// ==========================================
// 🚀 BOWEN.js - 全局交互、状态管理与背景音乐
// ==========================================

// 📅 基础文章数据库：加入标准规范的时间戳 (用于现实时间精准自动换算“几周前”)
const projects = [
  { 
    title: "机器人的子弹从不迷茫：比利SP以正义之名，坚守最后的骑士梦", 
    desc: "【置顶】新城区的霓虹依旧闪烁，但黑夜里的空洞从不沉睡。作为新艾利都治安局的精英，朱鸢手中的枪扣动时没有一丝犹豫。这不仅仅是一次次完美的任务执行，更是对这座城市、对所有怀揣正义与‘骑士梦’的孩子们最坚实的守护。\n\n当子弹划破长空，击碎虚无的恶意，我们终会明白：真正能打破黑暗的，从来不是命运的妥协，而是你我心中那股永不熄灭的执着与清醒。\n\n治安官已经就位，那些曾经执剑在黑夜中高呼正义的少年，现在是否依然坚信光芒的存在？孩子们，你们的骑士梦想，准备好在这一刻再度沸腾了吗？拉开保险，正义将由我们来彻底执行！", 
    link: "modal", 
    image: "images/ZZZ3.0.1.jpg",
    isTop: true,
    publishDate: "2026-06-08", // 1周前
    views: "12.4k", comments: 88, likes: 999, category: "明殿内参", lang: "简体中文"
  },
  { 
    title: "想清楚再干", 
    desc: "孩子们我的电队怎会如此…… 现在加入骑士团还来得及吗…… 经过核心机制全方位评测，在当前高压环境下，队伍的整体输出轴和充能效率面临前所未有的考验。建议少安庸躁，想清楚再决定培养资源的投入，骑士团的大门永远为你敞开。", 
    link: "modal", 
    image: "images/jqlzy.jpg",
    publishDate: "2026-06-01", // 2周前
    views: "659", comments: 0, likes: 13, category: "薇薇安", lang: "简体中文"
  },
  {
    title: "肘法",
    desc: "关于新艾利都中边缘创作组织与独立工作室的生存现状调查。在这个每个人都是一座孤岛、同时每个人又是一个全能螺丝钉的时代，‘一人有限集团’成为了自由职业者最真实的写照。深度拆解他们如何利用有限的生命在空洞边缘赚取最大化的酬劳与尊严。",
    link: "modal",
    image: "images/ZZZ3.0.3.jpg",
    publishDate: "2026-05-25", // 3周前
    views: "1.05k", comments: 6, likes: 8, category: "窄门", lang: "简体中文"
  },
  {
    title: "你就是不敢",
    desc: "很多人在面对驱动盘洗练或者1.4卡池抽取时，总会犹豫不决。你真的是在等待最优解，还是你根本就是不敢面对赌失败的风险？本文将为你揭开概率学背后血淋淋的心理博弈，教你如何在关键时刻果断清空库存，搏出属于你的一片天。",
    link: "modal",
    image: "images/ZZZzhe.jpg",
    publishDate: "2026-05-11", // 1个月前 (5周前)
    views: "1.04k", comments: 2, likes: 6, category: "明殿内参", lang: "简体中文"
  },
  { 
    title: "创造力是温柔的谎言吗", 
    desc: "1.4上半卡池全员原始人？问？？深度评测指南。\n新版本的数值膨胀引发了核心玩家群体的广泛争论。所谓的玩法机制创新，究竟是版本更迭里对老角色的降维打击，还是在特定配队中给玩家编织的温柔谎言？本文将从物理抗性与打击面进行最严谨的拆解。", 
    link: "modal", 
    image: "images/ZZZzhe1.jpg",
    publishDate: "2026-05-01", 
    views: "1.32k", comments: 0, likes: 3, category: "大千界", lang: "简体中文"
  },
  {
    title: "人类正在退出人类",
    desc: "当智能Agent与自动化脚脚当道，我们在游戏里甚至连走格子都不需要再亲自参与。这是对玩家双手的解放，还是人类逐步退出精神娱乐主导权的温水柱青蛙？从赛博空洞的生成机制，深度反思数字文明对人脑原生创造力的侵蚀。",
    link: "modal",
    image: "images/骑士梦1.jpg",
    publishDate: "2026-04-15", 
    views: "996", comments: 0, likes: 4, category: "覺有情", lang: "简体中文"
  },
  { 
    title: "AI 代代替不了这样的你", 
    desc: "绝区零新版本隐藏机制与连招实战拆解。\nAI可以穷举出极限的帧率和完美弹刀时机，但它永远无法模拟出你在一血极限状态下、手心冒汗却依然坚定敲下闪避键时的心跳共振。那种独属于人类少年的清醒与热血，才是骑士梦的内核。", 
    link: "modal", 
    image: "images/比利SP1.jpg",
    publishDate: "2026-04-01", 
    views: "1.43k", comments: 2, likes: 14, category: "咖啡馆", lang: "简体中文"
  },
  {
    title: "脉冲点火背后的架构设计",
    desc: "高性能数据流在边缘端实时分发的底层逻辑解析。如何通过精简握手协议与优化缓存清除策略，在千万人同时在线的高并发场景下，实现如‘脉冲点火’般的超高速响应响应，为前端渲染提供近乎零延迟的强力支撑。",
    link: "modal",
    image: "images/hyphae1.jpg",
    publishDate: "2026-03-10", 
    views: "1.13k", comments: 0, likes: 2, category: "职事", lang: "简体中文"
  },
  { 
    title: "基于 Cloudflare 生态的 AI Agent 实践", 
    desc: "如何利用边缘计算快速搭建轻量级智能体应用。\n利用 Workers AI 与 KV 存储，在世界的各个边缘节点部署具备超低延迟记忆功能的 Agent。摆脱繁重的传统服务器架构，让你的独立开发项目在出生时就具备全球分布式的无缝弹性和扩展能力。", 
    link: "modal", 
    image: "images/wanzho.jpg",
    publishDate: "2026-03-01", 
    views: "2.03k", comments: 3, likes: 7, category: "赛博灵澈", lang: "简体中文"
  }
];

