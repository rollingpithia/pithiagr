// Pithia hero playground — discovers numbered models, normalises each on load,
// and spaces them evenly round the orbit ring.
//
// Auto-detected per model, then overridable per file in HERO_OBJECT_FIXES:
//   1. which way the printed cover faces        (outside vs inside)
//   2. whether the print is on the inner skin   (inside-out cover panel)
//   3. whether the artwork is mirrored          (UV winding vs that outside)
//   4. roll                                     (in-plane rotation)

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import {
  HERO_OBJECT_FIXES,
  HERO_OBJECT_ROTATION,
  HERO_OBJECT_SCAN,
  HERO_OBJECT_SIZE_CM,
  HERO_ORBIT,
  HERO_RING_MIN,
  FLAGS,
  heroObjectCandidates,
} from '$lib/hero-objects.js';

const INTRO_DURATION = 1500;
const DEV = import.meta.env.DEV;
const MAX_TRIS_SCANNED = 200000;

/** Past this many packs the texture memory gets worth thinking about. */
const HEAVY_RING_WARNING = 24;

let maxAnisotropy = 1;

const PLACEHOLDER_COLORS = [
  0xc8b8a8, 0xb8a898, 0xd4c4b4, 0xa89888,
  0xccc0b0, 0xb0a090, 0xd0c0b0, 0x988878,
];

/** Every texture slot three.js might be holding, for teardown. */
const TEXTURE_SLOTS = [
  'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap',
  'displacementMap', 'roughnessMap', 'metalnessMap', 'alphaMap',
  'envMap', 'specularMap', 'clearcoatMap', 'clearcoatNormalMap',
  'clearcoatRoughnessMap', 'iridescenceMap', 'iridescenceThicknessMap',
  'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap',
  'specularIntensityMap', 'specularColorMap', 'anisotropyMap',
];

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function fmt(v) {
  return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
}

/** Filename without directory or ?v= cache token. */
function fileNameOf(url) {
  const path = url.split('?')[0];
  return path.slice(path.lastIndexOf('/') + 1);
}

