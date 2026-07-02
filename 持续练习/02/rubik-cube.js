/**
 * 持续练习 02 — 魔方粒子层（终末地式水平扫描 + 内部线框）
 * 供 suixi.html 主画布切换展示，也可被 02/index.html 独立引用。
 */
import * as THREE from "three";

const CELLS = 3;
const CELL = 1;
const GAP = 0.1;
const CUBELET = CELL - GAP;
const HALF = CUBELET / 2;
const EXTENT = (CELLS * CELL) / 2;

const MAX_CONTOUR = 52000;
const MAX_SCAN = 26000;
const MAX_GHOST = 6000;

function hash2(x, z) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function writeParticle(buf, idx, x, y, z, r, g, b) {
  const o = idx * 3;
  buf.positions[o] = x;
  buf.positions[o + 1] = y;
  buf.positions[o + 2] = z;
  buf.colors[o] = r;
  buf.colors[o + 1] = g;
  buf.colors[o + 2] = b;
  return idx + 1;
}

const _triA = new THREE.Vector3();
const _triB = new THREE.Vector3();
const _triC = new THREE.Vector3();
const _hitA = new THREE.Vector3();
const _segP0 = new THREE.Vector3();
const _segP1 = new THREE.Vector3();
const _worldBox = new THREE.Box3();
const _matrix = new THREE.Matrix4();

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

function sampleMeshLayers(mesh, matrix, layerStep, alongStep, buf, startIdx, maxIdx, colorFn) {
  const geo = mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  _worldBox.copy(geo.boundingBox).applyMatrix4(matrix);
  const minY = _worldBox.min.y;
  const maxY = _worldBox.max.y;
  const posAttr = geo.attributes.position;
  const index = geo.index;
  const triCount = index ? index.count / 3 : posAttr.count / 3;
  let idx = startIdx;
  const yStart = Math.floor(minY / layerStep) * layerStep;

  for (let layerY = yStart; layerY <= maxY + layerStep * 0.2 && idx < maxIdx; layerY += layerStep) {
    const layerKeys = new Set();
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
      const len = Math.hypot(_segP1.x - _segP0.x, _segP1.z - _segP0.z);
      if (len < 1e-6) continue;
      const n = Math.max(1, Math.ceil(len / alongStep));
      for (let i = 0; i < n && idx < maxIdx; i++) {
        const tt = n <= 1 ? 0.5 : i / (n - 1);
        const x = _segP0.x + (_segP1.x - _segP0.x) * tt;
        const z = _segP0.z + (_segP1.z - _segP0.z) * tt;
        const key = `${Math.round(x * 64)}|${Math.round(layerY * 64)}|${Math.round(z * 64)}`;
        if (layerKeys.has(key)) continue;
        layerKeys.add(key);
        const c = colorFn(x, layerY, z);
        idx = writeParticle(buf, idx, x, layerY, z, c.r, c.g, c.b);
      }
    }
  }
  return idx;
}

function sampleEdgeLine(p0, p1, step, buf, idx, maxIdx, colorFn) {
  const len = p0.distanceTo(p1);
  const n = Math.max(1, Math.ceil(len / step));
  for (let j = 0; j < n && idx < maxIdx; j++) {
    const t = n <= 1 ? 0.5 : j / (n - 1);
    const x = p0.x + (p1.x - p0.x) * t;
    const y = p0.y + (p1.y - p0.y) * t;
    const z = p0.z + (p1.z - p0.z) * t;
    const c = colorFn(x, y, z);
    idx = writeParticle(buf, idx, x, y, z, c.r, c.g, c.b);
  }
  return idx;
}

function sampleMeshEdges(mesh, matrix, step, buf, startIdx, maxIdx, colorFn) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 1);
  const pos = edges.attributes.position;
  let idx = startIdx;
  for (let i = 0; i < pos.count && idx < maxIdx; i += 2) {
    _segP0.fromBufferAttribute(pos, i).applyMatrix4(matrix);
    _segP1.fromBufferAttribute(pos, i + 1).applyMatrix4(matrix);
    idx = sampleEdgeLine(_segP0, _segP1, step, buf, idx, maxIdx, colorFn);
  }
  edges.dispose();
  return idx;
}