// ⏳ 现实时间核心算法
function getRelativeTimeString(dateStr) {
  const now = new Date("2026-06-15T18:00:00"); 
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "今天";
  if (diffDays < 7) return `${diffDays}天前`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}周前`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}个月前`;
  return `${Math.floor(diffMonths / 12)}年前`;
}

// 🏛️ 中间主视图切换 DOM 声明
const homeView = document.getElementById('home-view');
const articleView = document.getElementById('article-view');
const viewTitle = document.getElementById('view-title');
const viewDesc = document.getElementById('view-desc');
const viewImage = document.getElementById('view-image');
const viewRealTime = document.getElementById('view-real-time');
const viewWordCount = document.getElementById('view-word-count');
const viewReadTime = document.getElementById('view-read-time');
const viewClickCount = document.getElementById('view-click-count');
const btnBackHome = document.getElementById('btn-back-home');

function showArticleContent(article) {
  if (!homeView || !articleView || !viewTitle || !viewDesc || !viewImage) return;
  viewTitle.textContent = article.title;
  viewDesc.textContent = article.desc;
  viewImage.src = article.image;
  const pureText = article.desc.replace(/\s+/g, ''); 
  const wordCount = pureText.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 400)); 
  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = readMinutes;
  if (viewClickCount) viewClickCount.textContent = article.views;
  const now = new Date();
  if (viewRealTime) {
    viewRealTime.textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }
  homeView.classList.add('hidden');
  articleView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ view: 'article' }, "");
}

(function openArticleFromQuery() {
  const params = new URLSearchParams(location.search);
  const readIdx = params.get("read");
  if (readIdx === null) return;
  const i = parseInt(readIdx, 10);
  if (Number.isNaN(i) || !projects[i]) return;
  showArticleContent(projects[i]);
})();

function showHomeList() {
  if (!homeView || !articleView) return;
  articleView.classList.add('hidden');
  homeView.classList.remove('hidden');
}

if (btnBackHome) {
  btnBackHome.addEventListener('click', () => {
    if (!articleView.classList.contains('hidden')) {
      history.back();
    }
  });
}

