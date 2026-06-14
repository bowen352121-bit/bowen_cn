// bowen.js

// 🗃️ 完整底层文章及联动数据池
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
    desc: "1.4上半卡池全员原始人？问？？深度评测指南。\n新版本数值更迭引发了核心玩家群体的广泛争论。所谓的玩法机制创新，究竟是版本更迭里对老角色的降维打击，还是在特定配队中给玩家编织的温柔谎言？本文将从物理抗性与打击面进行最严谨的拆解。", 
    link: "modal", 
    image: "images/牢真.jpg",
    date: "2026-03", views: "1.32k", comments: 0, likes: 3
  },
  {
    title: "人类正在退出人类",
    desc: "当智能Agent与自动化系统大行其道，我们在游戏里甚至连走格子都不需要再亲自参与。这是对玩家双手的解放，还是人类逐步退出精神娱乐主导权的温水煮青蛙？深度反思数字文明对人脑原生创造力的侵蚀。",
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
    desc: "高性能数据流在边缘端实时分发的底层逻辑解析。如何通过精简握手协议与优化缓存清除策略，在千万人同时在线的高并发场景下，实现如‘脉冲点火’般的超高速响应，为前端渲染提供近乎零延迟的强力支撑。",
    link: "modal",
    image: "images/牢真.jpg",
    date: "2026-03", views: "1.13k", comments: 0, likes: 2
  }
];

// 🏛️ DOM 视图状态流向管理器
const homeView = document.getElementById('home-view');
const articleView = document.getElementById('article-view');
const viewTitle = document.getElementById('view-title');
const viewDesc = document.getElementById('view-desc');
const viewImage = document.getElementById('view-image');
const viewRealTime = document.getElementById('view-real-time');
const viewWordCount = document.getElementById('view-word-count');
const viewReadTime = document.getElementById('view-read-time');
const btnBackHome = document.getElementById('btn-back-home');

function showArticleContent(article) {
  if (!homeView || !articleView || !viewTitle || !viewDesc || !viewImage) return;
  
  viewTitle.textContent = article.title;
  viewDesc.textContent = article.desc;
  viewImage.src = article.image;

  const wordCount = article.desc.replace(/\s+/g, '').length;
  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = Math.max(1, Math.ceil(wordCount / 350));

  const now = new Date();
  if (viewRealTime) viewRealTime.textContent = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

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

// 📱 手机端专享搜索栏切换显示/隐藏逻辑
const mobileSearchToggle = document.getElementById('mobile-search-toggle');
const mobileSearchBar = document.getElementById('mobile-search-bar');
if (mobileSearchToggle && mobileSearchBar) {
  mobileSearchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileSearchBar.classList.toggle('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!mobileSearchBar.contains(e.target) && e.target !== mobileSearchToggle) {
      mobileSearchBar.add('hidden');
    }
  });
}

// 🎠 轮播控制
const carouselContainer = document.getElementById('carousel-container');
const carouselTitle = document.getElementById('carousel-title');
const carouselDots = document.getElementById('carousel-dots');
const carouselWrapper = document.getElementById('carousel-wrapper');
let carouselIndex = 0;
const bannerData = projects.slice(0, 4);

if (carouselContainer && carouselTitle && carouselDots) {
  bannerData.forEach((p, idx) => {
    const slide = document.createElement('div');
    slide.className = "w-1/10 h-full shrink-0";
    slide.innerHTML = `<img src="${p.image}" class="w-full h-full object-cover">`;
    carouselContainer.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = `w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-sky-500 w-3' : 'bg-white/40'}`;
    carouselDots.appendChild(dot);
  });

  function switchCarousel(index) {
    carouselIndex = index;
    carouselContainer.style.transform = `translateX(-${carouselIndex * 10}%)`;
    carouselTitle.textContent = bannerData[carouselIndex].title;
    carouselDots.querySelectorAll('span').forEach((dot, dIdx) => {
      dot.className = dIdx === carouselIndex ? "w-1.5 h-1.5 rounded-full bg-sky-500 w-3 transition-all" : "w-1.5 h-1.5 rounded-full bg-white/40";
    });
  }
  if (carouselWrapper) carouselWrapper.addEventListener('click', () => showArticleContent(bannerData[carouselIndex]));
  setInterval(() => { switchCarousel((carouselIndex + 1) % bannerData.length); }, 4000);
}

// 📢 一念滚动签名流
const signatures = ["孩子们别忘了骑士梦的最初梦想", "孩子们你们会坚持骑士梦的对吧？", "我敢抽格调角色你们敢吗？"];
const sigSlider = document.getElementById('signature-slider');
if (sigSlider) {
  signatures.forEach(txt => {
    const item = document.createElement('div');
    item.className = "h-14 w-full text-xs font-bold text-zinc-700 truncate flex items-center";
    item.textContent = txt;
    sigSlider.appendChild(item);
  });
}

