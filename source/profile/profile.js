import {moleCrop} from './passport-art.mjs?v=pad1';
import {createPassportImage} from './passport-export.mjs?v=pv3';
import {padHTML,initPad} from './sign-pad.mjs?v=pv3';
import {travelerStyles,travelerMark} from '../site/account-state.mjs?v=pad1';
import {memberLevels,memberRange,POINTS} from './passport-rules.mjs?v=pv2';
import {escapeHTML as esc,safeReturn} from './identity.mjs';
import {loadProfile} from './data.mjs?v=pv3';
import {halftoneField} from '../site/halftone-field.mjs?v=2';
import {readWantToGo,writeWantToGo,addItem,removeAt,moveItem,WTG_MAX,WTG_NAME_MAX} from './want-to-go.mjs?v=wtg1';
const $=selector=>document.querySelector(selector);
let profile,toastTimer,exportPromise,exportImage;
const params=new URLSearchParams(location.search);
const returnPath=safeReturn(params.get('from'))||(params.get('user')==='preview'?'/account/':'/community/');
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
const sigHTML=art=>art?`<img src="${esc(art)}" alt="${esc(profile.name)}’s mark" width="512" height="256">`:'<span>no mark yet</span>';
function typeHTML(){
 const t=profile.type,id=t.id||(profile.localPreview?profile.style:null),style=travelerStyles.find(s=>s.id===id);
 if(!style)return empty('no type yet.','A traveler type shows up after the first posting. It is worked out from the categories of what is posted.','<a href="/contribute/" class="pp-link">add a spot ↗</a>');
 const top=t.cats.slice(0,6),rest=t.cats.slice(6).reduce((n,c)=>n+c[1],0),parts=[...top.map(([k,n],i)=>[k,n,CATS[i]]),...(rest?[['other',rest,'#8a98a6']]:[])];
 return `<div class="pp-card pp-type"><div class="pp-type-row"><span class="pp-type-mark">${travelerMark(style.id)}</span><div><h3>${esc(style.name)}.</h3><p>${esc(style.description)}</p></div></div>
 ${parts.length?`<div class="pp-catbar" role="img" aria-label="Posting categories: ${esc(parts.map(p=>p[0]+' '+p[1]).join(', '))}">${parts.map(([k,n,c])=>`<i style="flex:${n};background:${c}"></i>`).join('')}</div><ul class="pp-legend">${parts.map(([k,n,c])=>`<li><i style="background:${c}" aria-hidden="true"></i>${esc(k)} <b>${n}</b></li>`).join('')}</ul>`:''}
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
 const list=profile.records,card=r=>`<li class="pp-post"${list.indexOf(r)>5?' data-extra hidden':''}><a href="${esc(r.href)}"><span class="pp-post-img">${r.image?`<img src="${esc(r.card||r.image)}" data-orig="${esc(r.image)}" alt="" width="400" height="300" loading="lazy" decoding="async">`:'<span class="pp-no-photo" aria-hidden="true">deep<br>spot.</span>'}</span><span class="pp-post-copy"><span class="pp-mono">${esc(r.place||'')}</span><strong>${esc(r.name)}</strong><span class="pp-post-tags">${r.kind==='story'?`<i>story · ${esc(r.tag||'')}</i>`:r.tags.filter(t=>t!=='DEEP SPOT CHOICE').slice(0,2).map(t=>`<i>${esc(t.toLowerCase())}</i>`).join('')+(r.tags.includes('DEEP SPOT CHOICE')?'<i class="pp-choice">deep spot choice</i>':'')}</span></span></a></li>`;
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
const wtgStatus=()=>`${wtgList.length}/${WTG_MAX} places. Saved on this browser.`;
function wtgHTML(){
 if(!profile.localPreview)return empty('no want-to-go list yet.','Lists are not shared from live accounts yet.');
 return `<form class="pp-wtg-form" id="pp-wtg-form" autocomplete="off" novalidate><label class="pp-mono" for="pp-wtg-in">add a place</label>
 <div class="pp-wtg-row"><div class="pp-wtg-combo"><input id="pp-wtg-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="pp-wtg-lb" maxlength="${WTG_NAME_MAX}" placeholder="a spot, a city, anywhere" enterkeyhint="done"><ul id="pp-wtg-lb" class="pp-wtg-lb" role="listbox" aria-label="Matching deep spots" hidden></ul></div><button type="submit" class="pp-wtg-add">add</button></div>
 <p class="pp-fine pp-wtg-msg" id="pp-wtg-msg" role="status" aria-live="polite">${wtgStatus()}</p></form><div id="pp-wtg-list">${wtgListHTML()}</div>`;
}
function wtgRefresh(){const box=$('#pp-wtg-list');if(!box)return;box.innerHTML=wtgListHTML();const s=document.querySelector('#pp-wtg span');if(s)s.textContent=`(${wtgList.length})`;const m=$('#pp-wtg-msg');if(m&&!m.dataset.keep)m.textContent=wtgStatus();}
function wtgSay(text){const m=$('#pp-wtg-msg');if(!m)return;m.textContent=text;m.dataset.keep='1';clearTimeout(wtgSay.t);wtgSay.t=setTimeout(()=>{delete m.dataset.keep;m.textContent=wtgStatus();},3500);}
function wtgCommit(next){wtgList=next;if(!writeWantToGo(wtgList))wtgSay('Could not save on this browser.');wtgRefresh();}
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
 inp.value='';wtgPick=null;wtgClose();wtgCommit(r.list);
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
 document.querySelectorAll('.pp-tab').forEach(t=>{const on=(t.dataset.tab==='mark')===mark;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on&&focus)t.focus();});
 $('#pp-pane-pass').hidden=mark;$('#pp-pane-mark').hidden=!mark;$('.pp-book').dataset.tab=name;
}
function render(){
 document.title=`${profile.name} — DeepSpot Passport`;
 const initials=profile.name.split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase(),lv=profile.level,st=profile.standing,soc=profile.socials;
 const rank=st?.rankAll;profile.field=rank&&rank<=3?RANKC[rank-1]:'#dfe6e4';
 const mole=profile.mole?moleHTML():profile.localPreview?'<a class="pp-mole pp-mole-empty" href="/account/"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg><span>roll your mole ↗</span></a>':`<span class="pp-mole pp-mole-empty" role="img" aria-label="${esc(profile.name)}’s initials"><b>${esc(initials)}</b></span>`;
 const mini=profile.mole?moleHTML('pp-mole-mini'):`<span class="pp-mole pp-mole-mini pp-mole-empty" aria-hidden="true"><b>${esc(initials)}</b></span>`;
 const mark=padHTML(profile),label=profile.localPreview?'my mark':'their mark';
 $('#passport').innerHTML=`<article class="pp-book" style="--pf:${profile.field}" data-tab="passport" aria-label="${esc(profile.name)}’s explorer passport">
 <aside class="pp-field" aria-label="Passport"><div class="pp-bg" aria-hidden="true"><div class="pp-bg-in"></div></div><div class="pp-field-in">
  <div class="pp-tabs" role="tablist" aria-label="Passport views"><button class="pp-tab" role="tab" id="pp-tab-pass" data-tab="passport" aria-selected="true" aria-controls="pp-pane-pass">passport</button><button class="pp-tab" role="tab" id="pp-tab-mark" data-tab="mark" aria-selected="false" tabindex="-1" aria-controls="pp-pane-mark">${label}</button></div>
  <div class="pp-halftone" aria-hidden="true"></div>
  <div class="pp-stage">
   <div class="pp-pane" id="pp-pane-pass" role="tabpanel" aria-labelledby="pp-tab-pass">
    <div class="pp-card pp-idcard"><div class="pp-id-top"><span>deepspot · explorer passport</span><span>${rank?'no. '+String(rank).padStart(3,'0'):profile.localPreview?'draft':''}</span></div>
     <div class="pp-id-body"><div class="pp-molebox">${mole}${lv?`<span class="pp-lvl" role="img" aria-label="Level ${lv.level}"><b>${lv.level}</b><i>lvl</i></span>`:''}</div>
      <dl class="pp-rows"><div><dt>name</dt><dd id="pp-name">${esc(profile.name)}</dd></div><div><dt>user</dt><dd>${profile.handle?'@'+esc(profile.handle):'—'}</dd></div><div><dt>since</dt><dd>${esc(profile.joined||'—')}</dd></div><div><dt>level</dt><dd>${esc(profile.member)}</dd></div></dl></div>
     ${lv?`<div class="pp-prog"><div class="pp-bar4" role="progressbar" aria-label="Progress to level ${lv.level+1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${lv.pct}"><i style="width:${Math.max(lv.pct,2)}%"></i></div><span>${fmt(lv.points)} / ${fmt(lv.to)} pts</span></div>`:''}
     <span class="pp-readable-code" aria-hidden="true">DEEP&lt;SPOT&lt;&lt;${esc(profile.name.toUpperCase().replaceAll(' ','<'))}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span></div>
    <div class="pp-sig" id="pp-sig">${sigHTML(profile.signatureArt)}</div>
   </div>
   <div class="pp-pane" id="pp-pane-mark" role="tabpanel" aria-labelledby="pp-tab-mark" hidden>${mark}</div>
  </div></div></aside>
 <div class="pp-rec">
 ${sec('bio','bio',null,`<div class="pp-bio-top">${mini}<div class="pp-bio-id"><h1 class="pp-bio-name">${esc(profile.name)}</h1><span class="pp-handle">${profile.handle?'@'+esc(profile.handle):'DeepSpot contributor'}</span></div>${lv?`<span class="pp-badge" role="img" aria-label="Level ${lv.level}"><b>${lv.level}</b><i>level</i></span>`:''}</div>
  ${profile.bio?`<p class="pp-bio-text">${esc(profile.bio)}</p>`:'<p class="pp-bio-text pp-bio-empty">no bio yet.</p>'}
  <div class="pp-chips-row"><ul class="pp-chips">${profile.points==null?'':`<li>${fmt(profile.points)} pts</li>`}${profile.joined?`<li>since ${esc(profile.joined.toLowerCase())}</li>`:''}<li>${esc(profile.member)}</li></ul>${soc&&(soc.instagram||soc.twitter||soc.website)?`<div class="pp-social-links">${soc.instagram?`<a href="https://www.instagram.com/${encodeURIComponent(soc.instagram.replace(/^@/,''))}/" target="_blank" rel="noopener" data-original>instagram ↗</a>`:''}${soc.twitter?`<a href="https://x.com/${encodeURIComponent(soc.twitter.replace(/^@/,''))}" target="_blank" rel="noopener" data-original>x ↗</a>`:''}${soc.website?`<a href="${esc(soc.website)}" target="_blank" rel="noopener" data-original>website ↗</a>`:''}</div>`:''}</div>`)}
 ${sec('type','traveler type',null,typeHTML())}
 ${sec('stats','contributions',null,statsHTML())}
 ${sec('posts','postings',profile.records.length,postingsHTML(),profile.records.length>6?'<button type="button" class="pp-chipbtn" data-more aria-expanded="false">show all</button>':'')}
 ${sec('wtg','want to go',profile.localPreview?wtgList.length:null,wtgHTML())}
 ${sec('stamps','stamps',`${profile.stamps.filter(s=>s.earned).length}/${profile.stamps.length}`,stampsHTML())}
 ${sec('places','places',profile.places.length,placesHTML())}
 ${sec('give','giveaway',null,giveawayHTML())}
 <p class="pp-note">${esc(profile.notice)}</p></div></article>`;
 $('#passport').setAttribute('aria-busy','false');$('.pp-share').disabled=false;
 /* soft ambient field: Earth glyphs on slow turbulent noise (same module as the community race), very low strength, fills the whole left column (sticky viewport-sized layer, so the cost stays one screen) */
 window._ppField?.stop();window._ppField=halftoneField($('.pp-bg-in'),{cell:8,fps:20,ink:()=>document.documentElement.dataset.theme==='light'?[24/255,48/255,86/255]:[146/255,193/255,228/255]});
 if(profile.localPreview)initPad($('#pp-pad'),{art:profile.signatureArt,onSave:url=>{profile.signatureArt=url||null;$('#pp-sig').innerHTML=sigHTML(profile.signatureArt);exportPromise=null;if(exportImage){URL.revokeObjectURL(exportImage.url);exportImage=null;}if(url)setTab('passport');}});
 if(profile.localPreview)wtgBind();
 if(location.hash==='#pp-pad')setTab('mark');
 applyTheme(document.documentElement.dataset.theme);
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
try{
 profile=await loadProfile(params.get('user')||'wayfarer');
 if(profile?.localPreview){wtgList=readWantToGo();await wtgLoadCatalog();}
 if(!profile){$('#passport').innerHTML='<div class="pp-loading"><h1>Profile not found</h1><p>This passport isn’t in the current collection.</p><a href="/community/">back to the community ↗</a></div>';$('#passport').setAttribute('aria-busy','false');}
 else render();
}catch{$('#passport').innerHTML='<div class="pp-loading"><h1>Unable to load this passport</h1><p>Please refresh to try again.</p><a href="/community/">back to the community ↗</a></div>';$('#passport').setAttribute('aria-busy','false');}
const footer=$('deepspot-cta');footer?.querySelectorAll('.ds-footer-logo,.ds-footer-nav a').forEach(a=>{if(a.classList.contains('ds-footer-logo')||a.textContent.trim()==='home')a.href='/?theme='+document.documentElement.dataset.theme;});

document.addEventListener('keydown',event=>{const tb=event.target.closest?.('.pp-tab');if(!tb||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();setTab(event.key==='ArrowLeft'||event.key==='Home'?'passport':'mark',true);});
