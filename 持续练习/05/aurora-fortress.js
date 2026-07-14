/**
 * 05 · 暴风雪与极光 — 德意志繁琐城堡（Burg + Schloss）
 */
import * as THREE from "three";
import { hash2, createMeshContext, buildCastleLayer } from "../castle-utils.js";

function groundY(x, z) {
  const d = Math.hypot(x, z);
  let y = 0.6 + Math.sin(x * 0.16) * Math.cos(z * 0.19) * 2.2;
  y += Math.exp(-((x + 3) ** 2 + z * z) / 55) * 2.8;
  y *= Math.exp(-(d * d) / 260);
  if (d > 12) y -= (d - 12) * 0.48;
  return y;
}

function addMesh(ctx, mesh, tag, hull = true) {
  ctx.addMesh(mesh, { tag, hull });
}

function addCrenellations(ctx, cx, cy, cz, span, depth, count, rotY = 0, tag = "schloss") {
  const step = span / count;
  for (let i = 0; i < count; i++) {
    const ox = -span / 2 + step * (i + 0.5);
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(step * 0.62, 0.55, depth), ctx.dummyMat);
    merlon.position.set(cx, cy, cz);
    merlon.rotation.y = rotY;
    merlon.translateX(ox);
    addMesh(ctx, merlon, tag);
  }
}

function addSteepRoof(ctx, cx, baseY, cz, width, depth, rise, rotY = 0, tag = "roof") {
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.72, rise, 4), ctx.dummyMat);
  roof.position.set(cx, baseY + rise / 2, cz);
  roof.rotation.y = rotY + Math.PI / 4;
  addMesh(ctx, roof, tag, true);

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(width * 1.02, 0.18, 0.22), ctx.dummyMat);
  ridge.position.set(cx, baseY + rise - 0.08, cz);
  ridge.rotation.y = rotY;
  addMesh(ctx, ridge, tag);

  for (const side of [-1, 1]) {
    const dormer = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.42), ctx.dummyMat);
    dormer.position.set(cx + side * width * 0.22, baseY + rise * 0.62, cz + depth * 0.18);
    dormer.rotation.y = rotY;
    addMesh(ctx, dormer, "timber");
    const dormerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.38, 4), ctx.dummyMat);
    dormerRoof.position.set(cx + side * width * 0.22, baseY + rise * 0.82, cz + depth * 0.18);
    dormerRoof.rotation.y = rotY + Math.PI / 4;
    addMesh(ctx, dormerRoof, "roof");
  }
}

function addHalfTimberFacade(ctx, cx, baseY, cz, w, h, d, rotY = 0) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ctx.dummyMat);
  wall.position.set(cx, baseY + h / 2, cz);
  wall.rotation.y = rotY;
  addMesh(ctx, wall, "schloss", true);

  const rows = Math.max(3, Math.floor(h / 1.1));
  const cols = Math.max(4, Math.floor(w / 0.9));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) continue;
      const px = -w / 2 + (c + 0.5) * (w / cols);
      const py = -h / 2 + (r + 0.5) * (h / rows);
      const beamV = new THREE.Mesh(new THREE.BoxGeometry(0.07, h / rows * 0.88, d * 1.02), ctx.dummyMat);
      beamV.position.set(cx, baseY + h / 2, cz);
      beamV.rotation.y = rotY;
      beamV.translateX(px);
      beamV.translateY(py);
      addMesh(ctx, beamV, "timber");

      const beamH = new THREE.Mesh(new THREE.BoxGeometry(w / cols * 0.9, 0.07, d * 1.02), ctx.dummyMat);
      beamH.position.set(cx, baseY + h / 2, cz);
      beamH.rotation.y = rotY;
      beamH.translateX(px);
      beamH.translateY(py);
      addMesh(ctx, beamH, "timber");
    }
  }

  for (let c = 0; c < cols - 1; c++) {
    const px = -w / 2 + (c + 1) * (w / cols);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.12), ctx.dummyMat);
    win.position.set(cx, baseY + h * 0.58, cz + (rotY ? 0 : d / 2 + 0.08));
    win.rotation.y = rotY;
    win.translateX(px);
    addMesh(ctx, win, "detail");
  }
}

function addOrielWindow(ctx, cx, baseY, cz, rotY = 0) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.85), ctx.dummyMat);
  box.position.set(cx, baseY + 0.7, cz);
  box.rotation.y = rotY;
  addMesh(ctx, box, "detail", true);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.55, 4), ctx.dummyMat);
  cap.position.set(cx, baseY + 1.55, cz);
  cap.rotation.y = rotY + Math.PI / 4;
  addMesh(ctx, cap, "roof");
  for (let i = 0; i < 3; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.9, 5), ctx.dummyMat);
    col.position.set(cx - 0.35 + i * 0.35, baseY + 0.45, cz + 0.35);
    col.rotation.y = rotY;
    addMesh(ctx, col, "detail");
  }
}