// 📊 群贤毕至列表渲染及点击无缝转详情页
const sidebarTabs = {
  new: projects.slice(1, 8),
  hot: [projects[3], projects[1], projects[5], projects[0], projects[4]],
  best: [projects[6], projects[2], projects[0], projects[5], projects[1]]
};
const sidebarList = document.getElementById('sidebar-list');
const tabs = {
  new: document.getElementById('tab-new'),
  hot: document.getElementById('tab-hot'),
  best: document.getElementById('tab-best')
};

function renderSidebar(type) {
  if (!sidebarList) return;
  sidebarList.innerHTML = '';
  sidebarTabs[type].forEach((art, idx) => {
    const li = document.createElement('li');
    li.className = "flex items-start space-x-2 border-b border-zinc-100/60 pb-2 cursor-pointer group";
    let rankHtml = idx < 3 
      ? `<div class="${idx===0?'bg-orange-500':idx===1?'bg-emerald-500':'bg-sky-500'} text-white text-[9px] font-bold w-4 h-4 rounded-sm flex items-center justify-center shrink-0">${idx+1}</div>`
      : `<div class="w-4 text-center text-zinc-400 font-bold text-[10px] shrink-0">${idx+1}.</div>`;
    
    li.innerHTML = `
      ${rankHtml}
      <div class="flex-grow min-w-0 flex flex-col">
        <span class="text-zinc-700 font-semibold group-hover:text-sky-600 truncate tracking-wide text-xs">${art.title}</span>
        <div class="text-[9px] text-zinc-400 font-medium space-x-2 mt-0.5">
          <span>${art.date}</span> <span>👁 ${art.views}</span> <span>💬 ${art.comments}</span>
        </div>
      </div>
    `;
    li.addEventListener('click', () => showArticleContent(art));
    sidebarList.appendChild(li);
  });
}
if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach(k => {
    tabs[k].addEventListener('click', () => {
      Object.keys(tabs).forEach(x => tabs[x].className = "cursor-pointer pb-0.5 border-b-2 border-transparent text-zinc-400");
      tabs[k].className = "cursor-pointer pb-0.5 border-b-2 border-sky-600 text-sky-600 font-black";
      renderSidebar(k);
    });
  });
}
renderSidebar('new');

// 主流卡片加载
const container = document.getElementById('projects-container');
if (container) {
  [projects[0], projects[1], projects[2], projects[4]].forEach(p => {
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl border ${p.isTop?'border-sky-300 bg-sky-50/10':'border-zinc-200'} p-3.5 flex h-28 sm:h-34 cursor-pointer hover:shadow-md transition`;
    card.innerHTML = `
      <div class="flex-grow min-w-0 flex flex-col justify-between pr-2">
        <div>
          <h4 class="text-xs sm:text-base font-black text-zinc-800 truncate mb-1">${p.isTop?'<span class="bg-red-500 text-white text-[9px] px-1 py-0.2 rounded mr-1">置顶</span>':''}${p.title}</h4>
          <p class="text-zinc-500 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">${p.desc}</p>
        </div>
        <div class="text-zinc-400 text-[10px] sm:text-xs flex items-center space-x-2">
          <span>💬 ${p.comments}</span> <span>👍 ${p.likes}</span>
          <span class="text-sky-500 font-bold ml-auto text-[11px]">阅读全文 →</span>
        </div>
      </div>
      <div class="w-24 sm:w-40 h-full bg-zinc-100 rounded-md overflow-hidden shrink-0"><img src="${p.image}" class="w-full h-full object-cover"></div>
    `;
    card.addEventListener('click', () => showArticleContent(p));
    container.appendChild(card);
  });
}

// 📱 手机抽屉状态逻辑绑定
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerContent = document.getElementById('drawer-content');

function toggleDrawer(open) {
  if (!mobileDrawer || !drawerContent) return;
  if (open) {
    mobileDrawer.classList.remove('pointer-events-none', 'opacity-0');
    drawerContent.classList.remove('-translate-x-full');
  } else {
    mobileDrawer.classList.add('pointer-events-none', 'opacity-0');
    drawerContent.classList.add('-translate-x-full');
  }
}
if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => toggleDrawer(true));
if (drawerOverlay) drawerOverlay.addEventListener('click', () => toggleDrawer(false));

document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    toggleDrawer(false);
    showHomeList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const btnMingdian = document.getElementById('btn-mingdian');
if(btnMingdian) btnMingdian.addEventListener('click', () => { showHomeList(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

// 全局 ZZZ 点击粒子
document.addEventListener('click', (e) => {
  if(e.target.closest('#sig-prev') || e.target.closest('#sig-next') || e.target.closest('input') || e.target.closest('button')) return;
  const zzz = document.createElement('img');
  zzz.src = "images/ZZZ.jpg"; zzz.className = "click-effect";
  zzz.style.left = `${e.clientX}px`; zzz.style.top = `${e.clientY}px`;
  document.body.appendChild(zzz);
  setTimeout(() => zzz.remove(), 800);
});