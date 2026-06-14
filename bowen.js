// bowen.js

// 📊 扩充至 10 篇文章/图片数据，完美供给轮播图与列表进行相互绑定与点击跳转
const projects = [
  { title: "想清楚再干", desc: "孩子们我的电队怎会如此…… 现在加入骑士团还来得及吗……", link: "https://www.bilibili.com/video/BV1EeXGBAENJ/", image: "images/骑士梦1.jpg" },
  { title: "创造力是温柔的谎言吗", desc: "1.4上半卡池全员原始人？问？？深度评测指南。", link: "https://bowen352121-bit.github.io/bowen_java-Gluttonous-Snake/", image: "images/牢真.jpg" },
  { title: "AI 代替不了这样的你", desc: "绝区零新版本隐藏机制与连招实战拆解。", link: "https://www.bilibili.com/", image: "images/骑士梦1.jpg" },
  { title: "基于 Cloudflare 生态的 AI Agent 实践", desc: "如何利用边缘计算快速搭建轻量级智能体应用。", link: "#", image: "images/牢真.jpg" },
  { title: "从统计学习到通用智能", desc: "探索大语言模型的涌现能力与本质边界。", link: "#", image: "images/骑士梦1.jpg" },
  { title: "无依之地", desc: "在繁华的赛博世界中，寻找属于骑士的归宿。", link: "#", image: "images/牢真.jpg" },
  { title: "无我不是 Egoless", desc: "独立开发者的自我修养，如何保持纯粹的创作状态。", link: "#", image: "images/骑士梦1.jpg" },
  { title: "世间无聊的矛与盾", desc: "当绝对的理性碰撞上纯粹的感性，我们该何去何从。", link: "#", image: "images/牢真.jpg" },
  { title: "孩子们，别忘了最初的骑士梦想", desc: "当年执剑的少年，如今是否依然在黑夜中坚守正义？", link: "#", image: "images/骑士梦1.jpg" },
  { title: "绝区零零痛苦开荒救赎指南", desc: "萌新少走弯路的10个核心避坑技巧。", link: "#", image: "images/牢真.jpg" }
];

// ==========================================
// 🎠 1. 自动轮播图核心联动逻辑（10张图）
// ==========================================
const carouselContainer = document.getElementById('carousel-container');
const carouselTitle = document.getElementById('carousel-title');
const carouselDots = document.getElementById('carousel-dots');
const carouselWrapper = document.getElementById('carousel-wrapper');

let currentIndex = 0;
let timer = null;

if (carouselContainer && carouselTitle && carouselDots) {
  // 渲染 10 张图到轮播轨道，以及生成右下角对应小圆点
  projects.forEach((p, idx) => {
    // 创建单张图容器
    const slide = document.createElement('div');
    slide.className = "w-1/10 h-full shrink-0 bg-zinc-800";
    slide.innerHTML = `<img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">`;
    carouselContainer.appendChild(slide);

    // 创建对应小圆点
    const dot = document.createElement('span');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-sky-500 w-4' : 'bg-white/50'}`;
    carouselDots.appendChild(dot);
  });

  // 轮播切换核心控制方法
  function updateCarousel(index) {
    currentIndex = index;
    // 位移横向轨道
    carouselContainer.style.transform = `translateX(-${currentIndex * 10}%)`;
    // 刷新下方大标题
    carouselTitle.textContent = projects[currentIndex].title;
    // 刷新高亮小圆点
    const dots = carouselDots.querySelectorAll('span');
    dots.forEach((dot, dIdx) => {
      if (dIdx === currentIndex) {
        dot.className = "w-2 h-2 rounded-full bg-sky-500 w-4 transition-all duration-300";
      } else {
        dot.className = "w-2 h-2 rounded-full bg-white/50 transition-all duration-300";
      }
    });
  }

  // 开启定时自动播放
  function startAutoPlay() {
    timer = setInterval(() => {
      let nextIdx = (currentIndex + 1) % projects.length;
      updateCarousel(nextIdx);
    }, 3500);
  }

  // 鼠标移入/手指触摸停止轮播，离开恢复
  carouselWrapper.addEventListener('mouseenter', () => clearInterval(timer));
  carouselWrapper.addEventListener('mouseleave', startAutoPlay);

  // 点击当前展示的轮播图，直接跳转到对应文章的链接
  carouselWrapper.addEventListener('click', () => {
    const targetLink = projects[currentIndex].link;
    if (targetLink && targetLink !== "#") {
      window.open(targetLink, '_blank');
    }
  });

  // 首次运行初始化
  updateCarousel(0);
  startAutoPlay();
}

// ==========================================
// 📑 2. 横向宽幅文章内容卡片列表渲染（白底风）
// ==========================================
const container = document.getElementById('projects-container');

if (container) {
  projects.forEach((p, index) => {
    const card = document.createElement('div');
    // 完美复刻原图：横向白底、精致卡片、带细微外边框与投影
    card.className = "bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-row h-28 sm:h-36";
    
    card.innerHTML = `
      <div class="p-4 flex flex-col justify-between flex-grow min-w-0">
        <div>
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xs bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded font-bold shrink-0">原创</span>
            <h4 class="text-sm sm:text-base font-bold text-zinc-800 tracking-wide truncate">${p.title}</h4>
          </div>
          <p class="text-zinc-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">${p.desc}</p>
        </div>
        <div class="flex items-center text-zinc-400 text-xs space-x-3 mt-1">
          <span>💬 ${Math.floor(Math.random() * 200)}</span>
          <span>👍 ${Math.floor(Math.random() * 500)}</span>
          <span class="text-sky-500 font-semibold hover:underline ml-auto">阅读全文 →</span>
        </div>
      </div>
      <div class="w-28 sm:w-44 h-full shrink-0 bg-zinc-100 border-l border-zinc-100 overflow-hidden">
        <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
      </div>
    `;
    
    card.addEventListener('click', () => {
      if (p.link && p.link !== "#") {
        window.open(p.link, '_blank'); 
      }
    });
    
    container.appendChild(card);
  });
}

// 左侧“明殿”按钮点击直接顺滑返回页面顶部
const btnMingdian = document.getElementById('btn-mingdian');
if(btnMingdian) {
  btnMingdian.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================
// 🎆 3. 全局背景点击喷射 ZZZ.jpg 特效（核心保留）
// ==========================================
document.addEventListener('click', (e) => {
  // 如果点击的是可点链接、卡片本身或者按钮，依然会产生特效，两者互不干扰
  const zzzIcon = document.createElement('img');
  
  // 指向你的 images 文件夹下的 ZZZ.jpg
  zzzIcon.src = "images/ZZZ.jpg"; 
  zzzIcon.className = "click-effect";
  
  // 基于点击鼠标/手指触碰位置精确铺设
  zzzIcon.style.left = `${e.clientX}px`;
  zzzIcon.style.top = `${e.clientY}px`;
  
  // 产生随机微调倾斜角，更富有爆发动感
  const randomRot = Math.floor(Math.random() * 50) - 25;
  zzzIcon.style.setProperty('--rand-rot', `${randomRot}deg`);
  
  // 💡 控制一大一小！完美实现你要求的 4倍 和 3倍 错落的随机视觉差效果
  const randomScale = Math.random() > 0.5 ? 1.3 : 0.9; 
  zzzIcon.style.setProperty('--rand-scale', randomScale);
  
  document.body.appendChild(zzzIcon);
  
  // 0.8秒后自动销毁，维持网页丝滑流畅
  setTimeout(() => {
    zzzIcon.remove();
  }, 800);
});