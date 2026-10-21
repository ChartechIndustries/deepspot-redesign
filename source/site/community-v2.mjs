import {esc,$,$$,icon,localURL,action,saveButton,spotURL,readStore,writeStore} from './core.mjs';
import {profileHref,profileId} from '../profile/identity.mjs';
import {readAccount,avatarImage} from './account-state.mjs?v=pad1';
import {stampArt,awards,moleCrop} from '../profile/passport-art.mjs?v=pad1';
import {COMMUNITY_METRICS} from './community-hub.mjs';

/* Community hub v2 (2026-10-19). Real data only: leaderboard, forum snapshot, catalog. Votes live in this browser. The giveaway hero lives in giveaway-hero.mjs. */
const DISCORD_URL='https://www.deepspot.io/community'; // TODO: replace with the real Discord invite when Charlie supplies it
const VOTE_KEYS={spot:'deepspot-community-spot-votes-v1',poll:'deepspot-community-poll-v1',road:'deepspot-community-roadmap-v1'};
const PP_COLORS=[['#07d653','#0b1b27'],['#3c60ff','#fff'],['#83cdce','#0b1b27'],['#f2c14e','#0b1b27']];
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

export function passCard(r,i){
 const [c,ink]=PP_COLORS[i%PP_COLORS.length],crop=`--mx:${moleCrop.x};--my:${moleCrop.y};--mw:${moleCrop.w}`;
 return `<li class="cv-pp"><a href="${esc(r.href)}" aria-label="${esc(r.name)}’s passport" style="--pc:${c};--pi:${ink}"><span class="cv-pp-top"><span>passport</span><span>no. ${String(r.rank).padStart(3,'0')}</span></span><span class="cv-pp-photo"><span class="cv-pp-mole" style="${crop}">${r.mole?`<img src="${esc(r.mole)}" alt="" width="512" height="512" loading="lazy" decoding="async">`:''}</span></span><strong>${esc(r.name)}</strong><span class="cv-tag">${esc(r.tag)}</span><span class="cv-sign-l">signature</span><span class="cv-sign" aria-hidden="true">${esc(r.name)}</span><span class="cv-pp-foot"><b>${fmt(r.spots)} <small>${r.spots===1?'spot':'spots'}</small></b><span class="cv-stamps">${r.stamps.map(s=>`<span role="img" aria-label="${esc(awards[s].name)} stamp" style="color:${awards[s].color}">${stampArt(s)}</span>`).join('')}</span></span></a></li>`;
}
/* ---------- 3. discord ---------- */
function discordHTML(content){
 const forum=content.forum,ann=forum.find(f=>f.category==='announcement'),poll=forum.find(f=>f.category==='poll'),rest=forum.filter(f=>f!==ann&&f!==poll);
 const href=f=>esc(localURL('/forum/',{id:f.id}));
 const replies=n=>`${n} ${n===1?'reply':'replies'}`;
 const options=(poll?.body||'').split('\n').map(l=>l.match(/^\s*[-*•]\s+(.+)$/)?.[1]?.trim()).filter(Boolean);
 const pv=votes('poll')[poll?.id];
 const pollTitle=(poll?.title||'').replace(/^poll:\s*/i,'');
 return `<section class="cv-panel cv-disc" aria-labelledby="cv-dc"><header class="cv-bar"><h2 id="cv-dc">live from the discord.</h2><div class="cv-join"><span class="cv-members"><i class="cv-live" aria-hidden="true"></i><b>${fmt(COMMUNITY_METRICS.members)}</b> members</span>${out('join now',DISCORD_URL,'cv-ink')}</div></header>
 <div class="cv-cols">
 ${ann?`<article class="cv-col"><div class="cv-col-top"><span>#announcements</span><span>${esc(ann.author)}</span></div><h3>${esc(ann.title)}</h3><p>${esc(clip(ann.body.split(/\n\s*\n/)[0].replace(/\s+/g,' ').trim(),160))}</p><div class="cv-col-foot"><span>${replies(ann.replies)}</span><a class="cv-link" href="${href(ann)}">read ↗</a></div></article>`:''}
 ${poll?`<article class="cv-col" data-poll="${esc(poll.id)}"><div class="cv-col-top"><span>#polls</span><span>${esc(poll.author)}</span></div><h3>${esc(pollTitle)}</h3><div class="cv-opts" role="group" aria-label="${esc(pollTitle)}">${options.map((o,i)=>`<button type="button" class="cv-opt" data-opt="${i}" aria-pressed="${pv===i}"><span class="cv-fill" aria-hidden="true"></span><span class="cv-opt-t">${esc(o)}</span><span class="cv-opt-m">your vote</span></button>`).join('')}</div><div class="cv-col-foot"><span>${replies(poll.replies)} on the forum</span><a class="cv-link" href="${href(poll)}">vote ↗</a></div></article>`:''}
 <article class="cv-col"><div class="cv-col-top"><span>featured</span><span>from the forum</span></div><h3>Featured topics</h3><ul class="cv-fl">${rest.map(f=>`<li><span class="cv-av"><span aria-hidden="true">${initial(f.author)}</span></span><div><span class="cv-fl-m"><b>${esc(f.author)}</b> #${esc(f.category.replace(/\s+/g,'-'))}</span><a href="${href(f)}">${esc(f.title)}</a><small>${replies(f.replies)}</small></div></li>`).join('')}</ul><div class="cv-col-foot"><span>Snapshot from Oct 8, 2026</span><a class="cv-link" href="${esc(localURL('/forum/'))}">open ↗</a></div></article>
 </div></section>`;
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
function wirePoll(scope){
 const art=$('[data-poll]',scope);if(!art)return;const id=art.dataset.poll;
 $$('[data-opt]',art).forEach(b=>b.onclick=()=>{const i=Number(b.dataset.opt),cur=votes('poll')[id];const val=cur===i?null:i;setVote('poll',id,val);$$('[data-opt]',art).forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.opt)===val)));});
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

/* vote call-to-action: leads into the two places where people vote */
const voteHTML=()=>`<section class="cv-vm" aria-labelledby="cv-vt"><div class="cv-vm-l"><span class="cv-vm-k">two ways to shape deepspot</span><h2 id="cv-vt">your vote <em>matters.</em></h2><p>Nothing goes on the map and nothing gets built without the community. Pick a side.</p></div><ol class="cv-vm-r"><li><a href="#cv-sp" data-jump="cv-sp"><span class="cv-vm-n">01</span><b>what makes the map.</b><span>Yes or not quite on new community spots.</span><i>vote on spots ${icon('arrow')}</i></a></li><li><a href="#cv-rd" data-jump="cv-rd"><span class="cv-vm-n">02</span><b>what we build next.</b><span>Up or down on the roadmap.</span><i>vote on the roadmap ${icon('arrow')}</i></a></li></ol></section>`;
export async function renderCommunityV2(root,data){
 const acct=readAccount(),gv=new URLSearchParams(location.search).get('giveaway')||'g1';
 root.innerHTML=`<div class="cv"><h1 class="cv-sr">DeepSpot community</h1><div data-giveaway></div>${discordHTML(data.content)}${voteHTML()}${spotsHTML(data,acct)}${roadHTML()}</div>`;
 $$('[data-jump]',root).forEach(l=>l.addEventListener('click',e=>{const t=document.getElementById(l.dataset.jump);if(!t)return;e.preventDefault();t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}));
 const scope=$('.cv',root);
 wirePoll(scope);wireSpots(scope,data,acct);wireVotes(scope);
 const {renderGiveaway}=await import('./giveaway-hero.mjs?v=14');renderGiveaway($('[data-giveaway]',scope),data,gv);
}
