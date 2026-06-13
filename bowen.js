// script.js
const projects = [
    {
      title: "项目名称1",
      desc: "项目描述，点我可以跳转",
      link: "https://example.com"
    },
    {
      title: "项目名称2",
      desc: "再加一个试试",
      link: "#"
    }
  ];
  
  const container = document.getElementById('projects-container');
  
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = "bg-zinc-900 p-6 rounded-2xl hover:scale-105 transition cursor-pointer";
    card.innerHTML = `
      <h4 class="text-xl font-semibold mb-2">${p.title}</h4>
      <p class="text-zinc-400 mb-4">${p.desc}</p>
      <a href="${p.link}" class="text-sky-400 hover:underline">查看详情 →</a>
    `;
    container.appendChild(card);
  });