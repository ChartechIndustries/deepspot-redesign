/* Shared passport editing pieces (2026-10-21): used by the edit-profile dialog (profile.js) and the /welcome/ onboarding.
   Archetype picker, bio look + passport style swatches, the passport card markup, live-preview sync, fit + tilt. */
import {cropFor} from './passport-art.mjs?v=89a3954f';
import {travelerStyles,travelerMark} from '../site/account-state.mjs?v=1c064097';
import {escapeHTML as esc} from './identity.mjs?v=744e89b9';

export const LOOK_KEY='deepspot-bio-look-v1',STYLE_KEY='deepspot-passport-style-v1';
export const LOOKS={bg:[['panel','plain'],['green','green'],['cobalt','cobalt'],['aqua','aqua'],['cream','paper'],['ink','ink']],font:[['display','bold'],['serif','serif'],['mono','type'],['hand','hand']],align:[['left','left'],['center','center']]};
export const ED_CK='<i class="ed-ck" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i>';
export const ED_LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
export const ED_ALIGN={left:'<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M6 6h30M6 14h22M6 22h34M6 30h16"/></svg>',center:'<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M9 6h30M13 14h22M7 22h34M16 30h16"/></svg>'};
export const STYLE={
 bg:[['halftone','earth halftone','',''],['dither-green','green dither','',''],['dither-cobalt','cobalt dither','',''],['night','night field','',''],['stars','starfield','',''],['aurora','aurora','',''],['dusk','dusk','',''],['grain','grain gradient','',''],['topo','topo lines','',''],['blueprint','blueprint','',''],['oya','oya quarry','',''],['xwejni','salt pans','',''],['green','green field','',''],['cobalt','cobalt field','',''],['paper','paper','','']],
 foil:[['none','none','',''],['holo','holo','',''],['gold','gold','',''],['chrome','chrome','',''],['cobalt','cobalt shine','','founding members'],['prism','prism','','reach level 10']]
};
/* bio look + passport style: saved choices (own=false returns the defaults) */
export function readLook(own=true){const d={bg:'panel',font:'display',align:'left'};if(!own)return d;try{const v=JSON.parse(localStorage.getItem(LOOK_KEY))||{};for(const k in d)if(LOOKS[k].some(([id])=>id===v[k]))d[k]=v[k];}catch{}return d;}
export function writeLook(v){try{localStorage.setItem(LOOK_KEY,JSON.stringify(v));return true;}catch{return false;}}
export function readStyle(own=true){const d={bg:'halftone',foil:'none'};if(!own)return d;try{const v=JSON.parse(localStorage.getItem(STYLE_KEY))||{};for(const k in d)if(STYLE[k].some(o=>o[0]===v[k]&&!o[3]))d[k]=v[k];}catch{}return d;}
export function writeStyle(v){try{localStorage.setItem(STYLE_KEY,JSON.stringify(v));return true;}catch{return false;}}

/* ---- archetype picker ---- */
export function archHTML(sel){
 const cur=travelerStyles.find(t=>t.id===sel)||travelerStyles[0];
 const opt=t=>`<label class="pp-arch-o" data-arch="${t.id}"><input type="radio" name="pp-arch" value="${t.id}"${t.id===cur.id?' checked':''} aria-describedby="pp-arch-d"><span>${travelerMark(t.id)}${esc(t.name.replace(/^the /,''))}</span></label>`;
 const groups=[...new Set(travelerStyles.map(t=>t.group))].map(g=>`<div class="pp-arch-g"><span class="pp-arch-gl">${esc(g)}</span><div class="pp-arch-row">${travelerStyles.filter(t=>t.group===g).map(opt).join('')}</div></div>`).join('');
 return `<fieldset class="pp-arch"><legend>traveler archetype</legend><div class="pp-arch-d" id="pp-arch-d" aria-live="polite">${archDesc(cur)}</div><div class="pp-arch-list">${groups}</div></fieldset>`;
}
export function archDesc(t){return `<span class="pp-arch-dm">${travelerMark(t.id)}</span><div><strong>${esc(t.name)}.</strong><p>${esc(t.description)}</p></div>`;}
/* hover / focus / selection drive the description box; returns {sel, show} */
export function wireArch(form){
 const box=form.querySelector('#pp-arch-d'),show=id=>{const t=travelerStyles.find(x=>x.id===id);if(t&&box)box.innerHTML=archDesc(t);},sel=()=>form.querySelector('[name=pp-arch]:checked')?.value;
 form.querySelectorAll('.pp-arch-o').forEach(o=>{o.addEventListener('pointerenter',()=>show(o.dataset.arch));o.addEventListener('pointerleave',()=>show(sel()));});
 form.addEventListener('focusin',e=>{if(e.target.name==='pp-arch')show(e.target.value);});
 form.addEventListener('change',e=>{if(e.target.name==='pp-arch')show(e.target.value);});
 return {sel,show};
}