// 🎠 1. 顶部大 banner 轮播图逻辑
const carouselContainer = document.getElementById('carousel-container');
const carouselTitle = document.getElementById('carousel-title');
const carouselDots = document.getElementById('carousel-dots');
const carouselWrapper = document.getElementById('carousel-wrapper');
const featuredThumbs = document.getElementById('featured-thumbs');

let currentIndex = 0;
let timer = null;
const bannerProjects = projects.slice(0, 5);

const iconClock = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
const iconEye = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
const iconComment = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>';
const iconLike = '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>';

if (carouselContainer && carouselTitle && carouselDots) {
  carouselContainer.innerHTML = '';
  carouselDots.innerHTML = '';
  if (featuredThumbs) featuredThumbs.innerHTML = '';
  carouselContainer.style.width = `${bannerProjects.length * 100}%`;

  bannerProjects.forEach((p, idx) => {
    const slide = document.createElement('div');
    slide.className = "carousel-slide";
    slide.style.width = `${100 / bannerProjects.length}%`;
    slide.innerHTML = `<img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">`;
    carouselContainer.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = idx === 0 ? 'is-active' : '';
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      clearInterval(timer);
      updateCarousel(idx);
      startAutoPlay();
    });
    carouselDots.appendChild(dot);

    if (featuredThumbs) {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = `sm-featured-thumb${idx === 0 ? ' is-active' : ''}`;
      thumb.innerHTML = `<img src="${p.image}" alt="${p.title}">`;
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        clearInterval(timer);
        updateCarousel(idx);
        startAutoPlay();
      });
      featuredThumbs.appendChild(thumb);
    }
  });

  function updateCarousel(index) {
    currentIndex = index;
    const offset = -currentIndex * (100 / bannerProjects.length);
    carouselContainer.style.transform = `translate3d(${offset}%, 0, 0)`;
    carouselTitle.textContent = bannerProjects[currentIndex].title;
    carouselDots.querySelectorAll('span').forEach((dot, dIdx) => {
      dot.classList.toggle('is-active', dIdx === currentIndex);
    });
    featuredThumbs?.querySelectorAll('.sm-featured-thumb').forEach((thumb, tIdx) => {
      thumb.classList.toggle('is-active', tIdx === currentIndex);
    });
  }

  function startAutoPlay() {
    clearInterval(timer);
    timer = setInterval(() => { updateCarousel((currentIndex + 1) % bannerProjects.length); }, 3500);
  }

  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', () => clearInterval(timer));
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    carouselWrapper.addEventListener('click', () => showArticleContent(bannerProjects[currentIndex]));

    let touchStartX = 0;
    carouselWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselWrapper.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) < 40) return;
      clearInterval(timer);
      if (dx < 0) {
        updateCarousel((currentIndex + 1) % bannerProjects.length);
      } else {
        updateCarousel((currentIndex - 1 + bannerProjects.length) % bannerProjects.length);
      }
      startAutoPlay();
    }, { passive: true });
  }

  updateCarousel(0);
  startAutoPlay();
}

// 📢 2. 精准签名栏轮播控制
const signatures = ["孩子们别忘了骑士梦的最初梦想", "孩子们你们会坚持骑士梦的对吧？", "我敢抽格调角色你们敢吗？", "正在穷举中，勿扰......"];
const sigSlider = document.getElementById('signature-slider');
const sigPrev = document.getElementById('sig-prev');
const sigNext = document.getElementById('sig-next');
let sigIndex = 0; let sigTimer = null; const FIXED_ROW_HEIGHT = 52;

if (sigSlider) {
  sigSlider.innerHTML = '';
  signatures.forEach((text) => {
    const item = document.createElement('div');
    item.style.lineHeight = `${FIXED_ROW_HEIGHT}px`;
    item.textContent = text;
    sigSlider.appendChild(item);
  });

  function updateSignature(index) {
    if (index < 0) sigIndex = signatures.length - 1;
    else if (index >= signatures.length) sigIndex = 0;
    else sigIndex = index;
    sigSlider.style.transform = `translateY(-${sigIndex * FIXED_ROW_HEIGHT}px)`;
  }

  function startSigAutoPlay() {
    clearInterval(sigTimer); sigTimer = setInterval(() => { updateSignature(sigIndex + 1); }, 15000);
  }

  if (sigPrev) sigPrev.addEventListener('click', () => { clearInterval(sigTimer); updateSignature(sigIndex - 1); startSigAutoPlay(); });
  if (sigNext) sigNext.addEventListener('click', () => { clearInterval(sigTimer); updateSignature(sigIndex + 1); startSigAutoPlay(); });

  updateSignature(0); startSigAutoPlay();
}

