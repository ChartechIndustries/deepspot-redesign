import {esc,$,$$,icon,localURL,action} from './core.mjs?v=65b48136';
import {profileHref,profileId} from '../profile/identity.mjs?v=744e89b9';

/* Community figures read from deepspot.io. Update this one constant to refresh them. */
export const COMMUNITY_METRICS={capturedAt:'2026-10-13',capturedLabel:'Oct 13, 2026',members:151,spots:487,month:28};
const GIVEAWAY_URL='https://www.deepspot.io/community';
const NEW_POST_URL='https://www.deepspot.io/community';

const SLIDES=[
 {key:'giveaway',kicker:"this month's giveaway",title:'DeepSpot Initial Giveaway',
  text:'First place wins $300 plus a one-of-one custom character item. Second and third place each win $100 plus an item. Every participant gets a character item and 3 months free (approved map spots only).',
  cta:'view details',href:GIVEAWAY_URL,external:true,art:'$300',artNote:'first place'},
 {key:'contest',kicker:'community challenge',title:'Monthly Photo Contest',
  text:'Share your most stunning photos of Kyoto. The top 3 win exclusive DeepSpot merch.',
  cta:'view details',href:'/competition/',art:'top 3',artNote:'win exclusive merch'},
 {key:'invite',kicker:'invite & earn',title:'Invite Friends, Earn Badges',
  text:'Invite friends to unlock the “Connector” badge.',
  cta:'invite now',href:'/invites/',art:'badge',artNote:'“Connector”'}
];
const TONES=['cobalt','aqua','panel'];

const svg=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICONS={
 members:svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.7 3-5.5 6.5-5.5s5.9 1.8 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .6 3.1 2.3 3.5 5.2"/>'),
 spots:svg('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'),
 month:svg('<path d="M12 4v16M4 12h16"/>'),
 pause:svg('<path d="M8 5v14M16 5v14"/>'),
 play:svg('<path d="M7 4.5v15l12-7.5Z"/>'),
 prev:svg('<path d="M19 12H5m6-6-6 6 6 6"/>'),
 next:svg('<path d="M5 12h14m-6-6 6 6-6 6"/>')
};

const outbound=(label,url,style='secondary')=>`<a class="ds-button ${style}" href="${esc(url)}" data-original target="_blank" rel="noopener">${label}${icon('arrow')}</a>`;
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- shared pieces ---------- */
/* All three versions use the same components and styles; they differ only in arrangement. */
const slideAction=s=>s.external?outbound(s.cta,s.href,''):action(s.cta,s.href,'');
const controls=()=>`<div class="hub-ctrl"><button type="button" class="hub-arrow" data-prev aria-label="Previous slide">${ICONS.prev}</button><button type="button" class="hub-arrow" data-next aria-label="Next slide">${ICONS.next}</button></div>`;
const dots=()=>`<div class="hub-dots" role="group" aria-label="Choose slide">${SLIDES.map((s,i)=>`<button type="button" data-dot="${i}" aria-label="Slide ${i+1}: ${esc(s.title)}" aria-current="${i===0}"><span></span></button>`).join('')}</div>`;
const pauseButton=()=>`<button type="button" class="hub-pause" data-pause aria-label="Pause slideshow" aria-pressed="false"><span data-pause-icon>${ICONS.pause}</span></button>`;

const GLYPHS=['star','pin','route'];
function slideHTML(s,i,fact,glyph){
 return `<div class="hub-slide" data-slide data-tone="${TONES[i]}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${SLIDES.length}"><div class="hub-slide-copy"><span class="ds-eyebrow">${esc(s.kicker)}</span><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>${slideAction(s)}</div>${glyph?`<span class="hub-glyph" aria-hidden="true">${icon(GLYPHS[i])}</span>`:''}${fact?`<div class="hub-fact" aria-hidden="true"><b>${esc(s.art)}</b><small>${esc(s.artNote)}</small></div>`:''}</div>`;
}
const carousel=(cls,fact=false,glyph=false)=>`<section class="hub-car ${cls}" data-carousel data-tone="cobalt" aria-roledescription="carousel" aria-label="Community highlights"><div class="hub-slides">${SLIDES.map((s,i)=>slideHTML(s,i,fact,glyph)).join('')}</div><div class="hub-car-bar">${dots()}${pauseButton()}${controls()}</div><div class="hub-sr" data-live aria-live="off" aria-atomic="true"></div></section>`;

