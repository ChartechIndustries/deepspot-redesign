import {esc,$,$$,icon,localURL,action,saveButton,spotURL,readStore,writeStore} from './core.mjs';
import {profileHref,profileId} from '../profile/identity.mjs';
import {readAccount,avatarImage} from './account-state.mjs?v=icons2';
import {COMMUNITY_METRICS} from './community-hub.mjs';
import {avatarHTML} from '../profile/identity.mjs';
import {passportModels,participantsHTML,wirePassports} from './passport-mini.mjs?v=un1';

/* Community hub v2 (2026-10-19). Real data only: leaderboard, forum snapshot, catalog. Votes live in this browser. The giveaway hero lives in giveaway-hero.mjs. */
const DISCORD_URL='https://www.deepspot.io/community'; // TODO: replace with the real Discord invite when Charlie supplies it
const VOTE_KEYS={spot:'deepspot-community-spot-votes-v1',poll:'deepspot-community-poll-v1',road:'deepspot-community-roadmap-v1'};
const ROAD=[
 ['building now',[['passports','Passports + profile moles','Your explorer ID, with stamps and badges.',70],['signatures','PictoChat signatures','Draw your own passport signature.',60],['giveaways','Monthly giveaways','Prizes for the top spot hunters.',90]]],
 ['up next',[['trip-lists','Trip lists','Save spots into lists and share them.'],['offline-maps','Offline maps','Download a region before you lose signal.'],['live-meetups','Live meetups','Find explorers heading where you are.']]],
 ['considering',[['route-planner','AI route planner','String nearby spots into a day trip.'],['tldr','TL;DR summaries','The 20-second version of every story.'],['video-spots','Video spots','Short clips from people who were there.']]]
];
const svg=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICO={prev:svg('<path d="M19 12H5m6-6-6 6 6 6"/>'),next:svg('<path d="M5 12h14m-6-6 6 6-6 6"/>'),pause:svg('<path d="M8 5v14M16 5v14"/>'),play:svg('<path d="M7 4.5v15l12-7.5Z"/>'),up:svg('<path d="m6 15 6-6 6 6"/>'),down:svg('<path d="m6 9 6 6 6-6"/>'),ext:svg('<path d="M7 17 17 7M8 7h9v9"/>')};
const out=(label,url,cls='')=>`<a class="ds-button ${cls}" href="${esc(url)}" data-original target="_blank" rel="noopener">${label}${icon('arrow')}</a>`;
const ext=(label,url,cls='cv-link')=>`<a class="${cls}" href="${esc(url)}" data-original target="_blank" rel="noopener">${label} ↗</a>`;
export const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const clip=(t,n)=>t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+'…':t;
const votes=k=>{const v=readStore(VOTE_KEYS[k],{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{};};
const setVote=(k,id,val)=>{const v=votes(k);if(val)v[id]=val;else delete v[id];writeStore(VOTE_KEYS[k],v);};
const initial=n=>esc(String(n||'?').trim()[0]?.toUpperCase()||'?');

/* ---------- data ---------- */
export function people(data){
 const profiles=data.profiles||[];
 const find=name=>profiles.find(p=>p.name===name||(p.aliases||[]).some(a=>profileId(a)===profileId(name)));
 const build=(list)=>list.map((r,i)=>{
  const p=find(r.name),id=p?.id||profileId(r.name),ids=new Set([r.name,...(p?.aliases||[])].map(x=>x.toLowerCase()));
  const own=data.spots.filter(s=>s.publisher&&ids.has(s.publisher.toLowerCase()));
  const tally={};for(const s of own)for(const t of s.tags)if(t!=='DEEP SPOT CHOICE')tally[t]=(tally[t]||0)+1;
  const top=Object.entries(tally).sort((a,b)=>b[1]-a[1])[0]?.[0];
  return {...r,rank:i+1,id,hasPhoto:!!(p?.image||r.image),mole:p&&!p.sample?`/community-assets/moles/${id}.webp`:'',tag:(top||'explorer').toLowerCase(),stamps:[0,...(own.some(s=>s.tags.includes('DEEP SPOT CHOICE'))?[2]:[])],href:profileHref(id)};
 });
 return {monthly:build(data.content.leaderboard.monthly),all:build(data.content.leaderboard.allTime)};
}
const viewerAvatar=(acct,cls='')=>{const src=avatarImage(acct);return `<span class="cv-av ${cls}">${src?`<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`:`<span aria-hidden="true">${initial(acct.name||acct.username||'you')}</span>`}</span>`;};

/* ---------- 3. discord: full-bleed showpiece ---------- */
/* one forum post shown as a chat message: avatar, handle, #channel, replies, the first lines of the post */
const replies=n=>`${n} ${n===1?'reply':'replies'}`;
const msg=f=>{const text=f.body.split(/\n\s*\n/)[0].replace(/^\s*[-*•]\s+/gm,'').replace(/\s+/g,' ').trim();
 return `<li class="dc-msg">${avatarHTML(f.author,{className:'dc-av'})}<div class="dc-mb"><span class="dc-m"><b>${esc(f.author)}</b><i>#${esc(f.category.replace(/\s+/g,'-'))}</i><small>${replies(f.replies)}</small></span><a href="${esc(localURL('/forum/',{id:f.id}))}">${esc(clip(text,150))}</a></div></li>`;};
const PIN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 3 6 6-3 1-4 4 .5 4.5L12 17l-5 5-1-1 5-5-2.5-2.5L13 9l1-3Z"/></svg>';
const CHECK='<svg class="dc-ck" viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>';
function discordHTML(content){
 const forum=content.forum,ann=forum.find(f=>f.category==='announcement'),poll=forum.find(f=>f.category==='poll');
 const href=f=>esc(localURL('/forum/',{id:f.id}));
 const options=(poll?.body||'').split('\n').map(l=>l.match(/^\s*[-*•]\s+(.+)$/)?.[1]?.trim()).filter(Boolean);
 const pv=votes('poll')[poll?.id];
 const pollTitle=(poll?.title||'').replace(/^poll:\s*/i,'');
 return `<section class="dc" id="cv-dc" aria-labelledby="cv-dct"><div class="dc-in">
 <header class="dc-head"><div class="dc-ttl"><span class="dc-livetag"><i class="dc-live" aria-hidden="true"></i>live now</span><h2 id="cv-dct">live from<br>the discord.</h2></div>
  <div class="dc-stats"><p><b data-count="${COMMUNITY_METRICS.month}">${fmt(COMMUNITY_METRICS.month)}</b><span>new spots this month</span></p><p><b data-count="${COMMUNITY_METRICS.members}">${fmt(COMMUNITY_METRICS.members)}</b><span>members</span></p></div>
  <a class="dc-join" href="${esc(DISCORD_URL)}" data-original target="_blank" rel="noopener">join now ${icon('arrow')}</a></header>
 <div class="dc-grid">
  <div class="dc-wall"><div class="dc-wall-top"><h3><i class="dc-live" aria-hidden="true"></i>featured messages</h3><span>from across the forum</span></div><ol class="dc-feed" data-feed aria-label="Featured messages from the forum">${forum.map(msg).join('')}</ol><a class="dc-more" href="${esc(localURL('/forum/'))}">open the forum ↗</a></div>
  <div class="dc-side">
  ${ann?`<article class="dc-ticket"><span class="dc-pin" aria-hidden="true">${PIN}</span><div class="dc-tk-top"><span>#announcements</span><span>pinned</span></div><h3>${esc(ann.title)}</h3><p>${esc(clip(ann.body.split(/\n\s*\n/)[0].replace(/\s+/g,' ').trim(),170))}</p><div class="dc-tk-foot"><span>${replies(ann.replies)}</span><a href="${href(ann)}">read it ↗</a></div></article>`:''}
  ${poll?`<article class="dc-poll" data-poll="${esc(poll.id)}"><div class="dc-poll-top"><span>#polls</span><span>open</span></div><h3>${esc(pollTitle)}</h3><div class="dc-opts" role="group" aria-label="${esc(pollTitle)}">${options.map((o,i)=>`<button type="button" class="dc-opt" data-opt="${i}" aria-pressed="${pv===i}"><span class="dc-fill" aria-hidden="true"></span><span class="dc-opt-t">${esc(o)}</span><span class="dc-opt-m">${CHECK}<span>your vote</span></span></button>`).join('')}</div><div class="dc-poll-foot"><span>${replies(poll.replies)} on the forum</span><a href="${href(poll)}">vote on the forum ↗</a></div></article>`:''}
  </div></div></div></section>`;
}

/* ---------- 4. spots ---------- */
const stem=s=>s.image.split('/').pop().replace(/\.[a-z]+$/i,'');
const cardImg=s=>`/editorial-assets/cards/${stem(s)}.webp`;
const haversine=(a,b)=>{const r=x=>x*Math.PI/180,d=r(b[0]-a[0]),e=r(b[1]-a[1]),h=Math.sin(d/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(e/2)**2;return 12742*Math.asin(Math.sqrt(h));};
const dateMs=s=>Date.parse(s.date||'')||0;
function spotLists(spots){
 const local=spots.filter(s=>s.image?.startsWith('/')&&!s.title.startsWith('PART OF:'));
 const trending=local.slice(0,6);
 const yes=votes('spot'),mine=local.filter(s=>yes[s.id]==='yes');
 const high=[...mine,...local.filter(s=>s.tags.includes('DEEP SPOT CHOICE')&&!mine.includes(s)),...local.slice(6)].filter((s,i,a)=>a.indexOf(s)===i).slice(0,6);
 const newest=[...local].filter(s=>dateMs(s)).sort((a,b)=>dateMs(b)-dateMs(a)).slice(0,6);
 const mapped=local.filter(s=>Array.isArray(s.coordinates));
 return {trending,high,newest,mapped};
}
const BASIS={trending:'Featured finds from the collection, in the order the team lists them.',high:'Spots you voted yes on come first, then Deep Spot Choice picks. Live vote totals stay on DeepSpot.',newest:'The most recently added spots with a photo, newest first.',near:'The mapped spots in the collection, closest first.'};
function voteBlock(id,v){
 return `<div class="cv-vote" data-vote-id="${esc(id)}" data-v="${v||''}"><div class="cv-vote-l"><span>belongs on Deep Spot?</span><b data-vtxt>${v==='yes'?'you said yes':v==='no'?'you said not quite':'cast your vote'}</b></div><div class="cv-vbar" aria-hidden="true"><i></i></div><div class="cv-vbtns"><button type="button" data-v-yes aria-pressed="${v==='yes'}">yes</button><button type="button" data-v-no aria-pressed="${v==='no'}">not quite</button></div></div>`;
}
function spotCard(s,acct,dist){
 const link=esc(spotURL(s)),v=votes('spot')[s.id];
 const where=s.region||s.place;
 return `<article class="cv-spot"><div class="cv-photo"><img src="${esc(cardImg(s))}" alt="" width="800" height="600" loading="lazy" decoding="async"><div class="cv-photo-copy"><span class="cv-place">${esc(where)}${dist!=null?` · ${fmt(Math.round(dist))} km away`:''}</span><h3><a href="${link}">${esc(s.title)}</a></h3><span class="cv-by">by ${esc(s.publisher||'DeepSpot collection')}</span></div><a class="cv-go" href="${link}" tabindex="-1" aria-hidden="true">${ICO.ext}</a></div>${saveButton(s)}${voteBlock(s.id,v)}<div class="cv-cmt">${viewerAvatar(acct,'sm')}<a class="cv-link" href="${link}">add a comment ↗</a></div></article>`;
}
function spotsHTML(data,acct){
 const L=spotLists(data.spots);
 return `<section class="cv-panel cv-spots" aria-labelledby="cv-sp"><header class="cv-bar"><h2 id="cv-sp">community spots.</h2><p>Found by explorers. Vote on what makes the map.</p></header>
 <div class="cv-tabs" role="group" aria-label="Sort community spots">${[['trending','trending'],['high','highest voted'],['newest','newest'],['near','near you']].map(([k,l],i)=>`<button type="button" data-tab="${k}" aria-pressed="${i===0}">${l}</button>`).join('')}</div>
 <div class="cv-spots-in"><p class="cv-basis" data-basis role="status">${BASIS.trending}</p><div class="cv-grid" data-grid>${L.trending.map(s=>spotCard(s,acct)).join('')}</div>
 <div class="cv-cta">${action('see all community spots','/browse/')}${action('submit a spot','/contribute/','secondary')}</div></div></section>`;
}

/* ---------- 5. roadmap ---------- */
function roadHTML(){
 const rv=votes('road');
 return `<section class="cv-panel cv-road" aria-labelledby="cv-rd"><header class="cv-bar"><h2 id="cv-rd">roadmap.</h2><p><a href="${esc(localURL('/roadmap/'))}">Vote on what we build next. ↗</a></p></header>
 <div class="cv-cols cv-road-cols">${ROAD.map(([name,items])=>`<div class="cv-col"><div class="cv-rh"><h3>${name}</h3><span>${items.length} features</span></div><ul class="cv-feats">${items.map(([id,t,d,pct])=>{const v=rv[id];return `<li class="cv-feat" data-road="${id}" data-v="${v||''}"><div class="cv-feat-c"><h4>${esc(t)}</h4><p>${esc(d)}</p>${pct?`<div class="cv-prog" role="progressbar" aria-label="${esc(t)} build progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>`:''}</div><div class="cv-ud"><button type="button" data-ud="up" aria-pressed="${v==='up'}" aria-label="Vote up ${esc(t)}">${ICO.up}</button><span data-udt>${v==='up'?'you +1':v==='down'?'you −1':'vote'}</span><button type="button" data-ud="down" aria-pressed="${v==='down'}" aria-label="Vote down ${esc(t)}">${ICO.down}</button></div></li>`;}).join('')}</ul></div>`).join('')}</div></section>`;
}

/* ---------- behavior ---------- */
/* the featured feed: the oldest message comes back at the top every few seconds with a soft spring, like a live channel; the rest slide down */
function wireFeed(scope){
 const ol=$('[data-feed]',scope);if(!ol||ol.children.length<2||reduced())return;
 let t=0,hold=false,seen=false;
 const step=()=>{const kids=[...ol.children],tops=new Map(kids.map(li=>[li,li.getBoundingClientRect().top])),last=ol.lastElementChild;
  ol.prepend(last);last.classList.add('is-new');
  for(const li of ol.children){if(li===last)continue;const dy=tops.get(li)-li.getBoundingClientRect().top;li.style.transition='none';li.style.transform=`translateY(${dy}px)`;}
  void ol.offsetHeight;
  requestAnimationFrame(()=>{for(const li of ol.children){li.style.transition='';li.style.transform='';}last.classList.remove('is-new');});};
 const tick=()=>{clearTimeout(t);if(hold||!seen||document.hidden)return;t=setTimeout(()=>{step();tick();},3500);};
 const box=ol.parentElement;
 box.addEventListener('pointerenter',()=>{hold=true;clearTimeout(t);});box.addEventListener('pointerleave',()=>{hold=false;tick();});
 box.addEventListener('focusin',()=>{hold=true;clearTimeout(t);});box.addEventListener('focusout',e=>{if(!box.contains(e.relatedTarget)){hold=false;tick();}});
 document.addEventListener('visibilitychange',tick);
 if('IntersectionObserver'in window)new IntersectionObserver(([en])=>{seen=en.isIntersecting;tick();},{threshold:.3}).observe(ol);
}
function wirePoll(scope){
 const art=$('[data-poll]',scope);if(!art)return;const id=art.dataset.poll;
 $$('[data-opt]',art).forEach(b=>b.onclick=()=>{const i=Number(b.dataset.opt),cur=votes('poll')[id];const val=cur===i?null:i;setVote('poll',id,val);$$('[data-opt]',art).forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.opt)===val)));});
}
/* the two big numbers count up once when the section scrolls into view */
function wireCounts(scope){
 const els=$$('[data-count]',scope).filter(e=>e.closest('.dc'));if(!els.length||reduced()||!('IntersectionObserver'in window))return;
 // real numbers stay in the markup until the count starts, so a missed observer never leaves a 0
 const io=new IntersectionObserver(([en])=>{if(!en.isIntersecting)return;io.disconnect();const t0=performance.now();
  const f=now=>{const x=Math.min(1,(now-t0)/1500),y=1-(1-x)**3;els.forEach(e=>{e.textContent=fmt(Math.round(+e.dataset.count*y));});if(x<1)requestAnimationFrame(f);};requestAnimationFrame(f);},{threshold:.35});
 io.observe($('.dc-head',scope));
}
function wireSpots(scope,data,acct){
 const L=spotLists(data.spots),grid=$('[data-grid]',scope),basis=$('[data-basis]',scope),tabs=$$('[data-tab]',scope);
 let geo=null,geoState='idle';
 const draw=(list,dists)=>{grid.innerHTML=list.length?list.map((s,i)=>spotCard(s,acct,dists?dists[i]:null)).join(''):'';};
 const show=async tab=>{
  tabs.forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab===tab)));basis.textContent=BASIS[tab==='near'?'near':tab];
  if(tab==='trending')return draw(L.trending);
  if(tab==='high')return draw(spotLists(data.spots).high);
  if(tab==='newest')return draw(L.newest);
  const m=L.mapped;
  if(geo){const r=m.map(s=>({s,d:haversine(geo,s.coordinates)})).sort((a,b)=>a.d-b.d).slice(0,6);basis.textContent=BASIS.near;return draw(r.map(x=>x.s),r.map(x=>x.d));}
  if(geoState==='asking')return;
  geoState='asking';basis.textContent='Asking your browser for your location…';draw(m.slice(0,6));
  const fail=()=>{geoState='idle';if($('[data-tab][aria-pressed=true]',scope)?.dataset.tab==='near')basis.textContent='Location is off, so we cannot sort by distance. Allow location to see the closest spots. Showing the mapped spots instead.';};
  if(!navigator.geolocation)return fail();
  navigator.geolocation.getCurrentPosition(p=>{geo=[p.coords.latitude,p.coords.longitude];geoState='idle';if($('[data-tab][aria-pressed=true]',scope)?.dataset.tab==='near')show('near');},fail,{timeout:6000,maximumAge:600000});
 };
 tabs.forEach(b=>b.onclick=()=>show(b.dataset.tab));
}
function wireVotes(scope){
 scope.addEventListener('click',e=>{
  const yn=e.target.closest('[data-v-yes],[data-v-no]');
  if(yn){const box=yn.closest('[data-vote-id]'),id=box.dataset.voteId,want=yn.hasAttribute('data-v-yes')?'yes':'no',cur=votes('spot')[id],val=cur===want?null:want;setVote('spot',id,val);
   $$(`[data-vote-id="${CSS.escape(id)}"]`,scope).forEach(b=>{b.dataset.v=val||'';$('[data-v-yes]',b).setAttribute('aria-pressed',String(val==='yes'));$('[data-v-no]',b).setAttribute('aria-pressed',String(val==='no'));$('[data-vtxt]',b).textContent=val==='yes'?'you said yes':val==='no'?'you said not quite':'cast your vote';});return;}
  const ud=e.target.closest('[data-ud]');
  if(ud){const li=ud.closest('[data-road]'),id=li.dataset.road,cur=votes('road')[id],val=cur===ud.dataset.ud?null:ud.dataset.ud;setVote('road',id,val);li.dataset.v=val||'';$$('[data-ud]',li).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ud===val)));$('[data-udt]',li).textContent=val==='up'?'you +1':val==='down'?'you −1':'vote';}
 });
}

/* your vote matters: two huge numbered cards, the same loud family as the discord stage */
const voteHTML=()=>`<section class="vm" aria-labelledby="cv-vt"><div class="vm-in"><div class="vm-l"><span class="vm-k">two ways to shape deepspot</span><h2 id="cv-vt">your vote<br>matters.</h2><p>Nothing goes on the map and nothing gets built without the community. Pick a side.</p></div><ol class="vm-r"><li><a href="#cv-sp" data-jump="cv-sp"><span class="vm-n">01</span><b>what makes<br>the map.</b><span class="vm-d">Yes or not quite on new community spots.</span><i>vote on spots ${icon('arrow')}</i></a></li><li><a href="#cv-rd" data-jump="cv-rd"><span class="vm-n">02</span><b>what we build<br>next.</b><span class="vm-d">Up or down on the roadmap.</span><i>vote on the roadmap ${icon('arrow')}</i></a></li></ol></div></section>`;
export async function renderCommunityV2(root,data){
 const acct=readAccount(),gv=new URLSearchParams(location.search).get('giveaway')||'g1';
 const order=people(data).monthly.slice().sort((a,b)=>b.points-a.points),models=passportModels(data,order);
 root.innerHTML=`<div class="cv"><h1 class="cv-sr">DeepSpot community</h1><div data-giveaway></div>${models.length?participantsHTML(models):''}${discordHTML(data.content)}${voteHTML()}<div class="cv-gut">${spotsHTML(data,acct)}${roadHTML()}</div></div>`;
 $$('[data-jump]',root).forEach(l=>l.addEventListener('click',e=>{const t=document.getElementById(l.dataset.jump);if(!t)return;e.preventDefault();t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}));
 const scope=$('.cv',root);
 wirePoll(scope);wireFeed(scope);wireCounts(scope);wireSpots(scope,data,acct);wireVotes(scope);
 const pm=$('[data-pm]',scope);if(pm)wirePassports(pm,models);
 const {renderGiveaway}=await import('./giveaway-hero.mjs?v=17');renderGiveaway($('[data-giveaway]',scope),data,gv);
}
