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
    views: "659", comments: 0, likes: 13, category: "學梦寺", lang: "简体中文"
  },
  {
    title: "肘法",
    desc: "关于新艾利都中边缘创作组织与独立工作室的生存现状调查。在这个每个人都是一座孤岛、同时每个人又是一个全能螺丝钉的时代，‘一人有限集团’成为了自由职业者最真实的写照。深度拆解他们如何利用有限的生命在空洞边缘赚取最大化的酬劳与尊严。",
    link: "modal",
    image: "images/ZZZ3.0.3.jpg",
    publishDate: "2026-05-25", // 3周前
    views: "1.05k", comments: 6, likes: 8, category: "不二门", lang: "简体中文"
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
    views: "1.43k", comments: 2, likes: 14, category: "狂浪生", lang: "简体中文"
  },
  {
    title: "脉冲点火背后的架构设计",
    desc: "高性能数据流在边缘端实时分发的底层逻辑解析。如何通过精简握手协议与优化缓存清除策略，在千万人同时在线的高并发场景下，实现如‘脉冲点火’般的超高速响应响应，为前端渲染提供近乎零延迟的强力支撑。",
    link: "modal",
    image: "images/hyphae1.jpg",
    publishDate: "2026-03-10", 
    views: "1.13k", comments: 0, likes: 2, category: "工巧", lang: "简体中文"
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

let currentIndex = 0;
let timer = null;
const bannerProjects = projects.slice(0, 5);

if (carouselContainer && carouselTitle && carouselDots) {
  carouselContainer.innerHTML = '';
  carouselDots.innerHTML = '';
  carouselContainer.style.width = `${bannerProjects.length * 100}%`;

  bannerProjects.forEach((p, idx) => {
    const slide = document.createElement('div');
    slide.style.width = `${100 / bannerProjects.length}%`;
    slide.className = "h-full shrink-0 bg-zinc-800 relative overflow-hidden";
    slide.innerHTML = `<img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">`;
    carouselContainer.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-sky-500 w-4' : 'bg-white/50'}`;
    carouselDots.appendChild(dot);
  });

  function updateCarousel(index) {
    currentIndex = index;
    const offset = -currentIndex * (100 / bannerProjects.length);
    carouselContainer.style.transform = `translate3d(${offset}%, 0, 0)`;
    carouselTitle.textContent = bannerProjects[currentIndex].title;
    const dots = carouselDots.querySelectorAll('span');
    dots.forEach((dot, dIdx) => {
      dot.className = dIdx === currentIndex ? "w-2 h-2 rounded-full bg-sky-500 w-4 transition-all duration-300" : "w-2 h-2 rounded-full bg-white/50 transition-all duration-300";
    });
  }

  function startAutoPlay() {
    timer = setInterval(() => { updateCarousel((currentIndex + 1) % bannerProjects.length); }, 3500);
  }

  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', () => clearInterval(timer));
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    carouselWrapper.addEventListener('click', () => showArticleContent(bannerProjects[currentIndex]));
  }

  updateCarousel(0);
  startAutoPlay();
}

// 📢 2. 精准签名栏轮播控制
const signatures = ["孩子们别忘了骑士梦的最初梦想", "孩子们你们会坚持骑士梦的对吧？", "我敢抽格调角色你们敢吗？", "正在穷举中，勿扰......"];
const sigSlider = document.getElementById('signature-slider');
const sigPrev = document.getElementById('sig-prev');
const sigNext = document.getElementById('sig-next');
let sigIndex = 0; let sigTimer = null; const FIXED_ROW_HEIGHT = 56;

