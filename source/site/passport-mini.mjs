import {esc} from './core.mjs?v=65b48136';
import {profileHref,profileId} from '../profile/identity.mjs?v=744e89b9';
import {travelerStyles} from './account-state.mjs?v=1c064097';
import {cardHTML,mrz,moleSlotHTML,stampName,variety,fitBands} from '../profile/passport-edit.mjs?v=b98d0bcf';
import {levelFor,memberLevel,travelerType,standing} from '../profile/passport-rules.mjs?v=dcb74f9b';
import {normalizedTags} from '../browse/catalog.mjs?v=776ebad9';

/* Community "participants" passports (2026-10-21). A smaller, independent copy of the profile v11 ID card (pm- classes).
   v3.1: deck -> carousel on scroll, portrait 5:7 card, archetype header, per-card variation from archetype group / rank / id hash (no randomness).
   Real data only: leaderboard + profiles.json + the catalog. A row is left out when its value is not known. */
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- data: the same values the profile page shows ---------- */
export function passportModels(data,monthly){
 const profiles=data.profiles||[],catalog=(data.raw||[]).filter(s=>s.id?.startsWith('/blog/')&&s.title&&!s.title.startsWith('PART OF:')),lb=data.content.leaderboard;
 const find=name=>profiles.find(p=>p.name===name||(p.aliases||[]).some(a=>profileId(a)===profileId(name)));
 return monthly.map(r=>{
  const p=find(r.name),id=p?.id||profileId(r.name),name=p?.name||r.name,aliases=[name,...(p?.aliases||[])],ids=new Set(aliases.map(n=>n.toLowerCase()));
  const records=[...catalog.filter(s=>ids.has(s.publisher?.toLowerCase())).map(s=>({kind:'spot',tags:normalizedTags(s.tags)}))];
  const stand=standing(lb,aliases),lv=stand?levelFor(stand.points):null,type=travelerType(records);
  const style=travelerStyles.find(x=>x.id===type.id);
  return {id,name,handle:p?.handle||null,joined:p?.joined||null,mole:p&&!p.sample?`/community-assets/moles/${id}.webp`:'',rank:stand?.rankAll||null,lv,member:lv?memberLevel(lv.level):null,typeId:style?.id||null,arch:style?.name||null,group:style?.group||null,signature:p?.signatureArt||null,bio:p?.bio||null,href:profileHref(id)};
 });
}

/* ---------- card: the shared passport (profile/passport-edit.mjs), the same thing the profile page shows ---------- */
const RANKC=['#07d653','#3c60ff','#f2c14e'];
const sigImg=m=>m.signature?`<img src="${esc(m.signature)}" alt="" width="512" height="256" loading="lazy" decoding="async">`:'<span>no mark yet</span>';
/* passportFace: the card with its foil wrapper, no deck item around it (also used by the home 'what's new' fan) */
export function passportFace(m,i){
 const v=variety(m.id,m.rank);
 const card=cardHTML({uid:'pc'+i,no:m.rank?'no. '+String(m.rank).padStart(3,'0'):'',mole:moleSlotHTML({src:m.mole,name:m.name}),lv:m.lv,arch:m.typeId||'',stamp:{name:stampName(m.typeId||''),sub:m.member||'contributor'},bio:m.bio,bioEmpty:'no bio yet.',ink:v.ink,rot:v.rot,rib:v.rib,
  name:m.name,handle:m.handle,joined:m.joined,member:m.member||'contributor',sigLabel:'their mark',sig:sigImg(m),mrz:mrz({name:m.name,handle:m.handle,joined:m.joined,member:m.member},m.rank,m.lv)});
 return `<div class="pm-tilt pp-passobj-in" data-foil="${v.foil}" style="--pf:${m.rank&&m.rank<=3?RANKC[m.rank-1]:'#dfe6e4'}">${card}</div>`;
}
export function passportHTML(m,i){
 const dx=((i*3)%5-2)*4,dy=((i*7)%5-2)*3,dr=((i*5)%7-3);
 return `<li class="pm-item" data-pm-i="${i}" style="--i:${i};--dx:${dx}px;--dy:${dy}px;--dr:${dr}deg"><a class="pm-link" href="${esc(m.href)}" aria-label="${esc(m.name)}’s passport" draggable="false">${passportFace(m,i)}</a></li>`;
}

/* ---------- section ---------- */
/* 2026-10-23 (5.2 + 5.7): the deck waits closed (title on top). Hover (mouse) peeks, click/tap/Enter deals it out. No scroll trigger.
   Open: drag the front card 1:1 (it tilts up to 12 deg), release past a threshold and it flies on a spring (stiffness 260, damping 26) to the pile;
   arrows and keys play the same flight. "deal again" gathers the deck and deals once more. Reduced motion: no deal, no flight, no peek. */
