// Tours: under construction (2026-10-20, v3 per Charlie's sketch). One screen, no scroll:
// giant "tours." title → construction mole in front of it → two green tape bands in an X across the full width
// → roadmap pill. A blurred, inert mock tour page sits at the back. Tape text is decorative; the h1 carries the meaning.
import {action} from './core.mjs?v=65b48136';
import {imgAttrs} from './img.mjs?v=61371a3b';

const STAR='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg>';
const PHOTOS=['oya','chiatura','teufelsberg','rummu','maishima','sandchurch'];
/* band centers and slopes from the sketch: A rises left→right, B falls left→right and passes behind A; C clips the top-right corner */
const TAPES=[
 {id:'b',y:.86,rise:-.235,dur:170,dir:-1},
 {id:'a',y:.78,rise:.507,dur:140,dir:1},
 {id:'c',x:.9,y:.06,rot:16,dur:120,dir:1,fixed:true}
];

/* the word and the three moles are one Blender render (2026-10-20): 3D "tours" type, real shadows, three mole loops.
   Every layer shares one camera; ART says where the image sits in em, relative to the "t" pen and the baseline. */
const ART={left:-0.44,width:2.99,top:1.10,height:1.22,w:2600,h:1061,inkL:-0.378,inkR:2.487};
const V='?v=art15';   /* bump when the render changes, so browsers drop cached images */
const layer=(cls,src,still,alt='')=>`<picture class="tr-art ${cls}">${still?`<source srcset="${still}${V}" media="(prefers-reduced-motion: reduce)">`:''}<img src="${src}${V}" alt="${alt}" width="${ART.w}" height="${ART.h}" decoding="async"></picture>`;
const art=()=>layer('tr-art-type tr-art-dark','/deepspot-redesign/tours/tours-type-dark.webp')+layer('tr-art-type tr-art-light','/deepspot-redesign/tours/tours-type-light.webp')
 +layer('tr-art-shadow','/deepspot-redesign/tours/tours-shadow.webp')
 +layer('tr-art-moles','/deepspot-redesign/tours/tours-moles.webp','/deepspot-redesign/tours/tours-moles-still.webp','Two moles in hard hats: one by the t with a hammer on his shoulder, one sitting against the r, smoking')
 +layer('tr-art-super','/deepspot-redesign/tours/tours-super.webp','/deepspot-redesign/tours/tours-super-still.webp','A supervisor mole in a white hard hat standing on the u');
const run=()=>Array.from({length:10},()=>`<span>under construction</span>${STAR}`).join('');
const tape=(t,i)=>`<div class="tr-tape" data-tape="${t.id}" data-roll="${t.dir<0?'rtl':'ltr'}" style="--i:${i};--x:${(t.x??.5)*100}%;--y:${t.y*100}%;--dur:${t.dur}s${t.fixed?`;--rot:${t.rot}deg`:''}"><div class="tr-run${t.dir<0?' tr-rev':''}"><div>${run()}</div><div>${run()}</div></div></div>`;

function fakePage(){
 const card=p=>`<div class="tr-f-card"><img${imgAttrs('/deepspot-redesign/spots/'+p+'.jpg','240px')} alt="" decoding="async"><i></i><i></i></div>`;
 return `<div class="tr-fake" aria-hidden="true" inert><div class="tr-f-chips">${'<b></b>'.repeat(5)}</div><div class="tr-f-grid">${PHOTOS.map(card).join('')}</div></div>`;
}

