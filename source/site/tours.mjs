// Tours: under construction (2026-10-20, v3 per Charlie's sketch). One screen, no scroll:
// giant "tours." title → construction mole in front of it → two green tape bands in an X across the full width
// → roadmap pill. A blurred, inert mock tour page sits at the back. Tape text is decorative; the h1 carries the meaning.
import {action} from './core.mjs';

const STAR='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg>';
const PHOTOS=['oya','chiatura','teufelsberg','rummu','maishima','sandchurch'];
/* band centers and slopes from the sketch: A rises left→right, B falls left→right and passes behind A; C clips the top-right corner */
const TAPES=[
 {id:'b',y:.86,rise:-.235,dur:170,dir:-1},
 {id:'a',y:.78,rise:.507,dur:140,dir:1},
 {id:'c',x:.9,y:.06,rot:16,dur:120,dir:1,fixed:true}
];

/* three working moles around the title (Charlie's sketch, 2026-10-20). Sizes in Blender units: h/ppu.
   hammer: profile, taps at the "t"; supervisor: white hat, stands on the "u" with a contact shadow; smoker: sits on the baseline, back to the "r". */
const MOLES=[
 {id:'hammer',w:507,h:624,ppu:155.5,feet:0.96,reach:0.925,alt:'A mole in a hard hat holding a hammer by the letter t'},
 {id:'supervisor',w:462,h:637,ppu:162.5,feet:0.98,alt:'A supervisor mole in a white hard hat standing on the letter u'},
 {id:'smoker',w:472,h:674,ppu:162.5,feet:0.981,back:0.032,alt:'A mole in a hard hat sitting against the letter r, smoking'}
];
const MOLE_K=.135;   /* title font-size per Blender unit: a standing mole (3.6 units) is about half the cap height */
const mole=m=>(m.id==='supervisor'?'<i class="tr-mole-shadow" aria-hidden="true"></i>':'')+`<div class="tr-mole" data-mole="${m.id}" style="aspect-ratio:${m.w}/${m.h}"><picture><source srcset="/tours/mole-${m.id}-still.webp" media="(prefers-reduced-motion: reduce)"><img src="/tours/mole-${m.id}.webp" alt="${m.alt}" width="${m.w}" height="${m.h}" decoding="async"></picture></div>`;
const run=()=>Array.from({length:10},()=>`<span>under construction</span>${STAR}`).join('');
const tape=t=>`<div class="tr-tape" data-tape="${t.id}" style="--x:${(t.x??.5)*100}%;--y:${t.y*100}%;--dur:${t.dur}s${t.fixed?`;--rot:${t.rot}deg`:''}"><div class="tr-run${t.dir<0?' tr-rev':''}"><div>${run()}</div><div>${run()}</div></div></div>`;

function fakePage(){
 const card=p=>`<div class="tr-f-card"><img src="/spots/${p}.jpg" alt="" decoding="async"><i></i><i></i></div>`;
 return `<div class="tr-fake" aria-hidden="true" inert><div class="tr-f-chips">${'<b></b>'.repeat(5)}</div><div class="tr-f-grid">${PHOTOS.map(card).join('')}</div></div>`;
}

