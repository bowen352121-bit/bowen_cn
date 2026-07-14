/**
 * 03 · 1 — 完工版现代豪宅（实体+玻璃+内光）
 */
import * as THREE from "three";
import { hash2, createMeshContext, buildCastleLayer } from "../castle-utils.js";

function groundY(x, z) {
  const d = Math.hypot(x, z);
  let y = 0.15 + Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.35;
  y *= Math.exp(-(d * d) / 320);
  if (d > 14) y -= (d - 14) * 0.12;
  return y;
}

function addMesh(ctx, mesh, tag, hull = true) {
  ctx.addMesh(mesh, { tag, hull });
}

function addBox(ctx, cx, baseY, cz, w, h, d, tag = "villa", rotY = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ctx.dummyMat);
  m.position.set(cx, baseY + h / 2, cz);
  m.rotation.y = rotY;
  addMesh(ctx, m, tag);
}

function addSlab(ctx, cx, y, cz, w, d, tag = "roof", rotY = 0, thick = 0.14) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, thick, d), ctx.dummyMat);
  m.position.set(cx, y, cz);
  m.rotation.y = rotY;
  addMesh(ctx, m, tag);
}

function addStoneSkirt(ctx, cx, baseY, cz, w, h, d, rotY = 0) {
  addBox(ctx, cx, baseY, cz, w, h, d, "villa", rotY);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, 0.08, d * 1.02), ctx.dummyMat);
  cap.position.set(cx, baseY + h, cz);
  cap.rotation.y = rotY;
  addMesh(ctx, cap, "detail");
}

function addWindowGrid(ctx, cx, baseY, cz, w, h, zOff, cols, rows, rotY = 0) {
  const z = cz + zOff;
  const edgeT = 0.07;
  for (const [ox, oy, ow, oh] of [
    [-w / 2, 0, edgeT, h], [w / 2, 0, edgeT, h],
    [0, -h / 2, w, edgeT], [0, h / 2, w, edgeT],
  ]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(ow, oh, 0.08), ctx.dummyMat);
    e.position.set(cx + ox, baseY + h / 2 + oy, z);
    e.rotation.y = rotY;
    addMesh(ctx, e, "glass");
  }
  for (let c = 1; c < cols; c++) {
    const ox = -w / 2 + (w / cols) * c;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, h * 0.96, 0.06), ctx.dummyMat);
    bar.position.set(cx + ox, baseY + h / 2, z);
    bar.rotation.y = rotY;
    addMesh(ctx, bar, "glass");
  }
  for (let r = 1; r < rows; r++) {
    const oy = -h / 2 + (h / rows) * r;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.97, 0.06, 0.06), ctx.dummyMat);
    bar.position.set(cx, baseY + h / 2 + oy, z);
    bar.rotation.y = rotY;
    addMesh(ctx, bar, "glass");
    const spandrel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, (h / rows) * 0.35, 0.1), ctx.dummyMat);
    spandrel.position.set(cx, baseY + h / 2 + oy - (h / rows) * 0.18, z - 0.04);
    spandrel.rotation.y = rotY;
    addMesh(ctx, spandrel, "villa");
  }
  const inner = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, h * 0.88, 0.04), ctx.dummyMat);
  inner.position.set(cx, baseY + h / 2, z - 0.06);
  inner.rotation.y = rotY;
  addMesh(ctx, inner, "interior");
}

function addLitInterior(ctx, cx, baseY, cz, w, h, d) {
  addBox(ctx, cx, baseY + 0.08, cz, w * 0.92, h * 0.84, d * 0.88, "interior");
  const floorY = baseY + h * 0.35;
  addSlab(ctx, cx, floorY, cz, w * 0.85, d * 0.82, "interior", 0, 0.05);
  addSlab(ctx, cx, baseY + h * 0.72, cz, w * 0.85, d * 0.82, "interior", 0, 0.05);
  const ceilLight = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.03, d * 0.5), ctx.dummyMat);
  ceilLight.position.set(cx, baseY + h * 0.9, cz);
  addMesh(ctx, ceilLight, "light");
}

