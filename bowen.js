// script.js
const projects = [
  {
    title: "作品一",
    desc: "孩子们我的电队怎会如此...... 现在加入骑士团还来得及吗......",
    link: "https://www.bilibili.com/video/BV1EeXGBAENJ/?spm_id_from=333.337.search-card.all.click&vd_source=dbe94c55ba811088785b7d7059784df9",
    image: "images/billy.jpg" // 👈 在这里填入作品1的图片路径，如果没有可以先空着 ""
  },
  {
    title: "作品二",
    desc: "问？？",
    link: "#",
    image: "images/牢真.jpg" // 
  }
];

const container = document.getElementById('projects-container');

projects.forEach(p => {
  const card = document.createElement('div');
  card.className = "bg-zinc-900 rounded-2xl hover:scale-105 transition cursor-pointer overflow-hidden flex flex-col";
  
  // 💡 这里加入了判断：如果配置了图片就显示图片，没配置就不显示
  const imageHtml = p.image 
    ? `<div class="w-full h-48 overflow-hidden bg-zinc-800">
         <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
       </div>`
    : '';

  card.innerHTML = `
    ${imageHtml}
    <div class="p-6 flex flex-col flex-grow">
      <h4 class="text-xl font-semibold mb-2">${p.title}</h4>
      <p class="text-zinc-400 mb-4 flex-grow">${p.desc}</p>
      <a href="${p.link}" class="text-sky-400 hover:underline mt-auto">查看详情 →</a>
    </div>
  `;
  container.appendChild(card);
});