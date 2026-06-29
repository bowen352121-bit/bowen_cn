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
  const HOLE_OPEN_MS = 420;
  const HOLE_REPAIR_MS = 5200;
  const HOLE_SWIRL_ZONE = 72;
  const CLICK_VORTEX_SCALE = 0.32;
  const CLICK_VORTEX_MIN = 200;
  const CLICK_VORTEX_MAX = 420;
  const MAX_HOLES = 4;
  const VORTEX_CHARS = "/\\|<>{}[]01.:;#@&$abcdefghijklmnopqrstuvwxyz";
  const VORTEX_ARMS = 3;
  const FILL_COLOR = "#00d7ee";
  const VORTEX_CORE = "#66f0ff";
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

  function easeOutQuart(t) {
    return 1 - (1 - t) ** 4;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  function easeOutBack(t) {
    const c1 = 1.55;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
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
    if (age < HOLE_OPEN_MS) {
      const t = age / HOLE_OPEN_MS;
      return hole.rMax * clamp(easeOutBack(t), 0, 1.04);
    }
    if (age < HOLE_OPEN_MS + HOLE_REPAIR_MS) {
      const t = (age - HOLE_OPEN_MS) / HOLE_REPAIR_MS;
      return hole.rMax * (1 - easeInOutCubic(t));
    }
    return 0;
  }

  function holeVigor(hole, now) {
    const age = now - hole.born;
    const openT = clamp(age / HOLE_OPEN_MS, 0, 1);
    const open = easeOutQuart(openT);
    if (age < HOLE_OPEN_MS) return open;
    const repairT = clamp((age - HOLE_OPEN_MS) / HOLE_REPAIR_MS, 0, 1);
    const sustain = 1 - easeOutQuart(repairT);
    return open * sustain;
  }

  function holeCenter(hole, age, vigor) {
    const drift = vigor * hole.rMaxNow * 0.07;
    const wobble = 1 + 0.35 * Math.exp(-age / 680);
    return {
      x: hole.x + Math.sin(age * 0.0016 + hole.driftPhase) * drift * wobble,
      y: hole.y + Math.cos(age * 0.0013 + hole.driftPhase * 1.37) * drift * wobble,
    };
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

  function drawGlyph(ch, x, y, alpha) {
    const code = ch.charCodeAt(0) - 32;
    if (code < 0 || code >= 96 || !charAtlas) return;
    const col = code % ATLAS_COLS;
    const row = Math.floor(code / ATLAS_COLS);
    if (alpha !== undefined) ctx.globalAlpha = alpha;
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

  function drawGlyphRotated(ch, x, y, rot, alpha) {
    const code = ch.charCodeAt(0) - 32;
    if (code < 0 || code >= 96 || !charAtlas) return;
    const col = code % ATLAS_COLS;
    const row = Math.floor(code / ATLAS_COLS);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      charAtlas,
      col * CHAR_STEP,
      row * ROW_STEP,
      CHAR_STEP,
      ROW_STEP,
      -CHAR_STEP * 0.5,
      -ROW_STEP * 0.5,
      CHAR_STEP,
      ROW_STEP
    );
    ctx.restore();
  }

  function punchHole(x, y) {
    const rMax = clamp(Math.min(w, h) * CLICK_VORTEX_SCALE, CLICK_VORTEX_MIN, CLICK_VORTEX_MAX);
    const swirlZone = rMax * 0.62;
    holes.push({
      x,
      y,
      rMax,
      swirlZone,
      born: performance.now(),
      dir: Math.random() > 0.5 ? 1 : -1,
      strength: 0.95 + Math.random() * 0.2,
      spin: 0.0032 + Math.random() * 0.0012,
      phase: Math.random() * Math.PI * 2,
      driftPhase: Math.random() * Math.PI * 2,
      wobbleSeed: Math.random() * Math.PI * 2,
    });
    if (holes.length > MAX_HOLES) holes.splice(0, holes.length - MAX_HOLES);
  }

  function localVortexWarp(px, py, hole, now) {
    const rMax = hole.rMaxNow;
    if (rMax <= 0) return null;

    const age = now - hole.born;
    const vigor = hole.vigorNow;
    if (vigor < 0.02) return null;

    const center = holeCenter(hole, age, vigor);
    const relX = px - center.x;
    const relY = py - center.y;
    const distSq = relX * relX + relY * relY;
    const outerR = rMax + (hole.swirlZone ?? HOLE_SWIRL_ZONE);
    if (distSq > outerR * outerR) return null;

    const dist = Math.sqrt(distSq);
    const rNorm = dist / outerR;
    const accel = smoothstep(0, 520, age);
    const swirlBase = 2.4 + 2.1 * accel * (1 - rNorm * 0.35);
    const wobble = 1 + 0.12 * Math.sin(age * 0.011 + dist * 0.05 + hole.wobbleSeed);
    const l =
      hole.dir *
      hole.strength *
      vigor *
      swirlBase *
      wobble /
      (1 + dist * 0.016);

    const cosL = Math.cos(l);
    const sinL = Math.sin(l);
    const rotX = relX * cosL - relY * sinL;
    const rotY = relX * sinL + relY * cosL;

    const inner = rMax * 0.06;
    const fallNorm = (dist - inner) / (outerR * 0.62);
    const falloff = Math.exp(-(fallNorm * fallNorm));
    const blend = falloff * vigor * 0.92;
    const inward = blend * vigor * 0.28 * (1 - rNorm) ** 1.4;
    const invDist = 1 / Math.max(dist, rMax * 0.08);
    const drawX = px + (rotX - relX) * blend - relX * inward * invDist;
    const drawY = py + (rotY - relY) * blend - relY * inward * invDist;

    return { cut: 0, drawX, drawY, blend };
  }

  function vortexSpin(hole, age) {
    const accel = smoothstep(0, 480, age);
    const burst = Math.exp(-age / 920) * 0.0055;
    const decay = 0.72 + 0.28 * Math.exp(-age / 2400);
    return age * (hole.spin * accel * decay + burst) * hole.dir + (hole.phase ?? 0);
  }

  function vortexArmAlpha(t, vigor, age, step) {
    const edgeIn = smoothstep(0, 0.14, t);
    const edgeOut = 1 - smoothstep(0.78, 1, t);
    const midGlow = 0.68 + 0.32 * Math.sin(t * Math.PI);
    const pulse = 1 + 0.08 * Math.sin(age * 0.009 + step * 0.18);
    return clamp(vigor * edgeIn * edgeOut * midGlow * pulse, 0.1, 1);
  }

  function drawVortexOverlay(now) {
    if (!activeHoles.length) return;

    for (let hi = 0; hi < activeHoles.length; hi++) {
      const hole = activeHoles[hi];
      const rMax = hole.rMaxNow;
      const vigor = hole.vigorNow;
      if (rMax <= 0 || vigor < 0.04) continue;

      const age = now - hole.born;
      const spin = vortexSpin(hole, age);
      const center = holeCenter(hole, age, vigor);
      const steps = Math.max(52, Math.floor(rMax / 4.2));
      const turns = 2.45 + 0.35 * Math.sin(age * 0.0018 + hole.wobbleSeed);

      for (let arm = 0; arm < VORTEX_ARMS; arm++) {
        const armBase = (arm / VORTEX_ARMS) * Math.PI * 2 + hole.wobbleSeed * 0.08;

        for (let step = 0; step < steps; step++) {
          const tRaw = step / (steps - 1);
          const t = easeOutQuart(tRaw);
          const ripple = 1 + 0.045 * Math.sin(age * 0.01 + step * 0.24 + arm);
          const radius = rMax * Math.pow(1 - t, 0.68) * ripple;
          const theta =
            spin +
            armBase +
            t * turns * Math.PI * 2 +
            Math.sin(age * 0.008 + t * 5.5 + hole.wobbleSeed) * 0.14 * vigor;
          const px = center.x + Math.cos(theta) * radius;
          const py = center.y + Math.sin(theta) * radius;

          if (px < -24 || px > w + 24 || py < -24 || py > h + 24) continue;

          const alpha = vortexArmAlpha(tRaw, vigor, age, step);
          const charIdx = (arm * 97 + step * 13 + hi * 31) % VORTEX_CHARS.length;
          const ch = VORTEX_CHARS[charIdx];
          const tangent = theta + Math.PI * 0.5 * hole.dir + Math.sin(age * 0.007 + step * 0.1) * 0.08;

          ctx.fillStyle = tRaw < 0.24 ? VORTEX_CORE : FILL_COLOR;
          drawGlyphRotated(ch, px, py, tangent, alpha);
        }
      }

      const ripples = 2;
      for (let ring = 0; ring < ripples; ring++) {
        const expand = smoothstep(0, HOLE_OPEN_MS * 1.2, age);
        const ringT = (0.42 + ring * 0.22 + expand * 0.18) * (1 - ring * 0.04);
        const radius = rMax * ringT * (1 + 0.03 * Math.sin(age * 0.012 + ring));
        const count = Math.max(18, Math.floor(radius * 0.22));
        const ringSpin = spin * (1.08 - ring * 0.1);

        for (let i = 0; i < count; i++) {
          const theta =
            ringSpin +
            (i / count) * Math.PI * 2 +
            Math.sin(age * 0.006 + i * 0.35) * 0.06 * vigor;
          const px = center.x + Math.cos(theta) * radius;
          const py = center.y + Math.sin(theta) * radius;
          const alpha = clamp(vigor * (0.2 - ring * 0.05) * expand, 0.06, 0.32);
          const ch = VORTEX_CHARS[(ring * 41 + i * 5) % VORTEX_CHARS.length];

          ctx.fillStyle = FILL_COLOR;
          drawGlyphRotated(ch, px, py, theta + Math.PI * 0.5 * hole.dir, alpha);
        }
      }

      const coreCount = 6;
      for (let i = 0; i < coreCount; i++) {
        const theta = spin * 1.65 + (i / coreCount) * Math.PI * 2;
        const radius = rMax * 0.07 * (0.55 + (i % 3) * 0.18) * (1 + 0.08 * Math.sin(age * 0.014 + i));
        const px = center.x + Math.cos(theta) * radius;
        const py = center.y + Math.sin(theta) * radius;
        const ch = VORTEX_CHARS[(i * 19) % VORTEX_CHARS.length];

        ctx.fillStyle = VORTEX_CORE;
        drawGlyphRotated(ch, px, py, theta, clamp(vigor * 0.92, 0.3, 1));
      }
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = FILL_COLOR;
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

      const pad = rMax + (hole.swirlZone ?? HOLE_SWIRL_ZONE);
      minX = Math.min(minX, hole.x - pad);
      minY = Math.min(minY, hole.y - pad);
      maxX = Math.max(maxX, hole.x + pad);
      maxY = Math.max(maxY, hole.y + pad);
    }

    holeBounds = activeHoles.length
      ? { minX, minY, maxX, maxY }
      : null;
  }

  function pointerToCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    return {
      x: ((clientX - rect.left) / rect.width) * w,
      y: ((clientY - rect.top) / rect.height) * h,
    };
  }

  function onCanvasPointer(e) {
    if (!isVisible()) return;
    if (e.button !== 0) return;
    if (e.target.closest(".slj-pay")) return;
    const pos = pointerToCanvas(e.clientX, e.clientY);
    if (!pos) return;
    e.stopPropagation();
    punchHole(pos.x, pos.y);
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
    const sw = stage.clientWidth || window.innerWidth;
    const sh = stage.clientHeight || window.innerHeight;
    w = sw;
    h = sh;
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

        if (hasHoles && inHoleBounds(p.x, p.y)) {
          const holeFx = applyHoles(p.x, p.y);
          if (holeFx.near) {
            drawX = holeFx.drawX;
            drawY = holeFx.drawY;
          }
        }
        ctx.globalAlpha = rowAlpha;
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
    drawVortexOverlay(now);
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

  stage?.addEventListener("pointerdown", (e) => {
    if (e.target === canvas || e.target.closest(".slj-pay")) return;
    if (!isVisible()) return;
    if (e.button !== 0) return;
    const pos = pointerToCanvas(e.clientX, e.clientY);
    if (!pos) return;
    punchHole(pos.x, pos.y);
  });

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