/* big archetype cards (onboarding): one section per group; radios share the name pp-arch so the dialog's wireArch logic also works on them */
export function archCardsHTML(sel){
 const groups=[...new Set(travelerStyles.map(t=>t.group))];
 const card=t=>`<label class="ob-ac" data-arch="${t.id}" title="${esc(t.description)}"><input type="radio" name="pp-arch" value="${t.id}"${t.id===sel?' checked':''}><span class="ob-ac-i">${travelerMark(t.id)}</span><b>${esc(t.name.replace(/^the /,''))}</b><span class="ob-ac-d">${esc(t.description)}</span><i class="ed-ck" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i></label>`;
 return groups.map((g,i)=>`<section class="ob-ag" id="ob-ag-${i}" aria-labelledby="ob-agh-${i}" data-group="${esc(g)}"><h3 class="ob-ag-h" id="ob-agh-${i}">${esc(g)}</h3><div class="ob-ag-l">${travelerStyles.filter(t=>t.group===g).map(card).join('')}</div></section>`).join('');
}
export const archGroups=()=>[...new Set(travelerStyles.map(t=>t.group))];

/* ---- swatch tiles ---- */
const lt=(lk,k,id,l)=>`<label class="ed-tile ed-t-${k}" data-v="${id}"><input type="radio" name="pp-look-${k}" value="${id}"${lk[k]===id?' checked':''}><span class="ed-sw">${k==='align'?ED_ALIGN[id]:k==='font'?'Aa':''}</span><span class="ed-tl">${l}</span>${ED_CK}</label>`;
export const lookGroupHTML=(lk,k,title)=>`<fieldset class="ed-set"><legend>${title}</legend><div class="ed-tiles ed-tiles-${k}">${LOOKS[k].map(([id,l])=>lt(lk,k,id,l)).join('')}</div></fieldset>`;
export const lookTilesHTML=lk=>lookGroupHTML(lk,'bg','background')+lookGroupHTML(lk,'font','type')+lookGroupHTML(lk,'align','align');
export const styleGroupHTML=(st,k,title,hint)=>`<fieldset class="ed-set"><legend>${title}</legend><p class="ed-hint">${hint}</p><div class="ed-tiles ed-tiles-cz">${STYLE[k].map(([id,label,icon,lock])=>`<label class="ed-tile ed-t-cz pp-cz-${k}${lock?' is-locked':''}" data-v="${id}"><input type="radio" name="cz-${k}" value="${id}"${st[k]===id?' checked':''}${lock?' disabled':''}><span class="ed-sw pp-cz-sw">${icon}</span><span class="ed-tl">${label}</span>${lock?`<span class="ed-lock">${ED_LOCK}${lock}</span>`:''}${ED_CK}</label>`).join('')}</div></fieldset>`;
export const styleTilesHTML=st=>styleGroupHTML(st,'bg','left background','The field behind your passport.')+styleGroupHTML(st,'foil','passport foil','A finish on the card. Move your mouse over the preview.');
export const pickLook=form=>{const o={};for(const k of Object.keys(LOOKS))o[k]=form.querySelector(`[name=pp-look-${k}]:checked`)?.value;return o;};
export const pickStyle=(form,base=readStyle())=>{const st={...base};form.querySelectorAll('[name^=cz-]:checked').forEach(i=>st[i.name.slice(3)]=i.value);return st;};