function addGermanTower(ctx, x, z, opts = {}) {
  const {
    r = 1.1,
    h = 8,
    spire = 4,
    baseY = groundY(x, z) + 0.4,
    tag = "tower",
    onion = false,
    bays = 3,
  } = opts;

  const lower = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 1.08, h * 0.42, 12), ctx.dummyMat);
  lower.position.set(x, baseY + h * 0.21, z);
  addMesh(ctx, lower, tag, true);

  const upper = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.78, r * 0.92, h * 0.38, 12), ctx.dummyMat);
  upper.position.set(x, baseY + h * 0.59, z);
  addMesh(ctx, upper, tag, true);

  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 1.05, 0.35, 12), ctx.dummyMat);
  gallery.position.set(x, baseY + h * 0.82, z);
  addMesh(ctx, gallery, tag);

  addCrenellations(ctx, x, baseY + h * 0.98, z, r * 2.1, r * 0.55, 10, 0, tag);

  if (onion) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * 0.62, 10, 8), ctx.dummyMat);
    bulb.position.set(x, baseY + h + spire * 0.35, z);
    addMesh(ctx, bulb, "roof");
    const sp = new THREE.Mesh(new THREE.ConeGeometry(r * 0.22, spire * 0.75, 8), ctx.dummyMat);
    sp.position.set(x, baseY + h + spire * 0.85, z);
    addMesh(ctx, sp, "roof");
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), ctx.dummyMat);
    cross.position.set(x, baseY + h + spire * 1.2, z);
    addMesh(ctx, cross, "detail");
  } else {
    const sp = new THREE.Mesh(new THREE.ConeGeometry(r * 0.95, spire, 10), ctx.dummyMat);
    sp.position.set(x, baseY + h + spire / 2, z);
    addMesh(ctx, sp, "roof", true);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.25), ctx.dummyMat);
    flag.position.set(x + r * 0.35, baseY + h + spire * 0.82, z);
    addMesh(ctx, flag, "detail");
  }

  for (let b = 0; b < bays; b++) {
    const ang = (b / bays) * Math.PI * 2;
    const wx = x + Math.cos(ang) * r * 0.82;
    const wz = z + Math.sin(ang) * r * 0.82;
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.18), ctx.dummyMat);
    slit.position.set(wx, baseY + h * 0.45, wz);
    slit.lookAt(x, baseY + h * 0.45, z);
    addMesh(ctx, slit, "detail");
    const slit2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.18), ctx.dummyMat);
    slit2.position.set(wx, baseY + h * 0.72, wz);
    slit2.lookAt(x, baseY + h * 0.72, z);
    addMesh(ctx, slit2, "detail");
  }

  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const butt = new THREE.Mesh(new THREE.BoxGeometry(0.28, h * 0.55, 0.35), ctx.dummyMat);
    butt.position.set(x + Math.cos(ang) * r * 0.95, baseY + h * 0.3, z + Math.sin(ang) * r * 0.95);
    butt.rotation.y = -ang;
    addMesh(ctx, butt, "schloss");
  }
}

function buildAlpineGround(ctx) {
  const geo = new THREE.PlaneGeometry(46, 46, 84, 84);
  geo.rotateX(-Math.PI / 2);
  const attr = geo.attributes.position;
  for (let i = 0; i < attr.count; i++) {
    attr.setY(i, groundY(attr.getX(i), attr.getZ(i)));
  }
  geo.computeVertexNormals();
  addMesh(ctx, new THREE.Mesh(geo, ctx.dummyMat), "cliff", true);

  for (let i = 0; i < 70; i++) {
    const a = hash2(i, 1) * Math.PI * 2;
    const r = 9 + hash2(i, 2) * 6;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y0 = groundY(x, z);
    const h = 1.5 + hash2(i, 3) * 6;
    const pine = new THREE.Mesh(new THREE.ConeGeometry(0.2 + hash2(i, 4) * 0.45, h, 5), ctx.dummyMat);
    pine.position.set(x, y0 + h * 0.35, z);
    addMesh(ctx, pine, "cliff");
  }
}

