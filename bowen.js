// bowen.js
const projects = [
  {
    title: "作品 1",
    desc: "点击这里可以直接跳转到《绝区零》官方角色页面，查看更多帅气角色信息！",
    // 已成功为您添加指定链接
    link: "https://www.bilibili.com/video/BV1EeXGBAENJ/?spm_id_from=333.337.search-card.all.click&vd_source=dbe94c55ba811088785b7d7059784df9"
  },
  {
    title: "作品 2",
    desc: "这是你的第二个作品卡片，以后可以在这里添加其他好玩的链接或描述。",
    link: "#"
  }
];

const container = document.getElementById('projects-container');

if (container) {
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = "bg-zinc-900/80 p-6 rounded-2xl hover:scale-105 transition cursor-pointer border border-zinc-800 hover:border-teal-500/50 backdrop-blur-sm";
    card.innerHTML = `
      <h4 class="text-xl font-semibold mb-2 text-zinc-100">${p.title}</h4>
      <p class="text-zinc-400 mb-4 text-sm">${p.desc}</p>
      <a href="${p.link}" target="_blank" class="text-teal-400 hover:underline inline-block font-medium">查看详情 →</a>
    `;
    
    // 让点击整个卡片也能够实现跳转
    card.addEventListener('click', () => {
      if (p.link !== "#") {
        window.open(p.link, '_blank');
      }
    });
    
    container.appendChild(card);
  });
}