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
    card.className = "bg-zinc-900/85 rounded-xl hover:scale-102 transition cursor-pointer overflow-hidden flex flex-col border border-zinc-800 hover:border-teal-500/50 backdrop-blur-sm shadow-lg max-w-sm mx-auto w-full";
    
    const imageHtml = p.image 
      ? `<div class="w-full h-36 md:h-40 overflow-hidden bg-zinc-800">
           <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-300">
         </div>`
      : '';

    card.innerHTML = `
      ${imageHtml}
      <div class="p-4 flex flex-col flex-grow">
        <h4 class="text-lg font-semibold mb-1 text-zinc-100 tracking-wide">${p.title}</h4>
        <p class="text-zinc-400 mb-3 text-xs md:text-sm line-clamp-2 flex-grow">${p.desc}</p>
        <span class="text-teal-400 text-xs md:text-sm hover:underline inline-block font-medium mt-auto">查看详情 →</span>
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