function buildMoatAndBridge(ctx) {
  const by = groundY(0, 8) + 0.15;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = 10.5;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.55), ctx.dummyMat);
    seg.position.set(Math.cos(a) * r, by, Math.sin(a) * r + 8);
    seg.rotation.y = -a;
    addMesh(ctx, seg, "schloss");
  }

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, 7.5), ctx.dummyMat);
  bridge.position.set(0, by + 0.55, 10.8);
  addMesh(ctx, bridge, "schloss", true);
  for (let i = 0; i < 5; i++) {
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.4, 8, 1, false, 0, Math.PI), ctx.dummyMat);
    arch.position.set(-1.2 + i * 0.6, by + 0.15, 10.2 + i * 0.15);
    arch.rotation.z = Math.PI / 2;
    arch.rotation.y = Math.PI / 2;
    addMesh(ctx, arch, "detail");
  }
}

function buildGatehouse(ctx) {
  const gz = 7.2;
  const gy = groundY(0, gz) + 0.5;

  const gateL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 6.2, 2.2), ctx.dummyMat);
  gateL.position.set(-2.1, gy + 3.1, gz);
  addMesh(ctx, gateL, "schloss", true);
  const gateR = gateL.clone();
  gateR.position.set(2.1, gy + 3.1, gz);
  addMesh(ctx, gateR, "schloss", true);

  const archTop = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 1.6, 12, 1, false, 0, Math.PI), ctx.dummyMat);
  archTop.position.set(0, gy + 5.8, gz);
  archTop.rotation.z = Math.PI;
  addMesh(ctx, archTop, "schloss", true);

  addGermanTower(ctx, -3.4, gz, { r: 1.25, h: 10.5, spire: 4.5, baseY: gy });
  addGermanTower(ctx, 3.4, gz, { r: 1.25, h: 10.5, spire: 4.5, baseY: gy, onion: true });

  addCrenellations(ctx, 0, gy + 6.8, gz, 5.2, 1.2, 9);
  const port = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 0.35), ctx.dummyMat);
  port.position.set(0, gy + 1.8, gz + 1.15);
  addMesh(ctx, port, "detail");
}

function buildOuterCurtain(ctx) {
  const gy = groundY(0, 0) + 0.8;
  const corners = [
    [-8, -6], [8, -6], [8, 4], [-8, 4],
  ];
  for (let i = 0; i < corners.length; i++) {
    const [x0, z0] = corners[i];
    const [x1, z1] = corners[(i + 1) % corners.length];
    const midX = (x0 + x1) / 2;
    const midZ = (z0 + z1) / 2;
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ang = Math.atan2(z1 - z0, x1 - x0);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 3.8, 0.85), ctx.dummyMat);
    wall.position.set(midX, gy + 1.9, midZ);
    wall.rotation.y = -ang;
    addMesh(ctx, wall, "schloss", true);
    addCrenellations(ctx, midX, gy + 3.95, midZ, len * 0.92, 0.75, Math.floor(len / 0.65), -ang);

    addGermanTower(ctx, x0, z0, { r: 0.95, h: 7.2, spire: 3.2, baseY: groundY(x0, z0) + 0.5 });
  }

  for (let i = 0; i < 10; i++) {
    const t = (i + 0.5) / 10;
    const x = -8 + t * 16;
    addGermanTower(ctx, x, -6, { r: 0.55, h: 5.5, spire: 2.2, baseY: groundY(x, -6) + 0.6 });
  }
}

