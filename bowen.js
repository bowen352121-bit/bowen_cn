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
    // 1. 去掉了 rounded-xl 换成手机端直角/电脑端圆角（rounded-none sm:rounded-2xl），让手机端无缝铺满。
    // 2. 去掉了 max-w-sm，宽度设为 w-full，手机上直接100%撑满。
    // 3. border 只有在电脑端显示，手机端无边框纯铺满。
    card.className = "bg-zinc-900/85 w-full rounded-none sm:rounded-2xl hover:scale-102 transition cursor-pointer overflow-hidden flex flex-col border-0 sm:border border-zinc-800 hover:border-teal-500/50 backdrop-blur-sm shadow-lg mb-4 sm:mb-0";
    
    // 手机端高度稍微加高到 h-52，大屏更爽
    const imageHtml = p.image 
      ? `<div class="w-full h-52 sm:h-44 overflow-hidden bg-zinc-800">
           <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-300">
         </div>`
      : '';

    // 💡 字号修改：text-xl (大标题) 和 text-base (正文)，再也不怕字小了！
    card.innerHTML = `
      ${imageHtml}
      <div class="p-5 flex flex-col flex-grow">
        <h4 class="text-xl font-bold mb-2 text-zinc-100 tracking-wide">${p.title}</h4>
        <p class="text-zinc-300 mb-4 text-base leading-relaxed flex-grow">${p.desc}</p>
        <span class="text-teal-400 text-base hover:underline inline-block font-semibold mt-auto">查看详情 →</span>
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