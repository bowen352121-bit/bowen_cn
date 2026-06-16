(function () {
  const MUSIC_ENABLED_KEY = "bowenMusicEnabled";
  const MUSIC_TIME_KEY = "bowenMusicTime";

  function getBgm() {
    return document.getElementById("bgm");
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
    if (bgm && Number.isFinite(savedTime) && savedTime > 0) {
      bgm.currentTime = savedTime;
    }
  }

  function isMusicEnabled() {
    return localStorage.getItem(MUSIC_ENABLED_KEY) !== "false";
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

    restoreMusicTime();
    return bgm.play().then(() => true).catch(() => false);
  }

  function pauseMusic() {
    const bgm = getBgm();
    if (!bgm) return;
    saveMusicTime();
    bgm.pause();
    localStorage.setItem(MUSIC_ENABLED_KEY, "false");
  }

  function enableMusic() {
    localStorage.setItem(MUSIC_ENABLED_KEY, "true");
  }

  let musicInstance = null;

  function initSiteMusic() {
    if (musicInstance) return musicInstance;

    const bgm = getBgm();
    if (!bgm) return null;

    if (localStorage.getItem(MUSIC_ENABLED_KEY) === null) {
      localStorage.setItem(MUSIC_ENABLED_KEY, "true");
    }

    setupLoop(bgm);
    bgm.addEventListener("timeupdate", saveMusicTime);
    window.addEventListener("beforeunload", saveMusicTime);
    window.addEventListener("pagehide", saveMusicTime);

    window.addEventListener("pageshow", (event) => {
      if (!isMusicEnabled()) return;
      if (event.persisted) restoreMusicTime();
      playMusic();
    });

    if (isMusicEnabled()) {
      playMusic().then((started) => {
        if (!started) {
          document.addEventListener("click", () => playMusic(), { once: true });
        }
      });
    }

    musicInstance = {
      bgm,
      playMusic,
      pauseMusic,
      saveMusicTime,
      restoreMusicTime,
      isMusicEnabled,
      enableMusic,
      MUSIC_ENABLED_KEY,
      MUSIC_TIME_KEY
    };

    return musicInstance;
  }

  window.BowenMusic = {
    init: initSiteMusic,
    saveMusicTime,
    playMusic,
    pauseMusic,
    isMusicEnabled,
    enableMusic,
    MUSIC_ENABLED_KEY,
    MUSIC_TIME_KEY
  };
})();