const metric=(key,label,value)=>({key,label,value,icon:ICONS[key]});
const METRICS=()=>[metric('members','members',COMMUNITY_METRICS.members),metric('spots','spots discovered',COMMUNITY_METRICS.spots),metric('month','added this month',COMMUNITY_METRICS.month)];
const metricNote=()=>`<p class="ds-note hub-note">Community figures from DeepSpot, ${COMMUNITY_METRICS.capturedLabel}.</p>`;
const statHTML=m=>`<div class="hub-stat"><span class="hub-ico">${m.icon}</span><div><strong data-count="${m.value}">${fmt(m.value)}</strong><span class="ds-eyebrow">${m.label}</span></div></div>`;

/* ---------- forum: announcements and polls only ---------- */
const FORUM_KINDS=[['announcement','announcements'],['poll','polls']];
function forumData(content){
 const topics=content.forum.filter(f=>FORUM_KINDS.some(([k])=>k===f.category)).map(f=>{
  const paras=(f.body||'').split(/\n\s*\n/);
  const options=f.category==='poll'?(f.body||'').split('\n').map(l=>l.match(/^\s*[-*•]\s+(.+)$/)?.[1]?.trim()).filter(Boolean):[];
  return {...f,options,excerpt:clip(paras[0].replace(/\s+/g,' ').trim(),150)};
 });
 const counts={};for(const t of topics)counts[t.category]=(counts[t.category]||0)+1;
 return {topics,counts,total:topics.length};
}
const clip=(t,n)=>t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+'…':t;
const repliesText=n=>`${n} ${n===1?'reply':'replies'}`;
function postHTML(t){
 const href=esc(localURL('/forum/',{id:t.id}));
 return `<article class="hub-post" data-cat="${esc(t.category)}"><span class="hub-badge ${esc(t.category)}">${esc(t.category)}</span><h3><a href="${href}">${esc(t.title)}</a></h3><p>${esc(t.excerpt)}</p>${t.options.length?`<ul class="hub-options" aria-label="Poll options">${t.options.map(o=>`<li>${esc(o)}</li>`).join('')}</ul>`:''}<div class="hub-post-foot"><span class="hub-by">${esc(t.author)} · ${repliesText(t.replies)}</span>${t.category==='poll'?outbound('vote on DeepSpot',t.url,''):`<a class="hub-readlink" href="${href}" tabindex="-1" aria-hidden="true">${icon('arrow')}</a>`}</div></article>`;
}
function forumSection(content){
 const fd=forumData(content);
 const tab=(id,label,n)=>`<button type="button" data-chip="${id}" aria-pressed="${id==='all'}">${label} <i>${n}</i></button>`;
 return `<section class="hub-feed" data-hubtabs><div class="hub-feedhead"><div class="ds-section-heading"><h2>announcements &amp; polls.</h2></div></div>
 <div class="hub-side-layout"><div class="hub-side"><span class="ds-eyebrow">from the team</span><div class="hub-chips" role="group" aria-label="Filter posts">${tab('all','all',fd.total)}${FORUM_KINDS.map(([k,l])=>tab(k,l,fd.counts[k]||0)).join('')}</div>${outbound('new post',NEW_POST_URL,'')}</div><div class="hub-posts">${fd.topics.map(postHTML).join('')}<p class="hub-empty" hidden>Nothing here yet.</p></div></div>
 <p class="ds-note">Discussion snapshot from October 8, 2026. Open a post to read it or continue the conversation on DeepSpot.</p></section>`;
}

