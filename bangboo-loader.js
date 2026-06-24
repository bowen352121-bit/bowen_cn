(function () {
  var FRAMES = 30;
  var SRC_W = 123;
  var SRC_H = 150;
  var MS_PER_FRAME = 25;

  var SPRITE = (function () {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("bangboo-loader.js") !== -1) {
        try {
          return new URL("images/bangboo-loading-persist.webp", scripts[i].src).href;
        } catch (e) {
          break;
        }
      }
    }
    return "images/bangboo-loading-persist.webp";
  })();

  var wrap = document.createElement("div");
  wrap.className = "bangboo-loader-wrap";

  var sprite = document.createElement("div");
  sprite.className = "bangboo-loader";
  sprite.style.backgroundImage = "url('" + SPRITE + "')";
  sprite.setAttribute("aria-hidden", "true");
  wrap.appendChild(sprite);

  var hidden = false;
  var persist = false;
  var animTimer = null;
  var animFrame = 0;
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function frameStepPx() {
    var w = sprite.offsetWidth || 50;
    return (w * SRC_H) / SRC_W;
  }

  function applyFrame(index) {
    sprite.style.backgroundPosition = "0 " + (-index * frameStepPx()) + "px";
  }

  function stopAnim() {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
    }
  }

  function startAnim() {
    stopAnim();
    animFrame = 0;
    applyFrame(0);
    if (motionQuery.matches) return;
    animTimer = setInterval(function () {
      animFrame = (animFrame + 1) % FRAMES;
      applyFrame(animFrame);
    }, MS_PER_FRAME);
  }

  function isPersistent() {
    return document.body && document.body.hasAttribute("data-bangboo-persist");
  }

  function mount() {
    if (!document.body || wrap.parentNode) return;
    document.body.appendChild(wrap);
    startAnim();
  }

  function show() {
    if (hidden) return;
    mount();
    wrap.classList.add("is-active");
  }

  function hide() {
    if (hidden || persist) return;
    hidden = true;
    stopAnim();
    wrap.classList.remove("is-active");
    window.setTimeout(function () {
      wrap.remove();
    }, 260);
  }

  function bootLoader() {
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-label", "页面加载中");
    show();
    if (document.readyState === "complete") {
      hide();
      return;
    }
    window.addEventListener("load", hide, { once: true });
    window.setTimeout(hide, 12000);
  }

  function bootPersistent() {
    wrap.classList.add("is-persistent", "is-active");
    wrap.setAttribute("aria-hidden", "true");
    mount();
  }

  function boot() {
    persist = isPersistent();
    if (persist) bootPersistent();
    else bootLoader();
  }

  window.addEventListener("resize", function () {
    if (wrap.parentNode) applyFrame(animFrame);
  });

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function () {
      if (wrap.parentNode) startAnim();
    });
  }

  if (document.body) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
