(() => {
  const panels = [
    { label: 'discoveries', kind: 'disc', theme: 'paper', title: 'a pile of rubble.<br>a spy station.<br>a gallery.', description: 'Berlin’s Teufelsberg is a man-made hill of war rubble, topped by a Cold War listening station that is now a sprawling street-art canvas.', image: '/spots/teufelsberg.jpg', alt: 'White radar domes of the Teufelsberg listening station rising above walls covered in graffiti murals', place: 'Teufelsberg, Berlin', publisher: 'Johan SWE', href: '/blog/berlin-s-hill-of-nazi-rubble-cold-war-spies-and-graffiti' },
    { label: 'community', kind: 'comm', theme: 'aqua', title: 'your profile<br>is a passport.', description: 'pick your traveler type, roll your mole, sign your mark and choose a foil.' },
    { label: 'featured spot', kind: 'feat', theme: 'blue', title: 'looks like art.<br>burns your trash.', description: 'Golden domes, candy-colored towers, and a very unexpected day job. Meet Osaka’s working garbage palace.', image: '/spots/maishima.jpg', alt: 'The colorful towers of Maishima Incineration Plant', place: 'Maishima, Osaka', href: '/blog/osaka-s-candy-colored-garbage-palace' }
  ];
  const arrow = direction => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="${direction === 'left' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;

  class DeepSpotNews extends HTMLElement {
    async connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      this.profiles = await import('/profile/identity.mjs?v=744e89b9');
      this.core = await import('/site/core.mjs?v=65b48136');
      this.passports = await this.loadPassports();
      this.style.setProperty('--wn-count', panels.length);
      const {imgAttrs} = await import('/site/img.mjs?v=61371a3b');
      this.active = 0;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
      this.paused = this.reduced.matches;
      this.innerHTML = `<section class="wn-section" aria-labelledby="wn-heading" aria-roledescription="carousel">
        <div class="wn-header"><h2 id="wn-heading"><button type="button" class="wn-intro-tab" aria-label="what’s new?" aria-expanded="false" aria-controls="wn-features"><span class="wn-intro-title" aria-hidden="true">what’s <br>new?</span><span class="wn-intro-label" aria-hidden="true">what’s new?</span><span class="wn-intro-arrow" aria-hidden="true">↗</span></button></h2></div>
        <div class="wn-window" id="wn-features" tabindex="-1">${panels.map((panel, i) => `<div class="wn-panel wn-${panel.theme}" data-news-panel="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${panels.length}: ${panel.label}">
          <button type="button" class="wn-rail" data-news-open="${i}" aria-label="Show ${panel.label}" aria-expanded="false" aria-controls="wn-content-${i}"><span>${panel.label}</span><span class="wn-rail-arrow" aria-hidden="true">↗</span></button>
          <div class="wn-content wn-k-${panel.kind}" id="wn-content-${i}">${panel.kind === 'comm' ? this.communityHTML(panel) : this.panelHTML(panel, imgAttrs)}
          </div>
        </div>`).join('')}</div>
        <div class="wn-mobile-tabs" aria-label="Featured categories">${panels.map((panel,i)=>`<button type="button" class="wn-${panel.theme}" data-news-open="${i}" aria-pressed="${i===0}">${panel.label}</button>`).join('')}</div>
        <div class="wn-controls">
          <button type="button" data-news-prev aria-label="Previous feature">${arrow('left')}</button>
          <button type="button" data-news-pause aria-label="Pause features"></button>
          <button type="button" data-news-next aria-label="Next feature">${arrow('right')}</button>
        </div>
        <span class="wn-sr" role="status" aria-live="polite"></span>
      </section>`;
      this.viewport = this.querySelector('.wn-window');
      this.section = this.querySelector('.wn-section');
      this.introTab = this.querySelector('.wn-intro-tab');
      this.mobile = matchMedia('(max-width:650px)');
      this.mobileHandler = () => { if (this.mobile.matches) this.expand(); };
      this.mobile.addEventListener('change', this.mobileHandler);
      this.mobileHandler();
      this.panels = [...this.querySelectorAll('.wn-panel')];
      this.fitFans();
      if ('ResizeObserver' in window) { this.sizer = new ResizeObserver(() => this.fitFans()); this.sizer.observe(this.viewport); }
      this.render(false);
      this.pauseLabel();
      this.addEventListener('click', event => {
        if (event.target.closest('.wn-intro-tab')) this.expand();
        const rail = event.target.closest('[data-news-open]');
        if (rail) this.select(Number(rail.dataset.newsOpen), true);
        if (event.target.closest('[data-news-next]')) this.select((this.active + 1) % panels.length, true);
        if (event.target.closest('[data-news-prev]')) this.select((this.active + panels.length - 1) % panels.length, true);
        if (event.target.closest('[data-news-pause]')) { this.paused = !this.paused; this.pauseLabel(); this.schedule(); }
      });
      this.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        this.select((this.active + (event.key === 'ArrowRight' ? 1 : panels.length - 1)) % panels.length, true);
      });
      this.wireSwipe();
      this.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { this.hovering = true; this.schedule(); } });
      this.addEventListener('pointerleave', () => { this.hovering = false; this.schedule(); });
      this.section.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') this.expand(); });
      this.addEventListener('focusin', event => { this.focused = true; if (event.target !== this.introTab) this.expand(); this.schedule(); });
      this.addEventListener('focusout', event => { if (!this.contains(event.relatedTarget)) { this.focused = false; this.schedule(); } });
      this.visibilityHandler = () => this.schedule();
      document.addEventListener('visibilitychange', this.visibilityHandler);
      this.motionHandler = () => { if (this.reduced.matches) this.paused = true; this.pauseLabel(); this.schedule(); };
      this.reduced.addEventListener('change', this.motionHandler);
      this.observer = new IntersectionObserver(entries => { this.visible = entries[0].isIntersecting; this.schedule(); }, { threshold: .2 });
      this.observer.observe(this);
    }

    panelHTML(panel, imgAttrs) {
      const feat = panel.kind === 'feat';
      const credit = panel.publisher ? '<span class="wn-sep"> · </span>' + this.profiles.authorLink(panel.publisher, {from: location.pathname + location.search + '#wn-heading'}) : '';
      // discoveries: the full 1600px original (the 800px card variant is too soft at this size). featured: card variants.
      const attrs = panel.kind === 'disc' ? ` src="${panel.image}" width="1600" height="1200"` : imgAttrs(panel.image, '(max-width:700px) 100vw, 740px');
      const photo = `<figure class="wn-photo" style="--wn-bg:url('${panel.image}')"><div class="wn-img"><img${attrs} alt="${panel.alt}" loading="lazy" decoding="async"></div>${feat ? '' : `<figcaption>${panel.place}${credit}</figcaption>`}</figure>`;
      const more = `<a class="wn-readmore" href="https://www.deepspot.io${panel.href}" target="_blank" rel="noopener">read more ${arrow('right')}</a>`;
      const copy = `<div class="wn-copy">${feat ? '<span class="wn-chip">featured spot</span>' : ''}<h3>${panel.title}</h3><p>${panel.description}</p>${feat ? `<p class="wn-place">${panel.place}</p>` : ''}${more}</div>`;
      return photo + copy;
    }

    // Community panel: a fanned stack of real passports (same models and card as the community page "participants" deck).
    async loadPassports() {
      try {
        const base = document.head;
        for (const href of ['/profile/profile.css?v=44525062', '/site/passport-mini.css?v=200d68a0']) {
          if (!document.querySelector(`link[href^="${href.split('?')[0]}"]`)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; base.append(l); }
        }
        const [mini, data] = await Promise.all([import('/site/passport-mini.mjs?v=f7927419'), this.core.loadData()]);
        const monthly = data.content.leaderboard.monthly.slice().sort((a, b) => b.points - a.points);
        const models = mini.passportModels(data, monthly).filter(m => m.mole);
        const foil = m => (m.rank === 1 ? 'gold' : m.rank && m.rank <= 3 ? 'chrome' : 'holo');
        const gold = models.filter(m => foil(m) === 'gold'), chrome = models.filter(m => foil(m) === 'chrome'), holo = models.filter(m => foil(m) === 'holo');
        // back to front: holo, chrome, chrome, then the gold card on top. Missing foils are skipped, extra holo cards fill in.
        let pick = [holo[0], chrome[1], chrome[0], gold[0]].filter(Boolean);
        for (const m of [...holo.slice(1), ...chrome, ...gold]) { if (pick.length >= 4) break; if (!pick.includes(m)) pick.unshift(m); }
        const rots = pick.length > 3 ? [-8, -3, 4, 0] : pick.length === 3 ? [-6, 3, 0] : pick.map((_, i, a) => (i === a.length - 1 ? 0 : -4));
        return pick.map((m, j) => ({m, j, rot: rots[j] ?? 0, html: mini.passportFace(m, 'wn' + j)}));
      } catch { return []; }
    }

    communityHTML(panel) {
      const {esc, localURL} = this.core;
      const cards = this.passports || [];
      const n = cards.length;
      const fan = n ? `<div class="wn-fan pp-main" style="--n:${n}" role="group" aria-label="A stack of example DeepSpot passports">${cards.map(({m, j, rot, html}) => `<a class="wn-pc pm-link" href="${esc(m.href)}" aria-label="${esc(m.name)}’s passport" draggable="false" ${j === n - 1 ? '' : 'tabindex="-1"'} style="--j:${j};--rot:${rot}deg;--top:${j === n - 1 ? 1 : 0}">${html}</a>`).join('')}</div>` : '';
      const example = this.profiles.profileHref('wayfarer', {from: location.pathname + location.search});
      return `<div class="wn-copy"><span class="wn-chip wn-new">new</span><h3>${panel.title}</h3><p>${panel.description}</p><div class="wn-actions"><a class="wn-join" href="${esc(localURL('/welcome/'))}">make yours <span aria-hidden="true">↗</span></a><a class="wn-forum" href="${esc(example)}">see an example ↗</a></div></div>${fan}`;
    }

    fitFans() {
      this.querySelectorAll('.wn-fan').forEach(fan => {
        const fw = fan.clientWidth, fh = fan.clientHeight, n = Number(fan.style.getPropertyValue('--n')) || 1;
        if (!fw || !fh) return;
        const tight = fw < 420, k = n > 1 ? (tight ? .17 : .27) : 0;
        // card box 440 x 690, pivot at the bottom centre; the back card leans left (about 314 px at scale 1), the top card is straight.
        const base = ((n - 1) / 2) * k * 440, L = base + (n > 3 ? 314 : n === 3 ? 291 : 220), R = base + 220;
        const sh = (fh - (matchMedia('(max-width:800px)').matches ? 14 : 56)) / 690, sw = (fw - 16) / (L + R);
        const s = Math.max(.15, Math.min(sh, sw));
        fan.style.setProperty('--cs', s.toFixed(4));
        fan.style.setProperty('--sx', (((L - R) / 2) * s).toFixed(1) + 'px');
        fan.style.setProperty('--sp', (440 * s * k).toFixed(1) + 'px');
        fan.style.setProperty('--ph', (690 * s).toFixed(1) + 'px');
        fan.style.setProperty('--pw', (440 * s).toFixed(1) + 'px');
      });
    }

    expand() {
      if (this.section.classList.contains('wn-expanded')) return;
      this.section.classList.add('wn-expanded');
      this.introTab.setAttribute('aria-expanded', 'true');
      this.introTab.tabIndex = -1;
      if (document.activeElement === this.introTab) this.viewport.focus({ preventScroll: true });
      this.introTab.disabled = true;
    }

    render(animate = true, recycled = []) {
      this.panels.forEach((panel, i) => {
        const distance = (i - this.active + panels.length) % panels.length;
        const active = distance === 0;
        panel.classList.toggle('wn-active', active);
        panel.classList.toggle('wn-recycled', recycled.includes(i));
        panel.style.transitionDuration = animate && !this.reduced.matches ? '1000ms' : '0ms';
        panel.style.zIndex = String(distance + 1);
        panel.style.transform = active ? 'translate3d(0,0,0)' : `translate3d(calc(100% + ${distance - 1} * var(--wn-rail)),0,0)`;
        const rail = panel.querySelector('.wn-rail');
        rail.setAttribute('aria-expanded', String(active));
        rail.tabIndex = active ? -1 : 0;
        rail.inert = active;
        rail.setAttribute('aria-hidden', String(active));
        panel.querySelector('.wn-content').inert = !active;
        panel.querySelector('.wn-content').setAttribute('aria-hidden', String(!active));
      });
      this.dataset.active = panels[this.active].label;
      this.querySelectorAll('.wn-mobile-tabs button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===this.active)));
    }

    select(index, manual = false, swipe = false) {
      if (index === this.active || this.moving) return;
      const dur = swipe ? 440 : 1000;
      clearTimeout(this.timer);
      const previous = this.active;
      const steps = swipe ? 1 : (index - previous + panels.length) % panels.length;
      const recycled = [];
      this.departing = [];
      // Keep outgoing layers visible while their originals wrap OFFSCREEN.
      // Incoming rails then travel left from beyond the right edge, in step
      // with the existing rails. Nothing is inserted into a visible slot.
      if (!this.reduced.matches) {
        for (let distance = 0; distance < steps; distance++) {
          const panelIndex = (previous + distance) % panels.length;
          const panel = this.panels[panelIndex];
          const copy = panel.cloneNode(true);
          copy.classList.add('wn-departing');
          const track = panel.querySelector('.wn-track');
          if (track) { const t = copy.querySelector('.wn-track'); t.style.animation = 'none'; t.style.transform = getComputedStyle(track).transform; }
          copy.removeAttribute('data-news-panel');
          copy.setAttribute('aria-hidden', 'true');
          copy.inert = true;
          copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
          copy.style.zIndex = swipe ? '0' : String(panels.length + distance + 1);
          copy.style.transitionDuration = dur + 'ms';
          if (distance > 0) copy.style.clipPath = 'inset(0 calc(100% - var(--wn-rail)) 0 0)';
          this.viewport.append(copy);
          this.departing.push(copy);
          recycled.push(panelIndex);
          panel.classList.add('wn-recycled');
          panel.classList.remove('wn-active');
          panel.style.transitionDuration = '0ms';
          panel.style.transform = `translate3d(calc(100% + ${panels.length - 1 + distance} * var(--wn-rail)),0,0)`;
        }
        this.viewport.getBoundingClientRect();
      }
      this.active = index;
      this.moving = true;
      if (this.panels.some(panel => panel.contains(document.activeElement))) this.viewport.focus({ preventScroll: true });
      this.render(true, recycled);
      if (swipe) this.panels.forEach(panel => { panel.style.transitionDuration = dur + 'ms'; panel.style.transitionTimingFunction = 'cubic-bezier(.22,1,.36,1)'; });
      if (!swipe) this.departing.forEach((copy, distance) => {
        copy.style.transform = distance === 0
          ? `translate3d(calc(-100% - ${steps - 1} * var(--wn-rail)),0,0)`
          : `translate3d(calc(${distance - steps} * var(--wn-rail)),0,0)`;
      });
      if (manual) this.querySelector('[role=status]').textContent = panels[index].label;
      this.finishTimer = setTimeout(() => {
        this.moving = false;
        this.departing.forEach(copy => copy.remove());
        this.departing = [];
        this.render(false);
        this.panels.forEach(panel => { panel.style.transitionTimingFunction = ''; });
        this.schedule();
      }, this.reduced.matches ? 0 : dur + 20);
    }

    // Swipe (touch and pen): the next or previous panel follows the finger 1:1. Past 20 % of the width, or a quick flick
    // (> 0.4 px/ms), it settles with a spring. Anything less springs back. Vertical moves still scroll the page.
    wireSwipe() {
      const win = this.viewport;
      let st = null;
      const width = () => win.clientWidth || 1;
      const rest = () => { this.render(true); };
      const clearDrag = () => { if (st?.panel) { st.panel.style.transitionTimingFunction = ''; } };
      win.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' || event.isPrimary === false || event.button > 0) return;
        if (this.moving) return;
        st = { id: event.pointerId, x0: event.clientX, y0: event.clientY, dx: 0, locked: false, pts: [[event.timeStamp, event.clientX]], panel: null, dir: 0 };
      });
      win.addEventListener('pointermove', event => {
        if (!st || event.pointerId !== st.id) return;
        const dx = event.clientX - st.x0, dy = event.clientY - st.y0;
        if (!st.locked) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          if (Math.abs(dy) > Math.abs(dx)) { st = null; return; }
          st.locked = true; this.expand(); this.touching = true; clearTimeout(this.timer); this.suppressClick = true;
          try { win.setPointerCapture(event.pointerId); } catch {}
        }
        st.pts.push([event.timeStamp, event.clientX]); if (st.pts.length > 6) st.pts.shift();
        st.dx = dx;
        if (this.reduced.matches) return;
        const dir = dx < 0 ? 1 : -1, w = Math.min(Math.abs(dx), width());
        if (dir !== st.dir) {
          if (st.panel) { rest(); st.panel.style.transitionDuration = '0ms'; }
          st.dir = dir;
          const index = (this.active + dir + panels.length) % panels.length;
          st.panel = this.panels[index]; st.index = index;
        }
        const p = st.panel;
        p.style.transitionDuration = '0ms';
        if (dir === 1) { p.style.transform = `translate3d(calc(100% - ${w}px),0,0)`; }
        else { p.style.zIndex = String(panels.length + 4); p.style.transform = `translate3d(calc(-100% + ${w}px),0,0)`; }
        event.preventDefault();
      });
      const end = event => {
        if (!st || event.pointerId !== st.id) return;
        const s = st; st = null;
        if (!s.locked) return;
        this.touching = false; this.resumeAt = performance.now() + 6000;
        setTimeout(() => { this.suppressClick = false; }, 60);
        const a = s.pts[0], b = s.pts[s.pts.length - 1], v = b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;
        const dir = s.dx < 0 ? 1 : -1;
        const go = event.type === 'pointerup' && (Math.abs(s.dx) > width() * .2 || (Math.abs(v) > .4 && Math.sign(v) === Math.sign(s.dx)));
        if (go) {
          if (this.reduced.matches) this.select((this.active + dir + panels.length) % panels.length, true);
          else this.select(s.index ?? (this.active + dir + panels.length) % panels.length, true, true);
        } else if (s.panel) {
          rest();
          s.panel.style.transitionDuration = '320ms'; s.panel.style.transitionTimingFunction = 'cubic-bezier(.22,1,.36,1)';
          setTimeout(() => { if (!this.moving) { this.render(false); s.panel.style.transitionTimingFunction = ''; } }, 340);
        }
        this.schedule();
      };
      win.addEventListener('pointerup', end);
      win.addEventListener('pointercancel', end);
      win.addEventListener('click', event => { if (this.suppressClick) { event.preventDefault(); event.stopPropagation(); } }, true);
    }

    pauseLabel() {
      const button = this.querySelector('[data-news-pause]');
      this.toggleAttribute('data-paused', this.paused);
      button.setAttribute('aria-label', this.paused ? 'Play features' : 'Pause features');
      button.innerHTML = this.paused ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m9 6 10 6-10 6Z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-width="1.5" d="M9 6v12M15 6v12"/></svg>';
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.visible || this.paused || this.hovering || this.focused || this.moving || this.touching || document.hidden) return;
      const wait = (this.resumeAt || 0) - performance.now();
      if (wait > 0) { this.timer = setTimeout(() => this.schedule(), wait + 30); return; }
      this.timer = setTimeout(() => this.select((this.active + 1) % panels.length), 6500);
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
      clearTimeout(this.finishTimer);
      this.departing?.forEach(copy => copy.remove());
      this.observer?.disconnect();
      this.sizer?.disconnect();
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.reduced?.removeEventListener('change', this.motionHandler);
      this.mobile?.removeEventListener('change', this.mobileHandler);
      this.ready = false;
    }
  }
  customElements.define('deepspot-news', DeepSpotNews);
})();
