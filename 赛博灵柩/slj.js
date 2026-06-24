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

function handleBrandHomeClick(e) {
  const inArticle = articleView && !articleView.classList.contains("hidden");
  if (inArticle) {
    e?.preventDefault();
    exitArticleView();
    return;
  }
  window.BowenMusic?.saveMusicTime();
}

if (btnBackHome) {
  btnBackHome.addEventListener("click", exitArticleView);
}

function isMobile() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

function closeMobileSidebar() {
  const sidebarMenu = document.getElementById("sidebar-menu");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  if (!sidebarMenu?.classList.contains("is-open")) return;
  sidebarMenu.classList.remove("is-open");
  sidebarMenu.setAttribute("aria-hidden", "true");
  sidebarOverlay?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("mobile-sidebar-open");
  document.removeEventListener("pointerdown", handleOutsidePointer, { capture: true });
}

function handleOutsidePointer(event) {
  const sidebarMenu = document.getElementById("sidebar-menu");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  if (!sidebarMenu?.classList.contains("is-open")) return;
  if (sidebarMenu.contains(event.target)) return;
  if (mobileMenuToggle?.contains(event.target)) return;
  closeMobileSidebar();
}

function openMobileSidebar() {
  const sidebarMenu = document.getElementById("sidebar-menu");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  if (!sidebarMenu || !isMobile() || sidebarMenu.classList.contains("is-open")) return;
  sidebarMenu.classList.add("is-open");
  sidebarMenu.setAttribute("aria-hidden", "false");
  sidebarOverlay?.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-sidebar-open");
  window.setTimeout(() => {
    document.addEventListener("pointerdown", handleOutsidePointer, { capture: true });
  }, 80);
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("slj-mj-page");
  document.body.classList.add("slj-mj-page");
  document.body.classList.remove("mobile-sidebar-open");

  const sidebarMenu = document.getElementById("sidebar-menu");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const btnBrandHome = document.getElementById("btn-brand-home");

  if (sidebarMenu && isMobile()) {
    sidebarMenu.setAttribute("aria-hidden", "true");
  }

  btnBrandHome?.addEventListener("click", handleBrandHomeClick);

  mobileMenuToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    sidebarMenu?.classList.contains("is-open") ? closeMobileSidebar() : openMobileSidebar();
  });

  mobileMenuClose?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMobileSidebar();
  });

  sidebarOverlay?.addEventListener("click", closeMobileSidebar);

  sidebarMenu?.addEventListener("click", (e) => {
    const item = e.target.closest(".sm-nav-item");
    if (item && isMobile() && sidebarMenu.classList.contains("is-open")) {
      window.BowenMusic?.saveMusicTime();
      closeMobileSidebar();
    }
  });

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

  initSljPay();
});

const SLJ_PAY_CONFIG = {
  paypal: {
    url: "https://paypal.me/bowen352121",
    linkText: "前往 PayPal 赞助",
  },
  btc: {
    address: "YOUR_BTC_ADDRESS",
  },
  eth: {
    address: "YOUR_ETH_ADDRESS",
  },
};

function initSljPay() {
  const payRoot = document.querySelector(".slj-pay");
  if (!payRoot) return;

  const panel = payRoot.querySelector(".slj-pay-panel");
  const btns = payRoot.querySelectorAll(".slj-pay-btn[data-pay]");
  const qrImgs = payRoot.querySelectorAll(".slj-pay-qr-img");
  const infoBlocks = payRoot.querySelectorAll(".slj-pay-info");
  let activePay = null;

  buildSljPayInfoPanels(payRoot);

  function hidePanelContent() {
    qrImgs.forEach((img) => {
      img.hidden = true;
    });
    infoBlocks.forEach((block) => {
      block.hidden = true;
    });
  }

  function showPanelContent(type) {
    hidePanelContent();
    const qr = payRoot.querySelector(`.slj-pay-qr-img[data-pay="${type}"]`);
    const info = payRoot.querySelector(`.slj-pay-info[data-pay="${type}"]`);
    if (qr) qr.hidden = false;
    if (info) info.hidden = false;
  }

  function closePanel() {
    activePay = null;
    if (panel) {
      panel.hidden = true;
      panel.setAttribute("aria-hidden", "true");
    }
    hidePanelContent();
    btns.forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-expanded", "false");
    });
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const type = btn.dataset.pay;
      if (!type || !panel) return;

      if (activePay === type) {
        closePanel();
        return;
      }

      activePay = type;
      panel.hidden = false;
      panel.setAttribute("aria-hidden", "false");
      btns.forEach((b) => {
        const on = b.dataset.pay === type;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-expanded", on ? "true" : "false");
      });
      showPanelContent(type);
    });
  });
}

function buildSljPayInfoPanels(payRoot) {
  const paypalEl = payRoot.querySelector('.slj-pay-info[data-pay="paypal"]');
  const btcEl = payRoot.querySelector('.slj-pay-info[data-pay="btc"]');
  const ethEl = payRoot.querySelector('.slj-pay-info[data-pay="eth"]');
  const { paypal, btc, eth } = SLJ_PAY_CONFIG;

  if (paypalEl && paypal?.url) {
    paypalEl.replaceChildren();

    const title = document.createElement("p");
    title.className = "slj-pay-info-title";
    title.textContent = "PayPal";

    const link = document.createElement("a");
    link.className = "slj-pay-link";
    link.href = paypal.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = paypal.linkText || "前往 PayPal 赞助";

    paypalEl.append(title, link);
  }

  if (btcEl && btc?.address) {
    buildSljCryptoPanel(btcEl, "BTC", btc.address);
  }

  if (ethEl && eth?.address) {
    buildSljCryptoPanel(ethEl, "ETH", eth.address);
  }
}

function buildSljCryptoPanel(container, label, address) {
  container.replaceChildren();

  const title = document.createElement("p");
  title.className = "slj-pay-info-title";
  title.textContent = `${label} 地址`;

  const code = document.createElement("code");
  code.className = "slj-pay-address";
  code.textContent = address;

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "slj-pay-copy-btn";
  copyBtn.textContent = "复制地址";
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    copySljPayText(address, copyBtn);
  });

  container.append(title, code, copyBtn);
}

async function copySljPayText(text, btn) {
  const original = btn.textContent;
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = "已复制";
    btn.classList.add("is-copied");
    window.setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("is-copied");
    }, 1600);
  } catch {
    btn.textContent = "复制失败";
    window.setTimeout(() => {
      btn.textContent = original;
    }, 1600);
  }
}