function addCompletedRoof(ctx, cx, y, cz, w, d, overhang = 0.55) {
  const rw = w + overhang * 2;
  const rd = d + overhang * 2;
  addSlab(ctx, cx, y, cz, rw, rd, "roof", 0, 0.16);
  const ph = 0.42;
  for (const [ox, oz, pw, pd] of [
    [0, rd / 2 - 0.08, rw, ph], [0, -rd / 2 + 0.08, rw, ph],
    [-rw / 2 + 0.08, 0, ph, rd], [rw / 2 - 0.08, 0, ph, rd],
  ]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pd), ctx.dummyMat);
    p.position.set(cx + ox, y + ph / 2 + 0.04, cz + oz);
    addMesh(ctx, p, "villa");
  }
  for (const side of [-1, 1]) {
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.12, 0.22), ctx.dummyMat);
    fascia.position.set(cx, y - 0.04, cz + side * (rd / 2 + 0.04));
    addMesh(ctx, fascia, "detail");
  }
}

function addBalcony(ctx, cx, y, cz, w, protrudeZ) {
  addSlab(ctx, cx, y, cz + protrudeZ / 2, w, protrudeZ + 0.35, "roof", 0, 0.1);
  addRailing(ctx, cx, y + 0.2, cz + protrudeZ + 0.05, w, 0, Math.ceil(w / 0.65) + 1);
  for (const ox of [-w / 2 + 0.2, w / 2 - 0.2]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), ctx.dummyMat);
    lamp.position.set(cx + ox, y + 0.32, cz + protrudeZ);
    addMesh(ctx, lamp, "light");
  }
}

function addRailing(ctx, cx, y, cz, length, rotY = 0, posts = 7) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.06, 0.08), ctx.dummyMat);
  rail.position.set(cx, y, cz);
  rail.rotation.y = rotY;
  addMesh(ctx, rail, "detail");
  const step = length / Math.max(1, posts - 1);
  for (let i = 0; i < posts; i++) {
    const ox = -length / 2 + step * i;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), ctx.dummyMat);
    post.position.set(cx, y - 0.2, cz);
    post.rotation.y = rotY;
    post.translateX(ox);
    addMesh(ctx, post, "detail");
  }
}

function addWing(ctx, cx, baseY, cz, w, h, d, opts = {}) {
  const { skirtH = 0.75, glassFace = "front", cols = 5, rows = 4, roofOh = 0.6, balcony = null } = opts;
  addStoneSkirt(ctx, cx, baseY, cz, w, skirtH, d);
  const wallY = baseY + skirtH;
  const wallH = h - skirtH;

  addBox(ctx, cx, wallY, cz, w, wallH, d, "villa");
  addLitInterior(ctx, cx, wallY, cz, w, wallH, d);

  if (glassFace === "front" || glassFace === "both") {
    addWindowGrid(ctx, cx, wallY + 0.1, cz + d / 2, w * 0.92, wallH - 0.2, -0.08, cols, rows);
  }
  if (glassFace === "back" || glassFace === "both") {
    addWindowGrid(ctx, cx, wallY + 0.1, cz - d / 2, w * 0.88, wallH - 0.2, 0.08, cols - 1, rows);
  }
  if (glassFace === "front" || glassFace === "both") {
    addWindowGrid(ctx, cx + w / 2, wallY + 0.1, cz, d * 0.85, wallH - 0.2, -0.08, 3, rows, Math.PI / 2);
  }

  addCompletedRoof(ctx, cx, baseY + h, cz, w, d, roofOh);
  if (balcony) addBalcony(ctx, balcony.x ?? cx, baseY + h - 0.05, balcony.z ?? cz + d / 2, balcony.w ?? w * 0.85, balcony.p ?? 0.85);
}

