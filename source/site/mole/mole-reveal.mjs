// DeepSpot mole profile reveal. three.js and all mole assets load only when this opens.
// Timeline is a pure function of time (schedule + closed-form fx), so it can be seeked for QA.

import { roll, equip } from './mole-rules.mjs?v=1';

const CDN = 'https://cdn.jsdelivr.net/npm/three@0.180.0';
const DRACO_PATH = CDN + '/examples/jsm/libs/draco/gltf/';
const BASE = new URL('./', import.meta.url);
const ASSETS = new URL('./assets/', import.meta.url);
const NONE_CHANCE = 0.15;
const ALWAYS = new Set(['Body/Shirt', 'Head/Hat']);
const POOL_SIZE = { 'Head/Hat': 18, 'Body/Shirt': 14, 'Jackets': 5, 'Mouth Area': 6, 'Face': 2, 'Eyes': 1 };
const FLICKER_WEIGHT = { 'Head/Hat': 36, 'Body/Shirt': 28, 'Jackets': 14, 'Mouth Area': 10, 'Face': 8, 'Eyes': 4 };

// timeline (ms)
const T = { intro: 800, chargeEnd: 4800, flashPeak: 5150, flashHold: 5300, flashEnd: 6050, end: 6050 };
const SWAP_START = 200, SWAP_END = 28;

// backlit: the mole is a dark shape against green light
const CREAM = [5, 7, 12], COBALT_WHITE = [10, 30, 22];
const SPARK_COLORS = ['#07d653', '#3c60ff', '#66df91', '#f5f4ee', '#83cdce'];

let libsPromise = null;
let active = null;

export function isMoleRevealOpen() { return !!active; }

function loadLibs(onTick) {
  const tick = (p) => p.then((m) => { try { onTick && onTick(); } catch {} return m; });
  return libsPromise ??= (async () => {
    const hasMap = !![...document.scripts].some((s) => s.type === 'importmap');
    if (!hasMap && HTMLScriptElement.supports?.('importmap')) {
      const m = document.createElement('script');
      m.type = 'importmap';
      m.textContent = JSON.stringify({ imports: { three: CDN + '/build/three.module.js', 'three/addons/': CDN + '/examples/jsm/' } });
      document.head.append(m);
    }
    const [THREE, g, d, r] = await Promise.all([
      tick(import('three')),
      tick(import('three/addons/loaders/GLTFLoader.js')),
      tick(import('three/addons/loaders/DRACOLoader.js')),
      tick(import('three/addons/loaders/HDRLoader.js'))
    ]);
    return { THREE, GLTFLoader: g.GLTFLoader, DRACOLoader: d.DRACOLoader, RGBELoader: r.HDRLoader };
  })().catch((e) => { libsPromise = null; throw e; });
}

function loadCSS() {
  const href = new URL('mole-reveal.css?v=ld3', BASE).href;
  if ([...document.styleSheets].some((s) => s.href === href) || document.querySelector(`link[data-mole-css]`)) return Promise.resolve();
  return new Promise((res) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.dataset.moleCss = '1';
    l.onload = l.onerror = () => res();
    document.head.append(l);
  });
}

// ---------------------------------------------------------------- random

function rng() { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] / 4294967296; }
function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Trait rules (scene.json `rules`, from MOLE_RULES.json) decide what can be worn together.
export function rollTraits(scene) {
  return roll(scene.slots, scene.rules, { rng, none: NONE_CHANCE, always: ALWAYS });
}

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeInOut = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);

// ---------------------------------------------------------------- open

