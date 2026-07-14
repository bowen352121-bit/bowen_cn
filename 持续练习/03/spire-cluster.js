/**
 * 03 · 王庭尖塔群系 — 环形尖塔大教堂
 */
import * as THREE from "three";
import { hash2, createMeshContext, buildCastleLayer } from "../castle-utils.js";

function plateauHeight(x, z) {
  const d = Math.hypot(x, z);
  let y = 1.5 + Math.sin(x * 0.3) * Math.cos(z * 0.28) * 1.2;
  y *= Math.exp(-(d * d) / 180);
  if (d > 9) y -= (d - 9) * 0.35;
  return y;
}

function buildPlateau(ctx) {
  const geo = new THREE.PlaneGeometry(36, 36, 72, 72);
  geo.rotateX(-Math.PI / 2);
  const attr = geo.attributes.position;
  for (let i = 0; i < attr.count; i++) {
    attr.setY(i, plateauHeight(attr.getX(i), attr.getZ(i)));
  }
  geo.computeVertexNormals();
  ctx.addMesh(new THREE.Mesh(geo, ctx.dummyMat), { tag: "base", hull: true });

  for (let i = 0; i < 40; i++) {
    const a = hash2(i, 1) * Math.PI * 2;
    const r = 7 + hash2(i, 2) * 4;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y0 = plateauHeight(x, z);
    const h = 1.5 + hash2(i, 3) * 4;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2 + hash2(i, 4) * 0.4, h, 5), ctx.dummyMat);
    cone.position.set(x, y0 - h * 0.35, z);
    cone.rotation.x = Math.PI;
    ctx.addMesh(cone, { tag: "base", hull: true });
  }
}

function addSpire(ctx, x, z, r, h, sp, tag = "spire") {
  const by = plateauHeight(x, z) + 0.4;
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, h, 10), ctx.dummyMat);
  cyl.position.set(x, by + h / 2, z);
  ctx.addMesh(cyl, { tag, hull: true });

  const tip = new THREE.Mesh(new THREE.ConeGeometry(r * 0.88, sp, 10), ctx.dummyMat);
  tip.position.set(x, by + h + sp / 2, z);
  ctx.addMesh(tip, { tag, hull: true });

  for (let f = 0; f < 4; f++) {
    const fa = (f / 4) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, sp * 0.55, 0.35), ctx.dummyMat);
    fin.position.set(x + Math.cos(fa) * r * 0.95, by + h + sp * 0.35, z + Math.sin(fa) * r * 0.95);
    fin.rotation.y = -fa;
    ctx.addMesh(fin, { tag: "detail", hull: true });
  }
}

function buildSpireRing(ctx) {
  const center = { x: 0, z: 0, r: 2.4, h: 14, sp: 7.5 };
  addSpire(ctx, center.x, center.z, center.r, center.h, center.sp, "spire");

  const count = 14;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 5.8 + hash2(i, 5) * 1.8;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const sr = 0.65 + hash2(i, 6) * 0.55;
    const sh = 5.5 + hash2(i, 7) * 5.5;
    const ss = 2.5 + hash2(i, 8) * 3.5;
    addSpire(ctx, x, z, sr, sh, ss, "spire");
  }

  for (let i = 0; i < count; i += 2) {
    const a0 = (i / count) * Math.PI * 2;
    const a1 = (((i + 3) % count) / count) * Math.PI * 2;
    const r0 = 5.8;
    const r1 = 5.8;
    const x0 = Math.cos(a0) * r0;
    const z0 = Math.sin(a0) * r0;
    const x1 = Math.cos(a1) * r1;
    const z1 = Math.sin(a1) * r1;
    const y0 = plateauHeight(x0, z0) + 4 + hash2(i, 9) * 3;
    const y1 = plateauHeight(x1, z1) + 4 + hash2(i, 10) * 3;
    const midX = (x0 + x1) / 2;
    const midZ = (z0 + z1) / 2;
    const midY = (y0 + y1) / 2;
    const span = Math.hypot(x1 - x0, z1 - z0);
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, span), ctx.dummyMat);
    arch.position.set(midX, midY, midZ);
    arch.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    ctx.addMesh(arch, { tag: "bridge", hull: true });
  }

  for (let i = 0; i < 24; i++) {
    const a = hash2(i, 11) * Math.PI * 2;
    const rad = 3 + hash2(i, 12) * 5;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    const by = plateauHeight(x, z) + 0.2;
    const h = 0.8 + hash2(i, 13) * 2.2;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h, 6), ctx.dummyMat);
    p.position.set(x, by + h / 2, z);
    ctx.addMesh(p, { tag: "detail", hull: true });
    if (hash2(i, 14) > 0.4) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6 + hash2(i, 15), 6), ctx.dummyMat);
      sp.position.set(x, by + h + 0.35, z);
      ctx.addMesh(sp, { tag: "detail", hull: true });
    }
  }
}