/* ---- passport card ---- */
export const bump=(uid='pp')=>`<svg class="pp-bump" aria-hidden="true" preserveAspectRatio="none"><filter id="${uid}-bumpf" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="7" result="h"/><feSpecularLighting in="h" surfaceScale="2.2" specularConstant="1.1" specularExponent="18" lighting-color="#fff" result="s"><fePointLight data-pml id="${uid}-bumpl" x="200" y="-60" z="140"/></feSpecularLighting><feDiffuseLighting in="h" surfaceScale="2.2" diffuseConstant=".9" lighting-color="#fff" result="d"><fePointLight data-pml id="${uid}-bumpl2" x="200" y="-60" z="140"/></feDiffuseLighting><feComposite in="s" in2="d" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0"/></filter><rect width="100%" height="100%" filter="url(#${uid}-bumpf)"/></svg>`;
export const BUMP=bump();
const mrzPad=(t,n)=>(t+'<'.repeat(n)).slice(0,n);
const mrzName=n=>String(n||'').normalize('NFKD').replace(/[^\w ]/g,'').toUpperCase().trim().replace(/\s+/g,'<');
export function mrz(p,rank,lv){const l1=mrzPad('P<DSP'+mrzName(p.name)+'<<'+mrzName(p.handle||''),30),l2=mrzPad((rank?String(rank).padStart(3,'0'):'DRF')+'<'+mrzName(p.joined||'')+'<LVL'+String(lv?.level||1).padStart(2,'0')+'<'+mrzName(p.member||''),30);return `${esc(l1)}<br>${esc(l2)}`.replaceAll('<br>','\n').replace(/</g,'&lt;').replace(/\n/g,'<br>');}
export const moleImgHTML=(src,{cls='',alt=''}={})=>src?`<span class="pp-mole ${cls}" style="--mx:${cropFor(src).x};--my:${cropFor(src).y};--mw:${cropFor(src).w}"><img src="${esc(src)}" alt="${cls?'':esc(alt)}" ${cls?'aria-hidden="true"':''} width="512" height="512" decoding="async"></span>`:'';
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
export const stampSize=n=>{const w=Math.max(1,...String(n).split(/\s+/).map(x=>x.length));return w<=6?12:w<=8?10.5:w<=10?9:8;};
export const stampName=id=>(travelerStyles.find(x=>x.id===id)?.name||'explorer').replace(/^the /,'');
/* ---- archetype group colourway, per-person variety (pure functions of real data: archetype group, rank, id) ---- */
const GROUPS={'weird & alternative':'weird','nature & outdoors':'nature','history & culture':'history','food & drink':'food','nightlife & social':'night','science & tech':'science','art & design':'art','wellness & spirit':'spirit','extra':'extra'};
export const groupKey=id=>GROUPS[travelerStyles.find(x=>x.id===id)?.group]||'';
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
const INKS=['#2b4bd9','#c2352f','#0b7d36','#6a3fc9'];
const ordinal=n=>n+(['th','st','nd','rd'][n]||'th');
/* stamp ink + angle from the id hash, foil by rank (#1 gold, #2-3 chrome, the rest holo), a ribbon for the top three */
export function variety(id,rank){const h=hash(id||'?');return {ink:INKS[(h>>>3)%4],rot:-10-((h>>>6)%7),foil:rank===1?'gold':rank&&rank<=3?'chrome':'holo',rib:rank&&rank<=3?ordinal(rank):''};}
const STAR='<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><path d="M24 8v32M8 24h32M12.7 12.7l22.6 22.6m0-22.6L12.7 35.3"/></svg>';
export const crestHTML=arch=>arch?travelerMark(arch):STAR;
/* the photo-block content for any person (own, other, or no mole yet) */
export function moleSlotHTML({src,name,own=false}){
 if(src)return moleImgHTML(src,{alt:name+'’s mole'});
 const ini=String(name||'').split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
 return own?'<button type="button" class="pp-mole pp-mole-empty" data-set-roll><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg><span>roll your mole</span></button>':`<span class="pp-mole pp-mole-empty" role="img" aria-label="${esc(name)}’s initials"><b>${esc(ini||'?')}</b></span>`;
}
/* THE passport card. Used by the profile page, the edit-dialog preview, onboarding and the community deck.
   o: name, handle, joined, member, no (text for the red number), mole (html), lv, arch (archetype id, '' = none yet), stamp {name,sub},
      bio, bioEmpty, rib, ink, rot, noStamp, uid (unique id prefix for the grain filter), sigLabel, sig (html), mrz (html), nameId, sigId */