export function renderTours(root){
 document.title='Tours — DeepSpot';
 document.documentElement.classList.add('tr-lock');
 root.classList.add('tr-root');
 root.innerHTML=`<section class="tr-stage" aria-labelledby="tr-h"><div class="tr-cam">${fakePage()}<h1 class="tr-title" id="tr-h">tours<span class="tr-base" aria-hidden="true"></span><span class="sr-only"> Under construction.</span></h1>${art()}<div class="tr-tapes" aria-hidden="true">${TAPES.map((t,i)=>tape(t,i)).join('')}</div></div><div class="tr-cta">${action('see the roadmap','/deepspot-redesign/roadmap/')}</div></section>`;
 const stage=root.querySelector('.tr-stage'),header=document.querySelector('ds-site-header');
 const fit=()=>{
  if(stage.classList.contains('tr-zoom'))return;   /* measurements are wrong while the camera is zoomed; refit when it ends */
  const top=Math.max(0,Math.round(header?.getBoundingClientRect().bottom||0));stage.style.top=top+'px';
  const W=stage.clientWidth,H=stage.clientHeight,H0=H;
  /* corner band: its lower edge just clips the tops of the "r" and the "s" */
  const c=stage.querySelector('[data-tape="c"]'),title=stage.querySelector('.tr-title'),txt=title.firstChild,base=title.querySelector('.tr-base');
  if(txt?.nodeType===3&&base){
   title.style.translate='0';const s0=stage.getBoundingClientRect(),F0=parseFloat(getComputedStyle(title).fontSize),gx=i=>{const r=document.createRange();r.setStart(txt,i);r.setEnd(txt,i+1);return r.getBoundingClientRect();};
   title.style.translate=`${Math.round(W/2-(gx(0).left+gx(4).right+.07*F0)/2+s0.left)}px 0`;   /* centre the word on its ink (the -.07em tracking leaves a gap after the "s") */
  }
  const portrait=W<700||H>W;c.toggleAttribute('data-top',portrait);
  TAPES.filter(t=>!t.fixed).forEach(t=>stage.querySelector(`[data-tape="${t.id}"]`).style.setProperty('--y',((t.y-(W<700?.045:0))*100)+'%'));   /* phones: low bands sit a little higher */
  if(portrait){c.style.setProperty('--x','50%');c.style.setProperty('--y',Math.round(c.offsetHeight*.75)+'px');c.style.setProperty('--rot','-6deg');}
  if(!portrait)c.style.setProperty('--rot',TAPES.find(t=>t.id==='c').rot+'deg');   /* back to the desktop angle after a resize from phone width */
  if(!portrait&&txt?.nodeType===3&&base){
   const sr=stage.getBoundingClientRect(),F=parseFloat(getComputedStyle(title).fontSize),rg=document.createRange();rg.setStart(txt,3);rg.setEnd(txt,4);
   const R=rg.getBoundingClientRect(),xTop=base.getBoundingClientRect().top-.53*F,th=16*Math.PI/180,h=c.offsetHeight;
   const px=R.left+R.width*.6-sr.left,py=xTop-F*.04-sr.top;
   c.style.setProperty('--x',(px+h/2*Math.sin(th))+'px');c.style.setProperty('--y',(py-h/2*Math.cos(th))+'px');
  }
  if(txt?.nodeType===3&&base){   /* place the render over the (now invisible) HTML word */
   const sr=stage.getBoundingClientRect(),F=parseFloat(getComputedStyle(title).fontSize),r=document.createRange();r.setStart(txt,0);r.setEnd(txt,1);
   const tx=r.getBoundingClientRect().left-sr.left,bl=base.getBoundingClientRect().top-sr.top;
   stage.querySelectorAll('.tr-art').forEach(el=>{el.style.left=(tx+ART.left*F)+'px';el.style.top=(bl-ART.top*F)+'px';el.style.width=(ART.width*F)+'px';el.style.height=(ART.height*F)+'px';});
  }
 stage.style.setProperty('--len',Math.ceil(Math.hypot(W,H)*1.25)+'px');
  TAPES.filter(t=>!t.fixed).forEach(t=>stage.querySelector(`[data-tape="${t.id}"]`).style.setProperty('--rot',Math.max(-24,Math.min(24,-Math.atan(t.rise*H/W)*180/Math.PI)).toFixed(2)+'deg'));
 };
 fit();addEventListener('resize',fit);
 /* every time the page opens: start zoomed in on the main tape (turned level so UNDER CONSTRUCTION reads), then snap out to the full comp */
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const W=stage.clientWidth,H=stage.clientHeight,a=stage.querySelector('[data-tape="a"]'),cs=getComputedStyle(a),h=a.offsetHeight;
  const oy=parseFloat(a.style.getPropertyValue('--y'))/100*H,z=Math.max(1.8,Math.min(.72*H/h,W/(3.3*h)));
  const cam=stage.querySelector('.tr-cam');cam.style.setProperty('--ox',W/2+'px');cam.style.setProperty('--oy',oy+'px');cam.style.setProperty('--r0',cs.getPropertyValue('--rot'));cam.style.setProperty('--z0',z.toFixed(2));
  stage.classList.add('tr-zoom');
  cam.addEventListener('animationend',e=>{if(e.animationName==='tr-pull'){stage.classList.remove('tr-zoom');fit();}},{once:true});
 }new ResizeObserver(fit).observe(header||document.body);
}
