// bowen.js
const projects = [
  {
    title: "作品一",
    desc: "孩子们我的电队怎会如此…… 现在加入骑士团还来得及吗……",
    link: "https://www.bilibili.com/video/BV1EeXGBAENJ/?spm_id_from=333.337.search-card.all.click&vd_source=dbe94c55ba811088785b7d7059784df9", // 👈 这里已经帮你换成了绝区零比利链接
    image: "images/骑士梦1.jpg" 
  },
  {
    title: "作品二",
    desc: "问？？",
    link: "#",
    image: "images/牢真.jpg" 
  }
];

const container = document.getElementById('projects-container');

if (container) {
  projects.forEach(p => {
    const card = document.createElement('div');
    // bg-zinc-900 后面加了 flex flex-col overflow-hidden，确保图片和卡片完美融合
    card.className = "bg-zinc-900/80 rounded-2xl hover:scale-105 transition cursor-pointer overflow-hidden flex flex-col border border-zinc-800 hover:border-teal-500/50 backdrop-blur-sm";
    
    // 判断是否有图片
    const imageHtml = p.image 
      ? `<div class="w-full h-48 overflow-hidden bg-zinc-800">
           <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
         </div>`
      : '';

    card.innerHTML = `
      ${imageHtml}
      <div class="p-6 flex flex-col flex-grow">
        <h4 class="text-xl font-semibold mb-2 text-zinc-100">${p.title}</h4>
        <p class="text-zinc-400 mb-4 text-sm flex-grow">${p.desc}</p>
        <span class="text-teal-400 hover:underline inline-block font-medium mt-auto">查看详情 →</span>
      </div>
    `;
    
    // 💡 核心修改：无论点击图片、文字还是“查看详情”，整个卡片统一执行这个点击事件
    card.addEventListener('click', () => {
      if (p.link && p.link !== "#") {
        // '_blank' 关键参数：代表在全新的空白标签页中打开，绝对不会占用你自己的网页！
        window.open(p.link, '_blank'); 
      }
    });
    
    container.appendChild(card);
  });
}