/**
 * 持续练习 — 城堡粒子层共用工具（终末地式水平扫描）
 */
import * as THREE from "three";

export function hash2(x, z) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

const _triA = new THREE.Vector3();
const _triB = new THREE.Vector3();
const _triC = new THREE.Vector3();
const _hitA = new THREE.Vector3();
const _segP0 = new THREE.Vector3();
const _segP1 = new THREE.Vector3();
const _worldBox = new THREE.Box3();

function edgeHitAtY(a, b, y) {
  const ay = a.y;
  const by = b.y;
  if (Math.abs(ay - by) < 1e-8) return null;
  const t = (y - ay) / (by - ay);
  if (t < 0 || t > 1) return null;
  _hitA.set(a.x + (b.x - a.x) * t, y, a.z + (b.z - a.z) * t);
  return _hitA;
}

function intersectTriangleAtY(vA, vB, vC, y) {
  const hits = [];
  const verts = [vA, vB, vC];
  for (let i = 0; i < 3; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % 3];
    const p = edgeHitAtY(a, b, y);
    if (!p) continue;
    let dup = false;
    for (let h = 0; h < hits.length; h++) {
      if (hits[h].distanceTo(p) < 1e-5) dup = true;
    }
    if (!dup) hits.push(p.clone());
  }
  if (hits.length < 2) return null;
  if (hits.length === 2) return [hits[0], hits[1]];
  let best = 0;
  let pair = [hits[0], hits[1]];
  for (let i = 0; i < hits.length; i++) {
    for (let j = i + 1; j < hits.length; j++) {
      const d = hits[i].distanceTo(hits[j]);
      if (d > best) {
        best = d;
        pair = [hits[i], hits[j]];
      }
    }
  }
  return pair;
}

function sampleSegmentLayer(p0, p1, alongStep, layerY, buf, idx, kind, layerKeys, maxIdx) {
  const len = Math.hypot(p1.x - p0.x, p1.z - p0.z);
  if (len < 1e-6) return idx;
  const n = Math.max(1, Math.ceil(len / alongStep));
  for (let i = 0; i < n && idx < maxIdx; i++) {
    const t = n <= 1 ? 0.5 : i / (n - 1);
    const x = p0.x + (p1.x - p0.x) * t;
    const z = p0.z + (p1.z - p0.z) * t;
    const key = `${Math.round(x * 64)}|${Math.round(layerY * 64)}|${Math.round(z * 64)}`;
    if (layerKeys.has(key)) continue;
    layerKeys.add(key);
    const o = idx * 3;
    buf.positions[o] = x;
    buf.positions[o + 1] = layerY;
    buf.positions[o + 2] = z;
    const c = buf.colorFn(x, layerY, z, kind);
    buf.colors[o] = c.r;
    buf.colors[o + 1] = c.g;
    buf.colors[o + 2] = c.b;
    idx += 1;
  }
  return idx;
}

function sampleMeshHorizontalLayers(mesh, matrix, layerStep, alongStep, buf, startIdx, kind, maxCount) {
  const geo = mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  _worldBox.copy(geo.boundingBox).applyMatrix4(matrix);
  const minY = _worldBox.min.y;
  const maxY = _worldBox.max.y;
  const posAttr = geo.attributes.position;
  const index = geo.index;
  const triCount = index ? index.count / 3 : posAttr.count / 3;
  let idx = startIdx;
  const maxIdx = Math.min(buf.positions.length / 3, maxCount);
  const layerKeys = new Set();
  const yStart = Math.floor(minY / layerStep) * layerStep;

  for (let layerY = yStart; layerY <= maxY + layerStep * 0.25 && idx < maxIdx; layerY += layerStep) {
    layerKeys.clear();
    for (let t = 0; t < triCount && idx < maxIdx; t++) {
      const i0 = index ? index.getX(t * 3) : t * 3;
      const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
      _triA.fromBufferAttribute(posAttr, i0).applyMatrix4(matrix);
      _triB.fromBufferAttribute(posAttr, i1).applyMatrix4(matrix);
      _triC.fromBufferAttribute(posAttr, i2).applyMatrix4(matrix);
      const seg = intersectTriangleAtY(_triA, _triB, _triC, layerY);
      if (!seg) continue;
      _segP0.copy(seg[0]);
      _segP1.copy(seg[1]);
      idx = sampleSegmentLayer(_segP0, _segP1, alongStep, layerY, buf, idx, kind, layerKeys, maxIdx);
    }
  }
  return idx;
}

