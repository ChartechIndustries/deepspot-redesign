import {moleCrop} from './passport-art.mjs?v=pad1';
import {createPassportImage} from './passport-export.mjs?v=pv3';
import {padHTML,initPad} from './sign-pad.mjs?v=pv3';
import {travelerStyles,travelerMark,accountKey,readAccount,normalizeAccount} from '../site/account-state.mjs?v=pad1';
import {memberLevels,memberRange,POINTS} from './passport-rules.mjs?v=pv2';
import {escapeHTML as esc,safeReturn} from './identity.mjs';
import {loadProfile} from './data.mjs?v=pv3';
import {halftoneField} from '../site/halftone-field.mjs?v=2';
import {mountGlobe} from './wtg-globe.mjs?v=wg9';
import {itemsFor} from './items.mjs?v=it1';
import {followHTML,exploredHTML,picksHTML,collectionsHTML,updatesHTML,counts as psCounts,bindSocial} from './profile-social.mjs?v=ps3';
import {readWantToGo,writeWantToGo,addItem,removeAt,moveItem,WTG_MAX,WTG_NAME_MAX} from './want-to-go.mjs?v=wtg1';
const $=selector=>document.querySelector(selector);
let profile,toastTimer,exportPromise,exportImage;
const params=new URLSearchParams(location.search);
const returnPath=safeReturn(params.get('from'))||'/community/';
const returnURL=new URL(returnPath,location.origin);
const returnLabel=returnURL.pathname==='/account/'?'back to account':returnURL.pathname==='/story/'?'back to story':returnURL.pathname==='/spot/'?'back to spot':returnURL.pathname==='/stories/'?'back to stories':returnURL.pathname==='/leaderboard/'?'back to leaderboard':returnURL.pathname==='/browse/'?'back to browse':returnURL.hash==='#stories'?'back to stories':returnURL.hash==='#fs-heading'?'back to deep spots':returnURL.hash==='#wn-heading'?'back to what’s new':'community';
$('.pp-back').textContent='← '+returnLabel;
function notify(text){clearTimeout(toastTimer);$('.br-toast').textContent=text;$('.br-toast').dataset.open='true';toastTimer=setTimeout(()=>$('.br-toast').dataset.open='false',3000);}
function applyTheme(value){
 document.documentElement.dataset.theme=value;try{localStorage.setItem('deepspot-theme',value);}catch{}
 const light=value==='light';$('.br-theme').textContent=light?'☾ dark':'☼ light';$('.br-theme').setAttribute('aria-label',`Switch to ${light?'dark':'light'} mode`);
 const url=new URL(location.href);url.searchParams.set('theme',value);history.replaceState(null,'',url);
 document.querySelectorAll('a[href]').forEach(a=>{const dest=new URL(a.href);if(dest.origin===location.origin&&['/','/browse/'].includes(dest.pathname)){dest.searchParams.set('theme',value);a.href=dest.pathname+dest.search+dest.hash;}});
 returnURL.searchParams.set('theme',value);$('.pp-back').href=returnURL.pathname+returnURL.search+returnURL.hash;
}
applyTheme(document.documentElement.dataset.theme);
$('.br-theme').addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
$('.br-menu').addEventListener('click',()=>{const open=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!open;$('.br-menu').setAttribute('aria-expanded',String(open));$('.br-menu').setAttribute('aria-label',open?'Close navigation':'Open navigation');$('.br-menu').textContent=open?'×':'☰';if(open)$('#mobile-nav a').focus();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#mobile-nav').hidden){$('.br-menu').click();$('.br-menu').focus();}});
function profileURL(){const url=new URL('/profile/',location.origin);url.searchParams.set('user',profile.id);return url.href;}
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const RANKC=['#07d653','#3c60ff','#f2c14e'],CATS=['#3c60ff','#07d653','#f2c14e','#e57a8a','#b69cff','#6fa8dc'];
const sec=(id,label,count,body,act='')=>`<section class="pp-sec" aria-labelledby="pp-${id}"><header class="pp-bar"><h2 id="pp-${id}">${label}${count==null?'':` <span>(${count})</span>`}</h2>${act}</header><div class="pp-body">${body}</div></section>`;
const empty=(title,text,link='')=>`<div class="pp-empty"><strong>${title}</strong><span>${text}</span>${link}</div>`;
const moleHTML=(cls='')=>profile.mole?`<span class="pp-mole ${cls}" style="--mx:${moleCrop.x};--my:${moleCrop.y};--mw:${moleCrop.w}"><img src="${esc(profile.mole)}" alt="${cls?'':esc(profile.name)+'’s mole'}" ${cls?'aria-hidden="true"':''} width="512" height="512"></span>`:'';
/* guilloche: the fine security curves printed on real passports (two rosettes, drawn once) */
const GUILLOCHE=(()=>{const band=(y0,amp,f,ph,n)=>{let out='';for(let k=0;k<n;k++){let d='';for(let x=-10;x<=450;x+=6){const y=y0+amp*Math.sin(x*f+k*ph)+amp*.45*Math.sin(x*f*2.3-k*ph*1.7)+k*1.6;d+=(x<-9?'M':'L')+x+' '+y.toFixed(1);}out+=`<path d="${d}"/>`;}return out;};
 return `<svg class="pp-id9-gu" viewBox="0 0 440 300" preserveAspectRatio="none" aria-hidden="true"><g class="g1">${band(40,14,.028,.32,16)}</g><g class="g2">${band(170,18,.021,.27,18)}</g><g class="g3">${band(250,10,.035,.4,10)}</g></svg>`;})();
const mrzPad=(t,n)=>(t+'<'.repeat(n)).slice(0,n);
const mrzName=n=>String(n||'').normalize('NFKD').replace(/[^\w ]/g,'').toUpperCase().trim().replace(/\s+/g,'<');
function mrz(p,rank,lv){const l1=mrzPad('P<DSP'+mrzName(p.name)+'<<'+mrzName(p.handle||''),36),l2=mrzPad((rank?String(rank).padStart(3,'0'):'DRF')+'<'+mrzName(p.joined||'')+'<LVL'+String(lv?.level||1).padStart(2,'0')+'<'+mrzName(p.member||''),36);return `${esc(l1)}<br>${esc(l2)}`.replaceAll('<br>','\n').replace(/</g,'&lt;').replace(/\n/g,'<br>');}
function factsHTML(){
 const own=profile.localPreview,t=profile.type||{},cat=t.cats?.[0]?.[0],rec=profile.records?.[0];
 const next=own?readWantToGo()[0]:null,nextName=next?(next.type==='spot'?(wtgBySlug.get(next.id)?.title||'a deep spot'):next.name):null;
 const facts=own?[['next up',nextName||'add a place to my map'],['top category',cat||'post a spot to find out'],['level',`${profile.level?.level||1} · ${profile.member}`]]
  :[['latest find',rec?.name||'nothing posted yet'],['top category',cat||'—'],['level',`${profile.level?.level||1} · ${profile.member}`]];
 return `<dl class="pp-facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}
const sigHTML=art=>art?`<img src="${esc(art)}" alt="${esc(profile.name)}’s mark" width="512" height="256">`:'<span>no mark yet</span>';
function typeHTML(){
 const t=profile.type,id=t.id||(profile.localPreview?profile.style:null),style=travelerStyles.find(s=>s.id===id);
 if(!style)return empty('no type yet.','A traveler type shows up after the first posting. It is worked out from the categories of what is posted.','<a href="/contribute/" class="pp-link">add a spot ↗</a>');
 const top=t.cats.slice(0,6),rest=t.cats.slice(6).reduce((n,c)=>n+c[1],0),parts=[...top.map(([k,n],i)=>[k,n,CATS[i]]),...(rest?[['other',rest,'#8a98a6']]:[])];
 return `<div class="pp-card pp-type"><div class="pp-type-row"><span class="pp-type-mark">${travelerMark(style.id)}</span><div><h3>${esc(style.name)}.</h3><p>${esc(style.description)}</p></div></div>
 ${parts.length?`<div class="pp-catbar" role="img" aria-label="Posting categories: ${esc(parts.map(p=>p[0]+' '+p[1]).join(', '))}">${parts.map(([k,n,c])=>`<i style="flex:${n};background:${c}"></i>`).join('')}</div><ul class="pp-legend">${parts.map(([k,n,c])=>`<li><i style="background:${c}" aria-hidden="true"></i>${esc(k)} <b>${n}</b><em>${Math.round(n/parts.reduce((a,p)=>a+p[1],0)*100)}%</em></li>`).join('')}</ul>`:''}
 <p class="pp-mono">${t.postings?`based on ${t.postings} ${t.postings===1?'posting':'postings'}${t.ranked.length>1?' · also '+t.ranked.slice(1).map(([sid,n])=>esc(travelerStyles.find(s=>s.id===sid).name.replace('the ',''))+' '+n).join(' · '):''}`:'your pick · postings will refine it'}</p></div>`;
}
function statsHTML(){
 const lv=profile.level,st=profile.standing,dash='—';
 const tiles=[[profile.points==null?dash:fmt(profile.points),'points','pp-hot'],[profile.contrib.spots??dash,'spots',''],[profile.contrib.stories??dash,'stories',''],[st?.rankMonth?'#'+st.rankMonth:dash,'rank this month','']];
 const idx=lv?memberLevels.map(([from],i)=>memberLevels[i+1]?lv.level>=from&&lv.level<memberLevels[i+1][0]:lv.level>=from).indexOf(true):-1;
 return `<dl class="pp-tiles">${tiles.map(([v,l,c])=>`<div class="pp-card ${c}${v===dash?' pp-nil':''}"><dt>${l}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
 <ol class="pp-ladder" aria-label="Member levels">${memberLevels.map(([from,name],i)=>`<li${i===idx?' aria-current="step"':''}>${esc(name)} <span>lvl ${memberRange(i)}</span></li>`).join('')}</ol>
 <p class="pp-fine">Level = 1 + √(points ÷ 40). You earn +${POINTS.spot} points for an approved spot, +${POINTS.story} for a story and +${POINTS.upvote} for each upvote.</p>`;
}
function postingsHTML(){
 const list=profile.records,card=r=>`<li class="pp-post"${list.indexOf(r)>5?' data-extra hidden':''}><a href="${esc(r.href)}"><span class="pp-post-img">${r.image?`<img src="${esc(r.card||r.image)}" data-orig="${esc(r.image)}" alt="" width="400" height="300" loading="lazy" decoding="async">`:'<span class="pp-no-photo" aria-hidden="true">deep<br>spot.</span>'}</span><span class="pp-post-copy"><span class="pp-mono">${esc(r.place||'')}</span><strong>${esc(r.name)}</strong><span class="pp-post-tags">${r.kind==='story'?`<i>story · ${esc(r.tag||'')}</i>`:r.tags.filter(t=>t!=='DEEP SPOT CHOICE').slice(0,2).map(t=>`<i>${esc(t.toLowerCase())}</i>`).join('')+(r.tags.includes('DEEP SPOT CHOICE')?'<i class="pp-choice">deep spot choice</i>':'')}</span></span></a>${profile.localPreview?pinBtn(r):''}</li>`;
 if(!list.length)return empty(profile.localPreview?'nothing posted yet.':'no postings in this collection.',profile.localPreview?'Your spots and stories will fill this page when your account is connected.':'This explorer’s postings are not in the saved collection yet.',profile.localPreview?'<a href="/contribute/" class="pp-link">add a spot ↗</a>':`<a href="/browse/?q=${encodeURIComponent(profile.name)}" class="pp-link">search for ${esc(profile.name)} ↗</a>`);
 return `<ul class="pp-posts">${list.map(card).join('')}</ul><a class="pp-link pp-all" href="/browse/?q=${encodeURIComponent(profile.name)}">all spots by ${esc(profile.name)} ↗</a>`;
}
function stampsHTML(){
 const lead=profile.stamps.find(s=>s.earned);
 const small=s=>`<li class="pp-stamp-wrap s${profile.stamps.indexOf(s)}${s.earned?'':' locked'}">${s.earned?`<button class="pp-card pp-stamp" type="button" data-award="${s.id}" aria-label="View ${esc(s.name)} achievement">${s.svg()}<b>${esc(s.name)}</b><span>earned</span></button>`:`<div class="pp-card pp-stamp">${s.svg()}<b>${esc(s.name)}</b><span>locked · ${esc(s.hint)}</span></div>`}</li>`;
 const big=s=>`<li class="pp-stamp-wrap pp-stamp-lead s${profile.stamps.indexOf(s)}"><button class="pp-card pp-stamp" type="button" data-award="${s.id}" aria-label="View ${esc(s.name)} achievement">${s.svg()}<span class="pp-stamp-copy"><b>${esc(s.name)}</b><span>${esc(s.description)}</span></span></button></li>`;
 return `<ul class="pp-stamps">${lead?big(lead):''}${profile.stamps.filter(s=>s!==lead).map(small).join('')}</ul>`;
}
function placesHTML(){
 if(!profile.places.length)return empty('no places yet.','Places show up here as spots are added.');
 return `<ul class="pp-places">${profile.places.map(p=>`<li><a href="/browse/?q=${encodeURIComponent(p)}">${esc(p)}</a></li>`).join('')}</ul>`;
}
function giveawayHTML(){
 const st=profile.standing;
 const line=st?(st.rankAll===1?'First place. Hold it until the month ends.':st.ahead?`${fmt(st.ahead.gap)} ${st.ahead.gap===1?'point':'points'} behind ${esc(st.ahead.name)}.`:'On the board.'):'Not on the board yet. An approved spot earns 50 points.';
 return `<div class="pp-card pp-give">${st?.rankAll?`<div class="pp-give-big"><b>#${st.rankAll}</b><span>of ${st.total} · ${fmt(st.points)} pts</span></div>`:''}<div class="pp-give-copy"><p class="pp-give-line">${line}</p><p>Top 3 on Oct 31 win. First place takes $300 and a one-of-one character item.</p><div class="pp-give-links"><a class="pp-link" href="/community/">see the race ↗</a><a class="pp-link" href="/contribute/">add a spot ↗</a></div></div></div>`;
}
/* ---- want to go (own passport only; real profiles have no list data) ---- */
let wtgList=[],wtgCatalog=[],wtgBySlug=new Map(),wtgPick=null,wtgActive=-1,wtgMatches=[];
const wtgSlug=id=>id.split('/').pop();
const wtgURL=slug=>{const u=new URL('/spot/',location.origin);u.searchParams.set('theme',document.documentElement.dataset.theme==='light'?'light':'dark');u.searchParams.set('id',slug);return u.pathname+u.search;};
const wtgStem=src=>src.split('/').pop().replace(/\.[a-z]+$/i,'');
function wtgSpot(s){const img=typeof s.image==='string'&&(s.image.startsWith('/')||/^https:\/\/[a-z0-9.-]+\.r2\.dev\//i.test(s.image))?s.image:'',loc=img.startsWith('/')?img:'';return {id:s.id,slug:wtgSlug(s.id),title:s.title,place:s.place||'',image:img,card:loc?'/editorial-assets/cards/'+wtgStem(loc)+'.webp':''};}
let spotCoords={};
document.addEventListener('click',e=>{
 const ch=e.target.closest('[data-wg-list]');if(ch){wgSwitch(ch.dataset.wgList);return;}
 if(e.target.closest('[data-wg-new]')){const box=$('.wg-lists');box.querySelector('[data-wg-new]').outerHTML=`<form class="wg-newform" data-wg-newform><input name="t" maxlength="40" placeholder="name it, e.g. abandoned rail lines" aria-label="New collection name" required><button type="submit" class="pp-chipbtn pp-editbtn">create</button></form>`;box.querySelector('[data-wg-newform] input').focus();return;}
 const del=e.target.closest('[data-wg-del]');if(del){if(del.dataset.sure!=='1'){del.dataset.sure='1';del.textContent='press again to delete';return;}const cs=readColls();cs.splice(+wgActive,1);writeColls(cs);wgSwitch('wtg');wtgSay('Collection deleted. Its places stay in want to go.');}
});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-wg-newform]');if(!f)return;e.preventDefault();const t=f.t.value.replace(/\s+/g,' ').trim().slice(0,40);if(!t)return;const cs=readColls();
 if(cs.some(c=>c.title.toLowerCase()===t.toLowerCase())){f.t.setCustomValidity('You already have a collection with that name.');f.reportValidity();f.t.setCustomValidity('');return;}
 const used=new Set(cs.map(c=>c.color)),color=COLL_COLORS.find(c=>!used.has(c))||COLL_COLORS[cs.length%COLL_COLORS.length];cs.push({title:t,color,items:[]});writeColls(cs);wgSwitch(String(cs.length-1));$('#pp-wtg-in')?.focus();});
/* tap a list card (not its buttons) to show that place on the globe */
document.addEventListener('click',e=>{const li=e.target.closest('.pp-wtg-item');if(!li||!wg||e.target.closest('button'))return;const k=[...li.parentElement.children].indexOf(li);if(wgPins[k]?.lat==null)return;e.preventDefault();wg.focus(k);});
async function wtgLoadCoords(){try{const r=await fetch('/site/spot-coords.json');if(r.ok)spotCoords=await r.json();}catch{}}
async function wtgLoadCatalog(){try{const r=await fetch('/featured-spots.json');if(!r.ok)return;const data=await r.json();wtgCatalog=data.filter(s=>s.id?.startsWith('/blog/')&&s.title&&!s.title.startsWith('PART OF:')).map(wtgSpot);wtgBySlug=new Map(wtgCatalog.map(s=>[s.id,s]));}catch{}}
const PIN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const wtgBtn=(act,i,label,glyph,off)=>`<button type="button" class="pp-wtg-btn" data-wtg="${act}" data-i="${i}" aria-label="${esc(label)}"${off?' disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true">${glyph}</svg></button>`;
function wtgCard(item,i,n){
 const spot=item.type==='spot'?wtgBySlug.get(item.id):null,isSpot=item.type==='spot',name=isSpot?(spot?.title||wtgSlug(item.id).replaceAll('-',' ')):item.name;
 const thumb=spot&&spot.image?`<img src="${esc(spot.card||spot.image)}" data-orig="${esc(spot.image)}" alt="" width="400" height="300" loading="lazy" decoding="async">`:`<span class="pp-wtg-pin" aria-hidden="true">${PIN}</span>`;
 const copy=`<span class="pp-post-img">${thumb}</span><span class="pp-post-copy"><span class="pp-mono">${isSpot?esc(spot?.place||'deep spot'):'your pick'}</span><strong>${esc(name)}</strong></span>`;
 return `<li class="pp-wtg-item"><div class="pp-wtg-card">${isSpot?`<a class="pp-wtg-link" href="${esc(wtgURL(wtgSlug(item.id)))}">${copy}</a>`:`<div class="pp-wtg-link">${copy}</div>`}
 <div class="pp-wtg-ctl"><span class="pp-mono" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="pp-wtg-btns">${wtgBtn('up',i,`move ${name} up`,'<path d="m6 15 6-6 6 6"/>',i===0)}${wtgBtn('down',i,`move ${name} down`,'<path d="m6 9 6 6 6-6"/>',i===n-1)}${wtgBtn('rm',i,`remove ${name}`,'<path d="m6 6 12 12M18 6 6 18"/>')}</span></div></div></li>`;
}
function wtgListHTML(){return wtgList.length?`<ul class="pp-wtg">${wtgList.map((it,i)=>wtgCard(it,i,wtgList.length)).join('')}</ul>`:empty('no places yet.','add the first one above.');}
const wtgStatus=()=>wgActive==='wtg'?`${wtgList.length}/${WTG_MAX} places. Saved on this browser.`:'Added places also go to want to go.';
/* my map (2026-10-21): "want to go" is the catch-all (like liked songs); collections are named, coloured sets (like playlists).
   Adding a place to a collection also adds it to want to go. Collections live in deepspot-collections-v1 as {title,color,items:[{type,id}|{type:'place',name}]};
   older entries stored as plain names are matched to catalog spots by title. */
const COLL_KEY='deepspot-collections-v1',COLL_MAX=12,COLL_COLORS=['#f28cb1','#3c60ff','#f2c14e','#b69cff','#e57a8a','#6fa8dc','#ff8a3d','#9be15d'];
let wgActive='wtg';
const wgAll=()=>wgActive==='wtg'?wtgList:readWantToGo();
function readColls(){let v;try{v=JSON.parse(localStorage.getItem(COLL_KEY)||'[]');}catch{v=[];}if(!Array.isArray(v))return [];
 return v.filter(c=>c&&typeof c.title==='string').slice(0,COLL_MAX).map((c,i)=>({title:c.title.slice(0,40),color:COLL_COLORS.includes(c.color)?c.color:COLL_COLORS[i%COLL_COLORS.length],
  items:normalizeListAny((c.items||[]).map(it=>typeof it==='string'?(()=>{const s=wtgCatalog.find(x=>x.title.toLowerCase()===it.trim().toLowerCase());return s?{type:'spot',id:s.id}:{type:'place',name:it};})():it))}));}
function writeColls(v){try{localStorage.setItem(COLL_KEY,JSON.stringify(v));return true;}catch{return false;}}
const normalizeListAny=l=>{const out=[];let cur=[];for(const it of l){const r=addItem(cur,it);if(r.ok){cur=r.list;}}return cur;};
const wgColl=()=>wgActive==='wtg'?null:readColls()[+wgActive]||null;
function wgSwitch(id){
 if(id!=='wtg'&&!readColls()[+id])id='wtg';
 wgActive=id;wtgList=id==='wtg'?readWantToGo():readColls()[+id].items;
 const side=$('.wg-side');if(side){side.querySelector('.wg-lists').outerHTML=wgListsHTML();side.querySelector('.wg-listh').outerHTML=wgHeadHTML();}
 wtgRefresh();wgSync();
}
const wgListsHTML=()=>{const cs=readColls(),all=wgActive==='wtg'?wtgList:readWantToGo();
 return `<div class="wg-lists" role="group" aria-label="Your lists"><button type="button" class="wg-chip" data-wg-list="wtg" aria-pressed="${wgActive==='wtg'}" style="--lc:#07d653"><i aria-hidden="true">♥</i>want to go <span>${all.length}</span></button>${cs.map((c,i)=>`<button type="button" class="wg-chip" data-wg-list="${i}" aria-pressed="${wgActive===String(i)}" style="--lc:${c.color}"><i aria-hidden="true"></i>${esc(c.title)} <span>${c.items.length}</span></button>`).join('')}${cs.length<COLL_MAX?`<button type="button" class="wg-chip wg-chip-new" data-wg-new>+ new collection</button>`:''}</div>`;};
const wgHeadHTML=()=>{const c=wgColl();return `<div class="wg-listh"><h3>${c?esc(c.title):'want to go'}</h3>${c?`<button type="button" class="pp-chipbtn" data-wg-del>delete collection</button>`:''}</div>`;};
function wtgHTML(){
 if(!profile.localPreview)return empty('no want-to-go list yet.','Lists are not shared from live accounts yet.');
 return `<div class="wg-wrap"><div class="wg" id="wg"><div class="wg-pop" id="wg-pop" hidden></div><p class="sr-only" id="wg-card" aria-live="polite"></p></div><aside class="wg-side" aria-label="Your lists">${wgListsHTML()}<form class="pp-wtg-form" id="pp-wtg-form" autocomplete="off" novalidate><label class="pp-mono" for="pp-wtg-in">add a place</label>
 <div class="pp-wtg-row"><div class="pp-wtg-combo"><input id="pp-wtg-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="pp-wtg-lb" maxlength="${WTG_NAME_MAX}" placeholder="a spot, a city, anywhere" enterkeyhint="done"><ul id="pp-wtg-lb" class="pp-wtg-lb" role="listbox" aria-label="Matching deep spots" hidden></ul></div><button type="submit" class="pp-wtg-add">add</button></div>
 <p class="pp-fine pp-wtg-msg" id="pp-wtg-msg" role="status" aria-live="polite">${wtgStatus()}</p></form>${wgHeadHTML()}<div id="pp-wtg-list">${wtgListHTML()}</div><p class="wg-sidenote" id="wg-note2"></p></aside></div>`;
}
function wtgRefresh(){const box=$('#pp-wtg-list');if(!box)return;box.innerHTML=wtgListHTML();const s=document.querySelector('#pp-wtg span');if(s)s.textContent=`(${wtgList.length})`;const m=$('#pp-wtg-msg');if(m&&!m.dataset.keep)m.textContent=wtgStatus();}
function wtgSay(text){const m=$('#pp-wtg-msg');if(!m)return;m.textContent=text;m.dataset.keep='1';clearTimeout(wtgSay.t);wtgSay.t=setTimeout(()=>{delete m.dataset.keep;m.textContent=wtgStatus();},3500);}
function wtgCommit(next){wtgList=next;let ok;
 if(wgActive==='wtg')ok=writeWantToGo(wtgList);else{const cs=readColls();cs[+wgActive].items=wtgList;ok=writeColls(cs);}
 if(!ok)wtgSay('Could not save on this browser.');wtgRefresh();wgSync();const l=$('.wg-lists');if(l)l.outerHTML=wgListsHTML();}
function wtgClose(){const lb=$('#pp-wtg-lb'),inp=$('#pp-wtg-in');if(!lb)return;lb.hidden=true;inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');wtgActive=-1;}
function wtgSuggest(){
 const inp=$('#pp-wtg-in'),lb=$('#pp-wtg-lb'),q=inp.value.trim().toLowerCase();wtgPick=null;
 if(q.length<2){wtgClose();return;}
 const have=new Set(wtgList.filter(i=>i.type==='spot').map(i=>i.id));
 const score=s=>{const t=s.title.toLowerCase(),p=s.place.toLowerCase();return t.startsWith(q)||p.startsWith(q)?0:t.includes(q)?1:p.includes(q)?2:-1;};
 wtgMatches=wtgCatalog.filter(s=>!have.has(s.id)&&score(s)>=0).sort((a,b)=>score(a)-score(b)).slice(0,6);
 if(!wtgMatches.length){wtgClose();return;}
 lb.innerHTML=wtgMatches.map((s,i)=>`<li role="option" id="pp-wtg-o${i}" aria-selected="false" data-i="${i}"><strong>${esc(s.title)}</strong><span class="pp-mono">${esc(s.place)}</span></li>`).join('');
 lb.hidden=false;inp.setAttribute('aria-expanded','true');wtgActive=-1;inp.removeAttribute('aria-activedescendant');
}
function wtgSetActive(i){const lb=$('#pp-wtg-lb'),inp=$('#pp-wtg-in');wtgActive=i;lb.querySelectorAll('[role=option]').forEach((o,n)=>o.setAttribute('aria-selected',String(n===i)));if(i>=0){inp.setAttribute('aria-activedescendant','pp-wtg-o'+i);lb.children[i].scrollIntoView({block:'nearest'});}else inp.removeAttribute('aria-activedescendant');}
function wtgChoose(i){const s=wtgMatches[i];if(!s)return;const inp=$('#pp-wtg-in');inp.value=s.title.slice(0,WTG_NAME_MAX);wtgClose();wtgPick=s;inp.focus();}
function wtgSubmit(){
 const inp=$('#pp-wtg-in'),text=inp.value.trim();let raw=null;
 if(wtgPick)raw={type:'spot',id:wtgPick.id};
 else if(text){const exact=wtgCatalog.find(s=>s.title.trim().toLowerCase()===text.toLowerCase());raw=exact?{type:'spot',id:exact.id}:{type:'place',name:text};}
 const r=addItem(wtgList,raw);
 if(!r.ok){wtgSay(r.reason==='duplicate'?'Already on your list.':r.reason==='full'?`List is full. ${WTG_MAX} places max.`:'Type a place first.');inp.focus();return;}
 inp.value='';wtgPick=null;wtgClose();if(wgActive!=='wtg'){const a=addItem(readWantToGo(),r.item);if(a.ok)writeWantToGo(a.list);}wtgCommit(r.list);
 wtgSay(`Added ${r.item.type==='spot'?(wtgBySlug.get(r.item.id)?.title||'spot'):r.item.name}.`);inp.focus();
}
function wtgBind(){
 const form=$('#pp-wtg-form');if(!form)return;const inp=$('#pp-wtg-in'),lb=$('#pp-wtg-lb');
 form.addEventListener('submit',e=>{e.preventDefault();wtgSubmit();});
 inp.addEventListener('input',wtgSuggest);
 inp.addEventListener('blur',()=>setTimeout(wtgClose,120));
 inp.addEventListener('keydown',e=>{
  const open=!lb.hidden;
  if(e.key==='ArrowDown'&&wtgMatches.length){e.preventDefault();if(!open)wtgSuggest();if(!lb.hidden)wtgSetActive(Math.min(wtgActive+1,wtgMatches.length-1));}
  else if(e.key==='ArrowUp'&&open){e.preventDefault();wtgSetActive(Math.max(wtgActive-1,-1));}
  else if(e.key==='Enter'&&open&&wtgActive>=0){e.preventDefault();wtgChoose(wtgActive);}
  else if(e.key==='Escape'&&open){e.preventDefault();wtgClose();}
 });
 lb.addEventListener('mousedown',e=>e.preventDefault());
 lb.addEventListener('click',e=>{const o=e.target.closest('[role=option]');if(o)wtgChoose(+o.dataset.i);});
 $('#pp-wtg-list').addEventListener('click',e=>{
  const b=e.target.closest('[data-wtg]');if(!b)return;const i=+b.dataset.i,act=b.dataset.wtg;
  if(act==='rm'){wtgCommit(removeAt(wtgList,i));const next=document.querySelector(`#pp-wtg-list [data-wtg="rm"][data-i="${Math.min(i,wtgList.length-1)}"]`);(next||inp).focus();wtgSay('Removed.');return;}
  const j=i+(act==='up'?-1:1);wtgCommit(moveItem(wtgList,i,act==='up'?-1:1));
  const t=document.querySelector(`#pp-wtg-list [data-wtg="${act}"][data-i="${j}"]:not([disabled])`)||document.querySelector(`#pp-wtg-list [data-wtg="rm"][data-i="${j}"]`);t?.focus();
 });
}
function setTab(name,focus){
 const mark=name==='mark';
 
 $('#pp-pane-pass').hidden=mark;$('#pp-pane-mark').hidden=!mark;$('.pp-book').dataset.tab=name;
}
function render(){
 document.title=`${profile.name} — DeepSpot Passport`;profile.items=itemsFor(profile);
 const initials=profile.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase(),lv=profile.level,st=profile.standing,soc=profile.socials;
 const rank=st?.rankAll;profile.field=rank&&rank<=3?RANKC[rank-1]:'#dfe6e4';
 const mole=profile.mole?moleHTML():profile.localPreview?'<button type="button" class="pp-mole pp-mole-empty" data-set-roll><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg><span>roll your mole</span></button>':`<span class="pp-mole pp-mole-empty" role="img" aria-label="${esc(profile.name)}’s initials"><b>${esc(initials)}</b></span>`;
 const mini=profile.mole?moleHTML('pp-mole-mini'):`<span class="pp-mole pp-mole-mini pp-mole-empty" aria-hidden="true"><b>${esc(initials)}</b></span>`;
 const mark=padHTML(profile),label=profile.localPreview?'my mark':'their mark';
 {const ks=$('.pp-share'),kb=$('.pp-back');if(ks)$('.pp-tools')?.append(ks);if(kb)$('.pp-toolbar')?.prepend(kb);}
 const own=profile.localPreview,lk=readLook();wg?.stop();wg=null;clearInterval(wgTimer);
 $('#passport').innerHTML=`<article class="pp-book" style="--pf:${profile.field}" data-tab="passport" aria-label="${esc(profile.name)}’s explorer passport">
 <aside class="pp-field" aria-label="Passport"><div class="pp-bg" aria-hidden="true"><div class="pp-bg-in"></div></div><div class="pp-field-in">
  <div class="pp-halftone" aria-hidden="true"></div>
  <div class="pp-stage">
   <div class="pp-pane" id="pp-pane-pass">
    <div class="pp-passobj"><div class="pp-passobj-in">
    <div class="pp-card pp-idcard pp-id9">${GUILLOCHE}<span class="pp-id9-wm" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg></span>
     <div class="pp-id-top"><span class="pp-id9-crest" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><path d="M24 8v32M8 24h32M12.7 12.7l22.6 22.6m0-22.6L12.7 35.3"/></svg></span><span class="pp-id9-title"><b>deepspot</b><i>explorer passport · pasaporte · パスポート</i></span><span class="pp-id9-no">${rank?'no. '+String(rank).padStart(3,'0'):own?'draft':''}</span></div>
     <div class="pp-id-body"><div class="pp-molebox">${mole}${lv?`<span class="pp-lvl" role="img" aria-label="Level ${lv.level}"><b>${lv.level}</b><i>lvl</i></span>`:''}<span class="pp-id9-stamp" aria-hidden="true"><b>${esc((travelerStyles.find(x=>x.id===(profile.type.id||(own?profile.style:null)))?.name||'explorer').replace(/^the /,''))}</b><i>${esc(profile.member)}</i></span></div>
      <dl class="pp-rows"><div><dt>name</dt><dd id="pp-name">${esc(profile.name)}</dd></div><div><dt>user</dt><dd>${profile.handle?'@'+esc(profile.handle):'—'}</dd></div><div><dt>since</dt><dd>${esc(profile.joined||'—')}</dd></div><div><dt>level</dt><dd>${esc(profile.member)}</dd></div></dl></div>
     <div class="pp-sig pp-id9-sig" id="pp-sig"><span class="pp-sig-l">${own?'my mark':'their mark'}</span>${sigHTML(profile.signatureArt)}</div>
     ${lv?`<div class="pp-prog"><div class="pp-bar4" role="progressbar" aria-label="Progress to level ${lv.level+1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lv.pct}"><i style="width:${Math.max(lv.pct,2)}%"></i></div><span>${fmt(lv.points)} / ${fmt(lv.to)} pts</span></div>`:''}
     <span class="pp-readable-code pp-id9-mrz" aria-hidden="true">${mrz(profile,rank,lv)}</span></div>
    </div></div>
   </div>
   ${deckHTML()}
   <div class="pp-pane" id="pp-pane-mark" hidden>${own?mark+'<div class="pp-markdone"><button type="button" class="pp-chipbtn" data-mark-done>back to passport</button></div>':''}</div>
  </div></div></aside>
 <div class="pp-rec">
  <section class="pp-sec pp-biosec" aria-labelledby="pp-bio" data-bg="${lk.bg}" data-font="${lk.font}" data-align="${lk.align}"><header class="pp-bar"><h2 id="pp-bio">bio</h2>${own?`<div class="pp-bar-acts"><button type="button" class="pp-chipbtn pp-editbtn" data-edit aria-expanded="false">edit profile</button><button type="button" class="pp-cog" data-settings aria-label="Settings" title="Settings">${COG}</button></div>`:''}</header>
   <div class="pp-body pp-bio-body" id="pp-bio-view">
    <div class="pp-bio-top">${mini}<div class="pp-bio-id"><h1 class="pp-bio-name">${esc(profile.name)}</h1><div class="ps-idrow"><span class="pp-handle">${profile.handle?'@'+esc(profile.handle):'DeepSpot contributor'}</span>${followHTML(profile,own)}</div></div>${lv?`<span class="pp-badge" role="img" aria-label="Level ${lv.level}"><b>${lv.level}</b><i>level</i></span>`:''}</div>
    <div class="pp-bio-fit">${profile.bio?`<p class="pp-bio-text">${esc(profile.bio)}</p>`:`<p class="pp-bio-text pp-bio-empty">${own?'say something. edit profile to write your bio.':'no bio yet.'}</p>`}</div>
    ${factsHTML()}
   </div>
   ${own?editHTML(lk):''}
  </section>
  <div class="pp-statsrow">${sec('type','traveler type',null,typeHTML())}${sec('stats','contributions',null,statsHTML())}</div>
  <section class="pp-sec pp-tabsec" aria-label="Passport contents"><div class="pp-vtabs" role="tablist" aria-orientation="vertical" aria-label="Passport contents">${VTABS.map(([id,label],i)=>`<button type="button" role="tab" class="pp-vtab" id="pp-vt-${id}" data-vt="${id}" aria-controls="pp-vp-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}${id==='wtg'&&own&&wgAll().length?` <span>${wgAll().length}</span>`:id==='contrib'&&profile.records.length?` <span>${profile.records.length}</span>`:psCounts(own)[id]?` <span>${psCounts(own)[id]}</span>`:''}</button>`).join('')}</div>
   <div class="pp-vpanels">
    <div class="pp-vpanel" role="tabpanel" id="pp-vp-show" aria-labelledby="pp-vt-show" tabindex="0">${showcaseHTML()}</div>
    <div class="pp-vpanel" role="tabpanel" id="pp-vp-contrib" aria-labelledby="pp-vt-contrib" tabindex="0" hidden>
     ${sub(`postings <span>(${profile.records.length})</span>`,postingsHTML(),profile.records.length>6?'<button type="button" class="pp-chipbtn" data-more aria-expanded="false">show all</button>':'')}${sub(`places <span>(${profile.places.length})</span>`,placesHTML())}${sub('updates',updatesHTML(profile))}
    </div>
    <div class="pp-vpanel" role="tabpanel" id="pp-vp-explored" aria-labelledby="pp-vt-explored" tabindex="0" hidden>${sub('explored',exploredHTML(own))}</div>
    <div class="pp-vpanel" role="tabpanel" id="pp-vp-wtg" aria-labelledby="pp-vt-wtg" tabindex="0" hidden>${wtgHTML()}</div>
    <div class="pp-vpanel" role="tabpanel" id="pp-vp-picks" aria-labelledby="pp-vt-picks" tabindex="0" hidden>${sub('picks',picksHTML(own))}</div>
    <div class="pp-vpanel" role="tabpanel" id="pp-vp-items" aria-labelledby="pp-vt-items" tabindex="0" hidden>${sub(`items <span>(${allItems().filter(x=>!x.locked).length}/${allItems().length})</span>`,itemsHTML(),'<span class="pp-mono pp-ph">placeholder</span>')}${sub('giveaway',giveawayHTML())}</div>
   </div>
  </section>
 </div></article>`;
 wireV4();applyStyle();
 $('#passport').setAttribute('aria-busy','false');$('.pp-share').disabled=false;
 /* soft ambient field: Earth glyphs on slow turbulent noise (same module as the community race), very low strength, fills the whole left column (sticky viewport-sized layer, so the cost stays one screen) */
 window._ppField?.stop();window._ppField=null;window._ppFieldBg=null;setField(readStyle().bg);
 if(profile.localPreview)initPad($('#pp-pad'),{art:profile.signatureArt,onSave:url=>{profile.signatureArt=url||null;$('#pp-sig').innerHTML=`<span class="pp-sig-l">my mark</span>${sigHTML(profile.signatureArt)}`;exportPromise=null;if(exportImage){URL.revokeObjectURL(exportImage.url);exportImage=null;}if(url)setTab('passport');}});
 if(profile.localPreview)wtgBind();
 bindSocial($('#passport'),profile,own,wtgCatalog.map(s=>s.title));
 if(location.hash==='#pp-pad')setTab('mark');
 applyTheme(document.documentElement.dataset.theme);
 appShell();
}
$('.pp-share').addEventListener('click',async()=>{
 $('#pp-share-url').value=profileURL();const local=['localhost','127.0.0.1'].includes(location.hostname);
 $('.pp-share-note').textContent=profile.localPreview?'This edited passport is stored on this browser. Download the image to share it; the preview link will not contain your draft.':local?'The link is local to this preview. Download the image to share it anywhere.':'Copy the profile link or download an image of this passport.';
 $('.pp-native-share').hidden=profile.localPreview||!navigator.share;$('.pp-share-dialog').showModal();
 const link=$('.pp-download');link.textContent=exportImage?'↓ download passport image':'preparing image…';
 try{exportPromise??=createPassportImage(profile,profile.records,profileURL());exportImage=await exportPromise;link.href=exportImage.url;link.download=exportImage.filename;link.setAttribute('aria-disabled','false');link.textContent='↓ download passport image';}
 catch{exportPromise=null;link.textContent='Image unavailable. Reopen Share to retry.';}
});
$('#pp-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(profileURL());$('#pp-copy').textContent='copied ✓';setTimeout(()=>$('#pp-copy').textContent='copy link',2200);}catch{$('#pp-share-url').focus();$('#pp-share-url').select();notify('Select and copy the profile link.');}});
$('.pp-native-share').addEventListener('click',async()=>{try{await navigator.share({title:`${profile.name} — DeepSpot Passport`,text:'A passport for the curious.',url:profileURL()});}catch(error){if(error.name!=='AbortError')notify('Use copy link to share this passport.');}});
$('.pp-download').addEventListener('click',event=>{if(!exportImage)event.preventDefault();});
window.addEventListener('pagehide',event=>{if(!event.persisted&&exportImage)URL.revokeObjectURL(exportImage.url);});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-award]');
 if(button){const stamp=profile.stamps.find(s=>s.id===button.dataset.award);$('.pp-award-body').innerHTML=`${stamp.svg()}<h2 id="pp-award-title">${esc(stamp.name)}</h2><p>${esc(stamp.description)}</p>`;$('.pp-award-dialog').showModal();}
 const more=event.target.closest('[data-more]');
 if(more){const open=more.getAttribute('aria-expanded')!=='true';document.querySelectorAll('.pp-post[data-extra]').forEach(li=>li.hidden=!open);more.setAttribute('aria-expanded',String(open));more.textContent=open?'hide':'show all';}
 const tb=event.target.closest('.pp-tab');if(tb)setTab(tb.dataset.tab);
 if(event.target.closest('.pp-dialog-close'))event.target.closest('dialog').close();
});
// Card photo falls back to the full image, then to the deep spot mark.
document.addEventListener('error',event=>{const img=event.target;if(!(img instanceof HTMLImageElement)||!img.closest('.pp-post-img'))return;if(img.dataset.orig&&img.getAttribute('src')!==img.dataset.orig){img.src=img.dataset.orig;return;}const mark=document.createElement('span');mark.className='pp-no-photo';mark.setAttribute('aria-hidden','true');mark.innerHTML='deep<br>spot.';img.replaceWith(mark);},true);
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
const footer=$('deepspot-cta');footer?.querySelectorAll('.ds-footer-logo,.ds-footer-nav a').forEach(a=>{if(a.classList.contains('ds-footer-logo')||a.textContent.trim()==='home')a.href='/?theme='+document.documentElement.dataset.theme;});

document.addEventListener('keydown',event=>{const tb=event.target.closest?.('.pp-tab');if(!tb||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();setTab(event.key==='ArrowLeft'||event.key==='Home'?'passport':'mark',true);});


/* ---------- v5 (2026-10-20): passport object, edit in place, bio look, vertical tabs ---------- */
const VTABS=[['show','showcase'],['explored','explored'],['wtg','my map'],['picks','picks'],['contrib','contributions'],['items','items']];
const sub=(title,body,act='')=>`<div class="pp-sub"><div class="pp-sub-h"><h3>${title}</h3>${act}</div>${body}</div>`;
const LOOK_KEY='deepspot-bio-look-v1',PIN_KEY='deepspot-showcase-v1';
const LOOKS={bg:[['panel','plain'],['green','green'],['cobalt','cobalt'],['aqua','aqua'],['cream','paper'],['ink','ink']],font:[['display','bold'],['serif','serif'],['mono','type'],['hand','hand']],align:[['left','left'],['center','center']]};
function readLook(){const d={bg:'panel',font:'display',align:'left'};if(!profile?.localPreview)return d;try{const v=JSON.parse(localStorage.getItem(LOOK_KEY))||{};for(const k in d)if(LOOKS[k].some(([id])=>id===v[k]))d[k]=v[k];}catch{}return d;}
function readPins(){try{const v=JSON.parse(localStorage.getItem(PIN_KEY));return Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,12):[];}catch{return [];}}
function writePins(v){try{localStorage.setItem(PIN_KEY,JSON.stringify(v));}catch{}}
const pinBtn=r=>{const on=readPins().includes(r.href);return `<button type="button" class="pp-pin" data-pin="${esc(r.href)}" aria-pressed="${on}" aria-label="${on?'remove':'show'} ${esc(r.name)} ${on?'from':'on'} your showcase">${on?'★ showing':'☆ show'}</button>`;};
function editHTML(lk){
 const d=readAccount(),grp=(k,label)=>`<fieldset class="pp-look"><legend>${label}</legend>${LOOKS[k].map(([id,l])=>`<label class="pp-look-o pp-look-${k}" data-v="${id}"><input type="radio" name="pp-look-${k}" value="${id}"${lk[k]===id?' checked':''}><span>${l}</span></label>`).join('')}</fieldset>`;
 return `<form class="pp-body pp-edit" id="pp-edit" hidden novalidate><div class="pp-edit-grid">
  <label class="pp-f"><span>name</span><input name="name" maxlength="50" value="${esc(d.name)}" autocomplete="nickname"></label>
  <label class="pp-f"><span>username</span><input name="username" maxlength="20" value="${esc(d.username)}" autocomplete="username"></label>
  <label class="pp-f pp-f-wide"><span>bio <i id="pp-bio-n">${d.bio.length}/400</i></span><textarea name="bio" maxlength="400" rows="3" placeholder="who you are, where you go, what you look for.">${esc(d.bio)}</textarea></label>
 </div>
 ${grp('bg','bio background')}${grp('font','type')}${grp('align','align')}<div class="pp-edit-cz">${customizeHTML()}</div>
 <div class="pp-edit-acts"><button type="button" class="pp-chipbtn" data-draw>draw my mark</button><button type="button" class="pp-chipbtn" data-set-roll>${readAccount().mole?'roll a new mole':'roll my mole'}</button><span class="pp-edit-sp"></span><button type="button" class="pp-chipbtn" data-cancel>cancel</button><button type="submit" class="pp-savebtn">save profile</button></div></form>`;
}
function showcaseHTML(){
 const t=profile.type||{},sid=t.id||(profile.localPreview?profile.style:null),style=sid&&travelerStyles.find(s=>s.id===sid);
 const pins=readPins(),recs=profile.records,picked=pins.map(h=>recs.find(r=>r.href===h)).filter(Boolean),list=picked.length?picked:recs.slice(0,6);
 const tcard=style?`<div class="pp-show-type"><span class="pp-type-mark">${travelerMark(style.id)}</span><div><span class="pp-mono">traveler type</span><strong>${esc(style.name)}.</strong></div></div>`:'';
 const grid=list.length?`<ul class="pp-posts pp-show-posts">${list.map(r=>`<li class="pp-post"><a href="${esc(r.href)}"><span class="pp-post-img">${r.image?`<img src="${esc(r.card||r.image)}" data-orig="${esc(r.image)}" alt="" width="400" height="300" loading="lazy" decoding="async">`:'<span class="pp-no-photo" aria-hidden="true">deep<br>spot.</span>'}</span><span class="pp-post-copy"><span class="pp-mono">${esc(r.place||'')}</span><strong>${esc(r.name)}</strong></span></a></li>`).join('')}</ul>`:'';
 const wtgAllList=readWantToGo(),wtg=profile.localPreview&&!recs.length&&wtgAllList.length?`<div class="pp-sub-h"><h3>next on my list</h3></div><ul class="pp-chips pp-show-wtg">${wtgAllList.slice(0,8).map(it=>`<li>${esc(it.type==='spot'?(wtgBySlug.get(it.id)?.title||'a deep spot'):it.name)}</li>`).join('')}</ul>`:'';
 const hint=profile.localPreview?`<p class="pp-fine">${recs.length?'Edit profile, then pick postings with ☆ show in contributions.':'Your showcase fills up as you post spots. Add places in want to go to show them here.'}</p>`:'';
 return (grid||wtg)?`${grid}${wtg}${hint}`:empty(profile.localPreview?'nothing to show yet.':'nothing here yet.',profile.localPreview?'Post a spot or add places to want to go.':'This explorer has not posted in this collection yet.');
}
function fitBio(){
 const box=$('.pp-bio-fit'),t=box?.querySelector('.pp-bio-text');if(!t)return;
 if(innerWidth<1100||box.clientHeight<20){t.style.fontSize='';return;}
 let lo=16,hi=t.classList.contains('pp-bio-empty')?36:44;
 for(let i=0;i<14;i++){const m=(lo+hi)/2;t.style.fontSize=m+'px';if(t.scrollHeight<=box.clientHeight&&t.scrollWidth<=box.clientWidth)lo=m;else hi=m;}
 t.style.fontSize=Math.floor(lo)+'px';
}
function selectVT(id,focus){
 document.querySelectorAll('.pp-vtab').forEach(b=>{const on=b.dataset.vt===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});
 document.querySelectorAll('.pp-vpanel').forEach(p=>p.hidden=p.id!=='pp-vp-'+id);$('.pp-tabsec').dataset.vt=id;if(id==='wtg'&&profile.localPreview)requestAnimationFrame(wgSync);requestAnimationFrame(fitBio);
}
function wireV4(){
 selectVT('show');
 const tl=$('.pp-vtabs');
 tl.addEventListener('click',e=>{const b=e.target.closest('.pp-vtab');if(b)selectVT(b.dataset.vt);});
 tl.addEventListener('keydown',e=>{const ids=[...document.querySelectorAll('.pp-vtab')].map(b=>b.dataset.vt),cur=ids.indexOf($('.pp-vtab[aria-selected=true]').dataset.vt);let n=null;
  if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(cur+1)%ids.length;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(cur-1+ids.length)%ids.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=ids.length-1;
  if(n!==null){e.preventDefault();selectVT(ids[n],true);}});
 requestAnimationFrame(fitBio);
 const form=$('#pp-edit');if(!form)return;
 const sec=$('.pp-biosec'),view=$('#pp-bio-view'),btn=$('[data-edit]'),book=$('.pp-book');
 const setEdit=on=>{form.hidden=!on;view.hidden=on;btn.setAttribute('aria-expanded',String(on));btn.textContent=on?'editing…':'edit profile';book.toggleAttribute('data-editing',on);if(on)form.querySelector('input').focus();else{Object.assign(sec.dataset,readLook());setTab('passport');requestAnimationFrame(fitBio);}};
 btn.addEventListener('click',()=>setEdit(form.hidden));
 form.addEventListener('change',e=>{const m=e.target.name?.match(/^pp-look-(\w+)$/);if(m)sec.dataset[m[1]]=e.target.value;});
 form.bio.addEventListener('input',()=>{$('#pp-bio-n').textContent=form.bio.value.length+'/400';});
 form.querySelector('[data-cancel]').addEventListener('click',()=>{applyStyle();setEdit(false);});
 form.querySelector('[data-draw]').addEventListener('click',()=>{setTab('mark');$('#pp-pane-mark button')?.focus();});
 form.addEventListener('submit',async e=>{e.preventDefault();
  const d=readAccount(),next=normalizeAccount({...d,name:form.name.value,username:form.username.value,bio:form.bio.value});
  const look={};for(const k of Object.keys(LOOKS))look[k]=form.querySelector(`[name=pp-look-${k}]:checked`)?.value;
  writeStyle(czPick());
  try{localStorage.setItem(accountKey,JSON.stringify(next));localStorage.setItem(LOOK_KEY,JSON.stringify(look));}catch{notify('This browser could not save your profile.');return;}
  profile=await loadProfile('preview');render();notify('Profile saved on this browser.');$('[data-edit]')?.focus();
 });
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-mark-done]'))setTab('passport');
 const pin=e.target.closest('[data-pin]');if(!pin)return;
 const h=pin.dataset.pin,list=readPins(),on=!list.includes(h);writePins(on?[...list,h]:list.filter(x=>x!==h));
 pin.setAttribute('aria-pressed',String(on));pin.textContent=on?'★ showing':'☆ show';$('#pp-vp-show').innerHTML=showcaseHTML();
});
addEventListener('resize',()=>requestAnimationFrame(fitBio));
/* the passport object is drawn at 440px and scaled up to fill its pane */
function fitPassport(){
 const obj=$('.pp-passobj'),field=$('.pp-field');if(!obj||!field)return;
 obj.style.zoom='';if(innerWidth<1100){return;}
 const w=obj.offsetWidth,h=obj.offsetHeight+110,fw=field.clientWidth-120,fh=field.clientHeight-60;
 const z=Math.max(1,Math.min(fw/w,fh/h,1.75));obj.style.zoom=z.toFixed(3);
}
addEventListener('resize',()=>requestAnimationFrame(fitPassport));
function appShell(){
 const field=$('.pp-field-in'),back=$('.pp-back'),share=$('.pp-share'),pane=$('#pp-pane-pass');
 if(back&&field){back.classList.add('pp-tabs-back');field.append(back);}
 if(share&&pane&&!pane.querySelector('.pp-sharebar')){const bar=document.createElement('div');bar.className='pp-sharebar';bar.append(share);const hint=document.createElement('span');hint.className='pp-mono';hint.textContent='share it, or save it as an image';bar.append(hint);pane.append(bar);}
 $('.pp-toolbar')?.setAttribute('hidden','');
 document.documentElement.classList.add('pp-app');requestAnimationFrame(fitBio);requestAnimationFrame(fitPassport);document.fonts?.ready.then(()=>requestAnimationFrame(fitBio));
 const header=document.querySelector('.br-header');
 const fit=()=>document.documentElement.style.setProperty('--pp-top',Math.max(0,Math.round(header?.getBoundingClientRect().bottom||0))+'px');
 fit();if(!window._ppFit){window._ppFit=1;addEventListener('resize',fit);}
 /* tilt: the whole passport (card + mark) is one object that leans toward the pointer; eased, small angles, no skew */
 const stage=$('.pp-stage'),obj=$('.pp-passobj-in');if(!stage||!obj)return;
 const calm=matchMedia('(prefers-reduced-motion: reduce)');let tx=0,ty=0,x=0,y=0,raf=0;
 const loop=()=>{x+=(tx-x)*.12;y+=(ty-y)*.12;obj.style.transform=`perspective(1600px) rotateX(${(-y*7).toFixed(3)}deg) rotateY(${(x*9).toFixed(3)}deg)`;obj.style.setProperty('--gx',Math.max(0,Math.min(100,(x+.5)*100)).toFixed(1)+'%');obj.style.setProperty('--gy',Math.max(0,Math.min(100,(y+.5)*100)).toFixed(1)+'%');
  if(Math.abs(tx-x)>.001||Math.abs(ty-y)>.001)raf=requestAnimationFrame(loop);else{raf=0;if(!tx&&!ty)obj.style.transform='';}};
 const kick=()=>{if(!raf)raf=requestAnimationFrame(loop);};
 stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||calm.matches)return;const r=obj.getBoundingClientRect();tx=Math.max(-.6,Math.min(.6,(e.clientX-r.left)/r.width-.5));ty=Math.max(-.6,Math.min(.6,(e.clientY-r.top)/r.height-.5));obj.classList.add('is-tilt');kick();});
 stage.addEventListener('pointerleave',()=>{tx=0;ty=0;obj.classList.remove('is-tilt');kick();});
}

/* ---------- want-to-go globe ---------- */
let wg=null,wgPins=[],wgTimer=0;
function wgPinsFrom(){const cs=readColls(),c=wgColl(),key=it=>it.type==='spot'?'s:'+it.id:'p:'+(it.name||'').toLowerCase(),colorOf=it=>c?c.color:(cs.find(x=>x.items.some(y=>key(y)===key(it)))?.color||'');return wtgList.map(it=>{const spot=it.type==='spot'?wtgBySlug.get(it.id):null,slug=it.type==='spot'?wtgSlug(it.id):null,c=slug&&spotCoords[slug];
 return {color:colorOf(it),name:spot?spot.title:it.name,place:spot?spot.place:'your pick',href:spot?wtgURL(slug):null,img:spot?(spot.card||spot.image):'',lat:c?c[0]:null,lon:c?c[1]:null,exact:c?.[2]==='exact'};});}
function wgCard(i){const p=wgPins[i],pop=$('#wg-pop'),sr=$('#wg-card');if(sr)sr.textContent=p?`${p.name}, ${p.place||''}`:'';if(!pop)return;
 if(!p||p.lat==null){pop.hidden=true;return;}
 pop.innerHTML=`${p.img?`<img src="${esc(p.img)}" alt="" width="120" height="90">`:''}<div><span class="pp-mono">${esc(p.place||'')}</span><strong>${esc(p.name)}</strong>${p.href?`<a href="${esc(p.href)}">open the spot ↗</a>`:''}</div>`;pop.hidden=false;
 document.querySelectorAll('.pp-wtg-item').forEach((li,k)=>li.classList.toggle('is-on',k===i));}
function wgPlace(pt){const pop=$('#wg-pop');if(!pop||pop.hidden)return;if(!pt){pop.style.visibility='hidden';return;}pop.style.visibility='';pop.style.transform=`translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`;}
document.addEventListener('click',e=>{const b=e.target.closest('[data-wg-step]');if(!b||!wg)return;const on=wgPins.map((x,k)=>x.lat!=null?k:-1).filter(k=>k>=0),n=on.indexOf(wg.sel);wg.focus(on[(n+ +b.dataset.wgStep+on.length)%on.length]);});
function wgSync(){
 const host=$('#wg');if(!host)return;wgPins=wgPinsFrom();const on=wgPins.map((p,i)=>p.lat!=null?i:-1).filter(i=>i>=0),off=wgPins.length-on.length;
 $('#wg-note2').textContent=!wgPins.length?'add places below and they land on the globe as pins.':off?`${off} ${off===1?'place has':'places have'} no location yet, so ${off===1?'it is':'they are'} only in the list.`:'drag to turn · scroll or pinch to zoom · tap a pin';
 if(!wg)wg=mountGlobe(host,{pins:wgPins,onSelect:wgCard,onPin:wgPlace,_old:(pt,{w})=>{const l=$('#wg-line'),c=$('#wg-card');if(!l||!c)return;if(!pt||c.hidden){l.setAttribute('x1',0);l.setAttribute('x2',0);l.setAttribute('y1',0);l.setAttribute('y2',0);return;}
  const hb=host.getBoundingClientRect(),cb=c.getBoundingClientRect(),x1=cb.left-hb.left+cb.width/2,y1=cb.bottom-hb.top;l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',pt.x);l.setAttribute('y2',pt.y);}});
 else wg.set(wgPins);
 if(on.length&&(wg.sel<0||!on.includes(wg.sel)))wg.focus(on[0]);if(!on.length)wgCard(-1);else if(wg.sel>=0)wgCard(wg.sel);
 clearInterval(wgTimer);if(on.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)wgTimer=setInterval(()=>{if(document.hidden||$('#wg')?.matches(':hover'))return;const k=on.indexOf(wg.sel);wg.focus(on[(k+1)%on.length]);},6000);
}
/* ---------- settings (2026-10-20): the cog on your own passport holds what the old account profile tab had ---------- */
const COG='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>';
const SESSION_KEY='deepspot-session-preview';
const readSess=()=>{try{const v=JSON.parse(localStorage.getItem(SESSION_KEY))||{};return {state:['free','member'].includes(v.state)?v.state:'out',email:typeof v.email==='string'?v.email:''};}catch{return {state:'out',email:''};}};
const ACCOUNT_LINKS=[['progress','travel stats'],['trips','my trips'],['submissions','my submissions'],['placements','my placements'],['billing','membership'],['notifications','notifications'],['security','account settings']];
function settingsHTML(){
 const d=readAccount(),s=readSess(),moleImg=d.mole?.png;
 const styles=travelerStyles.map(t=>`<label class="pp-look-o pp-set-style"><input type="radio" name="style" value="${t.id}"${d.style===t.id?' checked':''}><span>${travelerMark(t.id)}${esc(t.name.replace(/^the /,''))}</span></label>`).join('');
 return `<button class="pp-dialog-close" type="button" aria-label="Close settings">×</button><p class="pp-small">your passport</p><h2 id="pp-set-title">settings.</h2>
 <section class="pp-set-sec"><h3>profile picture</h3><div class="pp-set-mole"><span class="pp-set-av">${moleImg?`<img src="${esc(moleImg)}" alt="Your mole">`:travelerMark(d.style)}</span><div><p>${moleImg?'Your mole is your passport picture.':'Roll a mole from the DeepSpot collection to be your passport picture.'}</p><button type="button" class="pp-chipbtn pp-editbtn" data-set-roll>${moleImg?'roll a new mole':'roll my mole'}</button></div></div></section>
 <form id="pp-set-form" novalidate>
 <section class="pp-set-sec"><h3>find you elsewhere</h3><div class="pp-set-grid">
  <label class="pp-f"><span>instagram</span><input name="instagram" maxlength="60" value="${esc(d.instagram)}" placeholder="@handle"></label>
  <label class="pp-f"><span>x / twitter</span><input name="twitter" maxlength="60" value="${esc(d.twitter)}" placeholder="@handle"></label>
  <label class="pp-f pp-f-wide"><span>website</span><input name="website" type="url" maxlength="300" value="${esc(d.website)}" placeholder="https://"></label></div></section>
 <section class="pp-set-sec"><h3>traveler type</h3><p class="pp-fine">Used until your postings decide it for you.</p><fieldset class="pp-look"><legend class="sr-only">traveler type</legend>${styles}</fieldset></section>
 <div class="pp-set-save"><button type="submit" class="pp-savebtn">save settings</button><span class="pp-fine" id="pp-set-msg" role="status"></span></div>
 </form>
 <section class="pp-set-sec"><h3>account</h3><p class="pp-set-sess">preview session: <b>${s.state==='member'?'founding member':s.state==='free'?'free account':'signed out'}</b>${s.email?' · '+esc(s.email):''}</p>
  <div class="pp-set-links">${ACCOUNT_LINKS.map(([id,l])=>`<a class="pp-chipbtn" href="/account/?tab=${id}">${l} ↗</a>`).join('')}<a class="pp-chipbtn" href="/inbox/">inbox ↗</a><a class="pp-chipbtn" href="/invites/">invites ↗</a></div>
  <div class="pp-set-links">${s.state==='out'?'':'<button type="button" class="pp-chipbtn" data-set-out>sign out of preview</button>'}<button type="button" class="pp-chipbtn" data-set-export>download my data</button><button type="button" class="pp-chipbtn" data-set-clear>clear this passport</button></div></section>`;
}
function openSettings(){
 let dlg=$('.pp-settings');
 if(!dlg){dlg=document.createElement('dialog');dlg.className='pp-settings';dlg.setAttribute('aria-labelledby','pp-set-title');document.body.append(dlg);
  dlg.addEventListener('click',async e=>{
   if(e.target===dlg||e.target.closest('.pp-dialog-close'))return dlg.close();
   if(e.target.closest('[data-set-out]')){try{localStorage.setItem(SESSION_KEY,JSON.stringify({state:'out',email:''}));}catch{}dlg.innerHTML=settingsHTML();notify('Signed out of the preview.');}
   if(e.target.closest('[data-set-export]')){const data={profile:readAccount(),look:readLook(),showcase:readPins(),wantToGo:readWantToGo(),collections:readColls()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='deepspot-passport.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
   const clr=e.target.closest('[data-set-clear]');
   if(clr){if(clr.dataset.sure!=='1'){clr.dataset.sure='1';clr.textContent='press again to clear';return;}
    for(const k of [accountKey,LOOK_KEY,PIN_KEY,'deepspot-want-to-go-v1'])try{localStorage.removeItem(k);}catch{}
    wtgList=[];profile=await loadProfile('preview');render();dlg.close();notify('This passport is cleared on this browser.');}
  });
  dlg.addEventListener('submit',async e=>{e.preventDefault();const f=e.target,fd=Object.fromEntries(new FormData(f));
   const next=normalizeAccount({...readAccount(),instagram:fd.instagram,twitter:fd.twitter,website:fd.website,style:fd.style||readAccount().style});
   if(fd.website&&!next.website){$('#pp-set-msg').textContent='Websites need to start with https://';return;}
   try{localStorage.setItem(accountKey,JSON.stringify(next));}catch{notify('This browser could not save your settings.');return;}
   profile=await loadProfile('preview');render();$('#pp-set-msg').textContent='Saved.';});
 }
 dlg.innerHTML=settingsHTML();dlg.showModal();dlg.querySelector('.pp-dialog-close').focus();
}
let rolling=false;
async function rollMole(trigger){
 if(rolling)return;rolling=true;const dlg=$('.pp-settings'),wasOpen=dlg?.open;
 try{const {openMoleReveal}=await import('../site/mole/mole-reveal.mjs?v=rules1');if(wasOpen)dlg.close();
  const res=await openMoleReveal({trigger:trigger?.isConnected?trigger:$('[data-settings]')});
  if(res){const next=normalizeAccount({...readAccount(),avatarMode:'mole',mole:{traits:res.traits,png:res.png,rolledAt:res.rolledAt}});
   if(!next.mole)notify('That mole picture was too large to save.');
   else{localStorage.setItem(accountKey,JSON.stringify(next));profile=await loadProfile('preview');render();notify('Mole kept. Your passport picture is updated.');}}
  if(wasOpen){dlg.innerHTML=settingsHTML();dlg.showModal();}
 }catch(err){console.error(err);notify('The mole roll could not load. Try again.');}
 finally{rolling=false;}
}
document.addEventListener('click',e=>{if(e.target.closest('[data-settings]'))openSettings();const rb=e.target.closest('[data-set-roll]');if(rb&&profile?.localPreview){e.preventDefault();rollMole(rb);}});

/* ---------- items + card stack (2026-10-21): stamps are items; hovering one deals a card stack where the passport sits ---------- */
const DECK_N=7;
function allItems(){
 const st=profile.stamps.map(s=>({id:'stamp-'+s.id,name:s.name,kind:'stamp',rarity:s.earned?'earned':'locked',color:s.color,note:s.earned?s.description:'Locked · '+s.hint,art:s.svg(),locked:!s.earned}));
 return [...st,...profile.items.map(i=>({...i,locked:false}))];
}
function itemsHTML(){
 const list=allItems();
 return `<ul class="pp-items">${list.map(it=>`<li><button type="button" class="pp-item${it.locked?' is-locked':''}" data-item="${esc(it.id)}" style="--ic:${it.color}" aria-label="${esc(it.name)}, ${esc(it.kind)}, ${esc(it.rarity)}"><span class="pp-item-art">${it.art}</span><span class="pp-item-name">${esc(it.name)}</span><span class="pp-item-kind">${esc(it.kind)} · ${esc(it.rarity)}</span></button></li>`).join('')}</ul><p class="pp-fine">Placeholder items for the release. Names and art are not final.</p>`;
}
const BACK=`<span class="pp-cb-in"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg><b>deepspot</b><i>explorer item card</i></span>`;
function deckHTML(){return `<div class="pp-deck" id="pp-deck" aria-hidden="true">${Array.from({length:DECK_N},(_,i)=>`<span class="pp-cb" style="--n:${i-(DECK_N-1)/2}">${BACK}</span>`).join('')}<span class="pp-cf"><span class="pp-cf-back pp-cb">${BACK}</span><span class="pp-cf-face" id="pp-cf-face"></span></span></div><p class="sr-only" id="pp-deck-live" aria-live="polite"></p>`;}
const faceHTML=(it,n)=>`<span class="pp-cf-top"><span>deepspot · item</span><span>no. ${String(n).padStart(3,'0')}</span></span><span class="pp-cf-art" style="--ic:${it.color}">${it.art}</span><span class="pp-cf-plate"><strong>${esc(it.name)}</strong><span>${esc(it.kind)} · ${esc(it.rarity)}</span><em>${esc(it.note)}</em></span>`;
let deckState={open:false,id:null,t:[],hideT:0};
const calmNow=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function deckTimers(){deckState.t.forEach(clearTimeout);deckState.t=[];}
function showDeck(id){
 const field=$('.pp-field'),deck=$('#pp-deck'),face=$('#pp-cf-face');if(!field||!deck)return;
 clearTimeout(deckState.hideT);const list=allItems(),it=list.find(i=>i.id===id);if(!it)return;
 if(deckState.open&&deckState.id===id)return;
 deckTimers();const calm=calmNow(),later=(f,ms)=>deckState.t.push(setTimeout(f,calm?0:ms));
 document.querySelectorAll('.pp-item').forEach(b=>b.classList.toggle('is-on',b.dataset.item===id));
 $('#pp-deck-live').textContent=`${it.name}, ${it.kind}, ${it.rarity}`;
 if(!deckState.open){deckState.open=true;deckState.id=id;face.innerHTML=faceHTML(it,list.indexOf(it)+1);field.setAttribute('data-deck','in');later(()=>deck.classList.add('is-flipped'),360);return;}
 deckState.id=id;deck.classList.remove('is-flipped');deck.classList.add('is-shuffle');
 later(()=>{face.innerHTML=faceHTML(it,list.indexOf(it)+1);deck.classList.remove('is-shuffle');},260);
 later(()=>deck.classList.add('is-flipped'),420);
}
function hideDeck(delay=220){
 clearTimeout(deckState.hideT);
 deckState.hideT=setTimeout(()=>{deckTimers();const field=$('.pp-field'),deck=$('#pp-deck');if(!field||!deck)return;deck.classList.remove('is-flipped','is-shuffle');document.querySelectorAll('.pp-item').forEach(b=>b.classList.remove('is-on'));
  deckState.t.push(setTimeout(()=>{field.removeAttribute('data-deck');deckState.open=false;deckState.id=null;},calmNow()?0:240));},delay);
}
document.addEventListener('pointerover',e=>{const b=e.target.closest?.('.pp-item');if(b&&e.pointerType==='mouse')showDeck(b.dataset.item);});
document.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;const from=e.target.closest?.('.pp-items'),to=e.relatedTarget?.closest?.('.pp-items');if(from&&!to)hideDeck();});
document.addEventListener('focusin',e=>{const b=e.target.closest?.('.pp-item');if(b)showDeck(b.dataset.item);else if(deckState.open&&!e.target.closest?.('.pp-items'))hideDeck(0);});
document.addEventListener('click',e=>{const b=e.target.closest('.pp-item');if(b){if(deckState.open&&deckState.id===b.dataset.item&&matchMedia('(hover: none)').matches)hideDeck(0);else showDeck(b.dataset.item);if(innerWidth<1100)$('.pp-field')?.scrollIntoView({behavior:calmNow()?'auto':'smooth',block:'start'});}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&deckState.open&&!document.querySelector('dialog[open]'))hideDeck(0);});

/* ---------- customize (2026-10-21): backgrounds for the left pane and a foil on the passport (lives in edit profile). Placeholders; locked ones say how they will be earned ---------- */
const STYLE_KEY='deepspot-passport-style-v1';
const ICON=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const STYLE={
 bg:[['halftone','earth halftone','',''],['dither-green','green dither','',''],['dither-cobalt','cobalt dither','',''],['night','night field','',''],['stars','starfield','',''],['aurora','aurora','',''],['dusk','dusk','',''],['grain','grain gradient','',''],['topo','topo lines','',''],['blueprint','blueprint','',''],['oya','oya quarry','',''],['xwejni','salt pans','',''],['green','green field','',''],['cobalt','cobalt field','',''],['paper','paper','','']],
 foil:[['none','none','',''],['holo','holo','',''],['gold','gold','',''],['chrome','chrome','',''],['cobalt','cobalt shine','','founding members'],['prism','prism','','reach level 10']]
};
function readStyle(){const d={bg:'halftone',foil:'none'};if(!profile?.localPreview)return d;try{const v=JSON.parse(localStorage.getItem(STYLE_KEY))||{};for(const k in d)if(STYLE[k].some(o=>o[0]===v[k]&&!o[3]))d[k]=v[k];}catch{}return d;}
function writeStyle(v){try{localStorage.setItem(STYLE_KEY,JSON.stringify(v));}catch{}}
function customizeHTML(){
 const st=readStyle(),grp=(k,title,hint)=>`<fieldset class="pp-cz"><legend>${title}</legend><p class="pp-fine">${hint}</p><div class="pp-cz-opts">${STYLE[k].map(([id,label,icon,lock])=>`<label class="pp-cz-o pp-cz-${k}${lock?' is-locked':''}" data-v="${id}"><input type="radio" name="cz-${k}" value="${id}"${st[k]===id?' checked':''}${lock?' disabled':''}><span class="pp-cz-sw">${icon}</span><span class="pp-cz-l">${label}</span>${lock?`<span class="pp-cz-lock">🔒 ${lock}</span>`:''}</label>`).join('')}</div></fieldset>`;
 return `<p class="pp-mono pp-cz-k">customize your passport · placeholders, more unlock at launch</p>${grp('bg','background','The field behind your passport.')}${grp('foil','foil','A finish on your passport card. Move your mouse over it.')}`;
}
const FIELD_INK={'halftone':[[146,193,228],[24,48,86]],'dither-green':[[7,214,83],[8,120,47]],'dither-cobalt':[[120,150,255],[60,96,255]]};
function setField(bg){
 const host=$('.pp-bg-in');if(!host)return;const ink=FIELD_INK[bg];
 if(window._ppFieldBg===bg&&window._ppField)return;window._ppField?.stop();window._ppField=null;window._ppFieldBg=bg;if(!ink)return;
 window._ppField=halftoneField(host,{cell:bg==='halftone'?8:7,fps:20,ink:()=>(document.documentElement.dataset.theme==='light'?ink[1]:ink[0]).map(v=>v/255)});
}
function applyStyle(st=readStyle()){
 setField(st.bg);const field=$('.pp-field'),obj=$('.pp-passobj-in');if(field)field.dataset.bg=st.bg;if(obj)obj.dataset.foil=st.foil;
}
/* in edit profile the choices preview live; save profile keeps them, cancel puts the saved look back */
const czPick=()=>{const st=readStyle();document.querySelectorAll('#pp-edit [name^=cz-]:checked').forEach(i=>st[i.name.slice(3)]=i.value);return st;};
document.addEventListener('change',e=>{if(/^cz-/.test(e.target.name||'')&&profile?.localPreview)applyStyle(czPick());});

try{
 profile=await loadProfile(params.get('user')||'wayfarer');
 if(profile?.localPreview){wtgList=readWantToGo();await Promise.all([wtgLoadCatalog(),wtgLoadCoords()]);}
 if(!profile){$('#passport').innerHTML='<div class="pp-loading"><h1>Profile not found</h1><p>This passport isn’t in the current collection.</p><a href="/community/">back to the community ↗</a></div>';$('#passport').setAttribute('aria-busy','false');}
 else render();
}catch(err){console.error(err);$('#passport').innerHTML='<div class="pp-loading"><h1>Unable to load this passport</h1><p>Please refresh to try again.</p><a href="/community/">back to the community ↗</a></div>';$('#passport').setAttribute('aria-busy','false');}
