// 窄门分类页 — surmon.me/category/insight 骨架逻辑

const CATEGORY_NAME = "窄门";
const TOTAL_ARTICLES = 186;
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
    title: "一人有限集团",
    desc: "AI 时代的一种新的可能性。",
    image: "../images/ZZZ3.0.3.jpg",
    publishDate: "2026-04-01",
    views: "1.06k", comments: 6, likes: 8, lang: "简体中文"
  },
  {
    title: "你就是不敢",
    desc: "成功的答案就在那里，但你敢抄吗？",
    image: "../images/ZZZzhe.jpg",
    publishDate: "2026-04-01",
    views: "1.05k", comments: 2, likes: 6, lang: "简体中文"
  },
  {
    title: "人类正在退出人类",
    desc: "AI 可以生成一千张图，但它，不知道哪一张是对的。",
    image: "../images/骑士梦1.jpg",
    publishDate: "2026-04-15",
    views: "1.01k", comments: 0, likes: 4, lang: "简体中文"
  },
  {
    title: "AI 代代替不了这样的你",
    desc: "AI 代替不了认真生活的你，代替不了真诚、有温度的你。",
    image: "../images/比利SP1.jpg",
    publishDate: "2026-04-01",
    views: "1.44k", comments: 2, likes: 14, lang: "简体中文"
  },
  {
    title: "2025 投资报告：走慢的路",
    desc: "不曲折、不取巧、不费神、不躁动的路。",
    image: "../images/wanzho.jpg",
    publishDate: "2026-01-15",
    views: "3.16k", comments: 3, likes: 10, lang: "简体中文"
  },
  {
    title: "无依之地",
    desc: "破碎之地，自立之地。",
    image: "../images/ZZZ3.0.1.jpg",
    publishDate: "2025-12-01",
    views: "2.33k", comments: 0, likes: 11, lang: "简体中文"
  },
  {
    title: "会杀人的菩萨",
    desc: "才是菩萨。",
    image: "../images/jqlzy.jpg",
    publishDate: "2025-09-01",
    views: "2.15k", comments: 5, likes: 12, lang: "简体中文"
  },
  {
    title: "无我不是共识",
    desc: "它要么是个人事实，要么不是。",
    image: "../images/hyphae1.jpg",
    publishDate: "2025-09-01",
    views: "1.70k", comments: 0, likes: 8, lang: "简体中文"
  },
  {
    title: "文化的积重与偏见",
    desc: "与正本清源。",
    image: "../images/ZZZzhe1.jpg",
    publishDate: "2025-09-01",
    views: "2.15k", comments: 1, likes: 4, lang: "简体中文"
  },
  {
    title: "当下即安",
    desc: "第一束光洒在天台，微风来。",
    image: "../images/ZZZ3.0.3.jpg",
    publishDate: "2025-09-01",
    views: "1.71k", comments: 0, likes: 7, lang: "简体中文"
  },
  {
    title: "科学的尽头是态度",
    desc: "科学的尽头，不一定是神学。",
    image: "../images/骑士梦1.jpg",
    publishDate: "2025-09-01",
    views: "1.70k", comments: 0, likes: 5, lang: "简体中文"
  },
  {
    title: "无我不是 Egoless",
    desc: "而是 Anattā。",
    image: "../images/wanzho.jpg",
    publishDate: "2025-09-01",
    views: "2.60k", comments: 1, likes: 4, lang: "简体中文"
  },
  {
    title: "信仰不因恐惧而存在",
    desc: "信仰就是实践本身。",
    image: "../images/比利SP1.jpg",
    publishDate: "2025-09-01",
    views: "3.44k", comments: 1, likes: 6, lang: "简体中文"
  },
  {
    title: "世间无解的矛与盾",
    desc: "面对、理解、接纳、处理、放下。",
    image: "../images/jqlzy.jpg",
    publishDate: "2025-08-01",
    views: "2.06k", comments: 0, likes: 5, lang: "简体中文"
  },
  {
    title: "先别急着做些什么",
    desc: "先停下来，去看、听、读、问。",
    image: "../images/ZZZzhe.jpg",
    publishDate: "2025-09-01",
    views: "1.77k", comments: 0, likes: 4, lang: "简体中文"
  },
  {
    title: "佛不需要你的皈依",
    desc: "如果你皈依的是某个上师、某种符号、或某类形式……",
    image: "../images/hyphae1.jpg",
    publishDate: "2025-09-01",
    views: "2.10k", comments: 0, likes: 2, lang: "简体中文"
  }
];

const iconClock = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
const iconEye = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
const iconComment = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>';
const iconLike = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>';
const tagIcon = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>';

function getRelativeTimeString(dateStr) {
  const now = new Date("2026-06-17T18:00:00");
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
    el.innerHTML = `<span class="zm-tag-icon">${tagIcon}</span>${tag.name}<span>(${tag.count})</span>`;
    tagsCloud.appendChild(el);
  });
}

const sidebarData = {
  new: articles.slice(0, 8),
  hot: [articles[13], articles[12], articles[3], articles[0], articles[4], articles[5], articles[1], articles[2]],
  best: [articles[4], articles[12], articles[3], articles[6], articles[0], articles[11], articles[8], articles[13]]
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
  const btnWeian = document.getElementById("btn-weian");
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
    const item = e.target.closest(".sm-nav-item:not(#btn-zhaimen), .sm-nav-item.sm-nav-hot");
    if (item && isMobile() && sidebarMenu.classList.contains("is-open")) {
      closeMobileSidebar();
    }
  });

  [btnDaqianjie, btnJueyouqing, btnMingdian, btnWeian, btnZhishi].forEach((link) => {
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