if (sigSlider) {
  sigSlider.innerHTML = '';
  signatures.forEach((text) => {
    const item = document.createElement('div');
    item.className = "h-14 w-full text-xs sm:text-sm font-bold text-zinc-700 tracking-wide truncate";
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
    li.className = "flex items-start space-x-2.5 group cursor-pointer border-b border-zinc-100/40 pb-2 last:border-0";
    let badgeClass = "text-zinc-400 font-normal";
    if (idx === 0) badgeClass = "bg-blue-500 text-white font-bold rounded-sm w-4 h-4 text-center text-[10px] flex items-center justify-center";
    if (idx === 1) badgeClass = "bg-emerald-500 text-white font-bold rounded-sm w-4 h-4 text-center text-[10px] flex items-center justify-center";
    if (idx === 2) badgeClass = "bg-orange-500 text-white font-bold rounded-sm w-4 h-4 text-center text-[10px] flex items-center justify-center";
    const badgeHtml = idx < 3 ? `<div class="${badgeClass}">${idx + 1}</div>` : `<div class="w-4 text-center text-zinc-400 font-semibold text-[11px]">${idx + 1}.</div>`;

    li.innerHTML = `
      ${badgeHtml}
      <div class="flex-grow min-w-0 flex flex-col space-y-0.5">
        <span class="text-zinc-700 font-medium group-hover:text-sky-600 transition truncate tracking-wide">${article.title}</span>
        <div class="flex items-center text-[10px] text-zinc-400 font-normal space-x-2 select-none">
          <span class="tracking-tight">${getRelativeTimeString(article.publishDate)}</span>
          <span class="flex items-center">👁 ${article.views}</span>
          <span class="flex items-center">💬 ${article.comments}</span>
        </div>
      </div>
    `;
    li.addEventListener('click', () => showArticleContent(article));
    sidebarList.appendChild(li);
  });
}
if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach((key) => {
    tabs[key].addEventListener('mouseenter', () => {
      Object.keys(tabs).forEach((k) => tabs[k].className = "cursor-pointer transition-all pb-0.5 border-b-2 border-transparent text-zinc-400 hover:text-sky-500");
      tabs[key].className = "cursor-pointer transition-all pb-0.5 border-b-2 border-sky-600 text-sky-600 font-black";
      renderSidebarList(key);
    });
  });
}
renderSidebarList('new');


// 📑 4. 下方主卡片列表渲染
const container = document.getElementById('projects-container');
const mainListProjects = [projects[0], projects[1], projects[4], projects[6], projects[8]];