function makePointsGeo(buf, count) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buf.positions.subarray(0, count * 3), 3));
  geo.setAttribute("color", new THREE.BufferAttribute(buf.colors.subarray(0, count * 3), 3));
  return geo;
}

function buildInnerLatticeMeshes(dummyMat) {
  const meshes = [];
  const thin = 0.028;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const beamX = new THREE.Mesh(new THREE.BoxGeometry(CELL * 3.2, thin, thin), dummyMat);
      beamX.position.set(0, i * CELL, j * CELL);
      meshes.push(beamX);

      const beamY = new THREE.Mesh(new THREE.BoxGeometry(thin, CELL * 3.2, thin), dummyMat);
      beamY.position.set(i * CELL, 0, j * CELL);
      meshes.push(beamY);

      const beamZ = new THREE.Mesh(new THREE.BoxGeometry(thin, thin, CELL * 3.2), dummyMat);
      beamZ.position.set(i * CELL, j * CELL, 0);
      meshes.push(beamZ);
    }
  }

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), dummyMat);
  meshes.push(core);

  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    const rad = 0.55;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(thin, thin, rad * 2), dummyMat);
    spoke.position.set(Math.cos(ang) * rad * 0.5, Math.sin(ang) * 0.12, Math.sin(ang) * rad * 0.5);
    spoke.rotation.y = ang;
    meshes.push(spoke);
  }

  return meshes;
}

function buildOuterFrameMesh(dummyMat) {
  const outer = CELLS * CELL - GAP * 0.35;
  return new THREE.Mesh(new THREE.BoxGeometry(outer, outer, outer), dummyMat);
}

function buildCubeletMeshes(dummyMat) {
  const meshes = [];
  for (let ix = 0; ix < CELLS; ix++) {
    for (let iy = 0; iy < CELLS; iy++) {
      for (let iz = 0; iz < CELLS; iz++) {
        if (ix === 1 && iy === 1 && iz === 1) continue;
        const geo = new THREE.BoxGeometry(CUBELET, CUBELET, CUBELET);
        const mesh = new THREE.Mesh(geo, dummyMat);
        mesh.position.set((ix - 1) * CELL, (iy - 1) * CELL, (iz - 1) * CELL);
        mesh.userData.tag = "shell";
        meshes.push(mesh);
      }
    }
  }
  return meshes;
}

function buildParticleBuf(maxTotal) {
  return {
    positions: new Float32Array(maxTotal * 3),
    colors: new Float32Array(maxTotal * 3),
    count: 0,
  };
}

function sampleMeshesInto(buf, meshes, maxTotal, layerStep, alongStep, edgeStep, colorFn, edgeOnly = false) {
  let idx = buf.count;
  for (const mesh of meshes) {
    if (idx >= maxTotal) break;
    _matrix.identity();
    mesh.updateMatrixWorld(true);
    _matrix.copy(mesh.matrixWorld);
    if (edgeOnly) {
      idx = sampleMeshEdges(mesh, _matrix, edgeStep, buf, idx, maxTotal, colorFn);
    } else {
      idx = sampleMeshLayers(mesh, _matrix, layerStep, alongStep, buf, idx, maxTotal, colorFn);
    }
  }
  buf.count = idx;
}