function addEntrance(ctx, cx, baseY, cz) {
  addStoneSkirt(ctx, cx, baseY, cz, 3.8, 0.55, 2.2);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.5, 0.18), ctx.dummyMat);
  frame.position.set(cx, baseY + 1.55, cz);
  addMesh(ctx, frame, "detail");
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.2, 0.08), ctx.dummyMat);
  doorL.position.set(cx - 0.72, baseY + 1.45, cz + 0.06);
  addMesh(ctx, doorL, "timber");
  const doorR = doorL.clone();
  doorR.position.set(cx + 0.72, baseY + 1.45, cz + 0.06);
  addMesh(ctx, doorR, "timber");
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 2.4), ctx.dummyMat);
  canopy.position.set(cx, baseY + 2.85, cz + 0.5);
  addMesh(ctx, canopy, "roof");
  for (const ox of [-1.5, 0, 1.5]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.45, 8), ctx.dummyMat);
    col.position.set(cx + ox, baseY + 1.35, cz + 0.85);
    addMesh(ctx, col, "pillar");
  }
  const foyerGlow = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2, 1.6), ctx.dummyMat);
  foyerGlow.position.set(cx, baseY + 1.4, cz - 0.6);
  addMesh(ctx, foyerGlow, "interior");
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.6 - i * 0.3, 0.14, 0.42), ctx.dummyMat);
    step.position.set(cx, baseY + 0.07 + i * 0.14, cz + 1.5 + i * 0.38);
    addMesh(ctx, step, "detail");
  }
}

function addExternalStairs(ctx, x0, y0, z0, x1, y1, z1, width, steps) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  const rise = dy / steps;
  const run = len / steps;

  const landings = [Math.floor(steps / 2)];
  for (let i = 0; i < steps; i++) {
    const sx = x0 + (dx / steps) * (i + 0.5);
    const sy = y0 + rise * i + rise * 0.5;
    const sz = z0 + (dz / steps) * (i + 0.5);
    const step = new THREE.Mesh(new THREE.BoxGeometry(run * 0.94, 0.15, width), ctx.dummyMat);
    step.position.set(sx, sy, sz);
    step.rotation.y = -ang + Math.PI / 2;
    addMesh(ctx, step, "detail");
    if (landings.includes(i)) {
      const plat = new THREE.Mesh(new THREE.BoxGeometry(width * 1.1, 0.14, run * 1.8), ctx.dummyMat);
      plat.position.set(sx, sy + 0.08, sz);
      plat.rotation.y = -ang + Math.PI / 2;
      addMesh(ctx, plat, "detail");
    }
  }
  const midX = (x0 + x1) / 2;
  const midZ = (z0 + z1) / 2;
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, len * 1.05), ctx.dummyMat);
    rail.position.set(
      midX + Math.cos(ang + Math.PI / 2) * side * width * 0.52,
      y0 + dy * 0.55 + 0.52,
      midZ + Math.sin(ang + Math.PI / 2) * side * width * 0.52,
    );
    rail.rotation.y = -ang;
    addMesh(ctx, rail, "detail");
  }
}

function addOriel(ctx, cx, baseY, cz, w, h, protrude) {
  addBox(ctx, cx, baseY, cz + protrude / 2, w, h, protrude, "villa");
  addLitInterior(ctx, cx, baseY, cz + protrude / 2, w, h, protrude);
  addWindowGrid(ctx, cx, baseY + 0.08, cz + protrude + 0.04, w * 0.9, h - 0.15, -0.05, 3, 4);
  addCompletedRoof(ctx, cx, baseY + h, cz + protrude / 2, w, protrude, 0.35);
  addBalcony(ctx, cx, baseY + h - 0.04, cz + protrude, w * 0.92, 0.25);
}

function addTower(ctx, cx, baseY, cz, r, h) {
  addStoneSkirt(ctx, cx, baseY, cz, r * 2.1, 0.7, r * 2.1);
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h - 0.7, 14), ctx.dummyMat);
  cyl.position.set(cx, baseY + 0.7 + (h - 0.7) / 2, cz);
  addMesh(ctx, cyl, "villa");
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    addWindowGrid(ctx, cx + Math.cos(a) * r * 0.92, baseY + 1.2, cz + Math.sin(a) * r * 0.92, 0.85, h - 1.8, -0.05, 2, 5, a + Math.PI / 2);
  }
  const ceil = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.15, r * 1.08, 0.2, 14), ctx.dummyMat);
  ceil.position.set(cx, baseY + h + 0.08, cz);
  addMesh(ctx, ceil, "roof");
  const glow = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, h * 0.6, 10), ctx.dummyMat);
  glow.position.set(cx, baseY + h * 0.55, cz);
  addMesh(ctx, glow, "interior");
}

