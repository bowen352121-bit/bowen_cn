/** 赛博灵柩 — Midjourney 风格漂移网格 + 程序化动图块 */
(function () {
  const gridEl = document.getElementById("slj-mj-grid");
  if (!gridEl) return;

  const articles = (window.bowenProjects || []).filter((p) => p.category === "赛博灵柩");
  const palette = [
    ["#0ea5e9", "#6366f1", "#a855f7"],
    ["#22d3ee", "#3b82f6", "#8b5cf6"],
    ["#f472b6", "#a855f7", "#6366f1"],
    ["#34d399", "#06b6d4", "#3b82f6"],
    ["#fbbf24", "#f97316", "#ec4899"],
    ["#818cf8", "#c084fc", "#38bdf8"],
  ];

  function pickImages() {
    const imgs = articles.map((a) => ({
      type: "article",
      title: a.title,
      src: a.image.startsWith("../") ? a.image : `../${a.image}`,
      data: a,
    }));
    while (imgs.length < 18) {
      imgs.push({ type: "gen", seed: imgs.length * 17 + 3 });
    }
    return imgs;
  }

  function createGenCanvas(seed) {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 420;
    c.className = "slj-gen-canvas";
    const ctx = c.getContext("2d");
    const colors = palette[seed % palette.length];
    let t = seed * 0.7;

    function paint() {
      t += 0.012;
      const grd = ctx.createLinearGradient(0, 0, c.width, c.height);
      grd.addColorStop(0, colors[0]);
      grd.addColorStop(0.5 + Math.sin(t) * 0.15, colors[1]);
      grd.addColorStop(1, colors[2]);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = 0; i < 5; i++) {
        const x = c.width * (0.2 + 0.6 * Math.sin(t * 0.8 + i * 1.7));
        const y = c.height * (0.2 + 0.6 * Math.cos(t * 0.6 + i * 2.1));
        const r = 40 + 30 * Math.sin(t + i);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(255,255,255,0.35)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(paint);
    }
    paint();
    return c;
  }

  function buildTile(item, index) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "slj-mj-tile";
    tile.style.setProperty("--delay", `${(index % 12) * 0.35}s`);
    tile.style.setProperty("--dur", `${14 + (index % 7) * 2}s`);
    tile.style.setProperty("--drift-x", `${-30 - (index % 5) * 8}px`);
    tile.style.setProperty("--drift-y", `${-18 - (index % 4) * 6}px`);

    const media = document.createElement("div");
    media.className = "slj-mj-tile-media";

    if (item.type === "article") {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title;
      img.loading = "lazy";
      media.appendChild(img);
      tile.dataset.title = item.title;
      tile.addEventListener("click", () => {
        if (typeof window.sljOpenArticle === "function") {
          window.sljOpenArticle(item.data);
        }
      });
    } else {
      media.appendChild(createGenCanvas(item.seed));
    }

    const veil = document.createElement("div");
    veil.className = "slj-mj-tile-veil";
    if (item.type === "article") {
      const cap = document.createElement("span");
      cap.className = "slj-mj-tile-cap";
      cap.textContent = item.title;
      veil.appendChild(cap);
    }

    tile.appendChild(media);
    tile.appendChild(veil);
    return tile;
  }

  function render() {
    gridEl.innerHTML = "";
    const items = pickImages();
    items.forEach((item, i) => gridEl.appendChild(buildTile(item, i)));
  }

  render();
  window.sljMjGridRefresh = render;
})();
