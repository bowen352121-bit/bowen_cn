// 薇薇安分类页 — surmon.me/category/code 骨架逻辑

const CATEGORY_NAME = "薇薇安";
const TOTAL_ARTICLES = 63;
const PAGE_SIZE = 16;

const tagData = [
  { name: "见地", count: 136 },
  { name: "修行", count: 79 },
  { name: "形而上", count: 78 },
  { name: "稚绪", count: 69 },
  { name: "生活碎", count: 62 },
  { name: "Web 开发", count: 51 },
  { name: "折腾", count: 33 },
  { name: "总结", count: 32 },
  { name: "人工智能", count: 13 },
  { name: "无疆", count: 12 },
  { name: "网络", count: 5 },
  { name: "算法", count: 5 },
  { name: "GitHub", count: 5 },
  { name: "诗", count: 4 },
  { name: "多金", count: 4 },
  { name: "区块链", count: 2 }
];

const articles = [
  {
    title: "想清楚再干",
    desc: "AI 让造东西的成本趋近于零，但没让想清楚变得更容易。",
    image: "../images/jqlzy.jpg",
    publishDate: "2026-05-01",
    views: "677", comments: 0, likes: 13, lang: "简体中文"
  },
  {
    title: "创造力是温柔的谎言",
    desc: "「创造力」是人类的自我投射，和机器毫无关系。",
    image: "../images/ZZZzhe1.jpg",
    publishDate: "2026-03-15",
    views: "1.33k", comments: 0, likes: 3, lang: "简体中文"
  },
  {
    title: "脉冲点火背后的架构设计",
    desc: "摩托车机械设计中的解耦与内聚。",
    image: "../images/hyphae1.jpg",
    publishDate: "2026-03-10",
    views: "1.14k", comments: 0, likes: 2, lang: "简体中文"
  },
  {
    title: "基于 Cloudflare 生态的 AI Agent 实践",
    desc: "从零到一，为博客实现 AI Agent 智能助手。",
    image: "../images/wanzho.jpg",
    publishDate: "2026-03-01",
    views: "2.04k", comments: 3, likes: 7, lang: "简体中文",
    isOg: true
  },
  {
    title: "NodePress 支持用户登录了",
    desc: "NodePress 移除了 Disqus，并设计了全新的独立用户系统。",
    image: "../images/ZZZ3.0.3.jpg",
    publishDate: "2026-02-10",
    views: "1.15k", comments: 0, likes: 5, lang: "简体中文"
  },
  {
    title: "从统计学习到通用智能",
    desc: "工具可以被替代，但「值得被解决的问题」只能由人来发现。",
    image: "../images/骑士梦1.jpg",
    publishDate: "2026-01-20",
    views: "3.24k", comments: 0, likes: 18, lang: "简体中文"
  },
  {
    title: "React 与 Vue 的完美融合",
    desc: "两者兼备。",
    image: "../images/ZZZ3.0.1.jpg",
    publishDate: "2025-06-01",
    views: "4.51k", comments: 1, likes: 17, lang: "简体中文"
  },
  {
    title: "问了吗？",
    desc: "寻伯乐。",
    image: "../images/ZZZzhe.jpg",
    publishDate: "2022-03-01",
    views: "15.5k", comments: 10, likes: 100, lang: "简体中文"
  },
  {
    title: "小物件儿们",
    desc: "The widgets.",
    image: "../images/比利SP1.jpg",
    publishDate: "2022-01-15",
    views: "14.2k", comments: 3, likes: 19, lang: "简体中文"
  },
  {
    title: "README.md",
    desc: "By Vue component.",
    image: "../images/jqlzy.jpg",
    publishDate: "2022-01-01",
    views: "9.83k", comments: 1, likes: 54, lang: "简体中文"
  },
  {
    title: "2022 新年好，重回 Disqus",
    desc: "重回 Disqus 后的 Disqus。",
    image: "../images/wanzho.jpg",
    publishDate: "2022-01-01",
    views: "7.63k", comments: 12, likes: 12, lang: "简体中文"
  },
  {
    title: "Serverless 从放弃到入门再到放弃",
    desc: "不整了，妈的。",
    image: "../images/hyphae1.jpg",
    publishDate: "2021-12-01",
    views: "7.71k", comments: 4, likes: 32, lang: "简体中文"
  },
  {
    title: "漫漫长夜",
    desc: "专心编码。",
    image: "../images/ZZZ3.0.3.jpg",
    publishDate: "2021-10-01",
    views: "7.07k", comments: 5, likes: 28, lang: "简体中文"
  },
  {
    title: "Code Review 衍生的所思所想",
    desc: "所思，所想。",
    image: "../images/骑士梦1.jpg",
    publishDate: "2021-06-01",
    views: "9.58k", comments: 11, likes: 26, lang: "简体中文"
  },
  {
    title: "快感",
    desc: "社工。",
    image: "../images/ZZZzhe1.jpg",
    publishDate: "2020-06-01",
    views: "15.0k", comments: 15, likes: 73, lang: "简体中文"
  },
  {
    title: "我的 GitHub Sponsors 开通啦！",
    desc: "准备财务自由了。",
    image: "../images/ZZZ3.0.1.jpg",
    publishDate: "2020-03-01",
    views: "22.9k", comments: 29, likes: 86, lang: "简体中文"
  }
];