/** 3×3 分割线（小方块之间的缝隙轮廓） */
function sampleGridSeams(buf, startIdx, maxIdx) {
  let idx = startIdx;
  const step = 0.02;
  const seamColor = () => ({ r: 1.08, g: 1.1, b: 1.18 });
  const lo = -EXTENT + 0.03;
  const hi = EXTENT - 0.03;
  const seams = [-0.5, 0.5];

  for (const sx of seams) {
    for (let z = lo; z <= hi && idx < maxIdx; z += step * 2.5) {
      idx = sampleEdgeLine(
        new THREE.Vector3(sx, lo, z),
        new THREE.Vector3(sx, hi, z),
        step,
        buf,
        idx,
        maxIdx,
        seamColor
      );
    }
    for (let y = lo; y <= hi && idx < maxIdx; y += step * 2.5) {
      idx = sampleEdgeLine(
        new THREE.Vector3(sx, y, lo),
        new THREE.Vector3(sx, y, hi),
        step,
        buf,
        idx,
        maxIdx,
        seamColor
      );
    }
  }

  for (const sz of seams) {
    for (let x = lo; x <= hi && idx < maxIdx; x += step * 2.5) {
      idx = sampleEdgeLine(
        new THREE.Vector3(x, lo, sz),
        new THREE.Vector3(x, hi, sz),
        step,
        buf,
        idx,
        maxIdx,
        seamColor
      );
    }
    for (let y = lo; y <= hi && idx < maxIdx; y += step * 2.5) {
      idx = sampleEdgeLine(
        new THREE.Vector3(lo, y, sz),
        new THREE.Vector3(hi, y, sz),
        step,
        buf,
        idx,
        maxIdx,
        seamColor
      );
    }
  }

  for (const sy of seams) {
    for (let x = lo; x <= hi && idx < maxIdx; x += step * 2.5) {
      idx = sampleEdgeLine(
        new THREE.Vector3(x, sy, lo),
        new THREE.Vector3(x, sy, hi),
        step,
        buf,
        idx,
        maxIdx,
        seamColor
      );
    }
    for (let z = lo; z <= hi && idx < maxIdx; z += step * 2.5) {
      idx = sampleEdgeLine(
        new THREE.Vector3(lo, sy, z),
        new THREE.Vector3(hi, sy, z),
        step,
        buf,
        idx,
        maxIdx,
        seamColor
      );
    }
  }
  return idx;
}

function sampleMeshes(meshes, maxTotal, layerStep, alongStep, edgeStep, colorFn, edgeOnly = false) {
  const buf = buildParticleBuf(maxTotal);
  sampleMeshesInto(buf, meshes, maxTotal, layerStep, alongStep, edgeStep, colorFn, edgeOnly);
  return { buf, count: buf.count };
}

/** 水平 CT 扫描层：在整颗魔方体积内按层绘制 3×3 网格截面（终末地式） */
function sampleVolumeScan(buf, startIdx, maxIdx) {
  let idx = startIdx;
  const layerStep = 0.1;
  const alongStep = 0.08;

  const scanShellColor = () => ({ r: 0.72, g: 0.76, b: 0.86 });
  const scanInnerColor = (x, y, z) => {
    const d = Math.hypot(x, z);
    const core = Math.exp(-d * 2.0) * 0.35;
    return { r: 0.78 + core, g: 0.82 + core, b: 0.92 + core };
  };

  for (let layerY = -EXTENT; layerY <= EXTENT && idx < maxIdx; layerY += layerStep) {
    for (let ix = -1; ix <= 1; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        for (let iy = -1; iy <= 1; iy++) {
          if (ix === 1 && iy === 1 && iz === 1) continue;
          const cx = ix * CELL;
          const cy = iy * CELL;
          const cz = iz * CELL;
          if (layerY < cy - HALF || layerY > cy + HALF) continue;

          const x0 = cx - HALF;
          const x1 = cx + HALF;
          const z0 = cz - HALF;
          const z1 = cz + HALF;
          const y = layerY;
          const isMidLayer = Math.abs(layerY - cy) < HALF * 0.35;
          const colorFn = isMidLayer ? scanInnerColor : scanShellColor;

          idx = sampleEdgeLine(
            new THREE.Vector3(x0, y, z0),
            new THREE.Vector3(x1, y, z0),
            alongStep,
            buf,
            idx,
            maxIdx,
            colorFn
          );
          idx = sampleEdgeLine(
            new THREE.Vector3(x1, y, z0),
            new THREE.Vector3(x1, y, z1),
            alongStep,
            buf,
            idx,
            maxIdx,
            colorFn
          );
          idx = sampleEdgeLine(
            new THREE.Vector3(x1, y, z1),
            new THREE.Vector3(x0, y, z1),
            alongStep,
            buf,
            idx,
            maxIdx,
            colorFn
          );
          idx = sampleEdgeLine(
            new THREE.Vector3(x0, y, z1),
            new THREE.Vector3(x0, y, z0),
            alongStep,
            buf,
            idx,
            maxIdx,
            colorFn
          );

          if (isMidLayer && idx < maxIdx) {
            for (let t = -0.5; t <= 0.5 && idx < maxIdx; t += 0.5) {
              idx = sampleEdgeLine(
                new THREE.Vector3(cx + t * HALF * 0.8, y, cz - HALF * 0.6),
                new THREE.Vector3(cx + t * HALF * 0.8, y, cz + HALF * 0.6),
                alongStep * 1.2,
                buf,
                idx,
                maxIdx,
                scanInnerColor
              );
              idx = sampleEdgeLine(
                new THREE.Vector3(cx - HALF * 0.6, y, cz + t * HALF * 0.8),
                new THREE.Vector3(cx + HALF * 0.6, y, cz + t * HALF * 0.8),
                alongStep * 1.2,
                buf,
                idx,
                maxIdx,
                scanInnerColor
              );
            }
          }
        }
      }
    }
  }
  return idx;
}

