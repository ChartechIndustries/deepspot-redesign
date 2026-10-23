(() => {
  const stories = [
    { label: 'discoveries', kind: 'disc', theme: 'paper', title: 'a pile of rubble.<br>a spy station.<br>a gallery.', description: 'Berlin’s Teufelsberg is a man-made hill of war rubble, topped by a Cold War listening station that is now a sprawling street-art canvas.', image: '/spots/teufelsberg.jpg', alt: 'White radar domes of the Teufelsberg listening station rising above walls covered in graffiti murals', place: 'Teufelsberg, Berlin', publisher: 'Johan SWE', href: '/blog/berlin-s-hill-of-nazi-rubble-cold-war-spies-and-graffiti' },
    { label: 'community', kind: 'comm', theme: 'aqua', title: 'your profile<br>is a passport.', description: 'pick your traveler type, roll your mole, sign your mark and choose a foil.' },
    { label: 'featured spot', kind: 'feat', theme: 'blue', title: 'looks like art.<br>burns your trash.', description: 'Golden domes, candy-colored towers, and a very unexpected day job. Meet Osaka’s working garbage palace.', image: '/spots/maishima.jpg', alt: 'The colorful towers of Maishima Incineration Plant', place: 'Maishima, Osaka', href: '/blog/osaka-s-candy-colored-garbage-palace' }
  ];
  const arrow = direction => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="${direction === 'left' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;

  class DeepSpotNews extends HTMLElement {
    async connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      this.profiles = await import('/profile/identity.mjs?v=38b679eb');
      this.core = await import('/site/core.mjs?v=149e30e7');
      this.passports = await this.loadPassports();
      this.style.setProperty('--wn-count', stories.length);
      const {imgAttrs} = await import('/site/img.mjs?v=61371a3b');
      this.active = 0;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
      this.paused = this.reduced.matches;
      this.innerHTML = `<section class="wn-section" aria-labelledby="wn-heading" aria-roledescription="carousel">
        <div class="wn-header"><h2 id="wn-heading"><button type="button" class="wn-intro-tab" aria-label="what’s new?" aria-expanded="false" aria-controls="wn-features"><span class="wn-intro-title" aria-hidden="true">what’s <br>new?</span><span class="wn-intro-label" aria-hidden="true">what’s new?</span><span class="wn-intro-arrow" aria-hidden="true">↗</span></button></h2></div>
        <div class="wn-window" id="wn-features" tabindex="-1">${stories.map((story, i) => `<div class="wn-panel wn-${story.theme}" data-news-panel="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${stories.length}: ${story.label}">
          <button type="button" class="wn-rail" data-news-open="${i}" aria-label="Show ${story.label}" aria-expanded="false" aria-controls="wn-content-${i}"><span>${story.label}</span><span class="wn-rail-arrow" aria-hidden="true">↗</span></button>
          <div class="wn-content wn-k-${story.kind}" id="wn-content-${i}">${story.kind === 'comm' ? this.communityHTML(story) : this.storyHTML(story, imgAttrs)}
          </div>
        </div>`).join('')}</div>
        <div class="wn-mobile-tabs" aria-label="Featured categories">${stories.map((story,i)=>`<button type="button" class="wn-${story.theme}" data-news-open="${i}" aria-pressed="${i===0}">${story.label}</button>`).join('')}</div>
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
        if (event.target.closest('[data-news-next]')) this.select((this.active + 1) % stories.length, true);
        if (event.target.closest('[data-news-prev]')) this.select((this.active + stories.length - 1) % stories.length, true);
        if (event.target.closest('[data-news-pause]')) { this.paused = !this.paused; this.pauseLabel(); this.schedule(); }
      });
      this.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        this.select((this.active + (event.key === 'ArrowRight' ? 1 : stories.length - 1)) % stories.length, true);
      });
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

    storyHTML(story, imgAttrs) {
      const feat = story.kind === 'feat';
      const credit = story.publisher ? '<span class="wn-sep"> · </span>' + this.profiles.authorLink(story.publisher, {from: location.pathname + location.search + '#wn-heading'}) : '';
      // discoveries: the full 1600px original (the 800px card variant is too soft at this size). featured: card variants.
      const attrs = story.kind === 'disc' ? ` src="${story.image}" width="1600" height="1200"` : imgAttrs(story.image, '(max-width:700px) 100vw, 740px');
      const photo = `<figure class="wn-photo" style="--wn-bg:url('${story.image}')"><div class="wn-img"><img${attrs} alt="${story.alt}" loading="lazy" decoding="async"></div>${feat ? '' : `<figcaption>${story.place}${credit}</figcaption>`}</figure>`;
      const more = `<a class="wn-readmore" href="https://www.deepspot.io${story.href}" target="_blank" rel="noopener">read more ${arrow('right')}</a>`;
      const copy = `<div class="wn-copy">${feat ? '<span class="wn-chip">featured spot</span>' : ''}<h3>${story.title}</h3><p>${story.description}</p>${feat ? `<p class="wn-place">${story.place}</p>` : ''}${more}</div>`;
      return photo + copy;
    }

    // Community panel: a fanned stack of real passports (same models and card as the community page "participants" deck).
    async loadPassports() {
      try {
        const base = document.head;
        for (const href of ['/profile/profile.css?v=797515c1', '/site/passport-mini.css?v=a0170d67']) {
          if (!document.querySelector(`link[href^="${href.split('?')[0]}"]`)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; base.append(l); }
        }
        const [mini, data] = await Promise.all([import('/site/passport-mini.mjs?v=96713545'), this.core.loadData()]);
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

    communityHTML(story) {
      const {esc, localURL} = this.core;
      const cards = this.passports || [];
      const n = cards.length;
      const fan = n ? `<div class="wn-fan pp-main" style="--n:${n}" role="group" aria-label="A stack of example DeepSpot passports">${cards.map(({m, j, rot, html}) => `<a class="wn-pc pm-link" href="${esc(m.href)}" aria-label="${esc(m.name)}’s passport" draggable="false" ${j === n - 1 ? '' : 'tabindex="-1"'} style="--j:${j};--rot:${rot}deg;--top:${j === n - 1 ? 1 : 0}">${html}</a>`).join('')}</div>` : '';
      const example = this.profiles.profileHref('wayfarer', {from: location.pathname + location.search});
      return `<div class="wn-copy"><span class="wn-chip wn-new">new</span><h3>${story.title}</h3><p>${story.description}</p><div class="wn-actions"><a class="wn-join" href="${esc(localURL('/welcome/'))}">make yours <span aria-hidden="true">↗</span></a><a class="wn-forum" href="${esc(example)}">see an example ↗</a></div></div>${fan}`;
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
        const distance = (i - this.active + stories.length) % stories.length;
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
      this.dataset.active = stories[this.active].label;
      this.querySelectorAll('.wn-mobile-tabs button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===this.active)));
    }

    select(index, manual = false) {
      if (index === this.active || this.moving) return;
      clearTimeout(this.timer);
      const previous = this.active;
      const steps = (index - previous + stories.length) % stories.length;
      const recycled = [];
      this.departing = [];
      // Keep outgoing layers visible while their originals wrap OFFSCREEN.
      // Incoming rails then travel left from beyond the right edge, in step
      // with the existing rails. Nothing is inserted into a visible slot.
      if (!this.reduced.matches) {
        for (let distance = 0; distance < steps; distance++) {
          const panelIndex = (previous + distance) % stories.length;
          const panel = this.panels[panelIndex];
          const copy = panel.cloneNode(true);
          copy.classList.add('wn-departing');
          const track = panel.querySelector('.wn-track');
          if (track) { const t = copy.querySelector('.wn-track'); t.style.animation = 'none'; t.style.transform = getComputedStyle(track).transform; }
          copy.removeAttribute('data-news-panel');
          copy.setAttribute('aria-hidden', 'true');
          copy.inert = true;
          copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
          copy.style.zIndex = String(stories.length + distance + 1);
          copy.style.transitionDuration = '1000ms';
          if (distance > 0) copy.style.clipPath = 'inset(0 calc(100% - var(--wn-rail)) 0 0)';
          this.viewport.append(copy);
          this.departing.push(copy);
          recycled.push(panelIndex);
          panel.classList.add('wn-recycled');
          panel.classList.remove('wn-active');
          panel.style.transitionDuration = '0ms';
          panel.style.transform = `translate3d(calc(100% + ${stories.length - 1 + distance} * var(--wn-rail)),0,0)`;
        }
        this.viewport.getBoundingClientRect();
      }
      this.active = index;
      this.moving = true;
      if (this.panels.some(panel => panel.contains(document.activeElement))) this.viewport.focus({ preventScroll: true });
      this.render(true, recycled);
      this.departing.forEach((copy, distance) => {
        copy.style.transform = distance === 0
          ? `translate3d(calc(-100% - ${steps - 1} * var(--wn-rail)),0,0)`
          : `translate3d(calc(${distance - steps} * var(--wn-rail)),0,0)`;
      });
      if (manual) this.querySelector('[role=status]').textContent = stories[index].label;
      this.finishTimer = setTimeout(() => {
        this.moving = false;
        this.departing.forEach(copy => copy.remove());
        this.departing = [];
        this.render(false);
        this.schedule();
      }, this.reduced.matches ? 0 : 1020);
    }

    pauseLabel() {
      const button = this.querySelector('[data-news-pause]');
      this.toggleAttribute('data-paused', this.paused);
      button.setAttribute('aria-label', this.paused ? 'Play features' : 'Pause features');
      button.innerHTML = this.paused ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m9 6 10 6-10 6Z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" stroke-width="1.5" d="M9 6v12M15 6v12"/></svg>';
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.visible || this.paused || this.hovering || this.focused || this.moving || document.hidden) return;
      this.timer = setTimeout(() => this.select((this.active + 1) % stories.length), 6500);
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