const iconClock = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
const iconEye = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
const iconComment = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>';
const iconLike = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>';
const tagIcon = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>';

function getRelativeTimeString(dateStr) {
  const now = new Date("2026-06-15T18:00:00");
  const past = new Date(dateStr);
  const diffDays = Math.floor((now - past) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "今天";
  if (diffDays < 7) return `${diffDays}天前`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}周前`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}个月前`;
  return `${Math.floor(diffMonths / 12)}年前`;
}

const categoryView = document.getElementById("category-view");
const articleView = document.getElementById("article-view");
const viewTitle = document.getElementById("view-title");
const viewDesc = document.getElementById("view-desc");
const viewImage = document.getElementById("view-image");
const viewRealTime = document.getElementById("view-real-time");
const viewWordCount = document.getElementById("view-word-count");
const viewReadTime = document.getElementById("view-read-time");
const viewClickCount = document.getElementById("view-click-count");
const btnBackHome = document.getElementById("btn-back-home");

function showArticleContent(article) {
  if (!categoryView || !articleView) return;
  viewTitle.textContent = article.title;
  window.BowenArticleFormat?.applyDescToElement(viewDesc, article.desc);
  viewImage.src = article.image;
  const wordCount = article.desc.replace(/\s+/g, "").length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 400));
  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = readMinutes;
  if (viewClickCount) viewClickCount.textContent = article.views;
  const now = new Date();
  if (viewRealTime) {
    viewRealTime.textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }
  categoryView.classList.add("hidden");
  articleView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.pushState({ view: "article" }, "");
}

function showCategoryList() {
  if (!categoryView || !articleView) return;
  articleView.classList.add("hidden");
  categoryView.classList.remove("hidden");
}