export function cardHTML(o){
 const lv=o.lv,g=groupKey(o.arch),bio=(o.bio||'').trim(),sty=(o.ink?`--st:${o.ink};`:'')+(o.rot!=null?`--sr:${o.rot}deg;`:'');
 return `<div class="pp-card pp-idcard pp-id9 pp-id9-tall"${g?` data-g="${g}"`:''}${sty?` style="${sty}"`:''}>${bump(o.uid||'pp')}<span class="pp-id9-wm" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg></span>
     <div class="pp-id-top"><span class="pp-id9-crest${o.arch?' is-arch':''}" aria-hidden="true">${crestHTML(o.arch)}</span><span class="pp-id9-title"><b>deepspot</b><i><span>explorer passport</span><span>pasaporte · パスポート</span></i></span><span class="pp-id9-no">${esc(o.no||'')}</span></div>
     <div class="pp-id-body"><div class="pp-molebox">${o.mole}${lv?`<span class="pp-lvl" role="img" aria-label="Level ${lv.level}"><b>${lv.level}</b><i>lvl</i></span>`:''}${o.rib?`<span class="pp-id9-rib" aria-hidden="true">${esc(o.rib)}</span>`:''}</div>
      <dl class="pp-rows"><div><dt>name</dt><dd${o.nameId?` id="${o.nameId}"`:''}>${esc(o.name)}</dd></div><div><dt>user</dt><dd>${o.handle?'@'+esc(o.handle):'—'}</dd></div><div><dt>since</dt><dd>${esc(o.joined||'—')}</dd></div><div><dt>level</dt><dd>${esc(o.member)}</dd></div></dl></div>
     <div class="pp-id9-bio"><span class="pp-id9-bio-t"><p${bio?'':' class="is-ph"'}>${esc(bio||o.bioEmpty||'no bio yet.')}</p></span></div>
     <div class="pp-sig pp-id9-sig"${o.sigId?` id="${o.sigId}"`:''}><span class="pp-sig-l">${esc(o.sigLabel)}</span>${o.sig}</div>
     ${lv?`<div class="pp-prog"><div class="pp-bar4" role="progressbar" aria-label="Progress to level ${lv.level+1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lv.pct}"><i style="width:${Math.max(lv.pct,2)}%"></i></div><span>${fmt(lv.points)} / ${fmt(lv.to)} pts</span></div>`:''}
     <span class="pp-readable-code pp-id9-mrz" aria-hidden="true">${o.mrz}</span>
     <span class="pp-id9-stamp${o.noStamp?' is-ph':''}" aria-hidden="true"><b style="font-size:${stampSize(o.stamp.name)}px">${esc(o.stamp.name)}</b><i>${esc(o.stamp.sub)}</i></span></div>`;
}
/* v2.3: a long name / @username / type shrinks (down to 14px) to fit its row; the CSS ellipsis is the last resort. Call when laid out. */
export function fitRowText(dd,min=14){
 if(!dd||!dd.clientWidth)return;
 dd.style.fontSize='';const base=parseFloat(getComputedStyle(dd).fontSize)||17;
 for(let sz=base;sz>=min;sz-=.5){if(sz<base)dd.style.fontSize=sz+'px';if(dd.scrollWidth<=dd.clientWidth+.5)break;}
}
export const fitRows=root=>root?.querySelectorAll('.pp-rows dd').forEach(d=>fitRowText(d));
/* fit every bio band inside a root (call once the card is laid out) */
export const fitBands=root=>root.querySelectorAll('.pp-id9-bio-t>p').forEach(fitBandText);
/* v2.2: the taller card with a full-width bio band between the photo block and the mark line (edit-dialog preview; onboarding builds its own slot band) */
export function addBioBand(card){
 card.classList.add('pp-id9-tall');
 if(card.querySelector('.pp-id9-bio'))return;
 card.querySelector('.pp-id-body')?.insertAdjacentHTML('afterend','<div class="pp-id9-bio" aria-hidden="true"><span class="pp-id9-bio-t"><p class="is-ph"></p></span></div>');
}
/* biggest size that fits the band (19 -> 11px), never cut mid-word; an ellipsis only as the last resort */
export function fitBandText(p){
 const box=p.parentElement;if(!box||!box.clientHeight)return;
 const cs=getComputedStyle(box),avail=box.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
 p.style.display='block';p.style.webkitLineClamp='none';let sz=19;
 for(;sz>=11;sz-=.5){p.style.fontSize=sz+'px';if(p.scrollHeight<=avail+.5&&p.scrollWidth<=p.clientWidth+1)break;}
 if(sz<11){p.style.fontSize='11px';p.style.display='-webkit-box';p.style.webkitBoxOrient='vertical';p.style.webkitLineClamp=String(Math.max(1,Math.floor(avail/(11*1.22))));}
}
/* bio-look chip shown under the preview card */
export const biopHTML=lk=>`<div class="ed-biop" data-bg="${lk.bg}" data-font="${lk.font}" data-align="${lk.align}"><b class="ed-bn"></b><span class="ed-bh"></span><p class="ed-bt"></p></div>`;

