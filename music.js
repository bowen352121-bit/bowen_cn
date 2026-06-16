(function () {
  const MUSIC_ENABLED_KEY = "bowenMusicEnabled";
  const MUSIC_TIME_KEY = "bowenMusicTime";
  const MUSIC_ACTIVE_KEY = "bowenMusicActive";

  let musicInstance = null;
  let resumeController = null;

  function getBgm() {
    return document.getElementById("bgm");
  }

  function notifyStateChange() {
    window.dispatchEvent(new CustomEvent("bowenmusic:statechange", {
      detail: { playing: isActuallyPlaying() }
    }));
  }

  function isActuallyPlaying() {
    const bgm = getBgm();
    return !!(bgm && !bgm.paused && !bgm.ended);
  }

  function saveMusicTime() {
    const bgm = getBgm();
    if (bgm && Number.isFinite(bgm.currentTime)) {
      localStorage.setItem(MUSIC_TIME_KEY, String(bgm.currentTime));
    }
  }

  function restoreMusicTime() {
    const bgm = getBgm();
    const savedTime = Number(localStorage.getItem(MUSIC_TIME_KEY));
    if (!bgm || !Number.isFinite(savedTime) || savedTime <= 0) return;

    const apply = () => {
      if (Number.isFinite(bgm.duration) && savedTime < bgm.duration) {
        bgm.currentTime = savedTime;
      } else {
        bgm.currentTime = savedTime;
      }
    };

    if (bgm.readyState >= 1) {
      apply();
    } else {
      bgm.addEventListener("loadedmetadata", apply, { once: true });
    }
  }

  function savePageState() {
    const bgm = getBgm();
    if (!bgm) return;
    saveMusicTime();
    const active = !bgm.paused && !bgm.ended && isMusicEnabled();
    sessionStorage.setItem(MUSIC_ACTIVE_KEY, active ? "1" : "0");
  }

  function isMusicEnabled() {
    return localStorage.getItem(MUSIC_ENABLED_KEY) !== "false";
  }

  function shouldAutoResume() {
    return isMusicEnabled();
  }

  function unbindInteractionResume() {
    resumeController?.abort();
    resumeController = null;
  }

  function bindInteractionResume() {
    unbindInteractionResume();
    resumeController = new AbortController();
    const { signal } = resumeController;

    const handler = () => {
      if (!isMusicEnabled()) return;
      playMusic();
    };

    ["click", "keydown", "touchstart"].forEach((evt) => {
      document.addEventListener(evt, handler, { capture: true, signal });
    });
  }

  function setupLoop(bgm) {
    bgm.loop = true;
    bgm.addEventListener("ended", () => {
      if (!isMusicEnabled()) return;
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
    });
  }

  function playMusic() {
    const bgm = getBgm();
    if (!bgm || !isMusicEnabled()) return Promise.resolve(false);

    const attemptPlay = () => {
      restoreMusicTime();
      return bgm.play()
        .then(() => {
          sessionStorage.setItem(MUSIC_ACTIVE_KEY, "1");
          unbindInteractionResume();
          notifyStateChange();
          return true;
        })
        .catch(() => {
          bindInteractionResume();
          notifyStateChange();
          return false;
        });
    };

    if (bgm.readyState >= 2) {
      return attemptPlay();
    }

    return new Promise((resolve) => {
      const onReady = () => attemptPlay().then(resolve);
      if (bgm.readyState >= 1) {
        onReady();
        return;
      }
      bgm.addEventListener("canplay", onReady, { once: true });
    });
  }

  function pauseMusic() {
    const bgm = getBgm();
    if (!bgm) return;
    saveMusicTime();
    bgm.pause();
    localStorage.setItem(MUSIC_ENABLED_KEY, "false");
    sessionStorage.setItem(MUSIC_ACTIVE_KEY, "0");
    unbindInteractionResume();
    notifyStateChange();
  }

  function enableMusic() {
    localStorage.setItem(MUSIC_ENABLED_KEY, "true");
    sessionStorage.setItem(MUSIC_ACTIVE_KEY, "1");
  }

  function resumeMusic() {
    if (!shouldAutoResume()) return Promise.resolve(false);
    return playMusic();
  }

  function bindToggle(toggleEl, iconEl, paths) {
    initSiteMusic();

    const syncIcon = () => {
      if (!iconEl || !paths) return;
      const playing = isActuallyPlaying();
      iconEl.src = playing ? paths.play : paths.mute;
    };

    window.addEventListener("bowenmusic:statechange", syncIcon);

    if (toggleEl) {
      toggleEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isActuallyPlaying()) {
          pauseMusic();
        } else {
          enableMusic();
          playMusic();
        }
      });
    }

    syncIcon();
    setTimeout(syncIcon, 120);
    setTimeout(syncIcon, 600);
  }

  function initSiteMusic() {
    if (musicInstance) return musicInstance;

    const bgm = getBgm();
    if (!bgm) return null;

    if (localStorage.getItem(MUSIC_ENABLED_KEY) === null) {
      localStorage.setItem(MUSIC_ENABLED_KEY, "true");
    }

    setupLoop(bgm);
    bgm.addEventListener("timeupdate", saveMusicTime);
    bgm.addEventListener("play", notifyStateChange);
    bgm.addEventListener("pause", notifyStateChange);

    window.addEventListener("beforeunload", savePageState);
    window.addEventListener("pagehide", savePageState);

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || link.target === "_blank") return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      savePageState();
    }, true);

    window.addEventListener("pageshow", (event) => {
      if (!shouldAutoResume()) return;
      if (event.persisted) restoreMusicTime();
      resumeMusic();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible" || !shouldAutoResume()) return;
      const audio = getBgm();
      if (audio && audio.paused) resumeMusic();
    });

    if (shouldAutoResume()) {
      resumeMusic().then((started) => {
        if (!started) bindInteractionResume();
      });
    } else {
      notifyStateChange();
    }

    musicInstance = {
      bgm,
      playMusic,
      pauseMusic,
      resumeMusic,
      saveMusicTime,
      restoreMusicTime,
      isMusicEnabled,
      isActuallyPlaying,
      enableMusic,
      bindToggle,
      MUSIC_ENABLED_KEY,
      MUSIC_TIME_KEY
    };

    return musicInstance;
  }

  window.BowenMusic = {
    init: initSiteMusic,
    bindToggle,
    saveMusicTime,
    playMusic,
    pauseMusic,
    resumeMusic,
    isMusicEnabled,
    isActuallyPlaying,
    enableMusic,
    MUSIC_ENABLED_KEY,
    MUSIC_TIME_KEY
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteMusic);
  } else {
    initSiteMusic();
  }
})();
