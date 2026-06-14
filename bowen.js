// bowen.js

// 🗃️ 完整文章底层核心数据库 (补齐了设计图与手机实机截图中出现的所有文章正文)
const projects = [
  { 
    title: "治安官的子弹从不迷茫：比利SP以正义之名，坚守最后的骑士梦", 
    desc: "【置顶】新城区的霓虹依旧闪烁，但黑夜里的空洞从不沉睡。作为新艾利都治安局的精英，朱鸢手中的枪扣动时没有一丝犹豫。这不仅仅是一次次完美的任务执行，更是对这座城市、对所有怀揣正义与‘骑士梦’的孩子们最坚实的守护。\n\n当子弹划破长空，击碎虚无的恶意，我们终会明白：真正能打破黑暗的，从来不是命运的妥协，而是你我心中那股永不熄灭的执着与清醒。\n\n治安官已经就位，那些曾经执剑在黑夜中高呼正义的少年，现在是否依然坚信光芒的存在？孩子们，你们的骑士梦想，准备好在这一刻再度沸腾了吗？拉开保险，正义将由我们来彻底执行！", 
    link: "modal", 
    image: "images/比利SP1.jpg",
    isTop: true,
    date: "2026-06", views: "12.4k", comments: 88, likes: 999
  },
  { 
    title: "想清楚再干", 
    desc: "孩子们我的电队怎会如此…… 现在加入骑士团还来得及吗…… 经过核心机制全方位评测，在当前高压环境下，队伍的整体输出轴和充能效率面临前所未有的考验。建议少安毋躁，想清楚再决定培养资源的投入，骑士团的大门永远为你敞开。", 
    link: "modal", 
    image: "images/骑士梦1.jpg",
    date: "2026-05", views: "659", comments: 0, likes: 13
  },
  {
    title: "一人有限集团",
    desc: "关于新艾利都中边缘创作组织与独立工作室的生存现状调查。在这个每个人都是一座孤岛、同时每个人又是一个全能螺丝钉的时代，‘一人有限集团’成为了自由职业者最真实的写照。深度拆解他们如何利用有限的生命在空洞边缘赚取最大化的酬劳与尊严。",
    link: "modal",
    image: "images/牢真.jpg",
    date: "2026-04", views: "1.05k", comments: 6, likes: 8
  },
  {
    title: "你就是不敢",
    desc: "很多人在面对驱动盘洗练或者1.4卡池抽取时，总会犹豫不决。你真的是在等待最优解，还是你根本就是不敢面对赌失败的风险？本文将为你揭开概率学背后血淋淋的心理博弈，教你如何在关键时刻果断清空库存，搏出属于你的一片天。",
    link: "modal",
    image: "images/比利SP1.jpg",
    date: "2026-04", views: "1.04k", comments: 2, likes: 6
  },
  { 
    title: "创造力是温柔的谎言吗", 
    desc: "1.4上半卡池全员原始人？问？？深度评测指南。\n新版本的数值膨胀引发了核心玩家群体的广泛争论。所谓的玩法机制创新，究竟是版本更迭里对老角色的降维打击，还是在特定配队中给玩家编织的温柔谎言？本文将从物理抗性与打击面进行最严谨的拆解。", 
    link: "modal", 
    image: "images/牢真.jpg",
    date: "2026-03", views: "1.32k", comments: 0, likes: 3
  },
  {
    title: "人类正在退出人类",
    desc: "当智能Agent与自动化脚脚本大行其道，我们在游戏里甚至连走格子都不需要再亲自参与。这是对玩家双手的解放，还是人类逐步退出精神娱乐主导权的温水煮青蛙？从赛博空洞的生成机制，深度反思数字文明对人脑原生创造力的侵蚀。",
    link: "modal",
    image: "images/骑士梦1.jpg",
    date: "2026-03", views: "996", comments: 0, likes: 4
  },
  { 
    title: "AI 代替不了这样的你", 
    desc: "绝区零新版本隐藏机制与连招实战拆解。\nAI可以穷举出极限的帧率和完美弹刀时机，但它永远无法模拟出你在一血极限状态下、手心冒汗却依然坚定敲下闪避键时的心跳共振。那种独属于人类少年的清醒与热血，才是骑士梦的内核。", 
    link: "modal", 
    image: "images/骑士梦1.jpg",
    date: "2026-03", views: "1.43k", comments: 2, likes: 14
  },
  {
    title: "脉冲点火背后的架构设计",
    desc: "高性能数据流在边缘端实时分发的底层逻辑解析。如何通过精简握手协议与优化缓存清除策略，在千万人同时在线的高并发场景下，实现如‘脉冲点火’般的超高速响应响应，为前端渲染提供近乎零延迟的强力支撑。",
    link: "modal",
    image: "images/牢真.jpg",
    date: "2026-03", views: "1.13k", comments: 0, likes: 2
  },
  { 
    title: "基于 Cloudflare 生态的 AI Agent 实践", 
    desc: "如何利用边缘计算快速搭建轻量级智能体应用。\n利用 Workers AI 与 KV 存储，在世界的各个边缘节点部署具备超低延迟记忆功能的 Agent。摆脱繁重的传统服务器架构，让你的独立开发项目在出生时就具备全球分布式的无缝弹性和扩展能力。", 
    link: "modal", 
    image: "images/牢真.jpg",
    date: "2026-03", views: "2.03k", comments: 3, likes: 7
  }
];

