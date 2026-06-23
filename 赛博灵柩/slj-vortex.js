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
  const CHAR_STEP = 7;
  const ROW_STEP = 12;
  const DPR_CAP = 1;
  const RENDER_SCALE = 0.78;
  const TWIST_SPEED = 0.00011;
  const HOLE_OPEN_MS = 180;
  const HOLE_REPAIR_MS = 2400;
  const HOLE_SWIRL_ZONE = 50;
  const FILL_COLOR = "#00d7ee";
  const ATLAS_COLS = 16;

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
  let charAtlas = null;
  let colSkip = 1;
  let avgFrameMs = 16;
  let activeHoles = [];
  let holeBounds = null;
  let frameNow = 0;

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
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

  function holeVigor(hole, now) {
    const age = now - hole.born;
    const open = smoothstep(0, HOLE_OPEN_MS, age);
    if (age < HOLE_OPEN_MS) return open;
    const repairT = clamp((age - HOLE_OPEN_MS) / HOLE_REPAIR_MS, 0, 1);
    return open * (1 - easeOutCubic(repairT));
  }

  function buildCharAtlas() {
    const atlas = document.createElement("canvas");
    const rows = Math.ceil(96 / ATLAS_COLS);
    atlas.width = ATLAS_COLS * CHAR_STEP;
    atlas.height = rows * ROW_STEP;
    const actx = atlas.getContext("2d");
    actx.font = `${FONT_SIZE}px Consolas, "Courier New", monospace`;
    actx.textBaseline = "top";
    actx.fillStyle = "#ffffff";
    for (let i = 32; i < 128; i++) {
      const code = i - 32;
      const col = code % ATLAS_COLS;
      const row = Math.floor(code / ATLAS_COLS);
      actx.fillText(String.fromCharCode(i), col * CHAR_STEP, row * ROW_STEP);
    }
    charAtlas = atlas;
  }

  function drawGlyph(ch, x, y) {
    const code = ch.charCodeAt(0) - 32;
    if (code < 0 || code >= 96 || !charAtlas) return;
    const col = code % ATLAS_COLS;
    const row = Math.floor(code / ATLAS_COLS);
    ctx.drawImage(
      charAtlas,
      col * CHAR_STEP,
      row * ROW_STEP,
      CHAR_STEP,
      ROW_STEP,
      x,
      y,
      CHAR_STEP,
      ROW_STEP
    );
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
    if (holes.length > 8) holes.shift();
  }

  function localVortexWarp(px, py, hole, now) {
    const rMax = hole.rMaxNow;
    if (rMax <= 0) return null;

    const relX = px - hole.x;
    const relY = py - hole.y;
    const distSq = relX * relX + relY * relY;
    const outerR = rMax + HOLE_SWIRL_ZONE;
    if (distSq > outerR * outerR) return null;

    const dist = Math.sqrt(distSq);
    const vigor = hole.vigorNow;
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

  function applyHoles(px, py) {
    let cut = 0;
    let drawX = px;
    let drawY = py;
    let bestBlend = 0;

    for (let i = 0; i < activeHoles.length; i++) {
      const r = localVortexWarp(px, py, activeHoles[i], frameNow);
      if (!r) continue;
      cut = Math.max(cut, r.cut);
      if (r.blend > bestBlend) {
        bestBlend = r.blend;
        drawX = r.drawX;
        drawY = r.drawY;
      }
    }

    return { cut, drawX, drawY, near: bestBlend > 0.02 };
  }

  function syncActiveHoles(now) {
    activeHoles.length = 0;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = holes.length - 1; i >= 0; i--) {
      const hole = holes[i];
      const age = now - hole.born;
      const rMax = holeRadius(hole, now);
      if (rMax <= 0) {
        if (age > HOLE_OPEN_MS + HOLE_REPAIR_MS + 80) holes.splice(i, 1);
        continue;
      }
      const vigor = holeVigor(hole, now);
      hole.rMaxNow = rMax;
      hole.vigorNow = vigor;
      activeHoles.push(hole);

      const pad = rMax + HOLE_SWIRL_ZONE;
      minX = Math.min(minX, hole.x - pad);
      minY = Math.min(minY, hole.y - pad);
      maxX = Math.max(maxX, hole.x + pad);
      maxY = Math.max(maxY, hole.y + pad);
    }

    holeBounds = activeHoles.length
      ? { minX, minY, maxX, maxY }
      : null;
  }

  function drawVortexEyes() {
    for (let i = 0; i < activeHoles.length; i++) {
      const hole = activeHoles[i];
      if (hole.rMaxNow < 6 || hole.vigorNow < 0.12) continue;
      const eyeR = hole.rMaxNow * 0.2 * hole.vigorNow;
      ctx.fillStyle = "#01040c";
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, eyeR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function onCanvasPointer(e) {
    if (!isVisible()) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    punchHole((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  }

  function isVisible() {
    const view = document.getElementById("category-view");
    return view && !view.classList.contains("hidden") && !document.hidden;
  }

  function buildStreams() {
    streams = [];
    const count = Math.ceil(h / ROW_STEP) + 3;
    for (let i = 0; i < count; i++) {
      const text = (PROMPTS[i % PROMPTS.length] + "  --v 6  " + PROMPTS[(i + 2) % PROMPTS.length]).repeat(2);
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
    const rw = Math.max(1, Math.floor(w * RENDER_SCALE * dpr));
    const rh = Math.max(1, Math.floor(h * RENDER_SCALE * dpr));
    canvas.width = rw;
    canvas.height = rh;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(RENDER_SCALE * dpr, 0, 0, RENDER_SCALE * dpr, 0, 0);
    cx = w * 0.5;
    cy = h * 0.5;
    vortexRx = Math.max(w, h) * 0.72;
    vortexRy = vortexRx * 0.48;
    buildStreams();
    startTime = performance.now();
  }

  /** MJ 旋涡：水平流场 + 椭圆扭曲 */
  function warp(sx, sy, twistVal) {
    const dx = sx - cx;
    const dy = sy - cy;
    const nx = dx / vortexRx;
    const ny = dy / vortexRy;
    const er = Math.hypot(nx, ny);
    let ang = Math.atan2(ny, nx);

    const fall = Math.exp(-er * er * 0.42) * 1.65 + Math.max(0, 1.05 - er) ** 2.8 * 0.75;
    ang += twistVal * fall;

    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);
    return {
      x: cx + cosA * er * vortexRx,
      y: cy + sinA * er * vortexRy,
      er,
    };
  }

  function inHoleBounds(x, y) {
    if (!holeBounds) return false;
    return x >= holeBounds.minX && x <= holeBounds.maxX && y >= holeBounds.minY && y <= holeBounds.maxY;
  }

  function drawStreams(scrollT, now) {
    syncActiveHoles(now);

    const ringSpan = streams.length * ROW_STEP;
    const cols = Math.ceil((w + 160) / CHAR_STEP);
    const margin = 12;
    const hasHoles = activeHoles.length > 0;
    const twistVal = twist;

    ctx.fillStyle = FILL_COLOR;

    for (let si = 0; si < streams.length; si++) {
      const s = streams[si];
      const baseY = ((s.y - scrollT * s.speed * 0.08) % ringSpan + h + ROW_STEP) % (h + ROW_STEP) - ROW_STEP;
      const scrollWrap = s.textLen * CHAR_STEP;
      const scroll = scrollT * s.speed * 42 + s.phase;
      const rowAlpha = clamp(s.bright, 0.3, 0.48);
      ctx.globalAlpha = rowAlpha;

      for (let c = 0; c < cols; c += colSkip) {
        const sx = c * CHAR_STEP - (scroll % scrollWrap);
        const ch = s.text[c % s.textLen];
        if (ch === " ") continue;

        const p = warp(sx, baseY, twistVal);
        if (p.er > 1.55 && (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin)) {
          continue;
        }
        if (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) continue;

        let drawX = p.x;
        let drawY = p.y;
        let alphaMul = 1;

        if (hasHoles && inHoleBounds(p.x, p.y)) {
          const holeFx = applyHoles(p.x, p.y);
          if (holeFx.cut >= 0.99) continue;
          if (holeFx.near) {
            drawX = holeFx.drawX;
            drawY = holeFx.drawY;
          }
          alphaMul = 1 - holeFx.cut;
        }

        if (alphaMul < 0.05) continue;
        ctx.globalAlpha = rowAlpha * alphaMul;
        drawGlyph(ch, drawX, drawY);
      }
    }

    ctx.globalAlpha = 1;
  }

  function draw(scrollT, now) {
    frameNow = now;
    ctx.fillStyle = "#01040c";
    ctx.fillRect(0, 0, w, h);
    drawStreams(scrollT, now);
    drawVortexEyes();
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
    avgFrameMs = avgFrameMs * 0.9 + dt * 0.1;

    if (avgFrameMs > 22 && colSkip < 2) colSkip = 2;
    else if (avgFrameMs < 14 && colSkip > 1) colSkip = 1;

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
    activeHoles = [];
    holeBounds = null;
    colSkip = 1;
    avgFrameMs = 16;
    stage?.classList.remove("slj-stage--ready");
    replayLogo();
  }

  window.sljVortexPause = stop;
  window.sljVortexResume = () => {
    if (isVisible()) start();
  };
  window.sljVortexReplay = replay;

  buildCharAtlas();
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