function extensionOf(url) {
  const name = fileNameOf(url);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function hasMesh(object) {
  let found = false;
  object.traverse((child) => {
    if (child.isMesh) found = true;
  });
  return found;
}

function stripCamerasAndLights(root) {
  const remove = [];
  root.traverse((child) => {
    if (child.isCamera || child.isLight) remove.push(child);
  });
  for (const child of remove) child.parent?.remove(child);
}

function materialsOf(mesh) {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

// ---------------------------------------------------------------------------
// Teardown
//
// Clones share geometry, materials and textures, so collect uniques first and
// dispose each exactly once. Textures are the expensive part — the packs carry
// half-megabyte JPEGs, and material.dispose() does NOT free them.
// ---------------------------------------------------------------------------

function disposeSceneResources(scene) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  scene.traverse((child) => {
    if (!child.isMesh) return;
    if (child.geometry) geometries.add(child.geometry);
    for (const mat of materialsOf(child)) {
      if (!mat) continue;
      materials.add(mat);
      for (const slot of TEXTURE_SLOTS) {
        const tex = mat[slot];
        if (tex && tex.isTexture) textures.add(tex);
      }
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();

  if (DEV) {
    console.info(
      `[hero] freed ${geometries.size} geometries, ${materials.size} materials, ${textures.size} textures`,
    );
  }
}

// ---------------------------------------------------------------------------
// Geometry utilities
// ---------------------------------------------------------------------------

function flipWinding(geometry) {
  const index = geometry.index;
  if (index) {
    const a = index.array;
    for (let i = 0; i + 2 < a.length; i += 3) {
      const t = a[i];
      a[i] = a[i + 2];
      a[i + 2] = t;
    }
    index.needsUpdate = true;
    return;
  }
  for (const name of Object.keys(geometry.attributes)) {
    const attr = geometry.attributes[name];
    const size = attr.itemSize;
    const arr = attr.array;
    for (let i = 0; i + 2 < attr.count; i += 3) {
      for (let k = 0; k < size; k++) {
        const t = arr[i * size + k];
        arr[i * size + k] = arr[(i + 2) * size + k];
        arr[(i + 2) * size + k] = t;
      }
    }
    attr.needsUpdate = true;
  }
}

/**
 * Flattens the node hierarchy into meshes with transforms baked into cloned
 * geometry. Kills nested rotations, negative scale and the Z-up root in one
 * pass, so everything downstream can just read vertex positions.
 */
function bakeTransforms(root) {
  root.updateMatrixWorld(true);

  const source = [];
  root.traverse((child) => {
    if (child.isMesh && child.geometry) source.push(child);
  });

  const baked = new THREE.Group();
  for (const mesh of source) {
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    if (mesh.matrixWorld.determinant() < 0) flipWinding(geometry);
    geometry.computeBoundingBox();

    const flat = new THREE.Mesh(geometry, mesh.material);
    flat.name = mesh.name;
    baked.add(flat);
  }
  return baked;
}

function reflectGeometry(geometry, normal, offset) {
  const position = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    v.addScaledVector(normal, 2 * (offset - v.dot(normal)));
    position.setXYZ(i, v.x, v.y, v.z);
  }
  position.needsUpdate = true;

  const normals = geometry.attributes.normal;
  if (normals) {
    for (let i = 0; i < normals.count; i++) {
      v.fromBufferAttribute(normals, i);
      v.addScaledVector(normal, -2 * v.dot(normal));
      normals.setXYZ(i, v.x, v.y, v.z);
    }
    normals.needsUpdate = true;
  }

  flipWinding(geometry);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

// ---------------------------------------------------------------------------
// Finding the printed cover
// ---------------------------------------------------------------------------

function findPrintedFace(root) {
  root.updateMatrixWorld(true);

  const pA = new THREE.Vector3();
  const pB = new THREE.Vector3();
  const pC = new THREE.Vector3();
  const uvA = new THREE.Vector2();
  const uvB = new THREE.Vector2();
  const uvC = new THREE.Vector2();
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const scratch = new THREE.Vector3();

  let best = null;

  root.traverse((child) => {
    if (!child.isMesh) return;
    if (!materialsOf(child).some((m) => m && m.map)) return;

    const geometry = child.geometry;
    const position = geometry?.attributes?.position;
    const uv = geometry?.attributes?.uv;
    if (!position || !uv) return;

    const index = geometry.index;
    const count = index ? index.count : position.count;
    if (count / 3 > MAX_TRIS_SCANNED) return;

    for (let t = 0; t + 2 < count; t += 3) {
      const i0 = index ? index.getX(t) : t;
      const i1 = index ? index.getX(t + 1) : t + 1;
      const i2 = index ? index.getX(t + 2) : t + 2;

      uvA.fromBufferAttribute(uv, i0);
      uvB.fromBufferAttribute(uv, i1);
      uvC.fromBufferAttribute(uv, i2);

      const d1x = uvB.x - uvA.x;
      const d1y = uvB.y - uvA.y;
      const d2x = uvC.x - uvA.x;
      const d2y = uvC.y - uvA.y;

      const det = d1x * d2y - d1y * d2x;
      const uvArea = Math.abs(det) * 0.5;

      // A face that only samples a flat colour patch has a tiny UV footprint,
      // so this reliably ignores edges, backs and paper stacks.
      if (uvArea < 1e-7) continue;
      if (best && uvArea <= best.uvArea) continue;

      pA.fromBufferAttribute(position, i0).applyMatrix4(child.matrixWorld);
      pB.fromBufferAttribute(position, i1).applyMatrix4(child.matrixWorld);
      pC.fromBufferAttribute(position, i2).applyMatrix4(child.matrixWorld);

      e1.subVectors(pB, pA);
      e2.subVectors(pC, pA);
      if (scratch.crossVectors(e1, e2).lengthSq() < 1e-12) continue;

      // glTF images are top-down, so the image's "up" is decreasing v.
      const right = new THREE.Vector3()
        .addScaledVector(e1, d2y / det)
        .addScaledVector(e2, -d1y / det);
      const dv = new THREE.Vector3()
        .addScaledVector(e1, -d2x / det)
        .addScaledVector(e2, d1x / det);
      if (right.lengthSq() < 1e-12 || dv.lengthSq() < 1e-12) continue;

      right.normalize();
      const up = dv.negate();
      up.addScaledVector(right, -up.dot(right));
      if (up.lengthSq() < 1e-12) continue;
      up.normalize();

      best = {
        uvArea,
        mesh: child,
        right,
        up,
        front: new THREE.Vector3().crossVectors(right, up).normalize(),
        centroid: new THREE.Vector3().add(pA).add(pB).add(pC).multiplyScalar(1 / 3),
      };
    }
  });

  return best;
}

function projectionStats(root, axis) {
  const v = new THREE.Vector3();
  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;

  root.traverse((child) => {
    const position = child.isMesh ? child.geometry?.attributes?.position : null;
    if (!position) return;
    for (let i = 0; i < position.count; i++) {
      const d = v.fromBufferAttribute(position, i).dot(axis);
      sum += d;
      count++;
      if (d < min) min = d;
      if (d > max) max = d;
    }
  });

  return count ? { mean: sum / count, min, max, span: max - min } : null;
}

function flipTextureU(root) {
  const maps = new Set();
  root.traverse((child) => {
    if (!child.isMesh) return;
    for (const mat of materialsOf(child)) {
      if (mat?.map) maps.add(mat.map);
    }
  });
  for (const map of maps) {
    map.wrapS = THREE.RepeatWrapping;
    map.repeat.x = -1;
    map.offset.x = 1;
    map.needsUpdate = true;
  }
}

/**
 * Decides how the model should sit, repairs it in place, and returns the
 * rotation that puts the artwork square to +Z reading left-to-right.
 */
function normalizeHeroModel(root, file) {
  const face = findPrintedFace(root);
  if (!face) {
    if (DEV) console.warn(`[hero] ${file}: no textured face found — orientation left as authored.`);
    return null;
  }

  const fix = HERO_OBJECT_FIXES[file] ?? {};

  // 1. Which side of the booklet is the outside? The print sits on the far
  //    side of the body from the paper stack.
  const body = projectionStats(root, face.front);
  const separation = body ? face.centroid.dot(face.front) - body.mean : 0;
  const confident = Boolean(body) && Math.abs(separation) > body.span * 0.02;

  let flipOutward = confident && separation < 0;
  if (fix.flipOutward) flipOutward = !flipOutward;

  const outward = face.front.clone();
  if (flipOutward) outward.negate();

  // 2. Is the print on the inner skin of its own panel? Then the panel was
  //    mirrored in Blender — reflect it back so the artwork is outside.
  const panel = projectionStats(face.mesh, outward);
  let reflectPanel = false;
  if (panel) {
    const mid = (panel.min + panel.max) / 2;
    reflectPanel = face.centroid.dot(outward) < mid - panel.span * 0.01;
    if (fix.reflectPanel) reflectPanel = !reflectPanel;
    if (reflectPanel) reflectGeometry(face.mesh.geometry, outward, mid);
  }

  // 3. If the artwork only reads from the inside, mirror it across u. That
  //    leaves the image's "up" alone, so it stays the roll reference.
  let mirrorTexture = flipOutward;
  if (fix.mirrorTexture) mirrorTexture = !mirrorTexture;
  if (mirrorTexture) flipTextureU(root);

  // 4. Roll in the plane of the artwork.
  const up = face.up.clone();
  up.addScaledVector(outward, -up.dot(outward));
  if (up.lengthSq() < 1e-12) return null;
  up.normalize();

  const roll = Number(fix.roll) || 0;
  if (roll) {
    up.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(outward, degToRad(roll)));
  }

  const right = new THREE.Vector3().crossVectors(up, outward);
  const basis = new THREE.Matrix4().makeBasis(right, up, outward).transpose();

  if (DEV) {
    console.info(
      `[hero] ${file}: cover "${face.mesh.name || 'unnamed'}" outward ${fmt(outward)}` +
        ` · flipOutward=${flipOutward} reflectPanel=${reflectPanel}` +
        ` mirrorTexture=${mirrorTexture} roll=${roll}` +
        `${confident ? '' : ' · WEAK outward signal, set flipOutward by hand if wrong'}`,
    );
  }

  return new THREE.Quaternion().setFromRotationMatrix(basis);
}

function dedupeOverlappingCopies(root) {
  const children = [...root.children];
  if (children.length < 2) return 0;

  const kept = [];
  let removed = 0;
  const size = new THREE.Vector3();

  for (const child of children) {
    const counts = [];
    child.traverse((node) => {
      const n = node.isMesh ? node.geometry?.attributes?.position?.count : null;
      if (n) counts.push(n);
    });
    if (counts.length === 0) continue;
    counts.sort((a, b) => a - b);

    const signature = counts.join(',');
    const box = new THREE.Box3().setFromObject(child);
    if (box.isEmpty()) continue;

    box.getSize(size);
    const tolerance = Math.max(size.length() * 0.02, 1e-5);

    const duplicate = kept.find(
      (k) =>
        k.signature === signature &&
        k.box.min.distanceTo(box.min) < tolerance &&
        k.box.max.distanceTo(box.max) < tolerance,
    );

    if (duplicate) {
      root.remove(child);
      removed++;
    } else {
      kept.push({ signature, box });
    }
  }

  if (removed > 0 && DEV) {
    console.warn(`[hero] removed ${removed} duplicate copy(ies) stacked in the same spot.`);
  }
  return removed;
}

// ---------------------------------------------------------------------------

function fitHeroModel(object, file) {
  const aligned = new THREE.Group();
  aligned.add(object);
  if (FLAGS.autoAlignArtwork) {
    const quaternion = normalizeHeroModel(object, file);
    if (quaternion) aligned.quaternion.copy(quaternion);
  }

  const centred = new THREE.Group();
  centred.add(aligned);

  const box = new THREE.Box3().setFromObject(centred);
  if (box.isEmpty()) return centred;

  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  aligned.position.sub(center);

  box.setFromObject(centred).getSize(size);
  centred.scale.setScalar(HERO_OBJECT_SIZE_CM.width / Math.max(size.x, 1e-4));

  const model = new THREE.Group();
  model.add(centred);
  model.rotation.set(
    degToRad(HERO_OBJECT_ROTATION.x),
    degToRad(HERO_OBJECT_ROTATION.y),
    degToRad(HERO_OBJECT_ROTATION.z),
    'XYZ',
  );

  box.setFromObject(model).getCenter(center);
  model.position.sub(center);

  return model;
}

function createOrbitPivot(model) {
  const pivot = new THREE.Group();
  pivot.add(model);
  return pivot;
}

function createPlaceholder(index) {
  const { width, height } = HERO_OBJECT_SIZE_CM;
  const geometry = new THREE.BoxGeometry(width, height, width * 0.05);
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0,
    emissive: color,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.35,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function applyMeshDefaults(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    for (const mat of materialsOf(child)) {
      if (!mat) continue;
      if (mat.map) {
        mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.map.anisotropy = maxAnisotropy;
        mat.map.needsUpdate = true;
      }
    }
  });
}

async function loadGltf(url) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  stripCamerasAndLights(model);
  if (FLAGS.dedupeCopies) dedupeOverlappingCopies(model);
  if (!hasMesh(model)) throw new Error('No meshes in GLB');
  return bakeTransforms(model);
}

async function loadObj(url) {
  const [path, query = ''] = url.split('?');
  const basePath = path.slice(0, path.lastIndexOf('/') + 1);
  const suffix = query ? `?${query}` : '';
  const mtlName = fileNameOf(url).replace(/\.obj$/i, '.mtl') + suffix;

  const loader = new OBJLoader();
  try {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(basePath);
    const materials = await mtlLoader.loadAsync(mtlName);
    materials.preload();
    loader.setMaterials(materials);
  } catch {
    // optional .mtl
  }

  const object = await loader.loadAsync(url);
  object.traverse((child) => {
    if (child.isMesh && !child.material) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xd4c4b4,
        roughness: 0.85,
        metalness: 0.05,
      });
    }
  });
  return bakeTransforms(object);
}