function buildMainPalace(ctx) {
  const cy = groundY(0, 0) + 0.9;

  addHalfTimberFacade(ctx, 0, cy, -1.5, 10.5, 5.2, 6.5, 0);
  addSteepRoof(ctx, 0, cy + 5.2, -1.5, 10.5, 6.5, 4.2, 0);

  addHalfTimberFacade(ctx, -5.8, cy + 0.4, 1.2, 4.2, 4.2, 4.8, Math.PI / 2);
  addSteepRoof(ctx, -5.8, cy + 4.6, 1.2, 4.2, 4.8, 3.2, Math.PI / 2);

  addHalfTimberFacade(ctx, 5.8, cy + 0.4, 1.2, 4.2, 4.2, 4.8, -Math.PI / 2);
  addSteepRoof(ctx, 5.8, cy + 4.6, 1.2, 4.2, 4.8, 3.2, -Math.PI / 2);

  addHalfTimberFacade(ctx, 0, cy + 0.2, 3.8, 7.5, 3.8, 4.2, Math.PI);
  addSteepRoof(ctx, 0, cy + 4.0, 3.8, 7.5, 4.2, 2.8, Math.PI);

  const palas = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 5.5), ctx.dummyMat);
  palas.position.set(0, cy + 7.8, 0);
  addMesh(ctx, palas, "schloss", true);
  addSteepRoof(ctx, 0, cy + 9.4, 0, 6.5, 5.5, 3.5, 0);

  const chapel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.5, 3.2), ctx.dummyMat);
  chapel.position.set(-3.8, cy + 8.8, -2.2);
  addMesh(ctx, chapel, "schloss", true);
  addGermanTower(ctx, -3.8, -2.2, { r: 0.85, h: 6.5, spire: 5.5, baseY: cy + 8.2, onion: true, bays: 4 });

  addGermanTower(ctx, 0, 0, { r: 1.65, h: 14, spire: 5.5, baseY: cy, bays: 6 });
  addGermanTower(ctx, -4.5, -3.5, { r: 1.15, h: 11, spire: 4.2, baseY: cy });
  addGermanTower(ctx, 4.5, -3.5, { r: 1.15, h: 11.5, spire: 4.5, baseY: cy, onion: true });
  addGermanTower(ctx, -4.5, 3.5, { r: 1.05, h: 10, spire: 3.8, baseY: cy });
  addGermanTower(ctx, 4.5, 3.5, { r: 1.1, h: 10.5, spire: 4, baseY: cy });

  addOrielWindow(ctx, 2.2, cy + 3.2, 3.2, Math.PI);
  addOrielWindow(ctx, -2.2, cy + 3.2, 3.2, Math.PI);
  addOrielWindow(ctx, 0, cy + 6.5, -4.8, 0);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), ctx.dummyMat);
    chimney.position.set(Math.cos(ang) * 2.8, cy + 10.8, Math.sin(ang) * 2.2);
    addMesh(ctx, chimney, "detail");
    const smokeCap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.15, 0.48), ctx.dummyMat);
    smokeCap.position.set(Math.cos(ang) * 2.8, cy + 11.45, Math.sin(ang) * 2.2);
    addMesh(ctx, smokeCap, "detail");
  }

  const stair = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 4.5), ctx.dummyMat);
  stair.position.set(0, cy + 1.4, 5.8);
  addMesh(ctx, stair, "schloss", true);
  for (let s = 0; s < 5; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 0.55), ctx.dummyMat);
    step.position.set(0, cy + 0.35 + s * 0.42, 4.5 + s * 0.45);
    addMesh(ctx, step, "detail");
  }
}

function buildInnerCourtyard(ctx) {
  const cy = groundY(0, 0) + 0.95;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 3.6, 8), ctx.dummyMat);
    col.position.set(Math.cos(a) * 3.2, cy + 1.8, Math.sin(a) * 2.5);
    addMesh(ctx, col, "schloss");
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 4, 8, Math.PI / 2), ctx.dummyMat);
    arc.position.set(Math.cos(a) * 3.2, cy + 3.4, Math.sin(a) * 2.5);
    arc.rotation.y = -a;
    addMesh(ctx, arc, "detail");
  }
  const well = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.55, 10), ctx.dummyMat);
  well.position.set(1.2, cy + 0.28, 0.5);
  addMesh(ctx, well, "detail");
  const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.85, 6), ctx.dummyMat);
  wellRoof.position.set(1.2, cy + 0.95, 0.5);
  addMesh(ctx, wellRoof, "roof");
}

function buildAuroraRing(ctx) {
  const segments = 52;
  const radius = 15;
  const height = 19;
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const wave = Math.sin(a0 * 3) * 2.8;
    const x0 = Math.cos(a0) * radius;
    const z0 = Math.sin(a0) * radius;
    const x1 = Math.cos(a1) * radius;
    const z1 = Math.sin(a1) * radius;
    const y0 = height + wave;
    const y1 = height + Math.sin(a1 * 3) * 2.8;
    const midX = (x0 + x1) / 2;
    const midZ = (z0 + z1) / 2;
    const midY = (y0 + y1) / 2;
    const segLen = Math.hypot(x1 - x0, z1 - z0);
    const band = new THREE.Mesh(new THREE.BoxGeometry(segLen, 0.38, 0.55), ctx.dummyMat);
    band.position.set(midX, midY, midZ);
    band.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    addMesh(ctx, band, "aurora");
  }

  for (let i = 0; i < 24; i++) {
    const a = hash2(i, 22) * Math.PI * 2;
    const r = 9 + hash2(i, 23) * 6;
    const curtain = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4 + hash2(i, 24), 5.5 + hash2(i, 25) * 4.5),
      ctx.dummyMat
    );
    curtain.position.set(Math.cos(a) * r, 14 + hash2(i, 26) * 7, Math.sin(a) * r);
    curtain.lookAt(0, 16, 0);
    addMesh(ctx, curtain, "aurora");
  }
}