/* ---- live preview sync: card text, foil, background, bio chip. v = {name, username, bio, arch, foil, bg, look}; keys that are missing are left alone ---- */
export function syncPreview({stage,pobj,biop},v,{empty='—'}={}){
 const c=pobj?.querySelector('.pp-id9');
 if(c){
  const dd=c.querySelectorAll('.pp-rows dd'),nm=(v.name??'').trim(),un=(v.username??'').trim().replace(/^@/,'');
  if('name' in v&&dd[0]){dd[0].textContent=nm||empty;dd[0].classList.toggle('is-ph',!nm);}
  if('username' in v&&dd[1]){dd[1].textContent=un?'@'+un:empty;dd[1].classList.toggle('is-ph',!un);}
  if('name' in v||'username' in v)fitRows(c);
  if(v.arch!==undefined){const sb=c.querySelector('.pp-id9-stamp b');if(sb){const t=v.arch?stampName(v.arch):'explorer';sb.textContent=t;sb.style.fontSize=stampSize(t)+'px';}c.querySelector('.pp-id9-stamp')?.classList.toggle('is-ph',!v.arch);
   const cr=c.querySelector('.pp-id9-crest');if(cr){cr.innerHTML=crestHTML(v.arch);cr.classList.toggle('is-arch',!!v.arch);}const gk=groupKey(v.arch);if(gk)c.dataset.g=gk;else delete c.dataset.g;}
 }
 if('bio' in v&&c){const bp=c.querySelector('.pp-id9-bio-t>p');if(bp){const b=(v.bio||'').trim();bp.textContent=b||'say hi. a few lines about you.';bp.classList.toggle('is-ph',!b);fitBandText(bp);}}
 if(v.foil!==undefined&&pobj)pobj.dataset.foil=v.foil;
 if(v.bg!==undefined&&stage)stage.dataset.bg=v.bg;
 if(biop){
  if(v.look)for(const k of Object.keys(LOOKS))if(v.look[k])biop.dataset[k]=v.look[k];
  if('name' in v)biop.querySelector('.ed-bn').textContent=(v.name||'').trim()||'your name';
  if('username' in v){const un=(v.username||'').trim().replace(/^@/,'');biop.querySelector('.ed-bh').textContent=un?'@'+un:'@username';}
  if('bio' in v){const bt=biop.querySelector('.ed-bt'),b=(v.bio||'').trim();bt.textContent=b||'your bio shows here.';bt.classList.toggle('is-empty',!b);}
 }
}
/* scale the 440px card to the stage. els: {stage, cardw, scale, card, biop}; reserve = extra px kept free under the card */
export function fitPreview({stage,cardw,scale,card,biop},{reserve=150,padW=56,maxScale=1,byHeight=true}={}){
 const c=card;if(!c)return 1;scale.style.transform='none';
 const nh=c.offsetHeight||620,pw=stage.clientWidth-padW,ph=stage.clientHeight-(biop?biop.offsetHeight:0)-reserve;
 const s=Math.max(.3,Math.min(pw/440,byHeight?ph/nh:9,maxScale));
 scale.style.transform=`scale(${s.toFixed(4)})`;cardw.style.width=(440*s).toFixed(1)+'px';cardw.style.height=(nh*s).toFixed(1)+'px';return s;
}
/* mouse-only hover tilt */
export function bindTilt(stage,cardw,pobj){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=cardw.getBoundingClientRect(),x=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));pobj.style.transform=`perspective(1600px) rotateX(${(-y*9).toFixed(2)}deg) rotateY(${(x*11).toFixed(2)}deg)`;pobj.style.setProperty('--gx',((x+.5)*100).toFixed(1)+'%');pobj.style.setProperty('--gy',((y+.5)*100).toFixed(1)+'%');});
 stage.addEventListener('pointerleave',()=>{pobj.style.transform='';});
}