function buildCrownMist(ctx) {
  for (let i = 0; i < 28; i++) {
    const a = hash2(i, 20) * Math.PI * 2;
    const r = 2 + hash2(i, 21) * 7;
    const y = 16 + hash2(i, 22) * 8;
    const s = 0.35 + hash2(i, 23) * 0.9;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 6, 5), ctx.dummyMat);
    m.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    ctx.addMesh(m, { tag: "mist" });
  }
}

function colorFn(x, y, z, kind) {
  if (kind === 2) return new THREE.Color(0.78, 0.72, 0.48);
  if (kind === 1) {
    const f = 0.55 + hash2(x, z) * 0.2;
    return new THREE.Color(0.22 * f, 0.5 * f, 0.82 * f);
  }
  return new THREE.Color(0.9, 0.93, 0.98);
}

export function createSpireCastleLayer({ makeEndfieldMaterial, dummyMat, blackHullMat }) {
  const ctx = createMeshContext(dummyMat, blackHullMat);
  ctx.dummyMat = dummyMat;
  buildPlateau(ctx);
  buildSpireRing(ctx);
  buildCrownMist(ctx);

  return buildCastleLayer({
    makeEndfieldMaterial,
    entries: ctx.entries,
    meshGroup: ctx.meshGroup,
    hullGroup: ctx.hullGroup,
    colorFn,
    layers: [
      { tag: "spire", kind: 0, max: 180000, layerStep: 0.14, alongStep: 0.11, mat: [1.2, 0.92], renderOrder: 3 },
      { tag: "bridge", kind: 0, max: 24000, layerStep: 0.16, alongStep: 0.12, mat: [1.1, 0.78], renderOrder: 2 },
      { tag: "detail", kind: 0, max: 48000, layerStep: 0.15, alongStep: 0.11, mat: [1.05, 0.7], renderOrder: 2 },
      { tag: "base", kind: 0, max: 32000, layerStep: 0.34, alongStep: 0.28, mat: [1.05, 0.68], renderOrder: 1 },
      { tag: "mist", kind: 2, max: 8000, layerStep: 0.32, alongStep: 0.26, mat: [1.08, 0.42], renderOrder: 1 },
    ],
    extraParticles: [
      {
        count: 500,
        mat: [0.92, 0.5],
        renderOrder: 1,
        sampler: (i) => {
          const x = (hash2(i, 30) - 0.5) * 24;
          const y = 10 + hash2(i, 31) * 16;
          const z = (hash2(i, 32) - 0.5) * 24;
          if (Math.hypot(x, z) > 11) return null;
          return { x, y, z, kind: 1 };
        },
      },
    ],
    userData: {
      sceneScale: 6,
      rootY: -26,
      camLookY: 26,
      camRadius: 245,
      camHeight: 12,
      fogDensity: 0.0022,
    },
  });
}
