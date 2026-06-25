(function () {
  var IMG = (function () {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("click-effect.js") !== -1) {
        try {
          return new URL("images/ZZZ.jpg", scripts[i].src).href;
        } catch (e) {
          break;
        }
      }
    }
    return "images/ZZZ.jpg";
  })();

  var SKIP =
    "#sig-prev,#sig-next,#article-view,input,textarea,select," +
    "#music-toggle,#sidebar-menu,#sidebar-overlay," +
    "#btn-login-google,#btn-login-github,#auth-panel," +
    "#mobile-menu-toggle,#mobile-menu-close," +
    "#preview,#close,#image-lightbox,.img-lightbox,#cafe-image-lightbox,.cafe-lightbox";

  document.addEventListener("click", function (e) {
    if (e.target.closest(SKIP)) return;
    if (document.body.classList.contains("mobile-sidebar-open")) return;

    var icon = document.createElement("img");
    icon.src = IMG;
    icon.className = "click-effect";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.style.left = e.clientX + "px";
    icon.style.top = e.clientY + "px";
    document.body.appendChild(icon);
    setTimeout(function () {
      icon.remove();
    }, 800);
  });
})();