if (container) {
  container.innerHTML = ''; 
  mainListProjects.forEach((p) => {
    const card = document.createElement('div');
    const borderClass = p.isTop ? "border-sky-200 bg-sky-50/10" : "border-zinc-200";
    card.className = `bg-white rounded-xl overflow-hidden border hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-row h-32 sm:h-36 ${borderClass} group`;
    const originalTagHtml = `<span class="absolute top-2 left-2 z-20 text-[9px] bg-sky-500 text-white font-black px-1.5 py-0.5 rounded shadow-xs select-none">原创</span>`;
    const topTagHtml = p.isTop ? `<span class="text-[10px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-black mr-1 shrink-0">置顶</span>` : '';

    card.innerHTML = `
      <div class="w-1/3 h-full shrink-0 overflow-hidden relative select-none p-1.5 flex items-center justify-center">
        ${originalTagHtml}
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover rounded-lg border border-zinc-100/40 opacity-85 group-hover:opacity-100 transition-opacity duration-300">
      </div>
      <div class="w-2/3 p-3 flex flex-col justify-between flex-grow min-w-0 relative">
        <div class="absolute top-3 right-3 text-[10px] sm:text-xs text-zinc-400 font-normal select-none tracking-wide">${p.lang}</div>
        <div class="space-y-1 pr-14"> 
          <div class="flex items-center">
            ${topTagHtml}
            <h4 class="text-sm sm:text-base font-black text-zinc-800 tracking-wide truncate group-hover:text-sky-600 transition-colors duration-200">${p.title}</h4>
          </div>
          <p class="text-zinc-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-normal">${p.desc}</p>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-zinc-400 font-bold border-t border-zinc-50/50 pt-1.5 select-none">
          <span class="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md tracking-tight">${getRelativeTimeString(p.publishDate)}</span>
          <span class="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md flex items-center space-x-0.5">
            <svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${p.views}</span>
          </span>
          <span class="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md flex items-center space-x-0.5">
            <svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.78c-.072.083-.105.195-.088.307.017.111.087.206.188.258a4.912 4.912 0 002.393.616c.72 0 1.408-.155 2.03-.435.53-.24 1.144-.24 1.657.013.791.39 1.666.616 2.583.616z"/></svg>
            <span>${p.comments}</span>
          </span>
          <span class="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md flex items-center space-x-0.5">
            <svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.801 0 1.55.496 1.858 1.24.234.565.623 1.01 1.181 1.233.742.296 1.228.993 1.228 1.792V19.5a1.5 1.5 0 01-1.5 1.5H6.622a4.584 4.584 0 01-3.653-1.786l-1.028-1.37a1.5 1.5 0 01.39-2.183l1.522-1.015A4.817 4.817 0 016.633 10.5zm0 0V4.5A1.5 1.5 0 018.133 3h1.5a1.5 1.5 0 011.5 1.5V9a1.5 1.5 0 01-1.5 1.5h-3z"/></svg>
            <span>${p.likes || 0}</span>
          </span>
          <span class="bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-md font-bold tracking-wide flex items-center space-x-1">
            <svg class="w-3 h-3 text-sky-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h7v7H4zm0 9h7v7H4zm9-9h7v7h-7zm0 9h7v7h-7z"/></svg>
            <span>来自 ${p.category}</span>
          </span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => showArticleContent(p));
    container.appendChild(card);
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

// 🎆 5. 全局背景点击喷射 ZZZ 特效
document.addEventListener('click', (e) => {
  if (
    e.target.closest('#sig-prev') ||
    e.target.closest('#sig-next') ||
    e.target.closest('#article-view') ||
    e.target.closest('input') ||
    e.target.closest('#music-toggle') ||
    e.target.closest('#sidebar-menu') ||
    e.target.closest('#sidebar-overlay') ||
    e.target.closest('#mobile-menu-toggle') ||
    e.target.closest('#mobile-menu-close')
  ) return;
  const zzzIcon = document.createElement('img');
  zzzIcon.src = "images/ZZZ.jpg"; 
  zzzIcon.className = "click-effect";
  zzzIcon.style.left = `${e.clientX}px`;
  zzzIcon.style.top = `${e.clientY}px`;
  const randomRot = Math.floor(Math.random() * 50) - 25;
  zzzIcon.style.setProperty('--rand-rot', `${randomRot}deg`);
  const randomScale = Math.random() > 0.5 ? 1.3 : 0.9; 
  zzzIcon.style.setProperty('--rand-scale', randomScale);
  document.body.appendChild(zzzIcon);
  setTimeout(() => zzzIcon.remove(), 800);
});


// ==========================================
// 📱 手机侧边栏抽屉
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const btnDaqianjie = document.getElementById("btn-daqianjie");

  const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

  function openMobileSidebar() {
    if (!sidebarMenu || !sidebarOverlay || !isMobile()) return;
    sidebarMenu.classList.add("is-open");
    sidebarOverlay.classList.remove("hidden");
    sidebarOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("mobile-sidebar-open");
  }

  function closeMobileSidebar() {
    if (!sidebarMenu || !sidebarOverlay) return;
    sidebarMenu.classList.remove("is-open");
    sidebarOverlay.classList.add("hidden");
    sidebarOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mobile-sidebar-open");
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
    sidebarMenu.querySelectorAll("div.cursor-pointer, button:not(#btn-mingdian)").forEach((item) => {
      item.addEventListener("click", () => {
        if (isMobile() && sidebarMenu.classList.contains("is-open")) {
          closeMobileSidebar();
        }
      });
    });
  }

  if (btnDaqianjie) {
    btnDaqianjie.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
    });
  }

  const btnJueyouqing = document.getElementById("btn-jueyouqing");
  if (btnJueyouqing) {
    btnJueyouqing.addEventListener("click", () => {
      window.BowenMusic?.saveMusicTime();
    });
  }

  window.addEventListener("popstate", () => {
    if (articleView && !articleView.classList.contains("hidden")) {
      showHomeList();
    }
  });

  // ==========================================
  // 🎵 全站音乐控制模块
  // ==========================================
  const siteMusic = window.BowenMusic?.init();
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const IMG_PLAY = "images/音乐打开键.jpg";
  const IMG_MUTE = "images/音乐关闭键.jpg";

  let isPlaying = siteMusic?.isMusicEnabled() ?? false;

  function setMusicIcon(playing) {
    if (musicIcon) musicIcon.src = playing ? IMG_PLAY : IMG_MUTE;
  }

  function playMusic() {
    if (!siteMusic) return;
    siteMusic.enableMusic();
    siteMusic.playMusic().then((started) => {
      isPlaying = started;
      setMusicIcon(started);
    });
  }

  function pauseMusic() {
    if (!siteMusic) return;
    siteMusic.pauseMusic();
    isPlaying = false;
    setMusicIcon(false);
  }

  setMusicIcon(isPlaying);

  if (musicToggle) {
    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }
});