/* ---- 4.2 (2026-10-23): the passport tilts with the phone ----
   bindDeviceTilt({obj, host, persp}) -> {destroy}
   obj  : the element that leans (the .pp-passobj-in / .pm-tilt box), or a function returning it (deck: the front card). It gets
          rotateX/Y (max 8 deg, eased 0.12 per frame), --gx/--gy (the same light the pointer drives) and .is-tilt, and every
          [data-pml] light inside it moves. host: where the "tilt to shine" chip goes (iOS asks for permission on a tap).
   Off for reduced motion, for mouse-only devices, while the tab is hidden or the object is off screen. One shared sensor listener.
   The first real tilt sweeps the holo once across the card. Unsupported or denied: nothing changes, no chip. */
const TILT_MAX=8,TILT_RANGE=24,TILT_SMOOTH=.12,TILT_KEY='deepspot-tilt-v1';
const dev={on:false,got:false,listening:false,b0:null,g0:null,x:0,y:0,subs:new Set()};
const tiltOK=()=>typeof window!=='undefined'&&'DeviceOrientationEvent' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(pointer: coarse), (hover: none)').matches;
const needsAsk=()=>typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function onOrient(e){
 if(e.beta==null||e.gamma==null)return;
 dev.got=true;
 if(dev.b0===null){dev.b0=e.beta;dev.g0=e.gamma;}
 /* the rest pose follows slowly (about 4 s), so any way of holding the phone becomes "flat" */
 dev.b0+=(e.beta-dev.b0)*.004;dev.g0+=(e.gamma-dev.g0)*.004;
 const db=e.beta-dev.b0,dg=e.gamma-dev.g0,a=((screen.orientation?.angle??window.orientation??0)%360+360)%360;
 let x,y;
 if(a===90){x=db;y=-dg;}else if(a===270){x=-db;y=dg;}else if(a===180){x=-dg;y=-db;}else{x=dg;y=db;}
 dev.x=clamp(x/TILT_RANGE,-1,1);dev.y=clamp(y/TILT_RANGE,-1,1);
 dev.subs.forEach(s=>s.wake());
}
function startSensor(){if(dev.listening)return;dev.listening=true;dev.on=true;addEventListener('deviceorientation',onOrient,true);}
export function bindDeviceTilt({obj,host,persp=1600}={}){
 if(!tiltOK()||!obj)return {destroy(){}};
 const get=typeof obj==='function'?obj:()=>obj;
 const hideChip=()=>{chip?.remove();chip=null;};
 let x=0,y=0,raf=0,visible=true,last=null,chip=null,sweepT=null,sweptOnce=false,lx=-99,ly=-99,lt=0,dead=false;
 const reset=el=>{if(!el)return;el.style.transform='';el.style.removeProperty('--gx');el.style.removeProperty('--gy');el.classList.remove('is-tilt');};
 const active=()=>!dead&&dev.on&&dev.got&&visible&&document.visibilityState==='visible';
 const light=(el,gx,gy,now)=>{const card=el.querySelector('.pp-id9')||el,w=card.offsetWidth||440,h=card.offsetHeight||620,px=gx/100*w,py=gy/100*h;
  /* the bump light is an SVG filter: slow to repaint on phones, so it moves at most ~10 times a second and only by 10 px or more */
  if(now-lt<100||(Math.abs(px-lx)<10&&Math.abs(py-ly)<10))return;lt=now;lx=px;ly=py;for(const l of el.querySelectorAll('[data-pml]')){l.setAttribute('x',px.toFixed(0));l.setAttribute('y',py.toFixed(0));}};
 const frame=now=>{
  raf=0;if(!active())return;
  const el=get();if(!el)return;
  if(last&&last!==el)reset(last);last=el;
  x+=(dev.x-x)*TILT_SMOOTH;y+=(dev.y-y)*TILT_SMOOTH;
  let gx=50+x*50,gy=50+y*50;
  if(!sweptOnce&&Math.hypot(dev.x,dev.y)>.14&&el.dataset.foil&&el.dataset.foil!=='none'){sweptOnce=true;sweepT=now;}
  if(sweepT!==null){const t=(now-sweepT)/900;if(t>=1)sweepT=null;else{const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;gx=-10+e*120;}}
  el.style.transform=`${persp?`perspective(${persp}px) `:''}rotateX(${(-y*TILT_MAX).toFixed(3)}deg) rotateY(${(x*TILT_MAX).toFixed(3)}deg)`;
  el.style.setProperty('--gx',clamp(gx,-10,110).toFixed(1)+'%');el.style.setProperty('--gy',clamp(gy,0,100).toFixed(1)+'%');
  el.classList.add('is-tilt');light(el,clamp(gx,0,100),gy,now);
  if(Math.abs(dev.x-x)>.002||Math.abs(dev.y-y)>.002||sweepT!==null)raf=requestAnimationFrame(frame);
 };
 const sub={wake(){if(chip&&dev.got)hideChip();if(!raf&&active())raf=requestAnimationFrame(frame);}};
 dev.subs.add(sub);
 const io='IntersectionObserver' in window&&host?new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(!visible)reset(last);else sub.wake();},{threshold:.1}):null;io?.observe(host);
 const vis=()=>{if(document.visibilityState==='hidden')reset(last);else sub.wake();};document.addEventListener('visibilitychange',vis);
  const showChip=()=>{
  if(chip||!host||dead)return;
  chip=document.createElement('button');chip.type='button';chip.className='pp-tiltchip';chip.innerHTML='tilt to shine <i aria-hidden="true">&#10022;</i>';
  chip.addEventListener('click',async()=>{
   try{const r=await DeviceOrientationEvent.requestPermission();
    if(r==='granted'){try{localStorage.setItem(TILT_KEY,'granted');}catch{}startSensor();hideChip();}
    else{try{localStorage.setItem(TILT_KEY,'denied');}catch{}hideChip();}}
   catch{hideChip();}
  });
  host.appendChild(chip);
 };
 let stored='';try{stored=localStorage.getItem(TILT_KEY)||'';}catch{}
 if(needsAsk()){
  if(stored==='denied'){/* asked before, said no: stay quiet */}
  else{
   if(stored==='granted')startSensor();            /* iOS keeps the grant for the session; if no data arrives the chip comes back */
   setTimeout(()=>{if(!dev.got&&!dead)showChip();},stored==='granted'?900:0);
  }
 }else startSensor();                                  /* Android / others: no prompt */
 return {destroy(){dead=true;dev.subs.delete(sub);io?.disconnect();document.removeEventListener('visibilitychange',vis);hideChip();reset(last);}};
}
