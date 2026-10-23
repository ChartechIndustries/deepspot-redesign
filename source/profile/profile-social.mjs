/* Profile social layer (2026-10-21): follow + follower counts, and three passport lists.
   explored    = spots you have been to            (Atlas Obscura "been", renamed)
   picks       = spots you vouch for, with a reason (their "recommendations")
   collections = themed sets of spots               (their "lists")
   updates     = fixes to spot info, shown inside contributions (their "edited")
   There is no accounts backend yet: follows and lists are stored on this browser, like want-to-go.
   Other members show "not shared yet" until live accounts send this data. Counts never invent numbers. */
import {escapeHTML as esc} from './identity.mjs?v=38b679eb';

const KEY={follow:'deepspot-follows-v1',explored:'deepspot-explored-v1',picks:'deepspot-picks-v1',coll:'deepspot-collections-v1'};
const MAX={explored:200,picks:30,coll:12,collItems:40},NAME=60,WHY=120,TITLE=40;
const clean=(v,n)=>typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,n).trim():'';
const read=k=>{try{const v=JSON.parse(localStorage.getItem(KEY[k])||'[]');return Array.isArray(v)?v:[];}catch{return [];}};
const write=(k,v)=>{try{localStorage.setItem(KEY[k],JSON.stringify(v));return true;}catch{return false;}};
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const emptyBox=(t,s)=>`<div class="pp-empty"><strong>${t}</strong><span>${s}</span></div>`;

