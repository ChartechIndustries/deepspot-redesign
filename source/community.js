(() => {
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  class DeepSpotCommunity extends HTMLElement {
    async connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = 'true';
      this.abort = new AbortController();
      try {
        this.profiles = await import('/profile/identity.mjs');
        const response = await fetch('/profile/profiles.json', {signal:this.abort.signal});
        if (!response.ok) throw new Error('Community data unavailable');
        const data = await response.json();
        if (!this.isConnected) return;
        this.people = data.profiles.filter(p => p.name && Number.isFinite(p.contributions)).sort((a,b) => b.contributions - a.contributions).slice(0,6);
        this.preview = data.preview;
        this.render();
        this.connect();
        if(location.hash==='#community')this.scrollIntoView({block:'start'});
      } catch (error) {
        if (error.name === 'AbortError') return;
        this.innerHTML = '<section class="cl-unavailable"><h2>the people behind the pins.</h2><a href="https://www.deepspot.io/community">meet the community ↗</a></section>';
      }
    }

    render() {
      const people = this.people;
      const safeURL = p => /^https:\/\//.test(p.profileUrl || '') ? p.profileUrl : this.profiles.profileHref(p.id,{from:location.pathname+location.search+'#community'});
      this.innerHTML = `<header class="ed-heading cl-panel-heading"><h2>community</h2></header><section class="cl-community" aria-label="DeepSpot community">
        <div class="cl-float-field">
          <div class="cl-intro"><h2>the people<br>behind<br>the <em>pins.</em></h2></div>
          <div class="cl-heads">${people.map((p,i) => `<a class="cl-head${i===0?' cl-active':''}" href="${escape(safeURL(p))}" data-profile="${i}" data-person="${i}" aria-label="View ${escape(p.name)}’s passport"><span class="cl-portrait"><img ${p.image?`src="${escape(p.image)}"`:""} alt="" loading="lazy" decoding="async" draggable="false"><span class="cl-initials" aria-hidden="true">${escape(p.name.split(' ').map(s=>s[0]).join(''))}</span></span></a>`).join('')}</div>
          <div class="cl-field-footer"><span>made by the curious.</span><button class="cl-motion" type="button" aria-label="Pause floating portraits" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg></button></div>
        </div>
        <div class="cl-leaderboard"><header class="cl-list-heading"><h3><a href="/leaderboard/" style="color:inherit;text-decoration:none">top contributors ↗</a></h3>${this.preview?'<span class="cl-sample">sample profiles</span>':'<span class="cl-sample">oct 2026</span>'}</header>
          <ol class="cl-list">${people.map((p,i) => `<li class="cl-row${i===0?' cl-active':''}" data-person="${i}"><a class="cl-profile-link" href="${escape(safeURL(p))}" ${p.profileUrl?'target="_blank" rel="noopener"':''} data-profile="${i}" aria-label="View ${escape(p.name)}’s profile, ${p.contributions} contributions"><span class="cl-rank">${i+1}</span><span class="cl-person"><strong>${escape(p.name)}</strong><span>view passport <i aria-hidden="true">↗</i></span></span><span class="cl-total"><strong>${p.contributions}</strong><span>contributions</span></span></a></li>`).join('')}</ol>
        </div>
      </section>`;
      this.field = this.querySelector('.cl-float-field');
      this.heads = [...this.querySelectorAll('.cl-head')];
      this.rows = [...this.querySelectorAll('.cl-row')];
      this.heads.forEach(head => {
        const img = head.querySelector('img');
        if(!img.getAttribute('src'))head.classList.add('cl-image-failed');
        img.addEventListener('error', () => head.classList.add('cl-image-failed'), {once:true});
      });
    }

    connect() {
      const listen = (element,event,callback) => element.addEventListener(event,callback,{signal:this.abort.signal});
      listen(this,'pointerover',event => {
        const person = event.target.closest('[data-person]');
        if (person) this.select(+person.dataset.person);
        const head = event.target.closest('.cl-head');
        this.held = head ? +head.dataset.person : -1;
      });
      listen(this,'pointerout',event => {
        if (!event.relatedTarget?.closest?.('.cl-head')) this.held = -1;
      });
      listen(this,'focusin',event => {
        const person = event.target.closest('[data-person]');
        if (person) this.select(+person.dataset.person);
        const head = event.target.closest('.cl-head');
        this.focusedHead = head ? +head.dataset.person : -1;
      });
      listen(this,'focusout',() => {this.focusedHead = -1;});
      listen(this,'click',event => {
        const head = event.target.closest('.cl-head');
        if (head) this.select(+head.dataset.person);
        const link = event.target.closest('[data-profile]');
        if (link && !this.people[+link.dataset.profile].profileUrl) {
          // Keep the current theme even if it changed after the leaderboard loaded.
          const url = new URL(link.href);
          url.searchParams.set('theme',document.documentElement.dataset.theme==='light'?'light':'dark');
          link.href = url.pathname + url.search;
        }
      });
      const motion = this.querySelector('.cl-motion');
      listen(motion,'click',() => {
        this.paused = !this.paused;
        motion.setAttribute('aria-pressed',String(this.paused));
        motion.setAttribute('aria-label',this.paused?'Play floating portraits':'Pause floating portraits');
        motion.innerHTML = this.paused?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>';
        this.syncMotion();
      });
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
      listen(this.reduced,'change',() => this.syncMotion());
      listen(document,'visibilitychange',() => this.syncMotion());
      this.resizeObserver = new ResizeObserver(() => this.layout());
      this.resizeObserver.observe(this.field);
      this.observer = new IntersectionObserver(entries => {this.visible=entries[0].isIntersecting;this.syncMotion();},{threshold:.05});
      this.observer.observe(this.field);
      this.held = this.focusedHead = -1;
      this.layout();
    }

    select(index) {
      if (index===this.selected) return;
      this.selected = index;
      this.heads.forEach((head,i) => {head.classList.toggle('cl-active',i===index);});
      this.rows.forEach((row,i) => row.classList.toggle('cl-active',i===index));
    }

    layout() {
      const width=this.field.clientWidth, height=this.field.clientHeight;
      if (!width || !height) return;
      this.width=width; this.height=height;
      const scale=Math.min(1.08,width/600), sizes=[158,130,119,146,104,92];
      const positions=[[.26,.19],[.75,.20],[.16,.51],[.69,.78],[.29,.82],[.85,.49]];
      const velocity=[[13,9],[-10,13],[11,-8],[-12,-7],[14,-11],[-10,12]];
      this.bodies=this.heads.map((element,i)=>{
        const r=Math.max(34,sizes[i]*scale/2);
        element.style.width=element.style.height=`${r*2}px`;
        return {element,r,x:width*positions[i][0],y:height*positions[i][1],vx:velocity[i][0],vy:velocity[i][1]};
      });
      this.paint(); this.syncMotion();
    }

    syncMotion() {
      cancelAnimationFrame(this.frame); this.lastTime=0;
      this.classList.toggle('cl-reduced',this.reduced?.matches || false);
      if (this.visible && !document.hidden && !this.paused && !this.reduced?.matches && this.bodies) this.frame=requestAnimationFrame(time=>this.tick(time));
    }

    tick(time) {
      const dt=this.lastTime?Math.min((time-this.lastTime)/1000,.035):0;
      this.lastTime=time;
      const frozen=i=>i===this.held||i===this.focusedHead;
      this.bodies.forEach((body,i)=>{
        if (frozen(i)) return;
        body.x+=body.vx*dt;body.y+=body.vy*dt;
        const left=body.r+10,right=this.width-body.r-10,top=body.r+12,bottom=this.height-body.r-52;
        if(body.x<left){body.x=left;body.vx=Math.abs(body.vx);}if(body.x>right){body.x=right;body.vx=-Math.abs(body.vx);}
        if(body.y<top){body.y=top;body.vy=Math.abs(body.vy);}if(body.y>bottom){body.y=bottom;body.vy=-Math.abs(body.vy);}
      });
      // Six lightweight bodies, painted with transforms; no layout reads per frame.
      for(let i=0;i<this.bodies.length;i++)for(let j=i+1;j<this.bodies.length;j++){
        const a=this.bodies[i],b=this.bodies[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),min=a.r+b.r+7;
        if(dist>0 && dist<min){
          const nx=dx/dist,ny=dy/dist,overlap=min-dist,af=frozen(i),bf=frozen(j);
          if(!af){a.x-=nx*overlap*(bf?1:.5);a.y-=ny*overlap*(bf?1:.5);}
          if(!bf){b.x+=nx*overlap*(af?1:.5);b.y+=ny*overlap*(af?1:.5);}
          const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
          if(relative<0){if(!af){a.vx+=relative*nx;a.vy+=relative*ny;}if(!bf){b.vx-=relative*nx;b.vy-=relative*ny;}}
        }
      }
      this.paint();
      this.frame=requestAnimationFrame(next=>this.tick(next));
    }

    paint() {this.bodies.forEach(body=>{body.element.style.transform=`translate3d(${(body.x-body.r).toFixed(2)}px,${(body.y-body.r).toFixed(2)}px,0)`;});}

    disconnectedCallback() {
      this.abort?.abort();this.resizeObserver?.disconnect();this.observer?.disconnect();cancelAnimationFrame(this.frame);delete this.dataset.ready;
    }
  }
  customElements.define('deepspot-community',DeepSpotCommunity);
})();
