(() => {
  const stories = [
    { label: 'discoveries', theme: 'paper', title: 'a prison.<br>a swimming hole.<br>same place.', description: 'At Rummu, Estonia, a flooded quarry has turned the remains of a Soviet prison into something utterly unexpected.', image: '/spots/rummu.jpg', alt: 'The abandoned buildings of Rummu rising from clear blue water', place: 'Rummu, Estonia', href: '/blog/a-soviet-prison-doubles-as-a-swimming-hole' },
    { label: 'tours', theme: 'green', title: 'go beneath<br>the obvious.', description: 'An old quarry. Seventy years of carving. A cathedral-sized space hidden beneath Utsunomiya. Start your next detour here.', image: '/spots/oya.jpg', alt: 'Illuminated stone chambers inside Oya History Museum', place: 'Oya History Museum, Japan', href: '/blog/tochigi-underground-quarry' },
    { label: 'community', theme: 'aqua', title: 'a good find<br>gets around.', description: 'Wayfarer put London’s ever-changing Leake Street tunnel on the map. What’s hiding in your corner of the world?', image: '/editorial-assets/spot-south-london-s-most-notable-street-art-location.jpg', alt: 'Colorful street art covering the Leake Street tunnel in London', place: 'Leake Street, London', publisher: 'Wayfarer', href: '/blog/south-london-s-most-notable-street-art-location' },
    { label: 'featured spot', theme: 'blue', title: 'looks like art.<br>burns your trash.', description: 'Golden domes, candy-colored towers, and a very unexpected day job. Meet Osaka’s working garbage palace.', image: '/spots/maishima.jpg', alt: 'The colorful towers of Maishima Incineration Plant', place: 'Maishima, Osaka', href: '/blog/osaka-s-candy-colored-garbage-palace' }
  ];
  const arrow = direction => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="${direction === 'left' ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;

  class DeepSpotNews extends HTMLElement {
    async connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      this.profiles = await import('/profile/identity.mjs');
      this.active = 0;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
      this.paused = this.reduced.matches;
      this.innerHTML = `<section class="wn-section" aria-labelledby="wn-heading" aria-roledescription="carousel">
        <div class="wn-header"><h2 id="wn-heading"><button type="button" class="wn-intro-tab" aria-label="what’s new?" aria-expanded="false" aria-controls="wn-features"><span class="wn-intro-title" aria-hidden="true">what’s <br>new?</span><span class="wn-intro-label" aria-hidden="true">what’s new?</span><span class="wn-intro-arrow" aria-hidden="true">↗</span></button></h2></div>
        <div class="wn-window" id="wn-features" tabindex="-1">${stories.map((story, i) => `<div class="wn-panel wn-${story.theme}" data-news-panel="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${stories.length}: ${story.label}">
          <button type="button" class="wn-rail" data-news-open="${i}" aria-label="Show ${story.label}" aria-expanded="false" aria-controls="wn-content-${i}"><span>${story.label}</span><span class="wn-rail-arrow" aria-hidden="true">↗</span></button>
          <div class="wn-content" id="wn-content-${i}"><div class="wn-copy"><h3>${story.title}</h3><p>${story.description}</p></div>
            <figure class="wn-photo"><img src="${story.image}" alt="${story.alt}" loading="lazy" decoding="async"><figcaption>${story.place}${story.publisher?' · '+this.profiles.authorLink(story.publisher,{from:location.pathname+location.search+'#wn-heading'}):''}</figcaption></figure>
            <a class="wn-readmore" href="https://www.deepspot.io${story.href}" target="_blank" rel="noopener">read more ${arrow('right')}</a>
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
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.reduced?.removeEventListener('change', this.motionHandler);
      this.mobile?.removeEventListener('change', this.mobileHandler);
      this.ready = false;
    }
  }
  customElements.define('deepspot-news', DeepSpotNews);
})();
