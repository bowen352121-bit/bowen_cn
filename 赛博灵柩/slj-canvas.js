/** 赛博灵柩 — Midjourney 风格背景粒子流场 */
(function () {
  const canvas = document.getElementById("slj-bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let frame = 0;
  let raf = 0;
  const dots = [];
  const DOT_COUNT = 90;

  function resize() {
    const stage = canvas.parentElement;
    w = canvas.width = stage.clientWidth;
    h = canvas.height = stage.clientHeight;
  }

  function seedDots() {
    dots.length = 0;
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        hue: 190 + Math.random() * 80,
      });
    }
  }

  function draw() {
    frame += 1;
    ctx.fillStyle = "rgba(6, 6, 8, 0.22)";
    ctx.fillRect(0, 0, w, h);

    const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, Math.max(w, h) * 0.65);
    g.addColorStop(0, "rgba(88, 28, 135, 0.08)");
    g.addColorStop(0.45, "rgba(14, 165, 233, 0.04)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < dots.length; i++) {
      const a = dots[i];
      a.x += a.vx + Math.sin(frame * 0.004 + i) * 0.08;
      a.y += a.vy + Math.cos(frame * 0.003 + i * 0.7) * 0.08;
      if (a.x < 0) a.x = w;
      if (a.x > w) a.x = 0;
      if (a.y < 0) a.y = h;
      if (a.y > h) a.y = 0;

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${a.hue}, 70%, 62%, 0.35)`;
      ctx.fill();
    }

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          ctx.strokeStyle = `rgba(120, 180, 255, ${0.08 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  seedDots();
  draw();

  window.addEventListener("resize", () => {
    resize();
    seedDots();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });
})();
