import {esc} from './core.mjs';
import {profileHref,profileId} from '../profile/identity.mjs';
import {travelerStyles} from './account-state.mjs?v=icons2';
import {cardHTML,mrz,moleSlotHTML,stampName,variety,fitBands} from '../profile/passport-edit.mjs?v=r22a';
import {levelFor,memberLevel,travelerType,standing} from '../profile/passport-rules.mjs?v=pv2';
import {normalizedTags} from '../browse/catalog.mjs';

/* Community "participants" passports (2026-10-21). A smaller, independent copy of the profile v11 ID card (pm- classes).
   v3.1: deck -> carousel on scroll, portrait 5:7 card, archetype header, per-card variation from archetype group / rank / id hash (no randomness).
   Real data only: leaderboard + profiles.json + the catalog. A row is left out when its value is not known. */
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- data: the same values the profile page shows ---------- */
export function passportModels(data,monthly){
 const profiles=data.profiles||[],catalog=(data.raw||[]).filter(s=>s.id?.startsWith('/blog/')&&s.title&&!s.title.startsWith('PART OF:')),stories=data.stories||[],lb=data.content.leaderboard;
 const find=name=>profiles.find(p=>p.name===name||(p.aliases||[]).some(a=>profileId(a)===profileId(name)));
 return monthly.map(r=>{
  const p=find(r.name),id=p?.id||profileId(r.name),name=p?.name||r.name,aliases=[name,...(p?.aliases||[])],ids=new Set(aliases.map(n=>n.toLowerCase()));
  const records=[...catalog.filter(s=>ids.has(s.publisher?.toLowerCase())).map(s=>({kind:'spot',tags:normalizedTags(s.tags)})),...stories.filter(s=>ids.has(s.author?.toLowerCase())).map(s=>({kind:'story',tag:s.tag}))];
  const stand=standing(lb,aliases),lv=stand?levelFor(stand.points):null,type=travelerType(records);
  const style=travelerStyles.find(x=>x.id===type.id);
  return {id,name,handle:p?.handle||null,joined:p?.joined||null,mole:p&&!p.sample?`/community-assets/moles/${id}.webp`:'',rank:stand?.rankAll||null,lv,member:lv?memberLevel(lv.level):null,typeId:style?.id||null,arch:style?.name||null,group:style?.group||null,signature:p?.signatureArt||null,bio:p?.bio||null,href:profileHref(id)};
 });
}

/* ---------- card: the shared passport (profile/passport-edit.mjs), the same thing the profile page shows ---------- */
const RANKC=['#07d653','#3c60ff','#f2c14e'];
const sigImg=m=>m.signature?`<img src="${esc(m.signature)}" alt="" width="512" height="256" loading="lazy" decoding="async">`:'<span>no mark yet</span>';
export function passportHTML(m,i){
 const v=variety(m.id,m.rank),dx=((i*3)%5-2)*4,dy=((i*7)%5-2)*3,dr=((i*5)%7-3);
 const card=cardHTML({uid:'pc'+i,no:m.rank?'no. '+String(m.rank).padStart(3,'0'):'',mole:moleSlotHTML({src:m.mole,name:m.name}),lv:m.lv,arch:m.typeId||'',stamp:{name:stampName(m.typeId||''),sub:m.member||'contributor'},bio:m.bio,bioEmpty:'no bio yet.',ink:v.ink,rot:v.rot,rib:v.rib,
  name:m.name,handle:m.handle,joined:m.joined,member:m.member||'contributor',sigLabel:'their mark',sig:sigImg(m),mrz:mrz({name:m.name,handle:m.handle,joined:m.joined,member:m.member},m.rank,m.lv)});
 return `<li class="pm-item" data-pm-i="${i}" style="--i:${i};--dx:${dx}px;--dy:${dy}px;--dr:${dr}deg"><a class="pm-link" href="${esc(m.href)}" aria-label="${esc(m.name)}’s passport" draggable="false"><div class="pm-tilt pp-passobj-in" data-foil="${v.foil}" style="--pf:${m.rank&&m.rank<=3?RANKC[m.rank-1]:'#dfe6e4'}">${card}</div></a></li>`;
}