/**
 * @param {object} opts
 * @param {function} opts.makeEndfieldMaterial - suixi 共用像素材质工厂
 * @param {THREE.Material} opts.dummyMat
 * @param {THREE.Material} opts.blackHullMat
 * @param {function} opts.addBlackHull - (mesh) => void
 */
export function createRubikCubeLayer({ makeEndfieldMaterial, dummyMat, blackHullMat, addBlackHull }) {
  const layer = new THREE.Group();
  layer.name = "rubik-layer";
  layer.visible = false;

  const hullGroup = new THREE.Group();
  const meshGroup = new THREE.Group();
  layer.add(hullGroup);
  layer.add(meshGroup);

  const cubeletMeshes = buildCubeletMeshes(dummyMat);
  const latticeMeshes = buildInnerLatticeMeshes(dummyMat);
  const outerFrame = buildOuterFrameMesh(dummyMat);
  outerFrame.visible = false;

  for (const mesh of cubeletMeshes) {
    mesh.visible = false;
    meshGroup.add(mesh);
    addBlackHull(mesh, hullGroup, blackHullMat);
  }
  for (const mesh of latticeMeshes) {
    mesh.visible = false;
    meshGroup.add(mesh);
  }
  meshGroup.add(outerFrame);

  const contourColor = () => ({ r: 1.1, g: 1.12, b: 1.2 });
  const scanColor = (x, y, z) => {
    const flick = 0.88 + hash2(x * 3, z * 3) * 0.1;
    return { r: 0.68 * flick, g: 0.72 * flick, b: 0.82 * flick };
  };

  const contourBuf = buildParticleBuf(MAX_CONTOUR);
  sampleMeshesInto(
    contourBuf,
    [...cubeletMeshes, outerFrame, ...latticeMeshes],
    MAX_CONTOUR,
    0,
    0,
    0.018,
    contourColor,
    true
  );
  contourBuf.count = sampleGridSeams(contourBuf, contourBuf.count, MAX_CONTOUR);

  const scanBuf = buildParticleBuf(MAX_SCAN);
  scanBuf.count = sampleVolumeScan(scanBuf, 0, MAX_SCAN);

  const ghostBuf = buildParticleBuf(MAX_GHOST);
  sampleMeshesInto(ghostBuf, [outerFrame], MAX_GHOST, 0.28, 0.22, 0, scanColor, false);

  const contourMat = makeEndfieldMaterial(1.62, 1.0, true);
  const scanMat = makeEndfieldMaterial(1.08, 0.48);
  const ghostMat = makeEndfieldMaterial(0.92, 0.2);

  const contourPoints = new THREE.Points(makePointsGeo(contourBuf, contourBuf.count), contourMat);
  const scanPoints = new THREE.Points(makePointsGeo(scanBuf, scanBuf.count), scanMat);
  const ghostPoints = new THREE.Points(makePointsGeo(ghostBuf, ghostBuf.count), ghostMat);

  hullGroup.renderOrder = 0;
  ghostPoints.renderOrder = 1;
  scanPoints.renderOrder = 2;
  contourPoints.renderOrder = 4;

  meshGroup.add(ghostPoints);
  meshGroup.add(scanPoints);
  meshGroup.add(contourPoints);

  layer.userData.sceneScale = 24;
  layer.userData.rootY = 26;
  layer.userData.camLookY = 26;
  layer.userData.camRadius = 205;
  layer.userData.camHeight = 10;

  return {
    layer,
    materials: [contourMat, scanMat, ghostMat],
  };
}