async function loadModelFromUrl(url) {
  const ext = extensionOf(url);
  if (ext === '.glb' || ext === '.gltf') return loadGltf(url);
  if (ext === '.obj') return loadObj(url);
  throw new Error(`Unsupported format: ${url}`);
}

/** Returns a loaded slot, or null if none of the candidates worked. */
async function tryLoadHeroObject(candidates, index) {
  for (const url of candidates) {
    try {
      const file = fileNameOf(url);
      const model = await loadModelFromUrl(url);
      if (!hasMesh(model)) throw new Error('No meshes in file');
      applyMeshDefaults(model);
      const fitted = fitHeroModel(model, file);
      enableShadows(fitted);
      return { pivot: createOrbitPivot(fitted), model: fitted, file, url, index };
    } catch (err) {
      if (DEV) console.debug(`[hero] ${fileNameOf(url)} — not usable`, err);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Discovery — walk 01, 02, 03 … and take everything that's there
// ---------------------------------------------------------------------------

/** true = there, false = not there, null = can't tell (HEAD unavailable). */
async function probeUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) return false;
    // Static hosts with an SPA fallback answer missing files with the shell.
    const type = response.headers.get('content-type') || '';
    return !type.includes('text/html');
  } catch {
    return null;
  }
}

/**
 * Walks the numbered sequence in batches, stopping once it hits a run of gaps.
 * `test(index)` resolves to a truthy result for a hit, or null for a gap.
 */