/* ---------- leaderboard ---------- */
/* Read from deepspot.io/leaderboard on 2026-10-13. This Month and All Time were identical on the source that day. */
export const LEADERBOARD={capturedAt:'2026-10-13',capturedLabel:'Oct 13, 2026',rows:[
 {name:'Kris',handle:'lampbane',spots:143,points:13650},
 {name:'Wayfarer',handle:'wayfarer',spots:39,points:2100},
 {name:'kisekikana',handle:'kisekikana',spots:19,points:1025},
 {name:'Joelle',handle:'joelle',spots:11,points:700},
 {name:'NumberOne',handle:'numberone',spots:11,points:700},
 {name:'Lana Velkov',handle:'lanavelkov',spots:11,points:550},
 {name:'Annebelle',handle:'annebelle',spots:7,points:350},
 {name:'SAZ',handle:'s4zr4ty',spots:1,points:325},
 {name:'Lydia',handle:'korrgan',spots:6,points:300},
 {name:'Six',handle:'sixbacteria',spots:5,points:250}
]};
function boardHTML(content){
 const imgs=new Map([...(content.leaderboard?.monthly||[]),...(content.leaderboard?.allTime||[])].map(p=>[p.name,p.image]));
 const avatar=r=>{const src=imgs.get(r.name);return src?`<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`:`<span aria-hidden="true">${esc(r.name[0].toUpperCase())}</span>`;};
 const meta=r=>`${r.spots} ${r.spots===1?'spot':'spots'}`;
 const rows=LEADERBOARD.rows,link=r=>esc(profileHref(profileId(r.name)));
 const top=rows.slice(0,3).map((r,i)=>`<a class="hub-top hub-top${i+1}" href="${link(r)}"><span class="hub-rank">${i+1}</span><span class="hub-av">${avatar(r)}</span><strong>${esc(r.name)}</strong><span class="hub-handle">@${esc(r.handle)}</span><b class="hub-pts">${fmt(r.points)}<small>points</small></b><span class="hub-meta">${meta(r)}</span></a>`).join('');
 const rest=rows.slice(3).map((r,i)=>`<a class="hub-lrow" href="${link(r)}"><span class="hub-rank">${i+4}</span><span class="hub-av">${avatar(r)}</span><span class="hub-lname"><strong>${esc(r.name)}</strong><span class="hub-handle">@${esc(r.handle)}</span></span><span class="hub-meta">${meta(r)}</span><b class="hub-pts">${fmt(r.points)}</b></a>`).join('');
 return `<div class="hub-tops">${top}</div><div class="hub-lrows">${rest}</div>`;
}
function leaderboardSection(content){
 const body=boardHTML(content);
 return `<section class="hub-board" data-boardtabs><div class="hub-feedhead"><div class="ds-section-heading"><h2>top explorers.</h2></div><div class="ds-tabs hub-tabs" role="group" aria-label="Leaderboard period"><button type="button" data-board-tab="month" aria-pressed="true">this month</button><button type="button" data-board-tab="all" aria-pressed="false">all time</button></div></div>
 <div data-board-panel="month">${body}</div><div data-board-panel="all" hidden>${body}</div>
 <div class="hub-board-foot"><p class="hub-how" data-copy="kai-8"><b>how points work</b> spot +50 · upvote +10</p>${action('full leaderboard','/leaderboard/','secondary')}</div>
 <p class="ds-note">Leaderboard read from DeepSpot, ${LEADERBOARD.capturedLabel}. This month and all time showed the same ranking that day.</p></section>`;
}

/* ---------- page ---------- */
function pageHTML(data){
 const {content}=data;
 return `<div class="hub" data-v="c">
 <h1 class="hub-sr">DeepSpot community</h1>
 <section class="hub-bento">${carousel('hub-car-c',false,true)}<div class="hub-tiles" aria-label="Community numbers">${METRICS().map(statHTML).join('')}</div></section>
 ${metricNote()}
 ${forumSection(content)}
 ${leaderboardSection(content)}
 </div>`;
}