// ---------------------------------------------------------------- loading screen
// Shown the instant the reveal opens (before the CSS file, three.js or any GLB is fetched): a dark mole silhouette,
// "rolling your mole..." and a bar that follows the real work. Everything it needs is inline.
const SIL = 'data:image/png;base64,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';
const LD_CSS = `.mrl{position:fixed;inset:0;z-index:2147483001;display:grid;place-items:center;background:#0c101b;color:#f5f4ee;font-family:Arial,Helvetica,sans-serif;opacity:1;transition:opacity .28s ease;overscroll-behavior:contain}
.mrl.mrl-out{opacity:0;pointer-events:none}.mrl[hidden]{display:none}
.mrl::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(7,214,83,.2) 0,rgba(7,214,83,.07) 28%,transparent 56%)}
.mrl-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:18px;width:min(78vw,340px);padding:16px 0}
.mrl-mole{position:relative;width:min(40vw,150px);aspect-ratio:261/382;display:block;animation:mrl-bob 1.5s ease-in-out infinite}
.mrl-mole img{display:block;width:100%;height:100%;filter:brightness(1.12) drop-shadow(0 0 1px rgba(143,255,190,.9)) drop-shadow(0 0 22px rgba(7,214,83,.38))}
.mrl-mole::after{content:"";position:absolute;left:12%;right:12%;bottom:-14px;height:12px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.55),transparent 70%);animation:mrl-sh 1.5s ease-in-out infinite}
.mrl-t{margin:6px 0 0;font:800 clamp(24px,7vw,32px)/1 Arial,Helvetica,sans-serif;letter-spacing:-.05em;text-transform:lowercase;text-align:center}
.mrl-t span{color:#66df91}
.mrl-bar{width:100%;height:10px;border-radius:99px;background:rgba(245,244,238,.14);overflow:hidden}
.mrl-bar i{display:block;height:100%;width:100%;border-radius:inherit;background:linear-gradient(90deg,#07d653,#66df91);transform:scaleX(0);transform-origin:0 50%}
.mrl-p{margin:0;font:600 14px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#a4b5c6;min-height:14px}
.mrl-x{position:absolute;z-index:2;top:max(14px,env(safe-area-inset-top));right:16px;width:44px;height:44px;border-radius:50%;border:1.5px solid #f5f4ee55;background:#0c101bcc;color:#f5f4ee;font-size:26px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0 0 3px}
.mr-pre>:not(.mrl){visibility:hidden}
.mrl-x:hover{border-color:#f5f4ee}.mrl-x:focus-visible{outline:2px solid #66df91;outline-offset:3px}
@keyframes mrl-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes mrl-sh{0%,100%{transform:scaleX(1);opacity:.9}50%{transform:scaleX(.8);opacity:.6}}
@media(prefers-reduced-motion:reduce){.mrl-mole,.mrl-mole::after{animation:none}.mrl{transition-duration:.01s}}`;
function makeLoader(reduced) {
  if (!document.querySelector('style[data-mole-ld]')) { const st = document.createElement('style'); st.dataset.moleLd = '1'; st.textContent = LD_CSS; document.head.append(st); }
  const el = document.createElement('div');
  el.className = 'mrl'; el.setAttribute('role', 'status'); el.setAttribute('aria-busy', 'true');
  el.innerHTML = `<button type="button" class="mrl-x" aria-label="Close">&times;</button><div class="mrl-in"><span class="mrl-mole" aria-hidden="true"><img src="${SIL}" alt="" width="261" height="382"></span><p class="mrl-t">rolling your <span>mole&hellip;</span></p><div class="mrl-bar" role="progressbar" aria-label="Rolling your mole" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><p class="mrl-p" aria-hidden="true">0%</p></div>`;
  document.body.append(el);
  const fill = el.querySelector('.mrl-bar i'), bar = el.querySelector('.mrl-bar'), pct = el.querySelector('.mrl-p');
  // value = measured work done (0..1). The shown value eases up to it and never jumps back.
  let target = 0, shown = 0, raf = 0, on = true, last = performance.now();
  const paint = () => { const v = Math.round(shown * 100); fill.style.transform = `scaleX(${shown.toFixed(3)})`; bar.setAttribute('aria-valuenow', String(v)); pct.textContent = v + '%'; };
  const tick = (now) => {
    raf = 0; if (!on) return;
    const dt = Math.min(64, now - last); last = now;
    if (shown < target) shown = Math.min(target, shown + Math.max(0.004, (target - shown) * Math.min(1, dt / 90)));
    paint();
    if (shown < target || target < 1) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf && on) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  paint(); kick();
  return {
    el,
    set(v) { target = Math.max(target, Math.min(1, v)); kick(); },
    reset() { target = 0; shown = 0; on = true; el.hidden = false; el.classList.remove('mrl-out'); el.setAttribute('aria-busy', 'true'); paint(); kick(); },
    async finish() {
      target = 1; kick();
      for (let i = 0; i < 24 && shown < 0.995; i++) await new Promise((r) => setTimeout(r, 16));
      shown = 1; paint(); el.setAttribute('aria-busy', 'false');
      el.classList.add('mrl-out');
      await new Promise((r) => setTimeout(r, reduced ? 20 : 280));
      on = false; el.hidden = true;
    },
    remove() { on = false; if (raf) cancelAnimationFrame(raf); el.remove(); }
  };
}