/* ---------- section ---------- */
export function participantsHTML(models){
 const f=models[0],N=models.length;
 return `<section class="pm pp-main" id="cv-pt" aria-labelledby="cv-ptt" aria-roledescription="carousel" data-pm>
 <div class="pm-wrap"><div class="pm-stage" data-pm-stage role="group" aria-label="Participant passports"><ul class="pm-deck" data-pm-deck>${models.map(passportHTML).join('')}</ul></div>
 <div class="pm-hero" data-pm-hero><h2 id="cv-ptt">participants<span>.</span></h2><p class="pm-sub">${N} ${N===1?'explorer':'explorers'} in this month’s race</p></div></div>
 <div class="pm-ctl"><button type="button" class="pm-btn" data-pm-prev aria-label="Previous participant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><p class="pm-count" aria-hidden="true"><b data-pm-n>1</b> / ${N}</p><button type="button" class="pm-btn" data-pm-next aria-label="Next participant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><a class="pm-open" data-pm-open href="${esc(f.href)}">${esc(f.name)}’s passport ↗</a></div>
 <p class="cv-sr" role="status" aria-live="polite" data-pm-live></p></section>`;
}

export function wirePassports(sec,models){
 const deck=sec.querySelector('[data-pm-deck]'),stage=sec.querySelector('[data-pm-stage]'),cards=[...deck.children],N=cards.length,open=sec.querySelector('[data-pm-open]'),num=sec.querySelector('[data-pm-n]'),live=sec.querySelector('[data-pm-live]');
 let at=0,first=true;
 const isOpen=()=>sec.classList.contains('is-open');
 const lay=()=>{
  cards.forEach((li,i)=>{let k=((i-at)%N+N)%N;if(k>N/2)k-=N;const a=Math.abs(k);
   li.style.setProperty('--k',k);li.style.setProperty('--a',a);li.style.setProperty('--zi',isOpen()?50-a:N-i);
   li.classList.toggle('is-front',k===0);li.classList.toggle('is-off',a>3);li.classList.toggle('is-one',a>0);
   const link=li.firstElementChild;link.tabIndex=k===0?0:-1;li.setAttribute('aria-hidden',k===0?'false':'true');
   if(k!==0){li.querySelector('.pm-tilt').style.transform='';}});
  const m=models[at];open.href=m.href;open.textContent=`${m.name}’s passport ↗`;num.textContent=at+1;
  if(!first&&isOpen())live.textContent=`${m.name}, passport ${at+1} of ${N}`;first=false;
 };
 /* deck -> carousel: the title fades, the cards deal out of the stack with a stagger */
 const deal=()=>{
  if(isOpen())return;
  if(calm()){sec.classList.add('is-open','is-dealt');lay();return;}
  cards.forEach((li,i)=>{let k=((i-at)%N+N)%N;if(k>N/2)k-=N;li.style.setProperty('--dl',Math.abs(k)*50+(k<0?25:0));});
  sec.classList.remove('is-stacking');sec.classList.add('is-open','is-dealing');lay();
  clearTimeout(deal.t);deal.t=setTimeout(()=>{if(isOpen()){sec.classList.remove('is-dealing');sec.classList.add('is-dealt');}},1500);
 };
 /* back to the deck (title on top) when the section is not in view, not hovered and has no focus */
 const stack=()=>{
  if(!isOpen()||calm())return;
  cards.forEach((li,i)=>{let k=((i-at)%N+N)%N;if(k>N/2)k-=N;li.style.setProperty('--dl',(3-Math.min(3,Math.abs(k)))*40);});
  sec.classList.remove('is-open','is-dealt','is-dealing');sec.classList.add('is-stacking');lay();
  clearTimeout(stack.t2);stack.t2=setTimeout(()=>sec.classList.remove('is-stacking'),1100);
 };
 let seen=false,hover=false;
 const want=()=>seen||hover||sec.contains(document.activeElement);
 const sync=()=>{clearTimeout(sync.t);if(want()){deal();return;}sync.t=setTimeout(()=>{if(!want())stack();},700);};
 /* start watching only once the page above has settled (the hero renders after this section), else it deals on load */
 const watch=()=>new IntersectionObserver(es=>{seen=es[es.length-1].isIntersecting;sync();},{threshold:.4}).observe(sec);
 if('IntersectionObserver' in window){let y=NaN,still=0,t0=performance.now();const settle=()=>{const top=sec.getBoundingClientRect().top+scrollY;still=Math.abs(top-y)<1?still+1:0;y=top;if(still>=18||performance.now()-t0>4000)watch();else requestAnimationFrame(settle);};requestAnimationFrame(settle);}else deal();
 sec.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;sync();}});
 sec.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hover=false;sync();}});
 sec.addEventListener('focusin',sync);sec.addEventListener('focusout',()=>setTimeout(sync,0));
 const go=d=>{if(!isOpen()){deal();return;}at=((at+d)%N+N)%N;lay();};
 sec.querySelector('[data-pm-prev]').onclick=()=>go(-1);sec.querySelector('[data-pm-next]').onclick=()=>go(1);
 /* arrow keys anywhere inside the section */
 sec.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();go(e.key==='ArrowRight'?1:-1);if(sec.contains(document.activeElement)&&document.activeElement.closest('.pm-link'))cards[at].firstElementChild.focus({preventScroll:true});});
 /* drag or swipe sideways; a drag never counts as a tap */
 let x0=null,moved=false,pid=null,swallow=false;const step=()=>Math.max(60,cards[at].getBoundingClientRect().width*.5);
 stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;x0=e.clientX;moved=false;pid=e.pointerId;});
 stage.addEventListener('pointermove',e=>{if(x0===null||e.pointerId!==pid||!isOpen())return;const dx=e.clientX-x0;
  if(!moved&&Math.abs(dx)>8){moved=true;try{stage.setPointerCapture(pid);}catch{}stage.classList.add('is-drag');}
  if(moved&&Math.abs(dx)>=step()){go(dx<0?1:-1);x0=e.clientX;}});
 const end=()=>{if(moved)swallow=true;x0=null;pid=null;stage.classList.remove('is-drag');setTimeout(()=>{swallow=false;},0);};
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
 stage.addEventListener('dragstart',e=>e.preventDefault());
 /* tap the deck: deal it. tap the centre card: open the passport. tap a side card: bring it to the centre */
 stage.addEventListener('click',e=>{const li=e.target.closest('.pm-item');if(!li)return;if(!isOpen()){e.preventDefault();deal();return;}
  if(swallow||moved){e.preventDefault();moved=false;return;}
  if(li.classList.contains('is-front'))return;e.preventDefault();at=cards.indexOf(li);lay();});
 /* sheen + lit grain + tilt follow the mouse (touch and reduced motion stay flat) */
 let tx=0,ty=0,x=0,y=0,raf=0,cur=null;
 const front=()=>cards[at],setL=(card,px,py)=>{for(const l of card.querySelectorAll('[data-pml]')){l.setAttribute('x',px.toFixed(0));l.setAttribute('y',py.toFixed(0));}};
 const loop=()=>{raf=0;const li=front(),t=li.querySelector('.pm-tilt');x+=(tx-x)*.14;y+=(ty-y)*.14;
  t.style.transform=`rotateX(${(-y*13).toFixed(2)}deg) rotateY(${(x*13).toFixed(2)}deg)`;
  t.style.setProperty('--gx',Math.max(0,Math.min(100,(x+.5)*100)).toFixed(1)+'%');t.style.setProperty('--gy',Math.max(0,Math.min(100,(y+.5)*100)).toFixed(1)+'%');
  if(Math.abs(tx-x)>.002||Math.abs(ty-y)>.002)raf=requestAnimationFrame(loop);else if(!tx&&!ty)t.style.transform='';};
 stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||calm()||!sec.classList.contains('is-dealt')||x0!==null&&moved)return;const li=front(),c=li.querySelector('.pm-tilt'),r=c.getBoundingClientRect();
  if(cur!==li){cur?.querySelector('.pm-tilt').classList.remove('is-tilt');cur=li;}
  const inside=e.clientX>=r.left-40&&e.clientX<=r.right+40&&e.clientY>=r.top-40&&e.clientY<=r.bottom+40;
  if(!inside){tx=0;ty=0;c.classList.remove('is-tilt');if(!raf)raf=requestAnimationFrame(loop);return;}
  tx=Math.max(-.6,Math.min(.6,(e.clientX-r.left)/r.width-.5));ty=Math.max(-.6,Math.min(.6,(e.clientY-r.top)/r.height-.5));
  c.classList.add('is-tilt');const sc=r.width/c.offsetWidth||1;setL(c,(e.clientX-r.left)/sc,(e.clientY-r.top)/sc);if(!raf)raf=requestAnimationFrame(loop);});
 stage.addEventListener('pointerleave',()=>{tx=0;ty=0;front().querySelector('.pm-tilt').classList.remove('is-tilt');if(!raf)raf=requestAnimationFrame(loop);});
 fitBands(sec);document.fonts?.ready.then(()=>fitBands(sec));
 lay();
}