function buildStormClouds(ctx) {
  for (let i = 0; i < 26; i++) {
    const x = (hash2(i, 30) - 0.5) * 32;
    const y = 21 + hash2(i, 31) * 7;
    const z = (hash2(i, 32) - 0.5) * 32;
    const s = 1.2 + hash2(i, 33) * 2.8;
    addMesh(ctx, new THREE.Mesh(new THREE.SphereGeometry(s, 7, 6), ctx.dummyMat), "storm");
  }
}

function colorFn(x, y, z, kind) {
  if (kind === 3) {
    const flick = 0.55 + hash2(x, z) * 0.25;
    return new THREE.Color(0.3 * flick, 0.88 * flick, 0.5 + hash2(y, x) * 0.22);
  }
  if (kind === 2) return new THREE.Color(0.68, 0.74, 0.9);
  if (kind === 1) return new THREE.Color(0.78, 0.84, 0.96);
  return new THREE.Color(0.86, 0.9, 0.96);
}

export function createAuroraCastleLayer({ makeEndfieldMaterial, dummyMat, blackHullMat }) {
  const ctx = createMeshContext(dummyMat, blackHullMat);
  ctx.dummyMat = dummyMat;

  buildAlpineGround(ctx);
  buildMoatAndBridge(ctx);
  buildGatehouse(ctx);
  buildOuterCurtain(ctx);
  buildMainPalace(ctx);
  buildInnerCourtyard(ctx);
  buildAuroraRing(ctx);
  buildStormClouds(ctx);

  const auroraColorFn = (x, y, z, kind) => colorFn(x, y, z, kind === 2 ? 3 : kind);

  return buildCastleLayer({
    makeEndfieldMaterial,
    entries: ctx.entries,
    meshGroup: ctx.meshGroup,
    hullGroup: ctx.hullGroup,
    colorFn: auroraColorFn,
    layers: [
      { tag: "schloss", kind: 0, max: 200000, layerStep: 0.13, alongStep: 0.1, mat: [1.18, 0.92], renderOrder: 3 },
      { tag: "tower", kind: 0, max: 160000, layerStep: 0.12, alongStep: 0.09, mat: [1.22, 0.94], sharp: true, renderOrder: 4 },
      { tag: "roof", kind: 0, max: 90000, layerStep: 0.12, alongStep: 0.09, mat: [1.15, 0.88], renderOrder: 3 },
      { tag: "timber", kind: 0, max: 70000, layerStep: 0.11, alongStep: 0.085, mat: [1.08, 0.82], renderOrder: 3 },
      { tag: "detail", kind: 0, max: 55000, layerStep: 0.1, alongStep: 0.08, mat: [1.05, 0.78], renderOrder: 2 },
      { tag: "aurora", kind: 2, max: 48000, layerStep: 0.12, alongStep: 0.09, mat: [1.38, 0.74], sharp: true, renderOrder: 5 },
      { tag: "cliff", kind: 0, max: 38000, layerStep: 0.32, alongStep: 0.26, mat: [1.0, 0.62], renderOrder: 1 },
      { tag: "storm", kind: 1, max: 22000, layerStep: 0.36, alongStep: 0.28, mat: [0.9, 0.38], renderOrder: 1 },
    ],
    extraParticles: [
      {
        count: 1400,
        mat: [0.92, 0.58],
        renderOrder: 2,
        sampler: (i) => {
          const x = (hash2(i, 40) - 0.5) * 36;
          const y = 2 + hash2(i, 41) * 24;
          const z = (hash2(i, 42) - 0.5) * 36;
          if (Math.hypot(x, z) > 20 && y < 14) return null;
          return { x, y, z, kind: 1 };
        },
      },
      {
        count: 420,
        mat: [1.25, 0.58],
        renderOrder: 4,
        sampler: (i) => {
          const a = hash2(i, 50) * Math.PI * 2;
          const r = 11 + hash2(i, 51) * 5;
          return {
            x: Math.cos(a) * r,
            y: 15 + hash2(i, 52) * 9,
            z: Math.sin(a) * r,
            kind: 3,
          };
        },
      },
    ],
    userData: {
      sceneScale: 6,
      rootY: -26,
      camLookY: 26,
      camRadius: 255,
      camHeight: 12,
      fogDensity: 0.0026,
      animate: (t, layer) => {
        layer.rotation.y = Math.sin(t * 0.07) * 0.035;
      },
    },
  });
}