/* ---------- behavior ---------- */
function wireCarousel(el){
 const slides=$$('[data-slide]',el),dotsEl=$$('[data-dot]',el),live=$('[data-live]',el),pauseBtn=$('[data-pause]',el);
 let i=0,userPaused=false,hover=false,focus=false,visible=true,timer=null;
 const rm=reduced();
 const playing=()=>!rm&&!userPaused&&!hover&&!focus&&visible;
 const go=(n,announce=true)=>{
  i=(n+slides.length)%slides.length;
  slides.forEach((s,k)=>{const on=k===i;s.dataset.active=on;s.toggleAttribute('inert',!on);s.setAttribute('aria-hidden',String(!on));});
  dotsEl.forEach((d,k)=>d.setAttribute('aria-current',String(k===i)));
  if(live){live.setAttribute('aria-live',userPaused||rm?'polite':'off');if(announce)live.textContent=`Slide ${i+1} of ${slides.length}: ${$('h2',slides[i]).textContent}`;}
  el.dataset.index=i;el.dataset.tone=slides[i].dataset.tone;
 };
 const restart=()=>{clearInterval(timer);timer=null;if(playing())timer=setInterval(()=>{if(playing())go(i+1,false);},6000);};
 $$('[data-prev]',el).forEach(b=>b.onclick=()=>{go(i-1);restart();});
 $$('[data-next]',el).forEach(b=>b.onclick=()=>{go(i+1);restart();});
 dotsEl.forEach(d=>d.onclick=()=>{go(Number(d.dataset.dot));restart();});
 if(pauseBtn){
  if(rm)pauseBtn.hidden=true;
  pauseBtn.onclick=()=>{userPaused=!userPaused;pauseBtn.setAttribute('aria-pressed',String(userPaused));pauseBtn.setAttribute('aria-label',userPaused?'Play slideshow':'Pause slideshow');$('[data-pause-icon]',pauseBtn).innerHTML=userPaused?ICONS.play:ICONS.pause;el.dataset.paused=userPaused;if(live)live.setAttribute('aria-live',userPaused?'polite':'off');restart();};
 }
 el.addEventListener('mouseenter',()=>{hover=true;});
 el.addEventListener('mouseleave',()=>{hover=false;restart();});
 el.addEventListener('focusin',()=>{focus=true;});
 el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget)){focus=false;restart();}});
 el.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(i-1);restart();}else if(e.key==='ArrowRight'){e.preventDefault();go(i+1);restart();}});
 if('IntersectionObserver'in window)new IntersectionObserver(([en])=>{visible=en.isIntersecting;restart();},{threshold:.2}).observe(el);
 go(0,false);restart();
}

function wireCounts(scope){
 const nums=$$('[data-count]',scope);if(!nums.length)return;
 const final=el=>{el.textContent=fmt(Number(el.dataset.count));};
 if(reduced()||!('IntersectionObserver'in window)){nums.forEach(final);return;}
 const run=el=>{
  const to=Number(el.dataset.count),dur=1200,t0=performance.now();let done=false;
  const finish=()=>{if(done)return;done=true;final(el);};
  el.textContent='0';
  const step=now=>{if(done)return;const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(to*e));if(p<1)requestAnimationFrame(step);else finish();};
  requestAnimationFrame(step);
  setTimeout(finish,dur+400); // hidden tabs pause rAF; always land on the real number
 };
 const io=new IntersectionObserver(entries=>{for(const en of entries)if(en.isIntersecting){io.unobserve(en.target);run(en.target);}},{threshold:.4});
 nums.forEach(n=>io.observe(n));
}

function wireFeed(scope){
 const feed=$('[data-hubtabs]',scope);if(!feed)return;
 const chips=$$('[data-chip]',feed),rows=$$('.hub-post',feed),empty=$('.hub-empty',feed);
 chips.forEach(c=>c.onclick=()=>{
  chips.forEach(x=>x.setAttribute('aria-pressed',String(x===c)));
  let n=0;rows.forEach(r=>{const on=c.dataset.chip==='all'||r.dataset.cat===c.dataset.chip;r.hidden=!on;if(on)n++;});
  if(empty)empty.hidden=n>0;
 });
}

function wireBoard(scope){
 const board=$('[data-boardtabs]',scope);if(!board)return;
 const tabs=$$('[data-board-tab]',board);
 tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('[data-board-panel]',board).forEach(p=>p.hidden=p.dataset.boardPanel!==b.dataset.boardTab);});
}

export function renderCommunityHub(root,data,tail=''){
 root.innerHTML=pageHTML(data)+`<div class="hub-tail">${tail}</div>`;
 const scope=$('.hub',root);
 $$('[data-carousel]',scope).forEach(wireCarousel);
 wireCounts(scope);wireFeed(scope);wireBoard(scope);
}