export function participantsHTML(models){
 const f=models[0],N=models.length;
 return `<section class="pm pp-main" id="cv-pt" aria-labelledby="cv-ptt" aria-roledescription="carousel" data-pm>
 <div class="pm-wrap"><div class="pm-stage" data-pm-stage role="group" aria-label="Participant passports"><ul class="pm-deck" data-pm-deck>${models.map(passportHTML).join('')}</ul></div>
 <div class="pm-hero" data-pm-hero><h2 id="cv-ptt">participants<span>.</span></h2><p class="pm-sub">${N} ${N===1?'explorer':'explorers'} in this month’s race</p><button type="button" class="pm-deal" data-pm-deal data-copy="kai-6"><span class="pm-deal-m">hover to peek, click to deal</span><span class="pm-deal-t">tap to deal</span></button></div></div>
 <div class="pm-ctl"><button type="button" class="pm-btn" data-pm-prev aria-label="Previous participant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><p class="pm-count" aria-hidden="true"><b data-pm-n>1</b> / ${N}</p><button type="button" class="pm-btn" data-pm-next aria-label="Next participant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><button type="button" class="pm-again" data-pm-again data-copy="kai-6">deal again <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg></button><a class="pm-open" data-pm-open href="${esc(f.href)}">${esc(f.name)}’s passport ↗</a></div>
 <p class="cv-sr" role="status" aria-live="polite" data-pm-live></p></section>`;
}