async function scanNumbered(test) {
  const { max, missTolerance, batchSize } = HERO_OBJECT_SCAN;
  const found = [];
  let misses = 0;
  let next = 0;

  while (next < max && misses <= missTolerance) {
    const batch = [];
    for (let k = 0; k < batchSize && next + k < max; k++) batch.push(next + k);
    next += batch.length;

    const results = await Promise.all(batch.map((i) => test(i)));

    for (const result of results) {
      if (result) {
        found.push(result);
        misses = 0;
      } else {
        misses++;
        if (misses > missTolerance) break;
      }
    }
  }

  return found;
}

async function discoverHeroObjects(base, cacheToken) {
  const firstCandidate = heroObjectCandidates(base, 0, cacheToken)[0];
  const canProbe = (await probeUrl(firstCandidate)) !== null;

  if (canProbe) {
    // Cheap pass first, so missing numbers don't fill the console with 404s.
    const hits = await scanNumbered(async (index) => {
      for (const url of heroObjectCandidates(base, index, cacheToken)) {
        if ((await probeUrl(url)) === true) return { index, url };
      }
      return null;
    });
    const loaded = await Promise.all(hits.map((hit) => tryLoadHeroObject([hit.url], hit.index)));
    return loaded.filter(Boolean);
  }

  // No usable HEAD — fall back to trying the loads themselves.
  return scanNumbered((index) => tryLoadHeroObject(heroObjectCandidates(base, index, cacheToken), index));
}

