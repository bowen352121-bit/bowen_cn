// bowen.js

const projects = [
  { 
    title: "治安官的子弹从不迷茫：比利SP以正义之名，坚守最后的骑士梦", 
    desc: "【置顶】新城区的霓虹依旧闪烁，但黑夜里的空洞从不沉睡。作为新艾利都治安局的精英，朱鸢手中的枪扣动时没有一丝犹豫。这不仅仅是一次次完美的任务执行，更是对这座城市、对所有怀揣正义与‘骑士梦’的孩子们最坚实的守护。\n\n当子弹划破长空，击碎虚无的恶意，我们终会明白：真正能打破黑暗的，从来不是命运的妥协，而是你我心中那股永不熄灭的执着与清醒。\n\n治安官已经就位，那些曾经执剑在黑夜中高呼正义的少年，现在是否依然坚信光芒的存在？孩子们，你们的骑士梦想，准备好在这一刻再度沸腾了吗？拉开保险，正义将由我们来彻底执行！", 
    link: "modal", 
    image: "images/比利SP1.jpg",
    isTop: true 
  },
  { title: "想清楚再干", desc: "孩子们我的电队怎会如此…… 现在加入骑士团还来得及吗……", link: "https://www.bilibili.com/video/BV1EeXGBAENJ/", image: "images/骑士梦1.jpg" },
  { title: "创造力是温柔的谎言吗", desc: "1.4上半卡池全员原始人？问？？深度评测指南。", link: "https://bowen352121-bit.github.io/bowen_java-Gluttonous-Snake/", image: "images/牢真.jpg" },
  { title: "AI 代替不了这样的你", desc: "绝区零新版本隐藏机制与连招实战拆解。", link: "https://www.bilibili.com/", image: "images/骑士梦1.jpg" },
  { title: "基于 Cloudflare 生态的 AI Agent 实践", desc: "如何利用边缘计算快速搭建轻量级智能体应用。", link: "#", image: "images/牢真.jpg" }
];

// ==========================================
// 🏛️ 中间主视图切换：包含自动字数统计与分钟换算
// ==========================================
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
  const pureText = article.desc.replace(/\s+/g, ''); // 移除空格和回车
  const wordCount = pureText.length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 400)); // 设定每分钟读400字

  if (viewWordCount) viewWordCount.textContent = wordCount.toLocaleString();
  if (viewReadTime) viewReadTime.textContent = readMinutes;
  
  // 3. 👁️ 随机或固定生成好看的阅读次数
  if (viewClickCount) {
    viewClickCount.textContent = article.isTop ? "12,483" : Math.floor(Math.random() * 3000 + 500).toLocaleString();
  }

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

  // 5. 切换主视窗
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


// ==========================================
// 🎠 1. 顶部大 banner 轮播图逻辑
// ==========================================
const carouselContainer = document.getElementById('carousel-container');
const carouselTitle = document.getElementById('carousel-title');
const carouselDots = document.getElementById('carousel-dots');
const carouselWrapper = document.getElementById('carousel-wrapper');

let currentIndex = 0;
let timer = null;

if (carouselContainer && carouselTitle && carouselDots) {
  projects.forEach((p, idx) => {
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
    carouselTitle.textContent = projects[currentIndex].title;
    const dots = carouselDots.querySelectorAll('span');
    dots.forEach((dot, dIdx) => {
      dot.className = dIdx === currentIndex ? "w-2 h-2 rounded-full bg-sky-500 w-4 transition-all duration-300" : "w-2 h-2 rounded-full bg-white/50 transition-all duration-300";
    });
  }

  function startAutoPlay() {
    timer = setInterval(() => {
      let nextIdx = (currentIndex + 1) % projects.length;
      updateCarousel(nextIdx);
    }, 3500);
  }

  carouselWrapper.addEventListener('mouseenter', () => clearInterval(timer));
  carouselWrapper.addEventListener('mouseleave', startAutoPlay);
  
  carouselWrapper.addEventListener('click', () => {
    const target = projects[currentIndex];
    if (target.link === "modal") {
      showArticleContent(target); 
    } else if (target.link && target.link !== "#") {
      window.open(target.link, '_blank');
    }
  });

  updateCarousel(0);
  startAutoPlay();
}

// ==========================================
// 📢 2. 精准签名栏轮播控制
// ==========================================
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
    sigTimer = setInterval(() => {
      updateSignature(sigIndex + 1);
    }, 15000); 
  }

  if (sigPrev) sigPrev.addEventListener('click', () => { clearInterval(sigTimer); updateSignature(sigIndex - 1); startSigAutoPlay(); });
  if (sigNext) sigNext.addEventListener('click', () => { clearInterval(sigTimer); updateSignature(sigIndex + 1); startSigAutoPlay(); });

  updateSignature(0);
  startSigAutoPlay();
}