export function renderTours(root){
 document.title='Tours — DeepSpot';
 document.documentElement.classList.add('tr-lock');
 root.classList.add('tr-root');
 root.innerHTML=`<section class="tr-stage" aria-labelledby="tr-h">${fakePage()}<h1 class="tr-title" id="tr-h">tours<span class="tr-base" aria-hidden="true"></span><span class="sr-only"> Under construction.</span></h1>${MOLES.map(mole).join('')}<div class="tr-tapes" aria-hidden="true">${TAPES.map(tape).join('')}</div><div class="tr-cta">${action('see the roadmap','/roadmap/')}</div></section>`;
 const stage=root.querySelector('.tr-stage'),header=document.querySelector('ds-site-header');
 const fit=()=>{
  const top=Math.max(0,Math.round(header?.getBoundingClientRect().bottom||0));stage.style.top=top+'px';
  const W=stage.clientWidth,H=stage.clientHeight,H0=H;
  /* corner band: its lower edge just clips the tops of the "r" and the "s" */
  const c=stage.querySelector('[data-tape="c"]'),title=stage.querySelector('.tr-title'),txt=title.firstChild,base=title.querySelector('.tr-base');
  if(txt?.nodeType===3&&base){   /* centre the word on its ink, not its advance width (the -.07em tracking leaves a gap after the "s") */
   title.style.translate='0';const s0=stage.getBoundingClientRect(),F0=parseFloat(getComputedStyle(title).fontSize),gx=i=>{const r=document.createRange();r.setStart(txt,i);r.setEnd(txt,i+1);return r.getBoundingClientRect();};
   title.style.translate=`${Math.round(W/2-(gx(0).left+gx(4).right+.07*F0)/2+s0.left)}px 0`;
  }
  if(txt?.nodeType===3&&base){
   const sr=stage.getBoundingClientRect(),F=parseFloat(getComputedStyle(title).fontSize),rg=document.createRange();rg.setStart(txt,3);rg.setEnd(txt,4);
   const R=rg.getBoundingClientRect(),xTop=base.getBoundingClientRect().top-.53*F,th=16*Math.PI/180,h=c.offsetHeight;
   const px=R.left+R.width*.6-sr.left,py=xTop-F*.04-sr.top;
   c.style.setProperty('--x',(px+h/2*Math.sin(th))+'px');c.style.setProperty('--y',(py-h/2*Math.cos(th))+'px');
  }
  if(txt?.nodeType===3&&base){
   const sr=stage.getBoundingClientRect(),F=parseFloat(getComputedStyle(title).fontSize);
   const g=i=>{const r=document.createRange();r.setStart(txt,i);r.setEnd(txt,i+1);const b=r.getBoundingClientRect();return {l:b.left-sr.left,r:b.right-sr.left,w:b.width};};
   const T=g(0),U=g(2),Rr=g(3),bl=base.getBoundingClientRect().top-sr.top,xTop=bl-.52*F;
   const put=(id,cx,feetY,mode)=>{const m=MOLES.find(q=>q.id===id),el=stage.querySelector(`[data-mole="${id}"]`);if(!el)return;
    let H=m.h/m.ppu*MOLE_K*(W<700||H0>W?1.45:1)*F,Wd=H*m.w/m.h;
    if(mode==='reach'&&cx-m.reach*Wd<6){const k=Math.max(.6,(cx-6)/(m.reach*Wd));Wd*=k;H*=k;}   /* narrow screens: shrink into the margin, never below 60% */
    let left=mode==='reach'?cx-m.reach*Wd:mode==='back'?cx-m.back*Wd:cx-Wd/2;
    if(left<6)left=6;
    el.style.height=H+'px';el.style.left=left+'px';el.style.top=(feetY-m.feet*H)+'px';return {left,W:Wd,H};};
   const ink=g=>g.l+(g.w+.07*F)/2;                 /* glyph ink centre (range boxes include the -.07em tracking) */
   put('hammer',T.l+.03*F,bl,'reach');                          /* hammer head at the left tip of the "t" */
   const uStem=U.l+.165*F;                                        /* middle of the left stem of the "u" */
   const sv=put('supervisor',uStem,xTop+.012*F);                 /* stands on the left stem of the "u", feet planted */
   const sh=stage.querySelector('.tr-mole-shadow');
   if(sv&&sh){sh.style.left=(uStem-sv.W*.34)+'px';sh.style.width=(sv.W*.68)+'px';sh.style.top=(xTop-.01*F)+'px';sh.style.height=(.08*F)+'px';}   /* falls on the face of the "u", just under his feet */
   put('smoker',Rr.l+.215*F-.015*F,bl,'back');                   /* sits on the baseline, back against the stem of the "r" */
  }
 stage.style.setProperty('--len',Math.ceil(Math.hypot(W,H)*1.25)+'px');
  TAPES.filter(t=>!t.fixed).forEach(t=>stage.querySelector(`[data-tape="${t.id}"]`).style.setProperty('--rot',Math.max(-24,Math.min(24,-Math.atan(t.rise*H/W)*180/Math.PI)).toFixed(2)+'deg'));
 };
 fit();addEventListener('resize',fit);new ResizeObserver(fit).observe(header||document.body);
}
