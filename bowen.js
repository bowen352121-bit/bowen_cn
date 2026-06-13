// bowen.js
const projects = [
  {
    title: "作品一",
    desc: "孩子们我的电队怎会如此…… 现在加入骑士团还来得及吗……",
    link: "https://www.bilibili.com/video/BV1EeXGBAENJ/?spm_id_from=333.337.search-card.all.click&vd_source=dbe94c55ba811088785b7d7059784df9", 
    image: "images/骑士梦1.jpg" 
  },
  {
    title: "作品二",
    desc: "问？？",
    link: "https://bowen352121-bit.github.io/bowen_java-Gluttonous-Snake/",
    image: "images/牢真.jpg" 
  }
];

const container = document.getElementById('projects-container');

if (container) {
  projects.forEach(p => {
    const card = document.createElement('div');
    // 💡 核心修改：
    // 1. rounded-xl 让双排小卡片的圆角更加细腻自然。
    // 2. border border-zinc-900 给小卡片勾勒出精致边缘。
    card.className = "bg-zinc-900/85 w-full rounded-xl hover:scale-102 transition cursor-pointer overflow-hidden flex flex-col border border-zinc-900 shadow-md";
    
    // 💡 核心修改：手机上图片高度缩短至 h-24（电脑端 h-44），完美复刻B站主页双栏卡片的黄金比例
    const imageHtml = p.image 
      ? `<div class="w-full h-24 sm:h-44 overflow-hidden bg-zinc-800 relative">
           <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
         </div>`
      : '';

    // 💡 核心修改：内边距缩小到 p-2.5，字号分别使用 text-xs 和 text-[11px]，两行隐藏截断，和B站App主页排版一模一样！
    card.innerHTML = `
      ${imageHtml}
      <div class="p-2.5 flex flex-col flex-grow">
        <h4 class="text-sm md:text-lg font-bold mb-1 text-zinc-100 tracking-wide line-clamp-1">${p.title}</h4>
        <p class="text-zinc-400 mb-2 text-[11px] md:text-sm leading-snug flex-grow line-clamp-2">${p.desc}</p>
        <span class="text-teal-400 text-[11px] md:text-sm font-semibold mt-auto flex items-center">
          查看详情 <span class="ml-0.5 text-[9px] md:text-xs">→</span>
        </span>
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