/** 独立页：02/index.html 用 */
export function initRubikCubeScene({ canvas, wrap }) {
  if (!canvas || !wrap) throw new Error("canvas 容器缺失");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x060a12, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a1420, 0.0028);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1500);
  const root = new THREE.Group();
  scene.add(root);

  const dummyMat = new THREE.MeshBasicMaterial();
  const blackHullMat = new THREE.MeshBasicMaterial({ color: 0x000000, colorWrite: false, depthWrite: true });
  const materials = [];

  function makeEndfieldMaterial(pixelSize, opacity = 1, sharp = false) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelSize: { value: pixelSize },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uOpacity: { value: opacity },
        uSharp: { value: sharp ? 1 : 0 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uPixelSize;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = max(1.0, uPixelSize * uPixelRatio);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uOpacity;
        uniform float uSharp;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float core = exp(-d * d * mix(28.0, 52.0, uSharp));
          float rim = smoothstep(0.5, 0.06, d);
          float alpha = mix(rim, core, uSharp) * uOpacity;
          gl_FragColor = vec4(vColor * (core * 1.25 + rim * 0.5), alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    materials.push(mat);
    return mat;
  }

  function addBlackHull(mesh, hullGroup, hullMat) {
    const hull = new THREE.Mesh(mesh.geometry, hullMat);
    hull.position.copy(mesh.position);
    hull.rotation.copy(mesh.rotation);
    hull.scale.copy(mesh.scale).multiplyScalar(0.92);
    hullGroup.add(hull);
  }

  const { layer } = createRubikCubeLayer({
    makeEndfieldMaterial,
    dummyMat,
    blackHullMat,
    addBlackHull: (mesh, hullGroup, hullMat) => addBlackHull(mesh, hullGroup, hullMat),
  });
  layer.visible = true;
  layer.scale.setScalar(layer.userData.sceneScale);
  root.add(layer);

  let targetRotY = 0.4;
  let rotY = targetRotY;
  let targetRotX = 0.28;
  let rotX = targetRotX;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function onResize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w < 1 || h < 1) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    materials.forEach((m) => { m.uniforms.uPixelRatio.value = pr; });
  }

  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    wrap.classList.add("dragging");
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    targetRotY += (e.clientX - lastX) * 0.008;
    targetRotX += (e.clientY - lastY) * 0.006;
    targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX));
    lastX = e.clientX;
    lastY = e.clientY;
  });
  wrap.addEventListener("pointerup", () => { dragging = false; wrap.classList.remove("dragging"); });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    if (!dragging) targetRotY += 0.2 * dt;
    rotY += (targetRotY - rotY) * 0.07;
    rotX += (targetRotX - rotX) * 0.07;
    root.rotation.y = rotY;
    root.rotation.x = rotX;
    camera.position.set(0, 36, 205);
    camera.lookAt(0, 26, 0);
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", onResize);
  onResize();
  animate();
}