// 🏛️ 视图控制器组件联通
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

  // 渲染文章数据
  viewTitle.textContent = article.title;
  viewDesc.textContent = article.desc;
  viewImage.src = article.image;

  // 📝 智能字数和阅读时间精准计算
  const pureText = article.desc.replace(/\s+/g, ''); 
  const wordCount = pureText.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 380)); 

  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = readMinutes;
  if (viewClickCount) viewClickCount.textContent = article.views;

  // 🕒 注入实时系统级时间戳
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  if (viewRealTime) viewRealTime.textContent = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

  // 视图无缝平滑置顶
  homeView.classList.add('hidden');
  articleView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHomeList() {
  if (!homeView || !articleView) return;
  articleView.classList.add('hidden');
  homeView.classList.remove('hidden');
}

if (btnBackHome) btnBackHome.addEventListener('click', showHomeList);

//  Carousel 大图轮播
const carouselContainer = document.getElementById('carousel-container');
const carouselTitle = document.getElementById('carousel-title');
const carouselDots = document.getElementById('carousel-dots');
const carouselWrapper = document.getElementById('carousel-wrapper');
let currentIndex = 0;
let timer = null;
const bannerProjects = projects.slice(0, 5);

if (carouselContainer && carouselTitle && carouselDots) {
  bannerProjects.forEach((p, idx) => {
    const slide = document.createElement('div');
    slide.className = "w-1/10 h-full shrink-0 bg-zinc-800";
    slide.innerHTML = `<img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">`;
    carouselContainer.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-sky-500 w-4' : 'bg-white/50'}`;
    carouselDots.appendChild(dot);
  });

  function updateCarousel(index) {
    currentIndex = index;
    carouselContainer.style.transform = `translateX(-${currentIndex * 10}%)`;
    carouselTitle.textContent = bannerProjects[currentIndex].title;
    const dots = carouselDots.querySelectorAll('span');
    dots.forEach((dot, dIdx) => {
      dot.className = dIdx === currentIndex ? "w-2 h-2 rounded-full bg-sky-500 w-4 transition-all duration-300" : "w-2 h-2 rounded-full bg-white/50 transition-all duration-300";
    });
  }
  carouselWrapper.addEventListener('click', () => { showArticleContent(bannerProjects[currentIndex]); });
  updateCarousel(0);
  timer = setInterval(() => { updateCarousel((currentIndex + 1) % bannerProjects.length); }, 3500);
}

// 📢 签名文字滚动
const signatures = ["孩子们别忘了骑士梦的最初梦想", "孩子们你们会坚持骑士梦的对吧？", "我敢抽格调角色你们敢吗？", "正在穷举中，勿扰......"];
const sigSlider = document.getElementById('signature-slider');
if (sigSlider) {
  signatures.forEach((text) => {
    const item = document.createElement('div');
    item.className = "h-14 w-full text-xs font-bold text-zinc-700 truncate flex items-center";
    item.textContent = text;
    sigSlider.appendChild(item);
  });
}

// 📑 3. 右侧“群贤毕至”列表渲染（手机/桌面通用，点击一律链接切换到对应正文）
const sidebarData = {
  new: projects.slice(1, 9),
  hot: [projects[4], projects[2], projects[7], projects[0], projects[6], projects[1], projects[3], projects[5]],
  best: [projects[8], projects[2], projects[6], projects[0], projects[4], projects[1], projects[7], projects[3]]
};
const sidebarList = document.getElementById('sidebar-list');
const tabs = {
  new: document.getElementById('tab-new'),
  hot: document.getElementById('tab-hot'),
  best: document.getElementById('tab-best')
};

