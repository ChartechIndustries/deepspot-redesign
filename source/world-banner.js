(() => {
  class DeepSpotWorldBanner extends HTMLElement {
    connectedCallback() {
      if (this.ready) return;
      this.ready = true;
      this.abort = new AbortController();
      this.innerHTML = `<section class="world-banner" aria-labelledby="world-banner-title">
        <video class="world-banner-video" muted loop playsinline preload="none" poster="/media/world-is-deeper-poster.jpg" aria-hidden="true" tabindex="-1" disablepictureinpicture></video>
        <div class="world-banner-shade" aria-hidden="true"></div>
        <h2 id="world-banner-title"><span>the world is deeper,</span><span>stranger &amp; cooler than you imagine.</span></h2>
        <button class="world-banner-motion" type="button" aria-label="Play video banner"></button>
      </section>`;
      this.video = this.querySelector('video');
      this.video.muted = true;
      this.button = this.querySelector('button');
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const listen = (target,event,handler) => target.addEventListener(event,handler,{signal:this.abort.signal});
      listen(this.button,'click',() => {
        this.userPaused = !this.video.paused;
        this.userStarted = !this.userPaused;
        this.syncPlayback();
      });
      listen(this.video,'playing',() => this.updateControl());
      listen(this.video,'pause',() => this.updateControl());
      listen(document,'visibilitychange',() => this.syncPlayback());
      listen(this.reduced,'change',() => {this.userStarted=false;this.syncPlayback();});
      this.observer = new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting;
        this.syncPlayback();
      },{threshold:.05});
      this.observer.observe(this);
      this.updateControl();
    }

    syncPlayback() {
      const play = this.visible && !document.hidden && !this.userPaused && (!this.reduced.matches || this.userStarted);
      if (play) {
        if (!this.video.getAttribute('src')) this.video.src = '/media/world-is-deeper.mp4';
        this.video.play().catch(() => this.updateControl());
      } else this.video.pause();
      this.updateControl();
    }

    updateControl() {
      const paused = this.video.paused;
      this.button.setAttribute('aria-label',paused?'Play video banner':'Pause video banner');
      this.button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paused?'m9 5 10 7-10 7Z':'M9 6v12M15 6v12'}"/></svg>`;
    }

    disconnectedCallback() {
      this.abort?.abort();this.observer?.disconnect();this.video?.pause();this.ready=false;
    }
  }
  customElements.define('deepspot-world-banner',DeepSpotWorldBanner);
})();