export async function openMoleReveal(opts = {}) {
  if (active) return active.promise;
  const reduced = typeof opts.reducedMotion === 'boolean' ? opts.reducedMotion : matchMedia('(prefers-reduced-motion: reduce)').matches;
  const trigger = opts.trigger || document.activeElement;
  let resolveResult;
  const promise = new Promise((r) => { resolveResult = r; });
  const run = { promise, close: () => {} };
  active = run;

  // ---- dom (built at once: the loading screen shows before the CSS file, three.js or any model has arrived)
  const cssReady = loadCSS();
  const loader = makeLoader(reduced);
  const root = document.createElement('div');
  root.className = 'mr mr-pre';
  root.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0c101b;opacity:1;overflow:hidden';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Roll a mole');
  root.innerHTML = `
    <div class="mr-glow" aria-hidden="true"></div>
    <canvas class="mr-fx mr-fx-back" aria-hidden="true"></canvas>
    <button type="button" class="mr-close" aria-label="Close">&times;</button>
    <button type="button" class="mr-skip">skip</button>
    <button type="button" class="mr-roll" tabindex="-1">roll your mole</button>
    <div class="mr-stage"><div class="mr-view"><div class="mr-loading mr-hide" aria-hidden="true">waking the mole</div></div></div>
    <canvas class="mr-fx mr-fx-front" aria-hidden="true"></canvas>
    <div class="mr-foot">
      <h2 class="mr-title" aria-hidden="true"><span class="mr-t1">meet your</span> <span class="mr-t2">mole.</span></h2>
      <p class="mr-traits" aria-hidden="true">&nbsp;</p>
      <div class="mr-actions">
        <button type="button" class="mr-btn mr-primary" data-act="keep">keep this mole</button>
        <button type="button" class="mr-btn" data-act="again">roll again</button>
        <button type="button" class="mr-btn" data-act="download">download</button>
      </div>
    </div>
    <div class="mr-flash" aria-hidden="true"></div>
    <p class="mr-sr" role="status" aria-live="polite"></p>`;
  const $ = (s) => root.querySelector(s);
  const view = $('.mr-view'), loadingEl = $('.mr-loading'), srEl = $('.mr-sr');
  const fxBack = $('.mr-fx-back'), fxFront = $('.mr-fx-front');
  const flashEl = $('.mr-flash'), glowEl = $('.mr-glow'), traitsEl = $('.mr-traits'), titleEl = $('.mr-title');
  const skipBtn = $('.mr-skip'), closeBtn = $('.mr-close'), rollBtn = $('.mr-roll');
  const actionBtns = [...root.querySelectorAll('[data-act]')];

  const inerted = [...document.body.children].filter((el) => el !== root && !el.hasAttribute('inert'));
  inerted.forEach((el) => el.setAttribute('inert', ''));
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  root.append(loader.el);
  document.body.append(root);
  root.dataset.phase = 'load';
  const loaderX = loader.el.querySelector('.mrl-x');
  loaderX.addEventListener('click', () => run.close(null));
  loaderX.focus({ preventScroll: true });
  srEl.textContent = 'Rolling your mole.';
  cssReady.then(() => { root.classList.remove('mr-pre'); root.classList.add('mr-in'); root.style.cssText = ''; });

  // ---- real progress: libs + scene.json + base model + environment + trait models. The value only goes up.
  const W = { libs: 0.18, scene: 0.04, base: 0.30, env: 0.14, traits: 0.34 };
  const P = { libs: 0, scene: 0, base: 0, env: 0, traits: 0 };
  let rerollOnly = false;
  const setP = (k, v) => { P[k] = Math.max(P[k], Math.min(1, v)); loader.set(rerollOnly ? P.traits : Object.keys(W).reduce((a, x) => a + W[x] * P[x], 0)); };
  const fileProg = (k) => (e) => { if (e && e.lengthComputable && e.total) setP(k, e.loaded / e.total * 0.95); };

  // ---- state
  let closed = false;
  let lib = null, renderer = null, scene3 = null, camera = null, sun = null, envTex = null;
  let sceneJson = null, baseRoot = null, outfitGroup = null, silhouetteMat = null;
  const cache = new Map(), pendingLoads = new Map(), equipped = new Map();
  let homeTarget, fwd, homeDistance = 1, kFit = 1;
  let lightExposure = 0.91, sunIntensity = 1.10;
  let timeline = null;      // {schedule, rings, finalTraits, particles}
  let t0 = 0, tNow = 0, running = false, paused = false, rafId = 0, lastTs = 0, frozen = false;
  let stageSize = 400, dpr = 1, fxW = 0, fxH = 0, cx = 0, cy = 0;
  let isReal = false, lastStateIdx = -2, reduceFade = null;
  let finalTraits = null, result = null, traitIndex = {};

  const raf = (cb) => requestAnimationFrame(cb);

  function announce(text) { srEl.textContent = text; }

  // ---- model loading (lifted from the outfitter)
  // MOLE_RULES softAlpha: traits whose alpha is a real blend (Cig smoke, Fez strings).
  // Everything else is a cutout (Blender HASHED), so it writes depth and never sorts wrong.
  function prepare(rootObj, id) {
    const soft = !!id && ((sceneJson && sceneJson.rules && sceneJson.rules.softAlpha) || []).includes(id);
    const push = new Set((sceneJson && sceneJson.depth_push) || []);
    rootObj.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        if (push.has(o.name)) { m.polygonOffset = true; m.polygonOffsetFactor = 1; m.polygonOffsetUnits = 4; }
        if (m.transparent && m.opacity >= 0.999 && !soft) { m.transparent = false; m.depthWrite = true; m.alphaTest = 0.5; }
        else if (m.transparent && m.opacity >= 0.999) { m.depthWrite = false; m.alphaTest = 0.01; }
        else if (m.transparent) { m.depthWrite = false; }
        m.needsUpdate = true;
      });
    });
    return rootObj;
  }
  let gltfLoader;
  const loadGLB = (url, id, onProg) => new Promise((res, rej) => gltfLoader.load(url, (g) => res(prepare(g.scene, id)), onProg, rej));
  function getTrait(slot, id) {
    if (cache.has(id)) return Promise.resolve(cache.get(id));
    if (pendingLoads.has(id)) return pendingLoads.get(id);
    const t = traitIndex[slot][id];
    const p = loadGLB(new URL(t.file + '?v=rules1', ASSETS).href, id).then((r) => { cache.set(id, r); pendingLoads.delete(id); return r; })
      .catch((e) => { pendingLoads.delete(id); throw e; });
    pendingLoads.set(id, p);
    return p;
  }

  // ---- three setup
  function initThree() {
    const { THREE } = lib;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = lightExposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.domElement.className = 'mr-gl';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    view.append(renderer.domElement);
    scene3 = new THREE.Scene();
    const c = sceneJson.camera;
    camera = new THREE.PerspectiveCamera(c.fov_vertical_deg, 1, c.near, c.far);
    camera.position.fromArray(c.position);
    camera.quaternion.fromArray(c.quaternion);
    camera.updateMatrixWorld();
    outfitGroup = new THREE.Group();
    scene3.add(outfitGroup);
    silhouetteMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#05070c'), toneMapped: false });
    silhouetteMat.side = THREE.DoubleSide;
  }

  function frameModel(THREE) {
    const box = new THREE.Box3().setFromObject(baseRoot);
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(box.getSize(new THREE.Vector3()).length() * 0.5, 1) * 1.6;
    const homePos = camera.position.clone();
    fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const d = center.clone().sub(homePos).dot(fwd);
    homeDistance = Math.max(0.1, d);
    // aim at the model centre (bias up: hats), keep the Blender orientation
    const size = box.getSize(new THREE.Vector3());
    homeTarget = center.clone().add(new THREE.Vector3(0, size.y * 0.1, 0));
    const vis = 2 * homeDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    kFit = Math.max(1, (size.y * 1.2) / (0.86 * vis));
    camera.near = Math.max(0.05, homeDistance * 0.3 - radius * 1.15);
    camera.far = homeDistance * 4 + radius * 1.6;
    camera.updateProjectionMatrix();
    // sun, as in the outfitter
    const dir = sceneJson.world && sceneJson.world.sun_dir_three
      ? new THREE.Vector3().fromArray(sceneJson.world.sun_dir_three).normalize() : new THREE.Vector3(0.3, 0.9, 0.3).normalize();
    const dist = radius * 4;
    sun = new THREE.DirectionalLight(0xffffff, sunIntensity);
    sun.position.copy(center).addScaledVector(dir, dist);
    sun.target.position.copy(center);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const r = radius * 1.08, sc = sun.shadow.camera;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r;
    sc.near = Math.max(0.1, dist - radius * 1.6); sc.far = dist + radius * 1.6;
    sc.updateProjectionMatrix();
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
    scene3.add(sun); scene3.add(sun.target);
  }

  async function loadEnv() {
    const { THREE, RGBELoader } = lib;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const tex = await new RGBELoader().loadAsync(new URL((sceneJson.world && sceneJson.world.file) || 'env.hdr', ASSETS).href, fileProg('env'));
    setP('env', 1);
    const rt = pmrem.fromEquirectangular(tex);
    envTex = rt.texture;
    tex.dispose(); pmrem.dispose();
  }

  // ---- layout
  function resize() {
    if (!renderer) return;
    const r = view.getBoundingClientRect();
    stageSize = Math.max(120, Math.floor(Math.min(r.width, r.height)));
    renderer.setSize(stageSize, stageSize, false);
    renderer.domElement.style.width = stageSize + 'px';
    renderer.domElement.style.height = stageSize + 'px';
    camera.aspect = 1; camera.updateProjectionMatrix();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxW = window.innerWidth; fxH = window.innerHeight;
    for (const c of [fxBack, fxFront]) { c.width = Math.round(fxW * dpr); c.height = Math.round(fxH * dpr); c.style.width = fxW + 'px'; c.style.height = fxH + 'px'; }
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    glowEl.style.setProperty('--cx', cx + 'px'); glowEl.style.setProperty('--cy', cy + 'px');
    renderer.shadowMap.needsUpdate = true;
  }
  const onResize = () => { resize(); if (!running) renderAt(tNow); };
  window.addEventListener('resize', onResize);

  // ---- scene state
  function applyState(map) {
    const { THREE } = lib;
    for (const slot of sceneJson.slotOrder) {
      const cur = equipped.get(slot);
      const want = map[slot];
      if (cur && cur.userData.traitId !== want) { outfitGroup.remove(cur); equipped.delete(slot); }
    }
    for (const slot of sceneJson.slotOrder) {
      const want = map[slot];
      if (!want || equipped.has(slot)) continue;
      const rootObj = cache.get(want);
      if (!rootObj) continue;
      rootObj.userData.traitId = want;
      if (rootObj.parent) rootObj.parent.remove(rootObj);
      outfitGroup.add(rootObj);
      equipped.set(slot, rootObj);
    }
    renderer.shadowMap.needsUpdate = true;
  }
  function stateAt(idx) {
    const map = {};
    for (let i = 0; i <= idx; i++) { const e = timeline.schedule[i]; if (e.id) map[e.slot] = e.id; else delete map[e.slot]; }
    return map;
  }

  function setReal(on) {
    if (on === isReal) return;
    isReal = on;
    scene3.overrideMaterial = on ? null : silhouetteMat;
    scene3.environment = on ? envTex : null;
    renderer.shadowMap.needsUpdate = true;
  }

  // ---- timeline build
  function buildTimeline() {
    const r = mulberry(Math.floor(rng() * 4294967296));
    const schedule = [];
    // current silhouette state while flickering; always start bare
    const cur = {};
    const slots = sceneJson.slotOrder.filter((s) => poolBySlot[s]?.length);
    const weights = slots.map((s) => FLICKER_WEIGHT[s] || 5);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const pickSlot = () => { let x = r() * totalW; for (let i = 0; i < slots.length; i++) { x -= weights[i]; if (x <= 0) return slots[i]; } return slots[0]; };
    // even the flicker never shows a banned pair: equipping drops what it clashes with
    const put = (slot, id) => {
      const nx = equip(sceneJson.rules, cur, slot, id);
      for (const k of Object.keys(cur)) if (!(k in nx)) { delete cur[k]; schedule.push({ t: Math.round(t), slot: k, id: null }); }
      cur[slot] = id; schedule.push({ t: Math.round(t), slot, id });
    };
    let t = T.intro;
    const span = T.chargeEnd - T.intro;
    while (t < T.chargeEnd - 20) {
      const p = clamp01((t - T.intro) / span);
      const slot = pickSlot();
      const list = poolBySlot[slot];
      let id = (!ALWAYS.has(slot) && r() < 0.2) || (ALWAYS.has(slot) && cur[slot] && r() < 0.08) ? null : pick(list, r);
      if (id && id === cur[slot]) id = pick(list, r);
      if (id) put(slot, id); else { delete cur[slot]; schedule.push({ t: Math.round(t), slot, id }); }
      // later in the charge, change more slots per beat
      const extra = Math.floor(p * 2.4);
      for (let e = 0; e < extra; e++) { const s2 = pickSlot(); if (s2 === slot) continue; const id2 = pick(poolBySlot[s2], r); if (id2) put(s2, id2); }
      t += SWAP_START * Math.pow(SWAP_END / SWAP_START, Math.pow(p, 0.85));
    }
    // lock-in at the flash peak: final traits for every slot
    for (const slot of sceneJson.slotOrder) {
      const id = finalTraits[slot] || null;
      if (id || cur[slot]) schedule.push({ t: T.flashPeak, slot, id });
    }
    // rings: born faster over the charge
    const rings = [];
    let rt = T.intro + 200;
    while (rt < T.chargeEnd) { const p = clamp01((rt - T.intro) / span); rings.push(rt); rt += mix(520, 130, p * p); }
    // sparkle burst
    const particles = [];
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, sp = mix(0.25, 1.05, Math.pow(r(), 0.7));
      particles.push({ a, sp, size: mix(2, 7, r()), color: SPARK_COLORS[Math.floor(r() * SPARK_COLORS.length)], life: mix(0.9, 2.0, r()), star: r() < 0.55, rot: r() * 3, delay: r() * 0.12 });
    }
    const twinkles = [];
    for (let i = 0; i < 16; i++) twinkles.push({ a: r() * Math.PI * 2, rad: mix(0.28, 0.62, r()), phase: r(), period: mix(1.1, 2.0, r()), size: mix(3, 7, r()), color: SPARK_COLORS[Math.floor(r() * SPARK_COLORS.length)] });
    timeline = { schedule, rings, particles, twinkles };
  }

  // ---- drawing
  function drawStar(ctx, x, y, s, rot, alpha, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? s * 0.28 : s; const a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  function drawFx(t) {
    const unit = stageSize; // stage size in css px
    const b = fxBack.getContext('2d'), f = fxFront.getContext('2d');
    b.setTransform(dpr, 0, 0, dpr, 0, 0); f.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.clearRect(0, 0, fxW, fxH); f.clearRect(0, 0, fxW, fxH);
    if (reduced || !timeline) return;
    const charge = clamp01((t - T.intro) / (T.chargeEnd - T.intro));
    const chargeOn = t >= T.intro && t < T.flashPeak;
    if (chargeOn) {
      // rays
      const rayA = 0.08 + Math.pow(charge, 1.4) * 0.42;
      b.save(); b.translate(cx, cy); b.globalCompositeOperation = 'lighter';
      const n = 16, rot = t * 0.00035 * (1 + charge * 2);
      const R = Math.hypot(fxW, fxH);
      for (let i = 0; i < n; i++) {
        const a = rot + i * (Math.PI * 2 / n), w = 0.05 + 0.02 * Math.sin(i * 2.1 + t * 0.002);
        const g = b.createRadialGradient(0, 0, unit * 0.1, 0, 0, R * 0.55);
        g.addColorStop(0, `rgba(90,235,140,${rayA})`); g.addColorStop(1, 'rgba(7,214,83,0)');
        b.fillStyle = g; b.beginPath(); b.moveTo(0, 0);
        b.arc(0, 0, R, a - w, a + w); b.closePath(); b.fill();
      }
      b.restore();
      // rings
      b.save(); b.translate(cx, cy);
      for (const born of timeline.rings) {
        const age = (t - born) / 1000;
        if (age < 0 || age > 1.5) continue;
        const k = easeOut(age / 1.5), rad = unit * mix(0.12, 0.85, k), al = (1 - k) * mix(0.25, 0.6, charge);
        b.strokeStyle = `rgba(110,240,160,${al})`; b.lineWidth = mix(1.5, 4, 1 - k);
        b.beginPath(); b.arc(0, 0, rad, 0, Math.PI * 2); b.stroke();
      }
      b.restore();
    }
    // sparkles (front)
    const rt = (t - T.flashHold) / 1000;
    if (rt > 0) {
      f.save(); f.translate(cx, cy); f.globalCompositeOperation = 'lighter';
      for (const p of timeline.particles) {
        const age = rt - p.delay;
        if (age < 0 || age > p.life) continue;
        const k = age / p.life, dist = unit * p.sp * (1 - Math.pow(1 - Math.min(1, age / 1.1), 2.2)) * 0.62 + unit * 0.12 * Math.min(1, age * 3) * Math.sign(p.sp);
        const x = Math.cos(p.a) * dist, y = Math.sin(p.a) * dist + unit * 0.14 * age * age;
        const al = Math.pow(1 - k, 1.3) * (0.6 + 0.4 * Math.sin(age * 30 + p.rot * 5));
        if (p.star) drawStar(f, x, y, p.size * (1 + (1 - k)), p.rot + age * 2, Math.max(0, al), p.color);
        else { f.globalAlpha = Math.max(0, al); f.fillStyle = p.color; f.beginPath(); f.arc(x, y, p.size * 0.55, 0, Math.PI * 2); f.fill(); }
      }
      const tw = clamp01((rt - 0.35) / 0.5);
      if (tw > 0) for (const q of timeline.twinkles) {
        const ph = ((rt / q.period) + q.phase) % 1, al = Math.sin(ph * Math.PI);
        drawStar(f, Math.cos(q.a) * unit * q.rad, Math.sin(q.a) * unit * q.rad * 1.1, q.size * (0.5 + al), q.phase * 6 + rt, al * 0.9 * tw, q.color);
      }
      f.restore();
    }
  }

  function setCamera(k, yaw, pitch) {
    const { THREE } = lib;
    const off = fwd.clone().multiplyScalar(-homeDistance * k);
    if (yaw || pitch) {
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), fwd).normalize();
      off.applyAxisAngle(side, pitch);
    }
    camera.position.copy(homeTarget).add(off);
    camera.lookAt(homeTarget);
  }

  // Renders the frame for absolute timeline time t.
  function renderAt(t) {
    if (!renderer || !timeline) return;
    tNow = t;
    const { THREE } = lib;
    if (reduced) return renderReduced(t);
    const charge = clamp01((t - T.intro) / (T.chargeEnd - T.intro));
    // state
    let idx = -1;
    const sch = timeline.schedule;
    for (let i = 0; i < sch.length; i++) { if (sch[i].t <= t) idx = i; else break; }
    if (idx !== lastStateIdx) { applyState(stateAt(idx)); lastStateIdx = idx; }
    const real = t >= T.flashPeak;
    setReal(real);
    // camera
    let k, yaw = 0, pitch = 0, exposure = lightExposure;
    if (t < T.flashPeak) {
      const push = easeInOut(clamp01((t - 150) / (T.chargeEnd - 150)));
      k = kFit * mix(1.6, 0.97, push);
      const amp = 0.012 + charge * 0.01;
      yaw = Math.sin(t * 0.0016) * amp; pitch = Math.sin(t * 0.0011 + 1) * amp * 0.5;
      // per-swap pop
      if (idx >= 0 && t >= T.intro) { const since = (t - sch[idx].t) / 1000; k *= 1 - 0.012 * Math.exp(-since * 14) * (0.4 + charge); }
      // silhouette pulse
      const omega = mix(0.004, 0.03, charge * charge);
      const pulse = 0.5 + 0.5 * Math.sin(t * omega);
      const c = [0, 1, 2].map((i) => mix(CREAM[i], COBALT_WHITE[i], pulse * mix(0.25, 0.85, charge)));
      silhouetteMat.color.setRGB(c[0] / 255, c[1] / 255, c[2] / 255, THREE.SRGBColorSpace);
    } else {
      const rt = (t - T.flashPeak) / 1000;
      const bounce = Math.exp(-rt * 5) * Math.cos(rt * 11);
      k = kFit * (1 - 0.07 * bounce + 0.1 * Math.exp(-rt * 3.2));
      yaw = Math.sin(rt * 0.9) * 0.012; pitch = 0;
      exposure = lightExposure * (1 + 1.6 * Math.exp(-Math.max(0, rt - 0.15) * 3.2));
    }
    if (renderer.toneMappingExposure !== exposure) renderer.toneMappingExposure = exposure;
    setCamera(k, yaw, pitch);
    renderer.render(scene3, camera);
    drawFx(t);
    // dom layers
    const glow = t < T.flashPeak ? mix(0.55, 1, charge) : 1 - clamp01((t - T.flashHold) / 900) * 0.65;
    root.style.setProperty('--glow', glow.toFixed(3));
    root.style.setProperty('--glow-scale', (t < T.flashPeak ? mix(0.8, 1.4, charge) : mix(1.4, 1, easeOut(clamp01((t - T.flashHold) / 1200)))).toFixed(3));
    let flash = 0;
    if (t >= T.chargeEnd && t < T.flashPeak) flash = Math.pow(clamp01((t - T.chargeEnd) / (T.flashPeak - T.chargeEnd)), 1.6);
    else if (t >= T.flashPeak && t < T.flashHold) flash = 1;
    else if (t >= T.flashHold) flash = 1 - easeOut(clamp01((t - T.flashHold) / (T.flashEnd - T.flashHold)));
    flashEl.style.opacity = flash.toFixed(3);
    const phase = t < T.intro ? 'intro' : t < T.chargeEnd ? 'charge' : t < T.flashHold ? 'flash' : t < T.end ? 'reveal' : 'done';
    if (root.dataset.phase !== phase) setPhase(phase);
  }

  function setPhase(phase) {
    root.dataset.phase = phase;
    if (phase === 'reveal' || phase === 'done') showResult();
  }

  let resultShown = false;
  function showResult() {
    if (resultShown) return;
    resultShown = true;
    const names = sceneJson.slotOrder.filter((s) => finalTraits[s]).map((s) => traitIndex[s][finalTraits[s]].name.replace(/['’]+$/,'').toLowerCase());
    traitsEl.textContent = names.join(' · ') || 'bare and ready';
    titleEl.removeAttribute('aria-hidden'); traitsEl.removeAttribute('aria-hidden');
    root.classList.add('mr-done');
    announce('Meet your mole: ' + (names.join(', ') || 'bare and ready') + '.');
    actionBtns.forEach((b) => { b.disabled = false; });
  }

  // reduced motion: silhouette, then a fade to the final mole
  function renderReduced(t) {
    const { THREE } = lib;
    if (lastStateIdx !== 0) {
      lastStateIdx = 0; applyState({}); setReal(false);
      silhouetteMat.color.set('#05070c');
    }
    const showFinal = t >= 500;
    if (showFinal && !isReal) {
      applyState(finalTraits); setReal(true);
      renderer.toneMappingExposure = lightExposure;
      setCamera(kFit, 0, 0);
      renderer.domElement.style.transition = 'none';
      renderer.domElement.style.opacity = '0';
      renderer.render(scene3, camera);
      void renderer.domElement.offsetWidth;
      renderer.domElement.style.transition = 'opacity .45s ease';
      renderer.domElement.style.opacity = '1';
      setPhase('reveal');
      return;
    }
    if (!showFinal) { setCamera(kFit, 0, 0); renderer.render(scene3, camera); }
    else if (isReal) { setCamera(kFit, 0, 0); renderer.render(scene3, camera); }
    root.style.setProperty('--glow', '0.7'); root.style.setProperty('--glow-scale', '1');
    drawFx(t);
  }

  // ---- loop
  function frame(ts) {
    rafId = 0;
    if (closed || !running) return;
    if (!document.hidden) {
      const dt = Math.min(100, ts - lastTs);
      lastTs = ts;
      if (!paused && !frozen) {
        tNow += dt;
        if (reduced && tNow > 1100) { renderAt(tNow); running = false; return; }
        if (tNow >= T.end + 60000) tNow = T.end + 60000;
        renderAt(tNow);
        // keep the reveal alive (twinkles, sway) after the end
      }
    } else { lastTs = ts; }
    rafId = raf(frame);
  }
  function startLoop() { if (running) return; running = true; lastTs = performance.now(); rafId = raf(frame); }
  const onVis = () => { lastTs = performance.now(); };
  document.addEventListener('visibilitychange', onVis);

  // ---- actions
  async function begin(firstTime) {
    // pick the final roll up front; load it first
    finalTraits = rollTraits(sceneJson);
    announce('Rolling your mole.');
    root.classList.remove('mr-done'); resultShown = false;
    actionBtns.forEach((b) => { b.disabled = true; });
    traitsEl.innerHTML = '&nbsp;'; titleEl.setAttribute('aria-hidden', 'true'); traitsEl.setAttribute('aria-hidden', 'true');
    root.dataset.phase = 'load';
    flashEl.style.opacity = '0';
    P.traits = 0;
    // clear previous state
    equipped.forEach((o) => outfitGroup.remove(o)); equipped.clear();
    lastStateIdx = -2; isReal = true; setReal(false);
    renderer.domElement.style.opacity = '1'; renderer.domElement.style.transition = 'none';
    // pool: final traits first, then random extras per slot
    const r = mulberry(Math.floor(rng() * 4294967296));
    poolBySlot = {};
    const finalIds = Object.entries(finalTraits);
    for (const slot of sceneJson.slotOrder) {
      const all = (sceneJson.slots[slot] || []).map((t) => t.id);
      const n = Math.min(all.length, POOL_SIZE[slot] || 1);
      const chosen = new Set(shuffle(all, r).slice(0, n));
      poolBySlot[slot] = [...chosen];
    }
    // loading screen: always on the first roll; on a re-roll only when a model still has to be fetched
    const need = new Map(finalIds.map(([slot, id]) => [id, slot]));
    for (const slot of Object.keys(poolBySlot)) for (const id of poolBySlot[slot]) need.set(id, slot);
    const missing = [...need.keys()].filter((id) => !cache.has(id)).length;
    if (!firstTime) { rerollOnly = true; if (missing) loader.reset(); }
    const total = Math.max(1, need.size); let got = need.size - missing;
    setP('traits', got / total);
    const counted = (pr) => pr.finally(() => { got++; setP('traits', got / total * 0.98); });
    const finals = new Set(finalIds.map(([, id]) => id));
    await Promise.all(finalIds.map(([slot, id]) => cache.has(id) ? null : counted(getTrait(slot, id))));
    const poolLoads = [];
    for (const [id, slot] of need) if (!finals.has(id) && !cache.has(id)) poolLoads.push(counted(getTrait(slot, id).catch(() => null)));
    await Promise.all(poolLoads);
    for (const slot of Object.keys(poolBySlot)) poolBySlot[slot] = poolBySlot[slot].filter((id) => cache.has(id));
    if (closed) return;
    buildTimeline();
    loadingEl.classList.add('mr-hide');
    if (!loader.el.hidden) { await loader.finish(); if (!closed) closeBtn.focus({ preventScroll: true }); }
    if (closed) return;
    renderer.domElement.style.transition = '';
    tNow = 0; lastStateIdx = -2;
    renderAt(0);
    if (firstTime && !opts.manual) {
      // v2.2: the first roll waits for the user. The silhouette rests, a big green button starts the roll.
      root.dataset.phase = 'wait';
      rollBtn.tabIndex = 0;
      announce('Your mole is ready. Press roll your mole.');
      rollBtn.focus({ preventScroll: true });
      return;
    }
    root.dataset.phase = 'intro';
    if (!opts.manual) startLoop();
  }
  function startRoll() {
    if (root.dataset.phase !== 'wait' || closed) return;
    rollBtn.tabIndex = -1;
    root.dataset.phase = 'intro';
    announce('Rolling your mole.');
    tNow = 0; lastStateIdx = -2;
    startLoop();
    if (!skipBtn.hidden) skipBtn.focus({ preventScroll: true });
  }
  let poolBySlot = {};

  function skip() { if (!timeline) return; const had = document.activeElement === skipBtn; tNow = reduced ? 1100 : T.end; frozen = false; renderAt(tNow); if (!running) startLoop(); if (had) (actionBtns[0].disabled ? closeBtn : actionBtns[0]).focus({ preventScroll: true }); }

  function downloadPNG() {
    const prev = renderer.getPixelRatio();
    try {
      renderer.setPixelRatio(1); renderer.setSize(1024, 1024, false);
      renderer.toneMappingExposure = lightExposure;
      setCamera(kFit, 0, 0);
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene3, camera);
      const url = renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url; a.download = 'my-deepspot-mole.png';
      document.body.append(a); a.click(); a.remove();
    } catch (e) { console.error(e); }
    renderer.setPixelRatio(prev); resize(); renderAt(tNow);
  }

  function snapshotAvatar() {
    const size = 512;
    const prev = renderer.getPixelRatio();
    renderer.setPixelRatio(1); renderer.setSize(size, size, false);
    renderer.toneMappingExposure = lightExposure;
    setCamera(kFit * 0.8, 0, 0);
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene3, camera);
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    const bg = g.createRadialGradient(size / 2, size * 0.45, size * 0.05, size / 2, size / 2, size * 0.75);
    bg.addColorStop(0, '#a7e0e0'); bg.addColorStop(1, '#83cdce');
    g.fillStyle = bg; g.fillRect(0, 0, size, size);
    g.drawImage(renderer.domElement, 0, 0, size, size);
    let url = c.toDataURL('image/webp', 0.92);
    if (!/^data:image\/webp/.test(url)) url = c.toDataURL('image/png');
    renderer.setPixelRatio(prev); resize(); renderAt(tNow);
    return url;
  }

  function keep() {
    const traits = {};
    for (const s of sceneJson.slotOrder) if (finalTraits[s]) traits[s] = finalTraits[s];
    const png = snapshotAvatar();
    result = { traits, png, rolledAt: Date.now() };
    const names = sceneJson.slotOrder.filter((s) => traits[s]).map((s) => traitIndex[s][traits[s]].name.replace(/['’]+$/,''));
    result.names = names;
    close(result);
  }

  async function again() {
    actionBtns.forEach((b) => { b.disabled = true; });
    running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0;
    await begin(false);
  }

  actionBtns.forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.act;
    if (a === 'keep') keep(); else if (a === 'again') again(); else if (a === 'download') downloadPNG();
  }));
  closeBtn.addEventListener('click', () => close(null));
  skipBtn.addEventListener('click', skip);
  rollBtn.addEventListener('click', startRoll);

  // focus trap + esc
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(null); return; }
    if (e.key !== 'Tab') return;
    const f = [...root.querySelectorAll(loader.el.hidden ? 'button:not(.mrl-x)' : '.mrl-x')].filter((b) => !b.disabled && b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden');
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', onKey, true);

  function close(value) {
    if (closed) return;
    closed = true; running = false;
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('resize', onResize);
    try {
      cache.forEach((o) => o.traverse((m) => {
        if (!m.isMesh) return;
        m.geometry?.dispose();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => { if (!mat) return; for (const k in mat) { const v = mat[k]; if (v && v.isTexture) v.dispose(); } mat.dispose(); });
      }));
      baseRoot?.traverse((m) => { if (m.isMesh) { m.geometry?.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => mat && mat.dispose()); } });
      envTex?.dispose(); silhouetteMat?.dispose(); sun?.shadow?.map?.dispose();
      renderer?.dispose(); renderer?.forceContextLoss();
    } catch (e) { console.warn(e); }
    cache.clear();
    loader.remove();
    root.classList.remove('mr-in');
    inerted.forEach((el) => el.removeAttribute('inert'));
    document.documentElement.style.overflow = prevOverflow;
    setTimeout(() => root.remove(), 250);
    if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    if (window.__moleReveal && window.__moleReveal.run === run) delete window.__moleReveal;
    active = null;
    resolveResult(value);
  }
  run.close = close;

  // ---- boot
  try {
    lib = await loadLibs(() => setP('libs', P.libs + 0.25));
    setP('libs', 1);
    if (closed) return promise;
    sceneJson = await fetch(new URL('scene.json?v=rules1', ASSETS)).then((r) => r.json());
    setP('scene', 1);
    sceneJson.slotOrder.forEach((slot) => { traitIndex[slot] = {}; (sceneJson.slots[slot] || []).forEach((t) => { traitIndex[slot][t.id] = t; }); });
    initThree();
    const { GLTFLoader, DRACOLoader } = lib;
    const draco = new DRACOLoader(); draco.setDecoderPath(DRACO_PATH);
    gltfLoader = new GLTFLoader(); gltfLoader.setDRACOLoader(draco);
    resize();
    const [base] = await Promise.all([loadGLB(new URL(sceneJson.base.file, ASSETS).href, undefined, fileProg('base')), loadEnv()]);
    setP('base', 1);
    if (closed) return promise;
    baseRoot = base; scene3.add(base);
    frameModel(lib.THREE);
    resize();
    setReal(false);
    // show the bare silhouette while the pool loads
    setCamera(kFit * 1.6, 0, 0);
    silhouetteMat.color.set('#05070c');
    renderer.render(scene3, camera);
    root.style.setProperty('--glow', '0.55');
    await begin(true);
    if (window.location.search.includes('moledebug')) {
      window.__moleReveal = {
        run, T, timeline: () => timeline, finalTraits: () => finalTraits,
        seek(ms) { frozen = true; paused = true; renderAt(ms); return ms; },
        resume() { frozen = false; paused = false; lastTs = performance.now(); startLoop(); },
        time: () => tNow
      };
    }
  } catch (e) {
    console.error('mole reveal failed', e);
    loader.remove();
    loadingEl.textContent = 'the mole is asleep. try again in a moment.';
    loadingEl.classList.remove('mr-hide');
    closeBtn.focus({ preventScroll: true });
    skipBtn.hidden = true;
  }
  return promise;
}