const mod=(a,n)=>((a%n)+n)%n,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export function wirePassports(sec,models){
 const deck=sec.querySelector('[data-pm-deck]'),stage=sec.querySelector('[data-pm-stage]'),cards=[...deck.children],N=cards.length,open=sec.querySelector('[data-pm-open]'),num=sec.querySelector('[data-pm-n]'),live=sec.querySelector('[data-pm-live]');
 let at=0,pos=0,vel=0,target=0,raf=0,near=0,dir=1,busy=false,first=true;
 const isOpen=()=>sec.classList.contains('is-open');
 sec.style.setProperty('--pm-c',(N-1)/2);
 const csv=()=>parseFloat(getComputedStyle(sec).getPropertyValue('--pm-cs'))||.74;
 /* ---- layout: one function turns a (continuous) position into every card's transform. Mirrors the old CSS numbers. ---- */
 const place=(i,p)=>{
  const cs=csv(),w=innerWidth,stack=w<=650,cw=440*cs;let k=mod(i-p,N),o={};
  if(stack){
   if(k>N-1)k-=N;                       /* (-1,0): the card that is flying off */
   const step=Math.max(w,cw);
   if(k<0){const t=-k;o={tx:-t*step,ty:-t*18,tz:0,ry:0,rz:12*Math.sin(Math.PI*k),sc:cs*(1+.02*Math.sin(Math.PI*t)),fo:clamp((1-t)/.25),zi:700,lf:Math.sin(Math.PI*t)*1.3};}
   else{const d=Math.min(k,4);o={tx:0,ty:-d*14,tz:0,ry:0,rz:k>0.001?((i*37)%5-2)*.7:0,sc:cs*(k<=1?1-.06*k:.94-.03*(k-1)),fo:clamp(4-k),zi:600-Math.round(k*10),lf:clamp(1-k)};}
   return o;
  }
  if(k>N/2)k-=N;
  const a=Math.abs(k),step=(w<=1000?264:308)*cs,fly=a<1&&k*dir<0,bump=a<1?Math.sin(Math.PI*a):0;
  return {tx:k*step,ty:-bump*26,tz:-a*60+bump*90,ry:clamp(-18*k,-36,36),rz:a<1?12*Math.sin(Math.PI*k):0,sc:cs*((w<=1000?1.1:1.14)-a*.13),fo:clamp(4-a),zi:500-Math.round(a*20)+(fly?8:0),lf:clamp(1-a)+(fly?.5*bump:0)};
 };
 const render=()=>{
  cards.forEach((li,i)=>{const o=place(i,pos),st=li.style;
   st.setProperty('--tx',o.tx.toFixed(1)+'px');st.setProperty('--ty',o.ty.toFixed(1)+'px');st.setProperty('--tz',o.tz.toFixed(1)+'px');st.setProperty('--ry',o.ry.toFixed(2)+'deg');st.setProperty('--rz',o.rz.toFixed(2)+'deg');
   st.setProperty('--sc',o.sc.toFixed(4));st.setProperty('--fo',o.fo.toFixed(3));st.setProperty('--zi',o.zi);st.setProperty('--lf',o.lf.toFixed(3));
   li.classList.toggle('is-gone',o.fo<=.01);});
  const n=mod(Math.round(pos),N);if(n!==near)setNear(n);
 };
 const tick=()=>{num.classList.remove('is-tick');void num.offsetWidth;num.classList.add('is-tick');};
 const setNear=n=>{near=n;cards.forEach((li,i)=>{li.classList.toggle('is-front',i===n);const link=li.firstElementChild;link.tabIndex=i===n?0:-1;li.setAttribute('aria-hidden',i===n?'false':'true');});
  const m=models[n];open.href=m.href;open.textContent=`${m.name}’s passport ↗`;num.textContent=n+1;if(!first&&isOpen()){tick();live.textContent=`${m.name}, passport ${n+1} of ${N}`;}first=false;};
 /* closed deck: z order and aria only */
 const lay=()=>{cards.forEach((li,i)=>{li.style.setProperty('--zi',N-i);});setNear(at);};
 /* ---- spring ---- */
 const K=260,C=26;
 const run=()=>{if(raf)return;let t0=performance.now();
  const f=now=>{const dt=Math.min(.032,(now-t0)/1000);t0=now;const n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;
   for(let q=0;q<n;q++){vel+=(-K*(pos-target)-C*vel)*h;pos+=vel*h;}
   if(Math.abs(pos-target)<.0006&&Math.abs(vel)<.01){raf=0;settle();return;}
   if(Math.abs(vel)>.01)dir=vel>0?1:-1;
   render();raf=requestAnimationFrame(f);};
  raf=requestAnimationFrame(f);};
 const stop=()=>{cancelAnimationFrame(raf);raf=0;};
 const settle=()=>{at=mod(Math.round(target),N);pos=target=at;vel=0;render();};
 const goLive=()=>sec.classList.add('is-live');
 const go=d=>{
  if(!isOpen()){deal();return;}
  if(busy)return;
  if(calm()){at=mod(at+d,N);pos=target=at;render();return;}
  goLive();dir=d>0?1:-1;target=Math.round(target)+d;run();
 };
 /* ---- deal out / gather ---- */
 const deal=()=>{
  if(isOpen()||busy)return;
  sec.classList.remove('is-peek');
  at=mod(at,N);pos=target=at;
  if(calm()){sec.classList.add('is-open','is-dealt','is-live');render();return;}
  busy=true;
  cards.forEach((li,i)=>{let k=mod(i-at,N);if(k>N/2)k-=N;li.style.setProperty('--dl',Math.abs(k)*90+(k<0?45:0));});
  sec.classList.remove('is-stacking');sec.classList.add('is-open','is-dealing');render();
  clearTimeout(deal.t);deal.t=setTimeout(()=>{busy=false;sec.classList.remove('is-dealing');sec.classList.add('is-dealt','is-live');},1500);
 };
 const gather=()=>{
  if(!isOpen())return;stop();settle();
  if(calm()){sec.classList.remove('is-open','is-dealt','is-live');lay();return;}
  busy=true;cards.forEach((li,i)=>{let k=Math.abs(mod(i-at,N));if(k>N/2)k=N-k;li.style.setProperty('--dl',(3-Math.min(3,k))*40);});
  sec.classList.remove('is-open','is-dealt','is-dealing','is-live');sec.classList.add('is-stacking');lay();
  clearTimeout(gather.t);gather.t=setTimeout(()=>{sec.classList.remove('is-stacking');busy=false;},1000);
 };
 const again=()=>{if(busy||!isOpen())return;gather();if(calm()){deal();return;}setTimeout(deal,1050);};
 sec.querySelector('[data-pm-again]').onclick=again;
 sec.querySelector('[data-pm-deal]').onclick=e=>{e.preventDefault();deal();};
 /* ---- peek: the mouse over the closed deck fans the cards a little ---- */
 stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!isOpen()&&!busy&&!calm())sec.classList.add('is-peek');});
 stage.addEventListener('pointerleave',()=>sec.classList.remove('is-peek'));
 sec.querySelector('[data-pm-prev]').onclick=()=>go(-1);sec.querySelector('[data-pm-next]').onclick=()=>go(1);
 sec.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();go(e.key==='ArrowRight'?1:-1);if(sec.contains(document.activeElement)&&document.activeElement.closest('.pm-link'))cards[mod(Math.round(target),N)].firstElementChild.focus({preventScroll:true});});
 /* ---- drag: the front card follows the pointer 1:1 and tilts; release flies it on a spring ---- */
 let x0=null,p0=0,pid=null,moved=false,swallow=false,samples=[];
 const stepPx=()=>{const cs=csv(),w=innerWidth;return w<=650?Math.max(w,440*cs):(w<=1000?264:308)*cs;};
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||!isOpen()||busy)return;stop();vel=0;x0=e.clientX;p0=pos;pid=e.pointerId;moved=false;samples=[[performance.now(),pos]];});
 stage.addEventListener('pointermove',e=>{if(x0===null||e.pointerId!==pid)return;const dx=e.clientX-x0;
  if(!moved&&Math.abs(dx)>7){moved=true;try{stage.setPointerCapture(pid);}catch{}stage.classList.add('is-drag');goLive();}
  if(!moved)return;
  pos=clamp(p0-dx/stepPx(),p0-1.6,p0+1.6);dir=pos>p0?1:-1;
  const now=performance.now();samples.push([now,pos]);while(samples.length>2&&now-samples[0][0]>90)samples.shift();render();});
 const end=()=>{if(x0===null)return;const was=moved;x0=null;pid=null;stage.classList.remove('is-drag');if(was)swallow=true;setTimeout(()=>{swallow=false;},0);
  if(!was)return;
  const a=samples[0],b=samples[samples.length-1],v=b[0]>a[0]?clamp((b[1]-a[1])/((b[0]-a[0])/1000),-8,8):0,base=Math.round(p0);
  let t=Math.round(pos+v*.12);
  if(t===base&&(Math.abs(pos-base)>.22||Math.abs(v)>1.1))t=base+((v!==0?v:pos-base)>0?1:-1);
  t=clamp(t,base-2,base+2);
  if(calm()){target=t;settle();return;}
  target=t;vel=v;dir=t>=pos?1:-1;run();};
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
 stage.addEventListener('dragstart',e=>e.preventDefault());
 /* tap the deck: deal it. tap the centre card: open the passport. tap a side card: bring it to the centre */
 stage.addEventListener('click',e=>{const li=e.target.closest('.pm-item');if(!li)return;if(!isOpen()){e.preventDefault();deal();return;}
  if(swallow||moved){e.preventDefault();moved=false;return;}
  if(busy){e.preventDefault();return;}
  if(li.classList.contains('is-front')&&!raf)return;
  e.preventDefault();let kk=mod(cards.indexOf(li)-at,N);if(kk>N/2)kk-=N;if(kk)go(kk);});
 /* sheen + lit grain + tilt follow the mouse (touch and reduced motion stay flat) */
 let tx=0,ty=0,x=0,y=0,traf=0,cur=null;
 const front=()=>cards[mod(Math.round(target),N)],setL=(card,px,py)=>{for(const l of card.querySelectorAll('[data-pml]')){l.setAttribute('x',px.toFixed(0));l.setAttribute('y',py.toFixed(0));}};
 const loop=()=>{traf=0;const li=cur||front(),t=li.querySelector('.pm-tilt');x+=(tx-x)*.14;y+=(ty-y)*.14;
  t.style.transform=`rotateX(${(-y*13).toFixed(2)}deg) rotateY(${(x*13).toFixed(2)}deg)`;
  t.style.setProperty('--gx',Math.max(0,Math.min(100,(x+.5)*100)).toFixed(1)+'%');t.style.setProperty('--gy',Math.max(0,Math.min(100,(y+.5)*100)).toFixed(1)+'%');
  if(Math.abs(tx-x)>.002||Math.abs(ty-y)>.002)traf=requestAnimationFrame(loop);else if(!tx&&!ty)t.style.transform='';};
 const flat=()=>{tx=0;ty=0;(cur||front()).querySelector('.pm-tilt').classList.remove('is-tilt');if(!traf)traf=requestAnimationFrame(loop);};
 stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||calm()||!sec.classList.contains('is-dealt')||moved||raf)return;const li=front(),c=li.querySelector('.pm-tilt'),r=c.getBoundingClientRect();
  if(cur!==li){cur?.querySelector('.pm-tilt').classList.remove('is-tilt');cur?.querySelector('.pm-tilt').style.removeProperty('transform');cur=li;x=y=0;}
  const inside=e.clientX>=r.left-40&&e.clientX<=r.right+40&&e.clientY>=r.top-40&&e.clientY<=r.bottom+40;
  if(!inside){flat();return;}
  tx=Math.max(-.6,Math.min(.6,(e.clientX-r.left)/r.width-.5));ty=Math.max(-.6,Math.min(.6,(e.clientY-r.top)/r.height-.5));
  c.classList.add('is-tilt');const sc=r.width/c.offsetWidth||1;setL(c,(e.clientX-r.left)/sc,(e.clientY-r.top)/sc);if(!traf)traf=requestAnimationFrame(loop);});
 stage.addEventListener('pointerleave',flat);
 fitBands(sec);document.fonts?.ready.then(()=>fitBands(sec));
 addEventListener('resize',()=>{if(isOpen()&&!raf)render();});
 lay();
}