// ==========================================
// 📑 3. 右侧侧边栏“群贤毕至”Hover数据
// ==========================================
const sidebarData = {
  new: ["想清楚再干：别忘了初始的骑士梦想", "创造力是温柔的谎言吗？绝区零版本畅想", "AI 代替不了这样的你，电队深度理解"],
  hot: ["热点爆料：1.4下半卡池新角色前瞻机制", "牢真粉碎机！如何在一分钟内看懂驱动盘搭配", "孩子们，主线关卡打不过去怎么快速自救？"],
  best: ["深度干货！Cloudflare 生态搭建高级开发全书", "从零到一：个人主页如何一比一还原完美设计", "独立开发者的自我修养与创作心态保持"]
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
  sidebarData[type].forEach((title, idx) => {
    const li = document.createElement('li');
    li.className = "flex items-start space-x-2 group cursor-pointer";
    let badgeClass = "bg-zinc-100 text-zinc-500";
    if (idx === 0) badgeClass = "bg-red-100 text-red-600";
    if (idx === 1) badgeClass = "bg-amber-100 text-amber-600";
    
    li.innerHTML = `
      <span class="w-4 h-4 rounded text-[11px] flex items-center justify-center font-black shrink-0 mt-0.5 ${badgeClass}">${idx + 1}</span>
      <span class="text-zinc-600 group-hover:text-sky-600 transition truncate flex-grow">${title}</span>
    `;
    sidebarList.appendChild(li);
  });
}

if (tabs.new && tabs.hot && tabs.best) {
  Object.keys(tabs).forEach((key) => {
    tabs[key].addEventListener('mouseenter', () => {
      Object.keys(tabs).forEach((k) => {
        tabs[k].className = "cursor-pointer transition-all pb-1 border-b-2 border-transparent text-zinc-400 hover:text-sky-500";
      });
      tabs[key].className = "cursor-pointer transition-all pb-1 border-b-2 border-sky-600 text-sky-600 font-black";
      renderSidebarList(key);
    });
  });
}
renderSidebarList('new');

// ==========================================
// 📑 4. 下方主文章卡片列表渲染
// ==========================================
const container = document.getElementById('projects-container');
if (container) {
  projects.forEach((p) => {
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
          <span>💬 ${p.isTop ? 888 : Math.floor(Math.random() * 200)}</span>
          <span>👍 ${p.isTop ? 999 : Math.floor(Math.random() * 500)}</span>
          <span class="text-sky-500 font-semibold hover:underline ml-auto">阅读全文 →</span>
        </div>
      </div>
      <div class="w-28 sm:w-44 h-full shrink-0 bg-zinc-100 border-l border-zinc-100 overflow-hidden">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
      </div>
    `;
    
    card.addEventListener('click', () => {
      if (p.link === "modal") showArticleContent(p);
      else if (p.link && p.link !== "#") window.open(p.link, '_blank'); 
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

// ==========================================
// 🎆 5. 全局背景点击喷射 ZZZ 特效
// ==========================================
document.addEventListener('click', (e) => {
  if(e.target.closest('#sig-prev') || e.target.closest('#sig-next') || e.target.closest('#article-view')) return;
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