function exitArticleView() {
  if (!categoryView || !articleView) return;
  const inArticle = !articleView.classList.contains("hidden");
  if (inArticle) {
    showCategoryList();
    if (location.search) {
      history.replaceState({ view: "home" }, "", location.pathname);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

if (btnBackHome) {
  btnBackHome.addEventListener("click", exitArticleView);
}

function buildArticleCard(p) {
  const card = document.createElement("article");
  card.className = "sm-article-card";
  const ribbonClass = p.isOg ? "sm-ribbon sm-ribbon-og" : "sm-ribbon";

  card.innerHTML = `
    <div class="sm-article-thumb">
      <div class="sm-article-badges">
        <span class="${ribbonClass}">原创</span>
      </div>
      <img src="${p.image}" alt="${p.title}">
    </div>
    <div class="sm-article-body">
      <div class="sm-article-head">
        <h4 class="sm-article-title">${p.title}</h4>
        <span class="sm-article-lang">${p.lang === "简体中文" ? "中文" : p.lang}</span>
      </div>
      <p class="sm-article-desc">${p.desc}</p>
      <div class="sm-article-meta">
        <span class="sm-meta-item">${iconClock}${getRelativeTimeString(p.publishDate)}</span>
        <span class="sm-meta-item">${iconEye}${p.views}</span>
        <span class="sm-meta-item">${iconComment}${p.comments}</span>
        <span class="sm-meta-item">${iconLike}${p.likes || 0}</span>
        <span class="sm-meta-cat">${CATEGORY_NAME}</span>
      </div>
    </div>
  `;
  card.addEventListener("click", () => showArticleContent(p));
  return card;
}

const container = document.getElementById("projects-container");
const btnLoadMore = document.getElementById("btn-load-more");
const loadMoreText = document.getElementById("load-more-text");
let visibleCount = PAGE_SIZE;

function renderArticleList() {
  if (!container) return;
  container.innerHTML = "";
  articles.slice(0, visibleCount).forEach((p) => {
    container.appendChild(buildArticleCard(p));
  });
  if (loadMoreText) {
    loadMoreText.textContent = `${Math.min(visibleCount, articles.length)} / ${TOTAL_ARTICLES}`;
  }
  if (btnLoadMore) {
    btnLoadMore.style.display = visibleCount >= articles.length ? "none" : "flex";
  }
}

if (btnLoadMore) {
  btnLoadMore.addEventListener("click", () => {
    visibleCount = Math.min(visibleCount + PAGE_SIZE, articles.length);
    renderArticleList();
  });
}

const tagsCloud = document.getElementById("tags-cloud");
if (tagsCloud) {
  tagData.forEach((tag) => {
    const el = document.createElement("span");
    el.className = "sm-tag";
    el.innerHTML = `<span class="wwa-tag-icon">${tagIcon}</span>${tag.name}<span>(${tag.count})</span>`;
    tagsCloud.appendChild(el);
  });
}

const sidebarData = {
  new: articles.slice(0, 8),
  hot: [articles[7], articles[5], articles[15], articles[0], articles[6], articles[3], articles[1], articles[2]],
  best: [articles[5], articles[3], articles[6], articles[0], articles[15], articles[1], articles[4], articles[2]]
};

const sidebarList = document.getElementById("sidebar-list");
const tabs = {
  new: document.getElementById("tab-new"),
  hot: document.getElementById("tab-hot"),
  best: document.getElementById("tab-best")
};

function renderSidebarList(type) {
  if (!sidebarList) return;
  sidebarList.innerHTML = "";
  sidebarData[type].forEach((article, idx) => {
    const li = document.createElement("li");
    let badgeHtml;
    if (idx === 0) badgeHtml = '<span class="sm-rank-badge sm-rank-1">1</span>';
    else if (idx === 1) badgeHtml = '<span class="sm-rank-badge sm-rank-2">2</span>';
    else if (idx === 2) badgeHtml = '<span class="sm-rank-badge sm-rank-3">3</span>';
    else badgeHtml = `<span class="sm-rank-n">${idx + 1}.</span>`;

    li.innerHTML = `
      ${badgeHtml}
      <div class="min-w-0 flex-1">
        <div class="sm-rank-title">${article.title}</div>
        <div class="sm-rank-meta">
          <span>${getRelativeTimeString(article.publishDate)}</span>
          <span>${article.views}</span>
          <span>${article.comments}</span>
        </div>
      </div>
    `;
    li.addEventListener("click", () => showArticleContent(article));
    sidebarList.appendChild(li);
  });
}

if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach((key) => {
    const activate = () => {
      Object.keys(tabs).forEach((k) => tabs[k].classList.remove("is-active"));
      tabs[key].classList.add("is-active");
      renderSidebarList(key);
    };
    tabs[key].addEventListener("mouseenter", activate);
    tabs[key].addEventListener("click", activate);
  });
}

renderArticleList();
renderSidebarList("new");

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("mobile-sidebar-open");

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const btnDaqianjie = document.getElementById("btn-daqianjie");
  const btnJueyouqing = document.getElementById("btn-jueyouqing");
  const btnMingdian = document.getElementById("btn-mingdian");
  const btnZhaimen = document.getElementById("btn-zhaimen");
  const btnZhishi = document.getElementById("btn-zhishi");

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
    const item = e.target.closest(".sm-nav-item:not(#btn-weian), .sm-nav-item.sm-nav-hot");
    if (item && isMobile() && sidebarMenu.classList.contains("is-open")) {
      closeMobileSidebar();
    }
  });

  [btnDaqianjie, btnJueyouqing, btnMingdian, btnZhaimen, btnZhishi].forEach((link) => {
    link?.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  });

  window.addEventListener("popstate", () => {
    if (articleView && !articleView.classList.contains("hidden")) {
      showCategoryList();
    }
  });

  const readParams = new URLSearchParams(location.search);
  const readIdx = readParams.get("read");
  if (readIdx !== null) {
    const i = parseInt(readIdx, 10);
    if (!Number.isNaN(i) && articles[i]) showArticleContent(articles[i]);
  }

  window.matchMedia("(max-width: 1023px)").addEventListener("change", (e) => {
    if (!e.matches) closeMobileSidebar();
  });

  window.BowenMusic?.bindToggle(
    document.getElementById("music-toggle"),
    document.getElementById("music-icon"),
    { play: "../images/音乐打开键.jpg", mute: "../images/音乐关闭键.jpg" }
  );

  document.getElementById("btn-brand-home")?.addEventListener("click", exitArticleView);
});