function renderSidebarList(type) {
  if (!sidebarList) return;
  sidebarList.innerHTML = '';
  
  sidebarData[type].forEach((article, idx) => {
    const li = document.createElement('li');
    li.className = "flex items-start space-x-2.5 group cursor-pointer border-b border-zinc-100/50 pb-2.5 last:border-0";
    
    // 一比一还原实机截图的气泡序号样式
    let badgeHtml = "";
    if (idx === 0) badgeHtml = `<div class="bg-orange-500 text-white font-bold rounded-sm w-4 h-4 text-[10px] flex items-center justify-center shrink-0">1</div>`;
    else if (idx === 1) badgeHtml = `<div class="bg-emerald-500 text-white font-bold rounded-sm w-4 h-4 text-[10px] flex items-center justify-center shrink-0">2</div>`;
    else if (idx === 2) badgeHtml = `<div class="bg-sky-500 text-white font-bold rounded-sm w-4 h-4 text-[10px] flex items-center justify-center shrink-0">3</div>`;
    else badgeHtml = `<div class="w-4 text-center text-zinc-400 font-bold text-[11px] shrink-0">${idx + 1}.</div>`;

    li.innerHTML = `
      ${badgeHtml}
      <div class="flex-grow min-w-0 flex flex-col space-y-0.5">
        <span class="text-zinc-700 font-semibold group-hover:text-sky-600 transition truncate tracking-wide text-xs">${article.title}</span>
        <div class="flex items-center text-[10px] text-zinc-400 font-normal space-x-2 select-none tracking-tight">
          <span>${article.date}</span>
          <span>👁 ${article.views}</span>
          <span>💬 ${article.comments}</span>
          <span>👍 ${article.likes}</span>
        </div>
      </div>
    `;
    
    // 点按任意一句话，立刻链接切换进入该章节正文
    li.addEventListener('click', () => {
      showArticleContent(article);
    });
    sidebarList.appendChild(li);
  });
}

if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach((key) => {
    tabs[key].addEventListener('click', () => {
      Object.keys(tabs).forEach((k) => tabs[k].className = "cursor-pointer transition-all pb-0.5 border-b-2 border-transparent text-zinc-400 hover:text-sky-500");
      tabs[key].className = "cursor-pointer transition-all pb-0.5 border-b-2 border-sky-600 text-sky-600 font-black";
      renderSidebarList(key);
    });
  });
}
renderSidebarList('new');

// 主页文章卡片流渲染
const container = document.getElementById('projects-container');
const mainListProjects = [projects[0], projects[1], projects[4], projects[6], projects[8]];
if (container) {
  mainListProjects.forEach((p) => {
    const card = document.createElement('div');
    const borderClass = p.isTop ? "border-sky-300 bg-sky-50/10 shadow-sm" : "border-zinc-200 shadow-xs";
    card.className = `bg-white/95 rounded-xl overflow-hidden border hover:shadow-md transition cursor-pointer flex flex-row h-28 sm:h-36 ${borderClass}`;
    card.innerHTML = `
      <div class="p-3 sm:p-4 flex flex-col justify-between flex-grow min-w-0">
        <div>
          <div class="flex items-center space-x-1.5 mb-1">
            ${p.isTop ? '<span class="text-[9px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-black">置顶</span>' : ''}
            <h4 class="text-xs sm:text-base font-black text-zinc-800 truncate tracking-wide">${p.title}</h4>
          </div>
          <p class="text-zinc-500 text-[11px] sm:text-sm line-clamp-2 leading-relaxed">${p.desc}</p>
        </div>
        <div class="flex items-center text-zinc-400 text-[10px] sm:text-xs space-x-3">
          <span>💬 ${p.comments}</span><span>👍 ${p.likes}</span>
          <span class="text-sky-500 font-bold ml-auto">查看全文 →</span>
        </div>
      </div>
      <div class="w-24 sm:w-44 h-full shrink-0 bg-zinc-50 border-l border-zinc-100 overflow-hidden">
        <img src="${p.image}" class="w-full h-full object-cover">
      </div>
    `;
    card.addEventListener('click', () => { showArticleContent(p); });
    container.appendChild(card);
  });
}

// 📱 4. 手机端侧边滑出抽屉式核心控制器
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerContent = document.getElementById('drawer-content');

function openDrawer() {
  if (!mobileDrawer || !drawerContent) return;
  mobileDrawer.classList.remove('pointer-events-none', 'opacity-0');
  mobileDrawer.classList.add('opacity-100');
  drawerContent.classList.remove('-translate-x-full');
  drawerContent.classList.add('translate-x-0');
}

function closeDrawer() {
  if (!mobileDrawer || !drawerContent) return;
  mobileDrawer.classList.add('pointer-events-none', 'opacity-0');
  mobileDrawer.classList.remove('opacity-100');
  drawerContent.classList.remove('translate-x-0');
  drawerContent.classList.add('-translate-x-full');
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    closeDrawer();
    showHomeList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const btnMingdian = document.getElementById('btn-mingdian');
if(btnMingdian) btnMingdian.addEventListener('click', () => { showHomeList(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

// 全局 ZZZ 喷射
document.addEventListener('click', (e) => {
  if(e.target.closest('#sig-prev') || e.target.closest('#sig-next') || e.target.closest('#article-view') || e.target.closest('input') || e.target.closest('#hamburger-btn')) return;
  const zzzIcon = document.createElement('img');
  zzzIcon.src = "images/ZZZ.jpg"; 
  zzzIcon.className = "click-effect";
  zzzIcon.style.left = `${e.clientX}px`;
  zzzIcon.style.top = `${e.clientY}px`;
  document.body.appendChild(zzzIcon);
  setTimeout(() => zzzIcon.remove(), 800);
});