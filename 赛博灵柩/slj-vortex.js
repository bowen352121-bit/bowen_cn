/** 赛博灵柩 — Midjourney 首页复刻（水平 prompt 流 + 旋涡） */
(function () {
  const canvas = document.getElementById("slj-vortex-canvas");
  if (!canvas) return;

  const stage = canvas.closest(".slj-mj-stage");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

  const PROMPTS = [
    "imagine a luminous forest spirit dancing in moonlight --ar 3:4 --v 6",
    "cyberpunk street market neon rain reflective puddles --stylize 250",
    "abstract glass sculpture floating in zero gravity --q 2",
    "portrait of a knight in obsidian armor cinematic lighting --ar 2:3",
    "surreal ocean waves made of silk fabric golden hour --v 6",
    "minimalist architecture brutalist concrete fog morning --stylize 100",
    "bioluminescent jellyfish deep sea darkness --ar 16:9",
    "vintage sci-fi book cover rocket planet rings --q 2",
  ];

  const FONT_SIZE = 8;
  const CHAR_STEP = 6;
  const ROW_STEP = 10;
  const DPR_CAP = 1;
  const TWIST_SPEED = 0.00011;

  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let vortexRx = 0;
  let vortexRy = 0;
  let streams = [];
  let startTime = 0;
  let running = false;
  let raf = 0;
  let lastFrame = 0;
  let twist = 0;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function isVisible() {
    const view = document.getElementById("category-view");
    return view && !view.classList.contains("hidden") && !document.hidden;
  }

  function buildStreams() {
    streams = [];
    const count = Math.ceil(h / ROW_STEP) + 4;
    for (let i = 0; i < count; i++) {
      const text = (PROMPTS[i % PROMPTS.length] + "  --v 6  " + PROMPTS[(i + 2) % PROMPTS.length]).repeat(3);
      streams.push({
        y: i * ROW_STEP,
        text,
        textLen: text.length,
        speed: 22 + (i % 11) * 4,
        phase: i * 137.5,
        bright: 0.34 + (i % 6) * 0.045,
      });
    }
  }

  function resize() {
    if (!stage) return;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${FONT_SIZE}px Consolas, "Courier New", monospace`;
    ctx.textBaseline = "top";
    cx = w * 0.5;
    cy = h * 0.5;
    vortexRx = Math.max(w, h) * 0.72;
    vortexRy = vortexRx * 0.48;
    buildStreams();
    startTime = performance.now();
  }

  /** MJ 旋涡：水平流场 + 椭圆扭曲，中心同样弯曲 */
  function warp(sx, sy, twist) {
    let dx = sx - cx;
    let dy = sy - cy;
    const er = Math.hypot(dx / vortexRx, dy / vortexRy);
    let ang = Math.atan2(dy / vortexRy, dx / vortexRx);

    const fall = Math.exp(-er * er * 0.42) * 1.65 + Math.max(0, 1.05 - er) ** 2.8 * 0.75;
    ang += twist * fall;

    return {
      x: cx + Math.cos(ang) * er * vortexRx,
      y: cy + Math.sin(ang) * er * vortexRy,
      er,
    };
  }

  function drawStreams(scrollT) {
    const ringSpan = streams.length * ROW_STEP;
    const cols = Math.ceil((w + 200) / CHAR_STEP);
    const margin = 14;

    for (let si = 0; si < streams.length; si++) {
      const s = streams[si];
      const baseY = ((s.y - scrollT * s.speed * 0.08) % ringSpan + h + ROW_STEP) % (h + ROW_STEP) - ROW_STEP;
      const scrollWrap = s.textLen * CHAR_STEP;
      const scroll = scrollT * s.speed * 42 + s.phase;
      const rowAlpha = clamp(s.bright, 0.3, 0.48);
      ctx.fillStyle = `rgba(0, 215, 238, ${rowAlpha})`;

      for (let c = 0; c < cols; c++) {
        const sx = c * CHAR_STEP - (scroll % scrollWrap);
        const ch = s.text[c % s.textLen];
        if (ch === " ") continue;

        const p = warp(sx, baseY, twist);
        if (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) continue;

        ctx.fillText(ch, p.x, p.y);
      }
    }
  }

  function draw(scrollT) {
    ctx.fillStyle = "#01040c";
    ctx.fillRect(0, 0, w, h);
    drawStreams(scrollT);
    stage?.classList.add("slj-stage--ready");
  }

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (!isVisible()) {
      lastFrame = now;
      return;
    }

    if (!lastFrame) {
      lastFrame = now;
      return;
    }

    const dt = Math.min(now - lastFrame, 32);
    lastFrame = now;
    twist += dt * TWIST_SPEED;
    draw((now - startTime) * 0.001);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = 0;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function replayLogo() {
    const logo = document.querySelector(".slj-mj-logo");
    if (!logo) return;
    logo.classList.remove("slj-mj-logo--enter");
    void logo.offsetWidth;
    logo.classList.add("slj-mj-logo--enter");
  }

  function replay() {
    startTime = performance.now();
    lastFrame = 0;
    twist = 0;
    stage?.classList.remove("slj-stage--ready");
    replayLogo();
  }

  window.sljVortexPause = stop;
  window.sljVortexResume = () => {
    if (isVisible()) start();
  };
  window.sljVortexReplay = replay;

  resize();
  start();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 160);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !isVisible()) stop();
    else start();
  });
})();