// 🏛️ 3. 右侧侧边栏“最近更新”选项卡
const sidebarData = {
  new: projects.slice(1, 9),
  hot: [projects[4], projects[2], projects[7], projects[0], projects[6], projects[1], projects[3], projects[5]],
  best: [projects[8], projects[2], projects[6], projects[0], projects[4], projects[1], projects[7], projects[3]]
};
const sidebarList = document.getElementById('sidebar-list');
const tabs = { new: document.getElementById('tab-new'), hot: document.getElementById('tab-hot'), best: document.getElementById('tab-best') };

function renderSidebarList(type) {
  if (!sidebarList) return; sidebarList.innerHTML = '';
  sidebarData[type].forEach((article, idx) => {
    const li = document.createElement('li');
    let badgeHtml;
    if (idx === 0) badgeHtml = `<span class="sm-rank-badge sm-rank-1">1</span>`;
    else if (idx === 1) badgeHtml = `<span class="sm-rank-badge sm-rank-2">2</span>`;
    else if (idx === 2) badgeHtml = `<span class="sm-rank-badge sm-rank-3">3</span>`;
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
    li.addEventListener('click', () => showArticleContent(article));
    sidebarList.appendChild(li);
  });
}
if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach((key) => {
    const activate = () => {
      Object.keys(tabs).forEach((k) => tabs[k].classList.remove('is-active'));
      tabs[key].classList.add('is-active');
      renderSidebarList(key);
    };
    tabs[key].addEventListener('mouseenter', activate);
    tabs[key].addEventListener('click', activate);
  });
}
renderSidebarList('new');


// 📑 4. 下方主卡片列表渲染
const container = document.getElementById('projects-container');
const btnLoadMore = document.getElementById('btn-load-more');
const articleTotal = document.getElementById('article-total');
const PAGE_SIZE = 5;
let visibleCount = PAGE_SIZE;

function buildArticleCard(p) {
  const card = document.createElement('article');
  card.className = 'sm-article-card';
  const pinHtml = p.isTop ? `<span class="sm-pin">置顶</span>` : '';
  const ribbonClass = p.title.includes('Cloudflare') ? 'sm-ribbon sm-ribbon-og' : 'sm-ribbon';
  const featuredHtml = p.isTop ? '<span class="sm-ribbon-featured">精选</span>' : '';

  card.innerHTML = `
    <div class="sm-article-thumb">
      <div class="sm-article-badges">
        <span class="${ribbonClass}">原创</span>
        ${featuredHtml}
      </div>
      <img src="${p.image}" alt="${p.title}">
    </div>
    <div class="sm-article-body">
      <div class="sm-article-head">
        <h4 class="sm-article-title">${pinHtml}${p.title}</h4>
        <span class="sm-article-lang">${p.lang === '简体中文' ? '中文' : p.lang}</span>
      </div>
      <p class="sm-article-desc">${p.desc}</p>
      <div class="sm-article-meta">
        <span class="sm-meta-item">${iconClock}${getRelativeTimeString(p.publishDate)}</span>
        <span class="sm-meta-item">${iconEye}${p.views}</span>
        <span class="sm-meta-item">${iconComment}${p.comments}</span>
        <span class="sm-meta-item">${iconLike}${p.likes || 0}</span>
        <span class="sm-meta-cat">${p.category}</span>
      </div>
    </div>
  `;
  card.addEventListener('click', () => showArticleContent(p));
  return card;
}

