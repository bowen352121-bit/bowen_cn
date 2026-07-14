/**
 * 04 · 云层之上的天空之城 — 浮空岛链
 */
import * as THREE from "three";
import { hash2, createMeshContext, buildCastleLayer } from "../castle-utils.js";

function addPlatform(ctx, cx, cy, cz, rx, rz, thick, tag = "island") {
  const geo = new THREE.CylinderGeometry(rx, rx * 1.08, thick, 14, 1);
  const mesh = new THREE.Mesh(geo, ctx.dummyMat);
  mesh.position.set(cx, cy, cz);
  ctx.addMesh(mesh, { tag, hull: true });

  const underside = new THREE.Mesh(
    new THREE.ConeGeometry(rx * 0.55, thick * 2.8, 10),
    ctx.dummyMat
  );
  underside.position.set(cx, cy - thick * 1.6, cz);
  underside.rotation.x = Math.PI;
  ctx.addMesh(underside, { tag: "chain", hull: true });
}

function buildSkyIslands(ctx) {
  const islands = [
    { x: 0, y: 14, z: 0, rx: 5.5, rz: 5.5, t: 1.2 },
    { x: -7, y: 17, z: 3, rx: 3.2, rz: 3.2, t: 0.9 },
    { x: 7.5, y: 16, z: -2, rx: 3.5, rz: 3.5, t: 0.95 },
    { x: 3, y: 20, z: 6, rx: 2.4, rz: 2.4, t: 0.7 },
    { x: -4, y: 19, z: -5.5, rx: 2.8, rz: 2.8, t: 0.8 },
    { x: 9, y: 13, z: 4, rx: 2, rz: 2, t: 0.65 },
    { x: -8.5, y: 12.5, z: -3, rx: 2.2, rz: 2.2, t: 0.65 },
  ];

  for (const isl of islands) {
    addPlatform(ctx, isl.x, isl.y, isl.z, isl.rx, isl.rz, isl.t);
  }

  for (let i = 0; i < islands.length - 1; i++) {
    const a = islands[i];
    const b = islands[(i + 2) % islands.length];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2 - 0.5;
    const midZ = (a.z + b.z) / 2;
    const span = Math.hypot(b.x - a.x, b.z - a.z);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(span * 0.92, 0.18, 0.9), ctx.dummyMat);
    bridge.position.set(midX, midY, midZ);
    bridge.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
    ctx.addMesh(bridge, { tag: "bridge", hull: true });
  }
}

function buildPalace(ctx) {
  const bx = 0;
  const by = 14 + 1.2;
  const bz = 0;

  const hall = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 4.5), ctx.dummyMat);
  hall.position.set(bx, by + 1.6, bz);
  ctx.addMesh(hall, { tag: "palace", hull: true });

  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.8, 4), ctx.dummyMat);
  roof.position.set(bx, by + 4.6, bz);
  roof.rotation.y = Math.PI / 4;
  ctx.addMesh(roof, { tag: "palace", hull: true });

  const towers = [
    [-2.8, -1.6], [2.8, -1.6], [-2.8, 1.6], [2.8, 1.6],
  ];
  for (const [tx, tz] of towers) {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 5.5, 8), ctx.dummyMat);
    cyl.position.set(bx + tx, by + 4.2, bz + tz);
    ctx.addMesh(cyl, { tag: "palace", hull: true });
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 8), ctx.dummyMat);
    sp.position.set(bx + tx, by + 7.8, bz + tz);
    ctx.addMesh(sp, { tag: "palace", hull: true });
  }

  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 6, 8), ctx.dummyMat);
  beacon.position.set(bx, by + 9.5, bz);
  ctx.addMesh(beacon, { tag: "beacon", hull: true });
  const beaconTop = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), ctx.dummyMat);
  beaconTop.position.set(bx, by + 12.8, bz);
  ctx.addMesh(beaconTop, { tag: "beacon", hull: true });
}

function buildHangingChains(ctx) {
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = Math.cos(a) * (4 + hash2(i, 1) * 2);
    const z = Math.sin(a) * (4 + hash2(i, 2) * 2);
    const topY = 14 + hash2(i, 3) * 4;
    const chainH = 6 + hash2(i, 4) * 8;
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, chainH, 5), ctx.dummyMat);
    chain.position.set(x, topY - chainH / 2, z);
    ctx.addMesh(chain, { tag: "chain", hull: true });
  }
}

function buildCloudVeil(ctx) {
  for (let c = 0; c < 10; c++) {
    for (let i = 0; i < 12; i++) {
      const a = hash2(i, c) * Math.PI * 2;
      const r = 4 + hash2(c, i) * 10;
      const y = 6 + hash2(i + c, 5) * 8;
      const s = 0.5 + hash2(c, i + 1) * 1.4;
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(s, 7, 6), ctx.dummyMat);
      cloud.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      ctx.addMesh(cloud, { tag: "cloud" });
    }
  }
}

function colorFn(x, y, z, kind) {
  if (kind === 2) return new THREE.Color(0.95, 0.88, 0.55);
  if (kind === 1) return new THREE.Color(0.55, 0.78, 0.95);
  if (y > 18) return new THREE.Color(0.96, 0.97, 1.0);
  return new THREE.Color(0.82, 0.86, 0.94);
}

export function createSkyCastleLayer({ makeEndfieldMaterial, dummyMat, blackHullMat }) {
  const ctx = createMeshContext(dummyMat, blackHullMat);
  ctx.dummyMat = dummyMat;
  buildSkyIslands(ctx);
  buildPalace(ctx);
  buildHangingChains(ctx);
  buildCloudVeil(ctx);

  return buildCastleLayer({
    makeEndfieldMaterial,
    entries: ctx.entries,
    meshGroup: ctx.meshGroup,
    hullGroup: ctx.hullGroup,
    colorFn,
    layers: [
      { tag: "palace", kind: 0, max: 120000, layerStep: 0.14, alongStep: 0.11, mat: [1.22, 0.94], renderOrder: 3 },
      { tag: "beacon", kind: 2, max: 12000, layerStep: 0.13, alongStep: 0.1, mat: [1.25, 0.88], sharp: true, renderOrder: 4 },
      { tag: "island", kind: 0, max: 64000, layerStep: 0.16, alongStep: 0.12, mat: [1.08, 0.75], renderOrder: 2 },
      { tag: "bridge", kind: 0, max: 16000, layerStep: 0.15, alongStep: 0.11, mat: [1.05, 0.65], renderOrder: 2 },
      { tag: "chain", kind: 0, max: 28000, layerStep: 0.15, alongStep: 0.11, mat: [0.95, 0.58], renderOrder: 1 },
      { tag: "cloud", kind: 1, max: 36000, layerStep: 0.36, alongStep: 0.3, mat: [1.0, 0.48], renderOrder: 1 },
    ],
    extraParticles: [
      {
        count: 700,
        mat: [0.88, 0.42],
        renderOrder: 1,
        sampler: (i) => {
          const x = (hash2(i, 40) - 0.5) * 36;
          const y = 4 + hash2(i, 41) * 18;
          const z = (hash2(i, 42) - 0.5) * 36;
          return { x, y, z, kind: 1 };
        },
      },
    ],
    userData: {
      sceneScale: 6,
      rootY: -22,
      camLookY: 42,
      camRadius: 255,
      camHeight: 8,
      fogDensity: 0.0018,
      animate: (t, layer) => {
        layer.position.y = layer.userData.rootY + Math.sin(t * 0.28) * 0.6;
      },
    },
  });
}
