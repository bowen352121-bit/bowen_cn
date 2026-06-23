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
  const HOLE_OPEN_MS = 180;
  const HOLE_REPAIR_MS = 2400;
  const HOLE_SWIRL_ZONE = 50;

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
  let holes = [];

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function holeRadius(hole, now) {
    const age = now - hole.born;
    if (age < HOLE_OPEN_MS) return hole.rMax * (age / HOLE_OPEN_MS);
    if (age < HOLE_OPEN_MS + HOLE_REPAIR_MS) {
      const t = (age - HOLE_OPEN_MS) / HOLE_REPAIR_MS;
      return hole.rMax * (1 - easeOutCubic(t));
    }
    return 0;
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function holeVigor(hole, now) {
    const age = now - hole.born;
    const open = smoothstep(0, HOLE_OPEN_MS, age);
    if (age < HOLE_OPEN_MS) return open;
    const repairT = clamp((age - HOLE_OPEN_MS) / HOLE_REPAIR_MS, 0, 1);
    return open * (1 - easeOutCubic(repairT));
  }

  function punchHole(x, y) {
    const rMax = clamp(Math.min(w, h) * 0.14, 80, 150);
    holes.push({
      x,
      y,
      rMax,
      born: performance.now(),
      dir: Math.random() > 0.5 ? 1 : -1,
      strength: 0.48 + Math.random() * 0.12,
    });
    if (holes.length > 10) holes.shift();
  }

  /**
   * MJ 同款局部涡旋：l = k / r 旋转场（非径向拉扯，避免弹簧感）
   * 参考 midjourney.com 首页 ASCII warp 与 1/r 角速度场
   */
  function localVortexWarp(px, py, hole, now) {
    const rMax = holeRadius(hole, now);
    if (rMax <= 0) return null;

    const relX = px - hole.x;
    const relY = py - hole.y;
    const dist = Math.hypot(relX, relY);
    const outerR = rMax + HOLE_SWIRL_ZONE;
    if (dist > outerR) return null;

    const vigor = holeVigor(hole, now);
    if (vigor < 0.02) return null;

    const rMin = Math.max(rMax * 0.14, 12);
    const age = now - hole.born;
    const swirl = 1 + Math.min(age / 900, 0.35);
    const l = hole.dir * hole.strength * vigor * swirl / Math.max(dist, rMin);

    const cosL = Math.cos(l);
    const sinL = Math.sin(l);
    const rotX = relX * cosL - relY * sinL;
    const rotY = relX * sinL + relY * cosL;

    const blend = (1 - smoothstep(rMax * 0.42, outerR, dist)) * vigor;
    const drawX = px + (rotX - relX) * blend;
    const drawY = py + (rotY - relY) * blend;

    const eyeR = rMax * 0.24 * smoothstep(0, HOLE_OPEN_MS, age);
    let cut = 0;
    if (dist < eyeR) cut = 1;
    else if (dist < eyeR + 5) cut = 1 - smoothstep(eyeR, eyeR + 5, dist);

    return { cut, drawX, drawY, blend };
  }

  function applyHoles(px, py, now) {
    let cut = 0;
    let drawX = px;
    let drawY = py;
    let bestBlend = 0;

    for (let i = holes.length - 1; i >= 0; i--) {
      const hole = holes[i];
      const age = now - hole.born;
      const rMax = holeRadius(hole, now);
      if (rMax <= 0) {
        if (age > HOLE_OPEN_MS + HOLE_REPAIR_MS + 80) holes.splice(i, 1);
        continue;
      }

      const r = localVortexWarp(px, py, hole, now);
      if (!r) continue;

      cut = Math.max(cut, r.cut);
      if (r.blend > bestBlend) {
        bestBlend = r.blend;
        drawX = r.drawX;
        drawY = r.drawY;
      }
    }

    return {
      cut,
      drawX,
      drawY,
      near: bestBlend > 0.02,
    };
  }

  function drawVortexEyes(now) {
    for (const hole of holes) {
      const rMax = holeRadius(hole, now);
      const vigor = holeVigor(hole, now);
      if (rMax < 6 || vigor < 0.12) continue;

      const eyeR = rMax * 0.2 * vigor;
      ctx.fillStyle = "#01040c";
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, eyeR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function onCanvasPointer(e) {
    if (!isVisible()) return;
    const rect = canvas.getBoundingClientRect();
    punchHole(e.clientX - rect.left, e.clientY - rect.top);
  }

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

  function drawStreams(scrollT, now) {
    const ringSpan = streams.length * ROW_STEP;
    const cols = Math.ceil((w + 200) / CHAR_STEP);
    const margin = 14;

    for (let si = 0; si < streams.length; si++) {
      const s = streams[si];
      const baseY = ((s.y - scrollT * s.speed * 0.08) % ringSpan + h + ROW_STEP) % (h + ROW_STEP) - ROW_STEP;
      const scrollWrap = s.textLen * CHAR_STEP;
      const scroll = scrollT * s.speed * 42 + s.phase;
      const rowAlpha = clamp(s.bright, 0.3, 0.48);

      for (let c = 0; c < cols; c++) {
        const sx = c * CHAR_STEP - (scroll % scrollWrap);
        const ch = s.text[c % s.textLen];
        if (ch === " ") continue;

        const p = warp(sx, baseY, twist);
        if (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) continue;

        const holeFx = applyHoles(p.x, p.y, now);
        if (holeFx.cut >= 0.99) continue;

        const drawX = holeFx.near ? Math.round(holeFx.drawX) : p.x;
        const drawY = holeFx.near ? Math.round(holeFx.drawY) : p.y;
        const alpha = rowAlpha * (1 - holeFx.cut);
        if (alpha < 0.05) continue;
        ctx.fillStyle = `rgba(0, 215, 238, ${alpha})`;
        ctx.fillText(ch, drawX, drawY);
      }
    }
  }

  function draw(scrollT, now) {
    ctx.fillStyle = "#01040c";
    ctx.fillRect(0, 0, w, h);
    drawStreams(scrollT, now);
    drawVortexEyes(now);
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
    draw((now - startTime) * 0.001, now);
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
    holes = [];
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

  canvas.addEventListener("pointerdown", onCanvasPointer);

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