export function sampleByTag(entries, group, maxTotal, kind, tagFilter, layerStep, alongStep, colorFn) {
  const filtered = entries.filter(tagFilter);
  const buf = {
    positions: new Float32Array(maxTotal * 3),
    colors: new Float32Array(maxTotal * 3),
    colorFn,
  };
  if (filtered.length === 0) return { buf, count: 0 };
  let idx = 0;
  const matrix = new THREE.Matrix4();
  group.updateMatrixWorld(true);
  for (const entry of filtered) {
    if (idx >= maxTotal) break;
    const mesh = entry.mesh;
    mesh.updateMatrixWorld(true);
    matrix.copy(mesh.matrixWorld);
    idx = sampleMeshHorizontalLayers(mesh, matrix, layerStep, alongStep, buf, idx, kind, maxTotal);
  }
  return { buf, count: idx };
}

export function appendParticles(buf, startIdx, count, sampler) {
  let idx = startIdx;
  let tries = 0;
  const maxTries = count * 10;
  while (idx < startIdx + count && tries < maxTries) {
    tries += 1;
    const p = sampler(tries);
    if (!p) continue;
    const o = idx * 3;
    buf.positions[o] = p.x;
    buf.positions[o + 1] = p.y;
    buf.positions[o + 2] = p.z;
    const c = buf.colorFn(p.x, p.y, p.z, p.kind ?? 1);
    buf.colors[o] = c.r;
    buf.colors[o + 1] = c.g;
    buf.colors[o + 2] = c.b;
    idx += 1;
  }
  return idx;
}

export function makePointsGeo(buf, count) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buf.positions.subarray(0, count * 3), 3));
  geo.setAttribute("color", new THREE.BufferAttribute(buf.colors.subarray(0, count * 3), 3));
  return geo;
}

export function createMeshContext(dummyMat, blackHullMat) {
  const meshGroup = new THREE.Group();
  const hullGroup = new THREE.Group();
  const entries = [];

  function addMesh(mesh, opts = {}) {
    mesh.visible = false;
    meshGroup.add(mesh);
    if (opts.hull) {
      const hull = new THREE.Mesh(mesh.geometry, blackHullMat);
      hull.position.copy(mesh.position);
      hull.rotation.copy(mesh.rotation);
      hull.scale.copy(mesh.scale);
      hull.scale.multiplyScalar(0.94);
      hullGroup.add(hull);
    }
    entries.push({
      mesh,
      tag: opts.tag || "castle",
    });
    return mesh;
  }

  return { meshGroup, hullGroup, entries, addMesh };
}

/**
 * @param {object} opts
 * @param {function} opts.makeEndfieldMaterial
 * @param {Array} opts.entries
 * @param {THREE.Group} opts.meshGroup
 * @param {THREE.Group} opts.hullGroup
 * @param {function} opts.colorFn - (x,y,z,kind)=>THREE.Color
 * @param {Array<{tag:string, kind:number, max:number, layerStep:number, alongStep:number, mat:[number,number], renderOrder?:number}>} opts.layers
 * @param {Array<{count:number, sampler:function, kind?:number}>} [opts.extraParticles]
 * @param {object} opts.userData
 */
export function buildCastleLayer({
  makeEndfieldMaterial,
  entries,
  meshGroup,
  hullGroup,
  colorFn,
  layers,
  extraParticles = [],
  userData,
}) {
  const layer = new THREE.Group();
  layer.visible = false;
  layer.add(hullGroup);
  layer.add(meshGroup);

  const materials = [];
  hullGroup.renderOrder = 0;

  for (const spec of layers) {
    const sampled = sampleByTag(
      entries,
      meshGroup,
      spec.max,
      spec.kind,
      (e) => e.tag === spec.tag,
      spec.layerStep,
      spec.alongStep,
      colorFn
    );
    const mat = makeEndfieldMaterial(spec.mat[0], spec.mat[1], spec.sharp ?? false);
    const points = new THREE.Points(makePointsGeo(sampled.buf, sampled.count), mat);
    points.renderOrder = spec.renderOrder ?? 2;
    meshGroup.add(points);
    materials.push(mat);
  }

  for (const extra of extraParticles) {
    const buf = {
      positions: new Float32Array(extra.count * 3),
      colors: new Float32Array(extra.count * 3),
      colorFn,
    };
    const count = appendParticles(buf, 0, extra.count, extra.sampler);
    const mat = makeEndfieldMaterial(extra.mat?.[0] ?? 0.95, extra.mat?.[1] ?? 0.55);
    const points = new THREE.Points(makePointsGeo(buf, count), mat);
    points.renderOrder = extra.renderOrder ?? 1;
    meshGroup.add(points);
    materials.push(mat);
  }

  Object.assign(layer.userData, userData);
  return { layer, materials };
}