/**
 * One pivot per ring slot, cycling through the models in order.
 *
 * The count is rounded up to a whole number of passes through the list, so
 * each model appears the same number of times and its copies land evenly
 * spaced — with 8 models and 16 slots, a pack and its duplicate are on
 * opposite sides of the ring and never on screen together.
 */
function buildRing(loaded) {
  if (loaded.length === 0) {
    return {
      pivots: Array.from({ length: HERO_RING_MIN }, (_, i) => createOrbitPivot(createPlaceholder(i))),
      passes: 0,
    };
  }

  const target = Math.max(HERO_RING_MIN, loaded.length, Number(HERO_ORBIT.density) || 0);
  const passes = Math.max(1, Math.ceil(target / loaded.length));
  const count = passes * loaded.length;

  const pivots = [];
  for (let i = 0; i < count; i++) {
    if (i < loaded.length) {
      pivots.push(loaded[i].pivot);
    } else {
      const clone = loaded[i % loaded.length].model.clone(true);
      enableShadows(clone);
      pivots.push(createOrbitPivot(clone));
    }
  }

  if (DEV) {
    const apart = passes > 1 ? `, copies ${(360 / passes).toFixed(0)}° apart` : '';
    console.info(`[hero] ${loaded.length} model(s) × ${passes} → ${count} in the ring${apart}`);
    if (loaded.length > HEAVY_RING_WARNING) {
      console.warn(
        `[hero] ${loaded.length} textures on screen at once — watch GPU memory if the packs are large JPEGs.`,
      );
    }
  }
  return { pivots, passes };
}