function addFountainPlaza(ctx, cx, cz) {
  const gy = groundY(cx, cz);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.95, 0.32, 24), ctx.dummyMat);
  pool.position.set(cx, gy + 0.16, cz);
  addMesh(ctx, pool, "garden");
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.55, 0.06, 24), ctx.dummyMat);
  water.position.set(cx, gy + 0.3, cz);
  addMesh(ctx, water, "interior");

  for (const [ox, oz] of [[-1.8, 0.6], [1.6, -0.5]]) {
    const fx = cx + ox;
    const fz = cz + oz;
    const fgy = groundY(fx, fz);
    for (let t = 0; t < 3; t++) {
      const rad = 0.95 - t * 0.28;
      const bh = 0.26;
      const y = fgy + 0.28 + t * 0.24;
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad * 0.75, bh, 16), ctx.dummyMat);
      bowl.position.set(fx, y + bh / 2, fz);
      addMesh(ctx, bowl, "garden");
    }
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.5, 6), ctx.dummyMat);
    spout.position.set(fx, fgy + 1.05, fz);
    addMesh(ctx, spout, "detail");
  }
}

function addLantern(ctx, x, y, z) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1, 6), ctx.dummyMat);
  post.position.set(x, y + 0.5, z);
  addMesh(ctx, post, "detail");
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.24), ctx.dummyMat);
  lamp.position.set(x, y + 1.1, z);
  addMesh(ctx, lamp, "light");
}

function addBush(ctx, x, z, s = 0.5) {
  const gy = groundY(x, z);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 7), ctx.dummyMat);
  bush.position.set(x, gy + s * 0.55, z);
  bush.scale.set(1.1, 0.72, 1.1);
  addMesh(ctx, bush, "garden");
}

function addTree(ctx, x, z) {
  const gy = groundY(x, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6), ctx.dummyMat);
  trunk.position.set(x, gy + 0.8, z);
  addMesh(ctx, trunk, "garden");
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 7), ctx.dummyMat);
  crown.position.set(x, gy + 2.4, z);
  addMesh(ctx, crown, "garden");
}

function buildGround(ctx) {
  const geo = new THREE.PlaneGeometry(42, 34, 72, 58);
  geo.rotateX(-Math.PI / 2);
  const attr = geo.attributes.position;
  for (let i = 0; i < attr.count; i++) attr.setY(i, groundY(attr.getX(i), attr.getZ(i)));
  geo.computeVertexNormals();
  addMesh(ctx, new THREE.Mesh(geo, ctx.dummyMat), "base");

  addSlab(ctx, 0.5, groundY(0.5, 5) + 0.04, 5.5, 19, 5, "base", 0, 0.1);
  addSlab(ctx, -7.5, groundY(-7.5, 0) + 0.03, -0.5, 8, 8, "base", 0, 0.09);
  addSlab(ctx, 9, groundY(9, 6) + 0.03, 6.5, 8, 5.5, "base", 0, 0.09);
}