/* ---------- follow ---------- */
/* follow = a short, soft wobble of the whole page + a few hearts popping off the button (off for reduced motion) */
function cuteShake(btn){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const root=document.body;root.classList.remove('ps-shake');void root.offsetWidth;root.classList.add('ps-shake');
 setTimeout(()=>root.classList.remove('ps-shake'),700);
 btn.classList.remove('ps-pop');void btn.offsetWidth;btn.classList.add('ps-pop');
 const r=btn.getBoundingClientRect(),cols=['#07d653','#3c60ff','#e86a8f','#f2c94c','#83cdce'];
 for(let i=0;i<7;i++){const h=document.createElement('span');h.className='ps-heart';h.setAttribute('aria-hidden','true');h.textContent='♥';
  const a=(-160+i*(140/6))*Math.PI/180,d=46+Math.random()*30;
  h.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;color:${cols[i%cols.length]};--hx:${Math.cos(a)*d}px;--hy:${Math.sin(a)*d}px;--hr:${(Math.random()*40-20).toFixed(0)}deg`;
  document.documentElement.append(h);setTimeout(()=>h.remove(),900);}
}
export function followHTML(profile,own){
 const follows=read('follow').filter(x=>typeof x==='string'),on=follows.includes(profile.id);
 const followers=(Number.isFinite(profile.followers)?profile.followers:0)+(on&&!own?1:0);
 const following=own?follows.length:(Number.isFinite(profile.following)?profile.following:0);
 return `<div class="ps-follow"><p class="ps-counts"><span class="ps-c"><b data-ps-followers>${fmt(followers)}</b> ${followers===1?'follower':'followers'}</span><span aria-hidden="true">·</span><span class="ps-c"><b>${fmt(following)}</b> following</span></p>${own?'':`<button type="button" class="ps-followbtn" data-ps-follow aria-pressed="${on}">${on?'following ✓':'follow'}</button>`}</div>`;
}

/* ---------- lists ---------- */
function listForm(kind,label,ph,extra=''){
 return `<form class="ps-form" data-ps-form="${kind}" autocomplete="off" novalidate><label class="pp-mono" for="ps-in-${kind}">${label}</label><div class="ps-row"><input id="ps-in-${kind}" name="name" type="text" list="ps-spots" maxlength="${kind==='coll'?TITLE:NAME}" placeholder="${ph}" required>${extra}<button type="submit" class="pp-wtg-add">add</button></div><p class="pp-fine ps-msg" role="status" aria-live="polite"></p></form>`;
}
const rm=(kind,i,label,j='')=>`<button type="button" class="ps-x" data-ps-rm="${kind}" data-i="${i}"${j!==''?` data-j="${j}"`:''} aria-label="Remove ${esc(label)}">×</button>`;

function exploredBody(){
 const list=read('explored');
 if(!list.length)return emptyBox('nothing explored yet.','add a place you have been. it stays on this browser.');
 return `<p class="pp-mono ps-tally">${list.length} ${list.length===1?'place':'places'} explored</p><ul class="ps-list">${list.map((it,i)=>`<li><span>${esc(it.name)}</span>${rm('explored',i,it.name)}</li>`).join('')}</ul>`;
}
function picksBody(){
 const list=read('picks');
 if(!list.length)return emptyBox('no picks yet.','vouch for a spot and say why in one line.');
 return `<ul class="ps-cards">${list.map((it,i)=>`<li class="ps-card"><strong>${esc(it.name)}</strong>${it.why?`<p>“${esc(it.why)}”</p>`:''}${rm('picks',i,it.name)}</li>`).join('')}</ul>`;
}
function collBody(){
 const list=read('coll');
 if(!list.length)return emptyBox('no collections yet.','name a set, like “abandoned rail lines”, then add spots to it.');
 return `<ul class="ps-colls">${list.map((c,i)=>`<li class="ps-coll"><div class="ps-coll-h"><h4>${esc(c.title)} <span>(${c.items.length})</span></h4>${rm('coll',i,c.title)}</div>
  ${c.items.length?`<ul class="ps-list">${c.items.map((n,j)=>`<li><span>${esc(n)}</span>${rm('collitem',i,n,j)}</li>`).join('')}</ul>`:''}
  <form class="ps-form ps-form-sm" data-ps-form="collitem" data-i="${i}" autocomplete="off" novalidate><div class="ps-row"><input name="name" type="text" list="ps-spots" maxlength="${NAME}" placeholder="add a spot to this set" aria-label="Add a spot to ${esc(c.title)}" required><button type="submit" class="pp-chipbtn">add</button></div></form></li>`).join('')}</ul>`;
}
const BODY={explored:exploredBody,picks:picksBody,coll:collBody};
const notShared=what=>emptyBox(`no ${what} yet.`,'Lists are not shared from live accounts yet.');

export function exploredHTML(own){return own?listForm('explored','add a place you have been','a spot, a city, anywhere')+`<div data-ps-body="explored">${exploredBody()}</div>`:notShared('explored places');}
export function picksHTML(own){return own?listForm('picks','vouch for a spot','the spot',`<input name="why" type="text" maxlength="${WHY}" placeholder="why it is worth it, in one line" aria-label="Why it is worth it">`)+`<div data-ps-body="picks">${picksBody()}</div>`:notShared('picks');}
export function collectionsHTML(own){return own?listForm('coll','start a collection','name it, e.g. abandoned rail lines')+`<div data-ps-body="coll">${collBody()}</div>`:notShared('collections');}
export function updatesHTML(profile){
 const n=Array.isArray(profile.updates)?profile.updates.length:0;
 return n?`<ul class="ps-list">${profile.updates.map(u=>`<li><span>${esc(u.spot)} · ${esc(u.what)}</span></li>`).join('')}</ul>`:emptyBox('no updates yet.','fixes to spot info (hours, access, closed) will show here once edits go live.');
}
export const counts=own=>own?{explored:read('explored').length,picks:read('picks').length,coll:read('coll').length}:{};

/* ---------- wiring (call once per render) ---------- */
export function bindSocial(root,profile,own,spotTitles=[]){
 if(!document.getElementById('ps-spots')){const dl=document.createElement('datalist');dl.id='ps-spots';document.body.append(dl);}
 document.getElementById('ps-spots').innerHTML=spotTitles.slice(0,400).map(t=>`<option value="${esc(t)}">`).join('');
 const refresh=k=>{const box=root.querySelector(`[data-ps-body="${k}"]`);if(box)box.innerHTML=BODY[k]();const tab=root.querySelector(`.pp-vtab[data-vt="${k}"] span`),c=counts(own)[k];if(tab)tab.textContent=c||'';else if(c){const b=root.querySelector(`.pp-vtab[data-vt="${k}"]`);if(b)b.insertAdjacentHTML('beforeend',` <span>${c}</span>`);}};
 if(root.dataset.psBound)return;root.dataset.psBound='1';
 root.addEventListener('click',e=>{
  const f=e.target.closest('[data-ps-follow]');
  if(f){let list=read('follow').filter(x=>typeof x==='string');const on=!list.includes(profile.id);list=on?[...list,profile.id]:list.filter(x=>x!==profile.id);write('follow',list);
   f.setAttribute('aria-pressed',String(on));f.textContent=on?'following ✓':'follow';
   if(on)cuteShake(f);
   const b=root.querySelector('[data-ps-followers]');if(b){const n=(Number.isFinite(profile.followers)?profile.followers:0)+(on?1:0);b.textContent=fmt(n);b.nextSibling.textContent=n===1?' follower':' followers';}return;}
  const x=e.target.closest('[data-ps-rm]');
  if(x){const k=x.dataset.psRm,i=+x.dataset.i;
   if(k==='collitem'){const l=read('coll');l[i].items.splice(+x.dataset.j,1);write('coll',l);refresh('coll');}
   else{const l=read(k);l.splice(i,1);write(k,l);refresh(k);}}
 });
 root.addEventListener('submit',e=>{
  const form=e.target.closest('[data-ps-form]');if(!form)return;e.preventDefault();
  const k=form.dataset.psForm,msg=form.querySelector('.ps-msg'),say=t=>{if(msg)msg.textContent=t;};
  const name=clean(form.elements.name.value,k==='coll'?TITLE:NAME);if(!name){say('type a name first.');return;}
  if(k==='collitem'){const l=read('coll'),c=l[+form.dataset.i];if(!c)return;if(c.items.some(n=>n.toLowerCase()===name.toLowerCase()))return;if(c.items.length>=MAX.collItems)return;c.items.push(name);write('coll',l);refresh('coll');root.querySelector(`[data-ps-form="collitem"][data-i="${form.dataset.i}"] input`)?.focus();return;}
  const l=read(k),key=it=>(it.name||it.title||'').toLowerCase();
  if(l.some(it=>key(it)===name.toLowerCase())){say('already on this list.');return;}
  if(l.length>=MAX[k]){say('this list is full.');return;}
  l.push(k==='picks'?{name,why:clean(form.elements.why?.value,WHY)}:k==='coll'?{title:name,items:[]}:{name});
  if(!write(k,l)){say('could not save on this browser.');return;}
  form.reset();say('saved on this browser.');refresh(k);form.elements.name.focus();
 });
}
