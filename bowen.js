// bowen.js

// 所有文章底层数据库：全新整合、补齐了设计图中缺失的所有旧文章内容
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
    desc: "当智能Agent与自动化脚本当道，我们在游戏里甚至连走格子都不需要再亲自参与。这是对玩家双手的解放，还是人类逐步退出精神娱乐主导权的温水煮青蛙？从赛博空洞的生成机制，深度反思数字文明对人脑原生创造力的侵蚀。",
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

// 🏛️ 中间主视图切换：包含自动字数统计与分钟换算
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

  // 1. 注入内容和精准图片
  viewTitle.textContent = article.title;
  viewDesc.textContent = article.desc;
  viewImage.src = article.image;

  // 2. 📝 自动字数计算和阅读分钟估算
  const pureText = article.desc.replace(/\s+/g, ''); 
  const wordCount = pureText.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 400)); 

  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = readMinutes;
  
  // 3. 👁️ 显示对应的阅读次数
  if (viewClickCount) viewClickCount.textContent = article.views;

  // 4. 🕒 精准时间实时跟进
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  if (viewRealTime) {
    viewRealTime.textContent = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  }

  // 5. 切换主视窗并丝滑置顶
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


// 🎠 1. 顶部大 banner 轮播图逻辑
const carouselContainer = document.getElementById('carousel-container');
const carouselTitle = document.getElementById('carousel-title');
const carouselDots = document.getElementById('carousel-dots');
const carouselWrapper = document.getElementById('carousel-wrapper');

let currentIndex = 0;
let timer = null;

// 选取前 5 篇作为大图轮播展示
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

  function startAutoPlay() {
    timer = setInterval(() => {
      let nextIdx = (currentIndex + 1) % bannerProjects.length;
      updateCarousel(nextIdx);
    }, 3500);
  }

  carouselWrapper.addEventListener('mouseenter', () => clearInterval(timer));
  carouselWrapper.addEventListener('mouseleave', startAutoPlay);
  
  carouselWrapper.addEventListener('click', () => {
    showArticleContent(bannerProjects[currentIndex]);
  });

  updateCarousel(0);
  startAutoPlay();
}

// 📢 2. 精准签名栏轮播控制
const signatures = [
  "孩子们别忘了骑士梦的最初梦想",
  "孩子们你们会坚持骑士梦的对吧？",
  "我敢抽格调角色你们敢吗？",
  "正在穷举中，勿扰......"
];

const sigSlider = document.getElementById('signature-slider');
const sigPrev = document.getElementById('sig-prev');
const sigNext = document.getElementById('sig-next');

let sigIndex = 0;
let sigTimer = null;
const FIXED_ROW_HEIGHT = 56; 

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
    clearInterval(sigTimer); 
    sigTimer = setInterval(() => { updateSignature(sigIndex + 1); }, 15000); 
  }

  if (sigPrev) sigPrev.addEventListener('click', () => { clearInterval(sigTimer); updateSignature(sigIndex - 1); startSigAutoPlay(); });
  if (sigNext) sigNext.addEventListener('click', () => { clearInterval(sigTimer); updateSignature(sigIndex + 1); startSigAutoPlay(); });

  updateSignature(0);
  startSigAutoPlay();
}