function buildVillaMain(ctx) {
  const BY = 0.48;

  // 统一台地基座
  addBox(ctx, 0.5, BY, 0.2, 21, 0.45, 13.5, "villa");
  addBox(ctx, -7, BY + 0.1, -0.8, 7.5, 0.35, 7, "villa");
  addBox(ctx, 8.8, BY + 0.12, 2, 7.2, 0.38, 7.5, "villa");

  // ── 一层翼楼 ──
  addWing(ctx, -6.5, BY + 0.45, -0.5, 6.8, 3.05, 5.8, { cols: 4, rows: 3, roofOh: 0.65, balcony: { p: 0.75 } });
  addWing(ctx, 1, BY + 0.45, 0, 9.5, 3.15, 7.5, { cols: 6, rows: 3, glassFace: "both", roofOh: 0.7 });
  addWing(ctx, 8.8, BY + 0.45, 1.8, 6.8, 3.25, 6.5, { cols: 5, rows: 3, roofOh: 0.75, balcony: { p: 0.8 } });
  addEntrance(ctx, 0.2, BY + 0.45, 4.35);
  addTower(ctx, 11.5, BY + 0.45, 4, 1.05, 3.35);

  // ── 二层（退台叠建）──
  const L2 = BY + 3.55;
  addWing(ctx, -5.8, L2, -0.2, 6.2, 2.85, 5.2, { cols: 4, rows: 3, skirtH: 0.35, roofOh: 0.7, balcony: { p: 0.7 } });
  addWing(ctx, 1.5, L2, 0.5, 9.2, 2.95, 7, { cols: 6, rows: 4, skirtH: 0.35, glassFace: "both", roofOh: 0.75 });
  addWing(ctx, 9, L2, 2.2, 6.5, 3.1, 6.2, { cols: 5, rows: 4, skirtH: 0.35, roofOh: 0.8, balcony: { p: 0.65 } });
  addOriel(ctx, 4.2, L2 + 0.1, 3.85, 2.3, 2.4, 0.95);
  addOriel(ctx, -0.5, L2 + 0.1, 3.85, 1.9, 2.4, 0.8);

  // ── 三层（中央+右塔）──
  const L3 = BY + 6.55;
  addWing(ctx, 2.5, L3, 1, 7.2, 2.65, 5.5, { cols: 5, rows: 3, skirtH: 0.3, roofOh: 0.85, balcony: { p: 0.6 } });
  addWing(ctx, 9.5, L3, 2.5, 5.5, 3.35, 5.5, { cols: 4, rows: 5, skirtH: 0.3, roofOh: 0.65 });
  addTower(ctx, 11.3, L3, 4.3, 0.82, 3.5);

  // 左翼柱廊（有矮墙围合，非裸柱）
  const pY = BY + 0.45;
  for (const px of [-10.2, -8.8, -7.4]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.6, 8), ctx.dummyMat);
    col.position.set(px, pY + 1.3, -2.2);
    addMesh(ctx, col, "pillar");
    const col2 = col.clone();
    col2.position.set(px, pY + 1.3, 0.6);
    addMesh(ctx, col2, "pillar");
  }
  addBox(ctx, -8.8, pY, -0.8, 5.5, 0.55, 4.2, "villa");
  addWindowGrid(ctx, -8.8, pY + 0.65, 1.35, 5, 1.85, -0.06, 4, 3);
  addCompletedRoof(ctx, -8.8, pY + 2.65, -0.8, 6, 4.8, 0.6);
  addBalcony(ctx, -8.8, pY + 2.58, 1.5, 5.5, 0.7);

  // 外部楼梯 + 平台
  addExternalStairs(ctx, -0.5, BY + 0.45, 6.5, -5, L2, 2.8, 1.3, 15);
  addExternalStairs(ctx, 5.5, L2, 5.8, 3.2, L3, 4.9, 1.1, 10);
  addSlab(ctx, -5, L2 - 0.02, 2.8, 2.2, 1.8, "detail", 0, 0.12);
  addRailing(ctx, -5, L2 + 0.15, 3.55, 2, 0, 4);

  // 木格栅屏风
  for (let c = 0; c <= 5; c++) {
    const ox = -10 + (2.2 / 5) * c;
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 0.05), ctx.dummyMat);
    v.position.set(ox, pY + 1.5, -3.6);
    addMesh(ctx, v, "timber");
  }
  for (let r = 0; r <= 6; r++) {
    const hb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.05), ctx.dummyMat);
    hb.position.set(-9.9, pY + 0.7 + (1.8 / 6) * r, -3.6);
    addMesh(ctx, hb, "timber");
  }
}

function buildGarden(ctx) {
  addFountainPlaza(ctx, 7, 7.2);
  addTree(ctx, -11.5, 1);
  addTree(ctx, 12.5, 2);
  const bushes = [
    [-11, 3], [12, 5], [-3, 8], [4, 8.5], [-9, 6], [10.5, -1], [0, -4.5], [6, -3.5],
  ];
  for (const [bx, bz] of bushes) addBush(ctx, bx, bz, 0.42 + hash2(bx, bz) * 0.28);
  const lanterns = [
    [-4, 0.5, 7], [1.5, 0.5, 7.3], [7, 0.5, 6.8],
    [-8, 3.6, 3.5], [5, 3.6, 5.5], [10, 3.6, 5],
    [-6, 6.6, 3.2], [4, 6.6, 4.5], [9.5, 6.6, 4.8],
  ];
  for (const [lx, ly, lz] of lanterns) addLantern(ctx, lx, ly + groundY(lx, lz), lz);
}

function colorFn(x, y, z, kind) {
  if (kind === 2) return new THREE.Color(0.98, 0.78, 0.42);
  if (kind === 1) {
    const f = 0.58 + hash2(x, z) * 0.22;
    return new THREE.Color(0.48 * f, 0.72 * f, 0.95 * f);
  }
  if (kind === 3) {
    const w = 0.65 + hash2(x, y) * 0.2;
    return new THREE.Color(0.92 * w, 0.82 * w, 0.58 * w);
  }
  return new THREE.Color(0.91, 0.94, 0.98);
}