/** Only widens if papers would otherwise start overlapping. */
function ringRadius(count) {
  if (!HERO_ORBIT.autoWiden) return HERO_ORBIT.radius;
  const needed = (count * HERO_OBJECT_SIZE_CM.width) / (2 * Math.PI);
  const radius = Math.max(HERO_ORBIT.radius, needed);
  if (DEV && radius > HERO_ORBIT.radius) {
    console.info(`[hero] widened orbit ${HERO_ORBIT.radius} → ${radius.toFixed(1)} for ${count} objects`);
  }
  return radius;
}

/**
 * @param {HTMLElement} container
 * @param {{ base?: string }} [options]
 * @returns {Promise<() => void>}
 */
export async function initThreeHero(container, { base = '' } = {}) {
  THREE.Cache.clear();

  const scene = new THREE.Scene();

  let width = window.innerWidth || 1024;
  let height = window.innerHeight || 768;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
  camera.position.set(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight.position.set(20, 30, 10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.left = -60;
  dirLight.shadow.camera.right = 60;
  dirLight.shadow.camera.top = 60;
  dirLight.shadow.camera.bottom = -60;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  const objectsData = [];
  let introStartMs = 0;
  let frameId = 0;

  const startIntro = () => {
    if (introStartMs === 0) introStartMs = performance.now();
  };
  window.addEventListener('pithia:three-start', startIntro, { once: true });
  if (window.__pithiaThreeStarted) startIntro();

  const loaded = await discoverHeroObjects(base, '');

  camera.lookAt(new THREE.Vector3(0, 0, -40));

  function teardown(onResizeHandler, onScrollHandler) {
    cancelAnimationFrame(frameId);
    window.removeEventListener('pithia:three-start', startIntro);
    if (onScrollHandler) window.removeEventListener('scroll', onScrollHandler);
    if (onResizeHandler) window.removeEventListener('resize', onResizeHandler);
    disposeSceneResources(scene);
    renderer.dispose();
    renderer.domElement.parentNode?.removeChild(renderer.domElement);
  }

  // --- line-up mode: one of each, in a row, facing the camera -------------
  if (FLAGS.lineUp && loaded.length > 0) {
    const spacing = HERO_OBJECT_SIZE_CM.width * 1.3;
    const half = (spacing * (loaded.length - 1) + HERO_OBJECT_SIZE_CM.width) / 2;
    const hFov = 2 * Math.atan(Math.tan(degToRad(45) / 2) * (width / height));
    const dist = Math.max(14, (half / Math.tan(hFov / 2)) * 1.2);

    loaded.forEach((slot, i) => {
      const holder = new THREE.Group();
      holder.add(slot.model);
      holder.position.set(spacing * (i - (loaded.length - 1) / 2), 0, -dist);
      scene.add(holder);
    });

    container.style.opacity = '1';
    renderer.render(scene, camera);

    const onResizeLine = () => {
      width = window.innerWidth || 1024;
      height = window.innerHeight || 768;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResizeLine);

    return () => teardown(onResizeLine, null);
  }

  // --- the ring ----------------------------------------------------------
  const { pivots: meshes } = buildRing(loaded);
  const numObjects = meshes.length;
  const radius = ringRadius(numObjects);

  for (let i = 0; i < numObjects; i++) {
    const pivot = meshes[i];
    scene.add(pivot);

    const baseAngle = (i / numObjects) * Math.PI * 2;
    const heroRadius = radius + Math.sin(i * 3.17) * HERO_ORBIT.variance;
    const heroY = Math.cos(i * 2.39) * HERO_ORBIT.heightY;

    objectsData.push({
      mesh: pivot,
      baseAngle,
      orbitSpeed: 0.018,
      heroRadius,
      heroY,
      visionRadius: heroRadius + 10 + Math.random() * 12,
      visionY: heroY * 2.0 + (Math.random() - 0.5) * 30,
      visionRotX: (Math.random() - 0.5) * Math.PI,
      visionRotZ: (Math.random() - 0.5) * Math.PI,
    });
  }

  let currentProgress = 0;
  let targetProgress = 0;

  function updateScroll() {
    const wh = window.innerHeight || 1;
    targetProgress = Math.min(Math.max((window.scrollY || 0) / wh, 0), 1) || 0;
  }

  const onScroll = () => updateScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScroll();

  if (
    window.__pithiaThreeStarted ||
    document.body.classList.contains('pithia-ready')
  ) {
    startIntro();
  }

  const clock = new THREE.Clock();
  const qHero = new THREE.Quaternion();
  const qVision = new THREE.Quaternion();
  const qCurrent = new THREE.Quaternion();
  const eHero = new THREE.Euler();
  const eVision = new THREE.Euler();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate() {
    frameId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    currentProgress += (targetProgress - currentProgress) * 0.08;
    if (isNaN(currentProgress)) currentProgress = 0;
    currentProgress = Math.max(0, Math.min(1, currentProgress));

    for (let i = 0; i < objectsData.length; i++) {
      const data = objectsData[i];
      const currentAngle = data.baseAngle + time * data.orbitSpeed;

      const currentRadius = THREE.MathUtils.lerp(data.heroRadius, data.visionRadius, currentProgress);
      const currentY = THREE.MathUtils.lerp(data.heroY, data.visionY, currentProgress);

      data.mesh.position.set(
        Math.cos(currentAngle) * currentRadius,
        currentY,
        Math.sin(currentAngle) * currentRadius,
      );

      // Turns the model's +Z toward the camera at the centre of the ring, so
      // every paper shows its cover wherever it is in the orbit.
      const heroRotationY = -currentAngle - Math.PI / 2;

      eHero.set(0, heroRotationY, 0);
      qHero.setFromEuler(eHero);

      eVision.set(data.visionRotX, heroRotationY, data.visionRotZ);
      qVision.setFromEuler(eVision);

      qCurrent.slerpQuaternions(qHero, qVision, currentProgress);
      data.mesh.quaternion.copy(qCurrent);
    }

    const introFade =
      introStartMs === 0 ? 0 : Math.min(1, (performance.now() - introStartMs) / INTRO_DURATION);
    let scrollFade = 1 - Math.pow(currentProgress, 3);
    if (isNaN(scrollFade)) scrollFade = 1;
    container.style.opacity = String(introFade * scrollFade);

    renderer.render(scene, camera);
  }

  const onResize = () => {
    width = window.innerWidth || 1024;
    height = window.innerHeight || 768;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    updateScroll();
  };
  window.addEventListener('resize', onResize);

  if (reducedMotion) {
    container.style.opacity = '1';
    renderer.render(scene, camera);
  } else {
    animate();
  }

  return () => teardown(onResize, onScroll);
}