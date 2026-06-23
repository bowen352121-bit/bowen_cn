// 赛博灵柩 — 页面交互 + 文章阅读

const CATEGORY_NAME = "赛博灵柩";

const categoryView = document.getElementById("category-view");
const articleView = document.getElementById("article-view");
const viewTitle = document.getElementById("view-title");
const viewDesc = document.getElementById("view-desc");
const viewImage = document.getElementById("view-image");
const viewRealTime = document.getElementById("view-publish-time");
const viewCategory = document.getElementById("view-category");
const viewWordCount = document.getElementById("view-word-count");
const viewReadTime = document.getElementById("view-read-time");
const viewClickCount = document.getElementById("view-click-count");
const btnBackHome = document.getElementById("btn-back-home");

let listScrollY = 0;

function restoreListScroll() {
  requestAnimationFrame(() => window.scrollTo(0, listScrollY));
}

function showArticleContent(article) {
  if (!categoryView || !articleView) return;
  listScrollY = window.scrollY;
  viewTitle.textContent = article.title;
  window.BowenArticleFormat?.applyDescToElement(viewDesc, article.desc);
  viewImage.src = article.image.startsWith("../") ? article.image : `../${article.image}`;
  const wordCount = article.desc.replace(/\s+/g, "").length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 400));
  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = readMinutes;
  if (viewClickCount) viewClickCount.textContent = article.views;
  if (viewCategory) viewCategory.textContent = CATEGORY_NAME;
  if (viewRealTime) {
    const published = window.BowenArticleFormat?.formatPublishDate(article.publishDate) || article.publishDate || "";
    viewRealTime.dateTime = article.publishDate || published;
    viewRealTime.textContent = published ? `发布于 ${published}` : "";
  }
  categoryView.classList.add("hidden");
  articleView.classList.remove("hidden");
  window.sljVortexPause?.();
  window.scrollTo(0, 0);
  history.pushState({ view: "article" }, "");
}

window.sljOpenArticle = showArticleContent;

function showCategoryList() {
  if (!categoryView || !articleView) return;
  articleView.classList.add("hidden");
  categoryView.classList.remove("hidden");
  window.sljVortexResume?.();
}

function exitArticleView() {
  if (!categoryView || !articleView) return;
  const inArticle = !articleView.classList.contains("hidden");
  if (inArticle) {
    showCategoryList();
    if (location.search) {
      history.replaceState({ view: "home" }, "", location.pathname);
    }
    restoreListScroll();
  }
}

function handleBrandHomeClick() {
  const inArticle = articleView && !articleView.classList.contains("hidden");
  if (inArticle) {
    exitArticleView();
    return;
  }
  window.BowenMusic?.saveMusicTime();
  window.location.href = "../bowen.html";
}

if (btnBackHome) {
  btnBackHome.addEventListener("click", exitArticleView);
}

function isMobile() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

function closeMobileSidebar() {
  document.body.classList.remove("mobile-sidebar-open");
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) overlay.setAttribute("aria-hidden", "true");
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("slj-mj-page");
  document.body.classList.add("slj-mj-page");
  document.body.classList.remove("mobile-sidebar-open");

  document.getElementById("btn-brand-home")?.addEventListener("click", handleBrandHomeClick);

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const sidebarOverlay = document.getElementById("sidebar-overlay");

  mobileMenuToggle?.addEventListener("click", () => {
    document.body.classList.add("mobile-sidebar-open");
    sidebarOverlay?.setAttribute("aria-hidden", "false");
  });

  mobileMenuClose?.addEventListener("click", closeMobileSidebar);
  sidebarOverlay?.addEventListener("click", closeMobileSidebar);

  document.querySelectorAll("#sidebar-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  });

  window.addEventListener("popstate", () => {
    if (articleView && !articleView.classList.contains("hidden")) {
      showCategoryList();
      restoreListScroll();
    }
  });

  window.BowenMusic?.bindToggle(
    document.getElementById("music-toggle"),
    document.getElementById("music-icon"),
    { play: "../images/音乐打开键.jpg", mute: "../images/音乐关闭键.jpg" }
  );
});