// 📑 3. 右侧侧边栏“最近更新”一比一精细高仿图逻辑
const sidebarData = {
  // “最新”分类直接按顺序拉取前 8 篇
  new: projects.slice(1, 9),
  // “热门”分类进行无序混编，确保数据多样性
  hot: [projects[4], projects[2], projects[7], projects[0], projects[6], projects[1], projects[3], projects[5]],
  // “精选”分类进行无序混编
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
    // 高仿图排版结构：序号 + 标题 + 多维元数据（日期、浏览量、评论、点赞）
    li.className = "flex items-start space-x-2.5 group cursor-pointer border-b border-zinc-100/40 pb-2 last:border-0";
    
    // 前三名气泡背景色加重
    let badgeClass = "text-zinc-400 font-normal";
    if (idx === 0) badgeClass = "bg-blue-500 text-white font-bold rounded-sm w-4 h-4 text-center text-[10px] flex items-center justify-center";
    if (idx === 1) badgeClass = "bg-emerald-500 text-white font-bold rounded-sm w-4 h-4 text-center text-[10px] flex items-center justify-center";
    if (idx === 2) badgeClass = "bg-orange-500 text-white font-bold rounded-sm w-4 h-4 text-center text-[10px] flex items-center justify-center";
    
    // 如果不是前三名，单纯做个宽带占位文本
    const badgeHtml = idx < 3 ? `<div class="${badgeClass}">${idx + 1}</div>` : `<div class="w-4 text-center text-zinc-400 font-semibold text-[11px]">${idx + 1}.</div>`;

    li.innerHTML = `
      ${badgeHtml}
      <div class="flex-grow min-w-0 flex flex-col space-y-0.5">
        <span class="text-zinc-700 font-medium group-hover:text-sky-600 transition truncate tracking-wide">${article.title}</span>
        <div class="flex items-center text-[10px] text-zinc-400 font-normal space-x-2 select-none">
          <span class="tracking-tight">${article.date}</span>
          <span class="flex items-center">👁 ${article.views}</span>
          <span class="flex items-center">💬 ${article.comments}</span>
          <span class="flex items-center">👍 ${article.likes}</span>
        </div>
      </div>
    `;
    
    // 点按右侧任一话，无缝链接呼出该详情文章
    li.addEventListener('click', () => {
      showArticleContent(article);
    });
    
    sidebarList.appendChild(li);
  });
}

if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach((key) => {
    tabs[key].addEventListener('mouseenter', () => {
      Object.keys(tabs).forEach((k) => {
        tabs[k].className = "cursor-pointer transition-all pb-0.5 border-b-2 border-transparent text-zinc-400 hover:text-sky-500";
      });
      tabs[key].className = "cursor-pointer transition-all pb-0.5 border-b-2 border-sky-600 text-sky-600 font-black";
      renderSidebarList(key);
    });
  });
}
renderSidebarList('new');


// 📑 4. 下方主卡片列表渲染（只渲染列表中指定的文章）
const container = document.getElementById('projects-container');
const mainListProjects = [projects[0], projects[1], projects[4], projects[6], projects[8]];

if (container) {
  mainListProjects.forEach((p) => {
    const card = document.createElement('div');
    const borderClass = p.isTop ? "border-sky-300 bg-sky-50/20 shadow-md" : "border-zinc-200 shadow-sm";
    card.className = `bg-white/95 rounded-xl overflow-hidden border hover:shadow-md transition cursor-pointer flex flex-row h-28 sm:h-36 ${borderClass}`;
    
    let tagsHtml = '';
    if (p.isTop) tagsHtml += `<span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black shrink-0">置顶</span>`;
    tagsHtml += `<span class="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded font-bold shrink-0">原创</span>`;

    card.innerHTML = `
      <div class="p-4 flex flex-col justify-between flex-grow min-w-0">
        <div>
          <div class="flex items-center space-x-1.5 mb-1">
            ${tagsHtml}
            <h4 class="text-sm sm:text-base font-black text-zinc-800 tracking-wide truncate">${p.title}</h4>
          </div>
          <p class="text-zinc-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">${p.desc}</p>
        </div>
        <div class="flex items-center text-zinc-400 text-xs space-x-3 mt-1">
          <span>💬 ${p.comments}</span>
          <span>👍 ${p.likes}</span>
          <span class="text-sky-500 font-semibold hover:underline ml-auto">阅读全文 →</span>
        </div>
      </div>
      <div class="w-28 sm:w-44 h-full shrink-0 bg-zinc-100 border-l border-zinc-100 overflow-hidden">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
      </div>
    `;
    
    card.addEventListener('click', () => {
      showArticleContent(p);
    });
    container.appendChild(card);
  });
}

const btnMingdian = document.getElementById('btn-mingdian');
if(btnMingdian) {
  btnMingdian.addEventListener('click', () => {
    showHomeList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 🎆 5. 全局背景点击喷射 ZZZ 特效
document.addEventListener('click', (e) => {
  if(e.target.closest('#sig-prev') || e.target.closest('#sig-next') || e.target.closest('#article-view') || e.target.closest('input')) return;
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