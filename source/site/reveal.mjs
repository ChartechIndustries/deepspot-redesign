/* Scroll fade-in, every page (2026-10-23, REVEAL-SPEC.md). Loaded by site/navigation.js.
   Blocks get class "rv" (opacity 0, 18px down) from JS only. When 12 % of a block is in view it plays one Web Animation
   (opacity + translate, 700 ms, ease .2/.7/.2/1) and the class goes away, so nothing is left on the element afterwards.
   QA hooks: ?reveal=off turns it off; window.__dsReveal.hidden = blocks still hidden. */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
if (!REDUCED.matches && !/[?&]reveal=off\b/.test(location.search) && !window.__dsReveal) boot();

function boot() {
  const DUR = 700, EASE = 'cubic-bezier(.2,.7,.2,1)', STEP = 70, MAXSTEP = 5, RISE = '0 18px', FALLBACK = 2500;
  /* never reveal: chrome, overlays, and things that have their own entrance (deck .pm, community hero .gv, onboarding,
     passport field, tours stage, home hero / globe) */
  const SKIP = 'script,style,template,noscript,header,ds-site-header,.header,.br-header,.ticker,.br-ticker,nav,.skip-link,' +
    'dialog,[role=dialog],[aria-modal=true],.br-toast,.ds-toast,.sr-only,.cv-sr,.hero,.globe-stage,.variant-switch,' +
    '.pm,.gv,div:has(> section.gv),.pp-field,.pp-toolbar,.pp-vtabs,.tr-stage,.ob-stage,.ob-layer,.ob-sheet,' +
    '[data-no-reveal],[hidden],.ds-home-navigation,.ds-cookie-dialog';
  const ALWAYS = 'deepspot-cta,#passport,.pp-book,.pp-rec,.cv';   /* wrappers: never a block themselves */
  const state = new WeakMap();      /* skip | desc | block | done */
  const keys = new WeakMap(), roots = new WeakMap(), timers = new WeakMap(), born = new WeakMap();
  const shown = new Set();          /* keys of blocks already revealed: a re-render of the same content does not fade again */
  const hidden = new Set();
  const ios = new Map();
  const root = document.documentElement;
  const paneOf = el => (root.classList.contains('pp-app') ? el.closest('.pp-rec') : null);
  const heightOf = pane => (pane ? pane.clientHeight : innerHeight) || innerHeight;

  function io(pane) {
    let o = ios.get(pane || 0);
    if (!o) {
      o = new IntersectionObserver(onIO, { root: pane || null, rootMargin: '0px 0px -8% 0px', threshold: [0, 0.12] });
      ios.set(pane || 0, o);
    }
    return o;
  }

  function keyOf(el) {
    const cn = typeof el.className === 'string' ? el.className.replace(/\brv\S*/g, '').trim() : '';
    return el.tagName + '.' + cn + '|' + (el.textContent || '').slice(0, 120);
  }

  /* ---- finding blocks ---- */
  function walk(parent, depth) {
    for (const c of parent.children) {
      const s = state.get(c);
      if (s === 'desc') walk(c, depth + 1);
      else if (!s) consider(c, depth);
    }
  }

  function consider(c, depth) {
    if (c.matches(SKIP)) { state.set(c, 'skip'); return; }
    const cs = getComputedStyle(c);
    if (cs.display === 'none' || cs.display === 'inline') return;
    if (cs.display === 'contents') { walk(c, depth); return; }
    if (cs.position === 'fixed' || cs.position === 'absolute' || cs.position === 'sticky') { state.set(c, 'skip'); return; }
    const h = c.offsetHeight;
    if (h < 24) return;                       /* empty or loading: look again later */
    const pane = paneOf(c), vh = heightOf(pane);
    const kids = [...c.children].filter(k => !/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(k.tagName));
    const group = kids.length >= 4 && h > vh * 0.8 &&
      (cs.display === 'grid' || (cs.display === 'flex' && cs.flexWrap !== 'nowrap')) &&
      kids.every(k => k.tagName === kids[0].tagName);
    if (depth < 5 && kids.length && (c.matches(ALWAYS) || h > vh * 1.6 || group)) {
      state.set(c, 'desc');
      walk(c, depth + 1);
      return;
    }
    register(c, pane);
  }

  function register(c, pane) {
    state.set(c, 'block');
    const k = keyOf(c);
    if (shown.has(k) || (c.contains(document.activeElement) && document.activeElement !== document.body)) { state.set(c, 'done'); return; }
    keys.set(c, k);
    c.classList.add('rv');
    if (!pane && c.getBoundingClientRect().bottom + scrollY >= root.scrollHeight - 30) c.classList.add('rv-flat');
    roots.set(c, pane);
    born.set(c, performance.now());
    hidden.add(c);
    io(pane).observe(c);
  }

  function scan() {
    const list = [document.querySelector('main'), ...document.querySelectorAll('body > deepspot-cta')];
    for (const r of list) if (r) walk(r, 0);
  }

  /* ---- showing ---- */
  function reveal(el, delay, instant) {
    if (!hidden.delete(el)) return;
    clearTimeout(timers.get(el));
    io(roots.get(el)).unobserve(el);
    const flat = el.classList.contains('rv-flat');
    el.classList.remove('rv', 'rv-flat');
    state.set(el, 'done');
    shown.add(keys.get(el));
    if (instant || REDUCED.matches) return;
    try {
      el.classList.add('rv-run');
      const a = el.animate([{ opacity: 0, translate: flat ? '0 0' : RISE }], { duration: DUR, delay, easing: EASE, fill: 'backwards' });
      const end = () => el.classList.remove('rv-run');
      a.onfinish = end; a.oncancel = end;
    } catch (e) { el.classList.remove('rv-run'); }
  }

  /* the last 8 % of a screen is outside the trigger zone: at the end of a scroll area, show what is on screen */
  let edgeFrame = 0;
  function edge() {
    edgeFrame = 0;
    for (const el of [...hidden]) {
      if (!el.isConnected) { hidden.delete(el); continue; }
      const pane = roots.get(el), r = el.getBoundingClientRect();
      const box = pane ? pane.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      const sc = pane || root;
      const atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 3;
      if (!el.offsetHeight) reveal(el, 0, true);                       /* display:none now */
      else if (r.bottom <= box.top + 1) reveal(el, 0, true);           /* jumped past without a crossing */
      else if (atEnd && r.top < box.bottom - 4) reveal(el, 0, false);
    }
  }
  const onScroll = () => { if (!edgeFrame) edgeFrame = requestAnimationFrame(edge); };
  addEventListener('scroll', onScroll, { passive: true, capture: true });

  function revealAll() { for (const el of [...hidden]) reveal(el, 0, true); }

  /* safety net: a block that is on screen (or above it) and still hidden after a moment is shown, whatever the observer did */
  setInterval(() => {
    if (!hidden.size) return;
    const now = performance.now();
    for (const el of [...hidden]) {
      if (!el.isConnected) { hidden.delete(el); continue; }
      if (now - (born.get(el) || 0) < 1200) continue;
      const pane = roots.get(el), r = el.getBoundingClientRect(), bottom = pane ? pane.getBoundingClientRect().bottom : innerHeight;
      if (r.top < bottom) reveal(el, 0, false);
    }
  }, 1000);

  function onIO(entries) {
    const go = [];
    for (const e of entries) {
      const el = e.target;
      if (!hidden.has(el)) continue;
      if (!el.isConnected) { hidden.delete(el); continue; }
      const rb = e.rootBounds, rh = rb ? rb.height : innerHeight;
      if (e.isIntersecting) {
        if (!timers.has(el)) timers.set(el, setTimeout(() => reveal(el, 0, true), FALLBACK));
        /* 12 % in view, or a block so tall that 12 % can never be in view */
        if (e.intersectionRatio >= 0.12 || e.boundingClientRect.height * 0.12 > rh * 0.9) go.push(el);
      } else if (rb && e.boundingClientRect.bottom <= rb.top + 1) {
        reveal(el, 0, true);                    /* already scrolled past (restore, anchor jump): no fade */
      }
    }
    go.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb2 = b.getBoundingClientRect();
      return (Math.abs(ra.top - rb2.top) < 8 ? ra.left - rb2.left : ra.top - rb2.top);
    });
    go.forEach((el, i) => reveal(el, Math.min(i, MAXSTEP) * STEP, false));
  }

  /* keyboard users never land in invisible content */
  document.addEventListener('focusin', e => {
    for (let n = e.target.closest ? e.target.closest('.rv') : null; n; n = n.parentElement && n.parentElement.closest('.rv')) reveal(n, 0, true);
  });

  /* late content: hide new blocks in the same task so they never paint visible first */
  function relevant(n) {
    for (let p = n.parentElement; p; p = p.parentElement) {
      const s = state.get(p);
      if (s === 'block' || s === 'skip' || s === 'done') return false;
      if (p.matches('main,deepspot-cta')) return true;
    }
    return n.matches('main,deepspot-cta') || !!n.querySelector('main,deepspot-cta');
  }
  const mo = new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1 && relevant(n)) { scan(); return; }
  });

  /* desktop profile switches between page scroll and the record pane scroll at 1100px: show everything then */
  let paneMode = root.classList.contains('pp-app');
  addEventListener('resize', () => {
    const now = root.classList.contains('pp-app');
    if (now !== paneMode) { paneMode = now; revealAll(); }
  });
  REDUCED.addEventListener && REDUCED.addEventListener('change', () => { if (REDUCED.matches) revealAll(); });

  /* home is server-rendered and hydrated by React: touch nothing until hydration is done */
  function hydrated() {
    const main = document.querySelector('body > main'), hero = main && main.querySelector(':scope > section.hero');
    if (!hero) return true;
    const has = el => Object.keys(el).some(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps') || k.startsWith('__reactContainer'));
    return has(hero) || has(main);
  }
  function start() {
    scan();
    mo.observe(document.body, { childList: true, subtree: true });
  }
  function begin() {
    let waited = 0;
    (function tick() {
      if (hydrated() || waited > 5000) return start();
      waited += 40; setTimeout(tick, 40);
    })();
  }
  window.__dsReveal = { hidden, revealAll, scan };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin, { once: true });
  else begin();
}
