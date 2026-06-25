const GITHUB_HOME = "https://github.com/bowen352121-bit";

function openGithubHome() {
  window.open(GITHUB_HOME, "_blank", "noopener,noreferrer");
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("mobile-sidebar-open");

  const profileCard = document.getElementById("profile-card");
  const btnGithub = document.getElementById("btn-github");

  profileCard?.addEventListener("click", openGithubHome);
  profileCard?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGithubHome();
    }
  });

  btnGithub?.addEventListener("click", (e) => {
    e.stopPropagation();
    openGithubHome();
  });

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const btnDaqianjie = document.getElementById("btn-daqianjie");
  const btnJueyouqing = document.getElementById("btn-jueyouqing");
  const btnMingdian = document.getElementById("btn-mingdian");
  const btnWeian = document.getElementById("btn-weian");
  const btnZhaimen = document.getElementById("btn-zhaimen");

  const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

  function handleOutsidePointer(event) {
    if (!sidebarMenu?.classList.contains("is-open")) return;
    if (sidebarMenu.contains(event.target)) return;
    if (mobileMenuToggle?.contains(event.target)) return;
    closeMobileSidebar();
  }

  function openMobileSidebar() {
    if (!sidebarMenu || !isMobile() || sidebarMenu.classList.contains("is-open")) return;
    sidebarMenu.classList.add("is-open");
    sidebarMenu.setAttribute("aria-hidden", "false");
    sidebarOverlay?.setAttribute("aria-hidden", "false");
    document.body.classList.add("mobile-sidebar-open");
    document.addEventListener("pointerdown", handleOutsidePointer, { capture: true });
  }

  function closeMobileSidebar() {
    if (!sidebarMenu || !sidebarMenu.classList.contains("is-open")) return;
    sidebarMenu.classList.remove("is-open");
    sidebarMenu.setAttribute("aria-hidden", "true");
    sidebarOverlay?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-sidebar-open");
    document.removeEventListener("pointerdown", handleOutsidePointer, { capture: true });
  }

  if (sidebarMenu && isMobile()) {
    sidebarMenu.setAttribute("aria-hidden", "true");
  }

  mobileMenuToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    sidebarMenu.classList.contains("is-open") ? closeMobileSidebar() : openMobileSidebar();
  });

  mobileMenuClose?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMobileSidebar();
  });

  sidebarOverlay?.addEventListener("click", closeMobileSidebar);

  sidebarMenu?.addEventListener("click", (e) => {
    const item = e.target.closest(".sm-nav-item:not(#btn-zhishi), .sm-nav-item.sm-nav-hot");
    if (item && isMobile() && sidebarMenu.classList.contains("is-open")) {
      closeMobileSidebar();
    }
  });

  [btnDaqianjie, btnJueyouqing, btnMingdian, btnWeian, btnZhaimen, document.getElementById("btn-suixi")].forEach((link) => {
    link?.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  });

  window.matchMedia("(max-width: 1023px)").addEventListener("change", (e) => {
    if (!e.matches) closeMobileSidebar();
  });

  window.BowenMusic?.bindToggle(
    document.getElementById("music-toggle"),
    document.getElementById("music-icon"),
    { play: "../images/音乐打开键.jpg", mute: "../images/音乐关闭键.jpg" }
  );
});