function renderArticleList() {
  if (!container) return;
  container.innerHTML = '';
  projects.slice(0, visibleCount).forEach((p) => {
    container.appendChild(buildArticleCard(p));
  });
  if (articleTotal) articleTotal.textContent = projects.length;
  if (btnLoadMore) {
    btnLoadMore.style.display = visibleCount >= projects.length ? 'none' : 'flex';
  }
}

if (container) {
  renderArticleList();
}

if (btnLoadMore) {
  btnLoadMore.addEventListener('click', () => {
    visibleCount = Math.min(visibleCount + PAGE_SIZE, projects.length);
    renderArticleList();
  });
}

const btnMingdian = document.getElementById('btn-mingdian');
if(btnMingdian) {
  btnMingdian.addEventListener('click', () => {
    if (!articleView.classList.contains('hidden')) {
      history.back();
    } else {
      showHomeList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ==========================================
// 📱 手机侧边栏抽屉
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("mobile-sidebar-open");

  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const btnDaqianjie = document.getElementById("btn-daqianjie");

  const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

  function handleOutsidePointer(event) {
    if (!sidebarMenu?.classList.contains("is-open")) return;
    if (sidebarMenu.contains(event.target)) return;
    if (mobileMenuToggle?.contains(event.target)) return;
    closeMobileSidebar();
  }

  const sidebarOverlay = document.getElementById("sidebar-overlay");

  function openMobileSidebar() {
    if (!sidebarMenu || !isMobile()) return;
    if (sidebarMenu.classList.contains("is-open")) return;

    sidebarMenu.classList.add("is-open");
    sidebarMenu.setAttribute("aria-hidden", "false");
    sidebarOverlay?.setAttribute("aria-hidden", "false");
    document.body.classList.add("mobile-sidebar-open");
    document.addEventListener("pointerdown", handleOutsidePointer, { capture: true });
  }

  function closeMobileSidebar() {
    if (!sidebarMenu) return;
    if (!sidebarMenu.classList.contains("is-open")) return;

    sidebarMenu.classList.remove("is-open");
    sidebarMenu.setAttribute("aria-hidden", "true");
    sidebarOverlay?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-sidebar-open");
    document.removeEventListener("pointerdown", handleOutsidePointer, { capture: true });
  }

  if (sidebarMenu && isMobile()) {
    sidebarMenu.setAttribute("aria-hidden", "true");
  } else if (sidebarMenu) {
    sidebarMenu.removeAttribute("aria-hidden");
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (sidebarMenu.classList.contains("is-open")) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeMobileSidebar);
  }

  if (sidebarMenu) {
    sidebarMenu.addEventListener("click", (e) => {
      const item = e.target.closest(".sm-nav-item:not(#btn-mingdian), .sm-nav-item.sm-nav-hot");
      if (item && isMobile() && sidebarMenu.classList.contains("is-open")) {
        closeMobileSidebar();
      }
    });
  }

  if (btnDaqianjie) {
    btnDaqianjie.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  }

  const btnJueyouqing = document.getElementById("btn-jueyouqing");
  if (btnJueyouqing) {
    btnJueyouqing.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  }

  const btnWeian = document.getElementById("btn-weian");
  if (btnWeian) {
    btnWeian.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  }

  const btnZhaimen = document.getElementById("btn-zhaimen");
  if (btnZhaimen) {
    btnZhaimen.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  }

  const btnZhishi = document.getElementById("btn-zhishi");
  if (btnZhishi) {
    btnZhishi.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  }

  const btnKafei = document.getElementById("btn-kafei");
  if (btnKafei) {
    btnKafei.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
      if (isMobile()) closeMobileSidebar();
    });
  }

  window.addEventListener("popstate", () => {
    if (articleView && !articleView.classList.contains("hidden")) {
      showHomeList();
    }
  });

  window.matchMedia("(max-width: 1023px)").addEventListener("change", (e) => {
    if (!e.matches) closeMobileSidebar();
  });

  // ==========================================
  // 🎵 全站音乐控制模块
  // ==========================================
  window.BowenMusic?.bindToggle(
    document.getElementById("music-toggle"),
    document.getElementById("music-icon"),
    { play: "images/音乐打开键.jpg", mute: "images/音乐关闭键.jpg" }
  );
});