export function createVillaCastleLayer({ makeEndfieldMaterial, dummyMat, blackHullMat }) {
  const ctx = createMeshContext(dummyMat, blackHullMat);
  ctx.dummyMat = dummyMat;
  buildGround(ctx);
  buildVillaMain(ctx);
  buildGarden(ctx);

  return buildCastleLayer({
    makeEndfieldMaterial,
    entries: ctx.entries,
    meshGroup: ctx.meshGroup,
    hullGroup: ctx.hullGroup,
    colorFn,
    layers: [
      { tag: "interior", kind: 3, max: 140000, layerStep: 0.12, alongStep: 0.1, mat: [1.18, 0.58], renderOrder: 5 },
      { tag: "glass", kind: 1, max: 160000, layerStep: 0.11, alongStep: 0.09, mat: [1.18, 0.9], renderOrder: 4 },
      { tag: "light", kind: 2, max: 24000, layerStep: 0.1, alongStep: 0.08, mat: [1.28, 0.62], renderOrder: 6 },
      { tag: "villa", kind: 0, max: 160000, layerStep: 0.13, alongStep: 0.1, mat: [1.14, 0.88], renderOrder: 3 },
      { tag: "roof", kind: 0, max: 72000, layerStep: 0.12, alongStep: 0.09, mat: [1.16, 0.9], renderOrder: 3 },
      { tag: "pillar", kind: 0, max: 28000, layerStep: 0.13, alongStep: 0.1, mat: [1.1, 0.82], renderOrder: 2 },
      { tag: "timber", kind: 0, max: 20000, layerStep: 0.13, alongStep: 0.1, mat: [1.06, 0.76], renderOrder: 2 },
      { tag: "detail", kind: 0, max: 56000, layerStep: 0.14, alongStep: 0.11, mat: [1.05, 0.74], renderOrder: 2 },
      { tag: "garden", kind: 0, max: 36000, layerStep: 0.2, alongStep: 0.16, mat: [1.03, 0.7], renderOrder: 1 },
      { tag: "base", kind: 0, max: 28000, layerStep: 0.32, alongStep: 0.26, mat: [1.02, 0.65], renderOrder: 1 },
    ],
    extraParticles: [
      {
        count: 900,
        mat: [1.05, 0.62],
        renderOrder: 5,
        sampler: (i) => {
          const zones = [
            [-6.5, 2, -0.5, 5, 2.2], [1, 2, 0, 7, 2.2], [8.8, 2, 1.8, 5, 2.2],
            [-5.8, 5.2, -0.2, 4.5, 2], [1.5, 5.2, 0.5, 7, 2], [9, 5.2, 2.2, 5, 2.2],
            [2.5, 8.2, 1, 5.5, 1.8], [9.5, 8.5, 2.5, 4.5, 2.5],
          ];
          const z = zones[i % zones.length];
          const x = z[0] + (hash2(i, 1) - 0.5) * z[3];
          const y = z[1] + hash2(i, 2) * z[4];
          const pz = z[2] + (hash2(i, 3) - 0.5) * z[3] * 0.7;
          return { x, y, z: pz, kind: 3 };
        },
      },
      {
        count: 380,
        mat: [1.12, 0.55],
        renderOrder: 6,
        sampler: (i) => {
          const spots = [
            [0.2, 2, 4], [-6, 4.5, 2], [1.5, 4.8, 3.5], [9, 5, 4.5],
            [2.5, 8, 3], [-4, 1.2, 7], [7, 7, 7],
          ];
          const s = spots[i % spots.length];
          return {
            x: s[0] + (hash2(i, 10) - 0.5) * 1.2,
            y: s[1] + hash2(i, 11) * 0.6,
            z: s[2] + (hash2(i, 12) - 0.5) * 1.2,
            kind: 2,
          };
        },
      },
    ],
    userData: {
      sceneScale: 5.8,
      rootY: -24,
      camLookY: 22,
      camRadius: 238,
      camHeight: 10,
      fogDensity: 0.0018,
    },
  });
}
