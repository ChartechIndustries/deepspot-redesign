// Sign-in / paid gate (prototype: no backend, nothing is sent anywhere).
// Reading wall on /spot/ and /story/ (signed out), action sheet for save / vote / comment / trip / submit,
// member sheet for the photo gallery and the giveaway. State lives in gate-state.mjs.
import {esc,localURL,icon} from './core.mjs';
import {OFF_KEY,readSession,writeSession,validEmail,parseGateParam,allows,SESSION_KEY} from './gate-state.mjs?v=gate1';
export {readSession,writeSession};

const D=document,LOGIN='https://www.deepspot.io/login';
const $=(s,r=D)=>r.querySelector(s);
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const G_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>';
const A_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';

/* ---------- state + review switch ---------- */
{const g=parseGateParam(location.search);try{if(g==='off')sessionStorage.setItem(OFF_KEY,'1');else if(g){sessionStorage.removeItem(OFF_KEY);writeSession({state:g,email:g==='out'?'':readSession().email});}}catch{}}
export const gateOff=()=>{try{return sessionStorage.getItem(OFF_KEY)==='1';}catch{return false;}};
export const gateState=()=>gateOff()?'member':readSession().state;
const listeners=new Set();
export const onGate=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
const emit=()=>listeners.forEach(fn=>{try{fn(gateState());}catch(e){console.error(e);}});
export function setState(state,email=''){writeSession({state,email});emit();}
window.addEventListener('storage',e=>{if(e.key===SESSION_KEY||e.key===null)emit();});
let live;const announce=text=>{live??=Object.assign(D.createElement('p'),{className:'sr-only',id:'gt-live'});live.setAttribute('role','status');if(!live.isConnected)D.body.append(live);live.textContent='';setTimeout(()=>live.textContent=text,30);};

/* ---------- stylesheet (loaded only when a gate is shown) ---------- */
let cssP;const css=()=>cssP??=new Promise(res=>{const l=D.createElement('link');l.rel='stylesheet';l.href=new URL('./gate.css?v=gate6',import.meta.url).href;l.onload=l.onerror=()=>res();D.head.append(l);});

/* ---------- sheet ---------- */
let sheet=null,opener=null,seq=0,wall=null,pageCtx=null,wallResume=null;
const focusables=d=>[...d.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')].filter(e=>e.offsetParent!==null||e===D.activeElement);
const legal=`By continuing, you agree to the <a href="${esc(localURL('/terms/'))}">terms of service</a> and <a href="${esc(localURL('/privacy/'))}">privacy policy</a>.`;
const note='<p class="gt-note">preview: accounts connect at launch</p>';
/* two-tone display heading like the site's page titles: text after the comma (or the last word) in green */
const twoTone=h=>{const t=esc(h),c=t.indexOf(', ');if(c>0)return `${t.slice(0,c+1)} <em>${t.slice(c+2)}</em>`;const w=t.lastIndexOf(' ');return w>0?`${t.slice(0,w)} <em>${t.slice(w+1)}</em>`:`<em>${t}</em>`;};
const CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const perks=list=>`<ul class="gt-perks">${list.map(x=>`<li>${CHECK}<span>${x}</span></li>`).join('')}</ul>`;
function freeHTML(kind,heading){
 return `${kind==='wall'?'':'<button class="gt-x" type="button" data-gt-x aria-label="Close">×</button>'}<div class="gt-grid"><div class="gt-a"><p class="gt-k">deepspot · free account</p><h2 class="gt-h" id="gt-h" tabindex="-1">${twoTone(heading)}</h2><p class="gt-b" id="gt-b">It’s free, and it takes ten seconds.</p>${perks(['read every spot and story in full','keep a fieldbook and plan trips','vote on what makes the map'])}</div><div class="gt-c"><form class="gt-form" novalidate><label class="gt-l" for="gt-email">email address</label><input class="gt-input" id="gt-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" aria-describedby="gt-err" required><p class="gt-err" id="gt-err"></p><button class="ds-button gt-go" type="submit">continue ${icon('arrow')}</button></form><p class="gt-or"><span>or</span></p><div class="gt-prov"><a class="ds-button secondary gt-p" href="${LOGIN}" data-original target="_blank" rel="noopener">${G_ICON}continue with Google</a><a class="ds-button secondary gt-p" href="${LOGIN}" data-original target="_blank" rel="noopener">${A_ICON}continue with Apple</a></div><p class="gt-legal">${legal}</p><p class="gt-foot">want unlimited photos and giveaway entries? <a href="${esc(localURL('/membership/'))}">see membership ↗</a></p>${note}</div></div>`;
}
const memberHTML=()=>`<button class="gt-x" type="button" data-gt-x aria-label="Close">×</button><div class="gt-grid"><div class="gt-a"><p class="gt-k">deepspot · founding member</p><h2 class="gt-h" id="gt-h" tabindex="-1">go <em>deeper.</em></h2><p class="gt-price" aria-label="1 dollar per week">$1<small>/ week</small></p><p class="gt-b" id="gt-b">Billed monthly. Cancel any time.</p></div><div class="gt-c">${perks(['unlimited spot photos','an entry in every monthly giveaway','the early supporter badge on your passport'])}<a class="ds-button gt-go" href="${esc(localURL('/membership/'))}">become a founding member ${icon('arrow')}</a><p class="gt-foot gt-foot-m">you are signed in${readSession().email?' as '+esc(readSession().email):''}.</p><button class="gt-ghost" type="button" data-gt-member>preview: mark me as a member</button>${note}</div></div>`;

async function open(kind,o={}){
 const my=++seq;await css();if(my!==seq)return;
 kill();
 const d=D.createElement('dialog');d.className='gt-sheet';d.dataset.mode=kind;d.setAttribute('aria-labelledby','gt-h');d.setAttribute('aria-describedby','gt-b');d.setAttribute('aria-modal','true');
 d.innerHTML=`<div class="gt-in">${kind==='member'?memberHTML():freeHTML(kind,o.heading||'create a free account, or log in.')}<p class="gt-status" role="status" aria-live="polite"></p></div>`;
 sheet=d;d._o=o;D.body.append(d);
 kind==='wall'?d.show():d.showModal();
 wire(d,kind);
 if(kind==='wall'){d._stop=rise(d);layoutWall();}
 else{const f=$('#gt-email',d)||$('[data-gt-x]',d);f?.focus({preventScroll:true});}
 return d;
}
function kill(){if(!sheet)return;const d=sheet;sheet=null;d._stop?.();try{d.close?.();}catch{}d.remove();}
function dismiss(restore=true){
 const d=sheet;if(!d)return;
 const done=()=>{if(sheet===d)sheet=null;d._stop?.();d.remove();if(restore){(opener?.isConnected?opener:$('#page-content'))?.focus({preventScroll:true});opener=null;}if(wall)layoutWall();};
 if(reduce()){try{d.close();}catch{}done();return;}
 d.dataset.out='1';setTimeout(()=>{try{d.close();}catch{}done();},200);
}
function success(d,heading,line){
 const o=d._o||{};
 d.dataset.done='1';
 $('.gt-in',d).innerHTML=`<div class="gt-done"><p class="gt-k">deepspot · free account</p><h2 class="gt-h" id="gt-h" tabindex="-1">${twoTone(heading)}</h2><p class="gt-b" id="gt-b">${line}</p><p class="gt-status gt-ok" role="status" aria-live="polite">${esc(heading)}</p>${note}</div>`;
 $('#gt-h',d).focus({preventScroll:true});
 const resume=o.resume,then=o.then;
 setTimeout(()=>{dismiss(!then);if(then)then();else if(resume)resume();if(d._wall&&wallResume){const r=wallResume;wallResume=null;r();}},d.dataset.mode==='wall'?1300:800);
}
function wire(d,kind){
 const email=$('#gt-email',d),err=$('#gt-err',d);
 d.addEventListener('submit',e=>{
  e.preventDefault();const v=email.value.trim();
  if(!validEmail(v)){err.textContent=v?'enter a valid email, like you@example.com.':'enter your email to continue.';email.setAttribute('aria-invalid','true');email.focus();return;}
  d._wall=kind==='wall'&&!!wall;
  setState('free',v);
  success(d,'you’re in.',`signed in as ${esc(v)} in this preview. saved on this browser only.`);
  announce('You are signed in. The page is unlocked.');
 });
 email?.addEventListener('input',()=>{err.textContent='';email.removeAttribute('aria-invalid');});
 d.addEventListener('click',e=>{
  if(e.target.closest('[data-gt-x]')||(e.target===d&&kind!=='wall'))return dismiss(true);
  if(e.target.closest('[data-gt-member]')){setState('member',readSession().email);success(d,'you’re a member.','marked as a founding member in this preview only. nothing is charged.');announce('Marked as a member in this preview.');}
 });
 d.addEventListener('cancel',e=>{e.preventDefault();if(kind!=='wall')dismiss(true);});
 d.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&kind==='wall'){$('.br-wordmark')?.focus();return;}
  if(e.key!=='Tab')return;
  const f=focusables(d);if(!f.length)return;
  const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&(D.activeElement===first||!d.contains(D.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&D.activeElement===last){e.preventDefault();first.focus();}
 });
}

/* ---------- actions ---------- */
export function ask(verb,resume){
 if(gateOff()||allows(gateState(),'free')){resume?.();return true;}
 if(wall&&sheet){nudge(`sign in to ${verb}.`);if(resume)wallResume=resume;return false;}
 opener=D.activeElement;open('action',{heading:`sign in to ${verb}.`,resume});return false;
}
export function askMember(resume){
 if(gateOff()||gateState()==='member'){resume?.();return true;}
 opener=D.activeElement;
 const m=()=>open('member',{resume});
 if(gateState()==='out'){if(wall&&sheet){nudge('sign in to continue.');return false;}open('action',{heading:'sign in to go deeper.',then:m});return false;}
 m();return false;
}
function nudge(text){
 const d=sheet;if(!d)return;
 const s=$('.gt-status',d);if(s)s.textContent=text;
 d._open?.();d.dataset.nudge='1';setTimeout(()=>delete d.dataset.nudge,600);
 $('#gt-email',d)?.focus({preventScroll:true});
}
let bypass=false;
const run=fn=>{bypass=true;try{fn();}finally{bypass=false;}};
const RULES=[
 {sel:'[data-save-spot],[data-save-story]',verb:'save this',when:el=>el.getAttribute('aria-pressed')!=='true'},
 {sel:'[data-v-yes],[data-v-no],[data-ud],[data-opt]',verb:'vote'},
 {sel:'.cv-cmt a',verb:'comment'},
 {sel:'#trip-share',verb:'share this trip'},
 {sel:'#trip-keep',verb:'save this trip'},
 {sel:'[data-gallery-open]',need:'member',when:el=>Number(el.dataset.galleryOpen)>0},
 {sel:'[data-photo-next],[data-photo-previous]',need:'member'},
 {sel:'.gv-join',need:'member'}
];
D.addEventListener('click',e=>{
 if(bypass||gateOff()||!(e.target instanceof Element))return;
 const op=e.target.closest('[data-gt-open]');
 if(op){e.preventDefault();ask(op.dataset.gtOpen||'continue');return;}
 for(const r of RULES){
  const el=e.target.closest(r.sel);if(!el||(r.when&&!r.when(el)))continue;
  if(allows(gateState(),r.need||'free'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const resume=()=>run(()=>el.isConnected&&el.click());
  r.need==='member'?askMember(resume):ask(r.verb,resume);return;
 }
},true);
D.addEventListener('submit',e=>{
 if(bypass||gateOff())return;const f=e.target;
 if(!(f instanceof HTMLFormElement)||f.id!=='contribution-form'||allows(gateState(),'free'))return;
 e.preventDefault();e.stopImmediatePropagation();
 ask('submit this',()=>run(()=>f.isConnected&&f.requestSubmit()));
},true);
D.addEventListener('keydown',e=>{
 if(bypass||gateOff()||gateState()==='member'||(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'))return;
 const dlg=e.target instanceof Element&&e.target.closest('.ds-photo-dialog');if(!dlg)return;
 e.preventDefault();e.stopImmediatePropagation();
 askMember(()=>run(()=>$(e.key==='ArrowLeft'?'[data-photo-previous]':'[data-photo-next]',dlg)?.click()));
},true);

/* ---------- reading wall ---------- */
/* the wall sheet starts as a peek and rises slowly as the reader scrolls; focus or a click on it opens it fully */
function rise(d){
 const peek=()=>innerWidth<=520?120:156;
 let cur=null,force=false,raf=0;
 const target=()=>{if(force)return 1;const range=D.documentElement.scrollHeight-innerHeight;return range<80?1:Math.min(1,Math.max(0,scrollY/(range*.9)));};
 const frame=()=>{
  raf=0;if(!d.isConnected)return;
  const H=d.offsetHeight,P=Math.min(peek(),H),t=target();
  cur=cur===null||reduce()?t:cur+(t-cur)*.08;if(Math.abs(t-cur)<.002)cur=t;
  const y=Math.round((1-cur)*(H-P));
  d.style.translate=`0 ${y}px`;D.documentElement.style.setProperty('--gt-v',(H-y)+'px');
  d.toggleAttribute('data-peek',cur<.97);
  if(cur!==t)raf=requestAnimationFrame(frame);
 };
 const kick=()=>{if(!raf)raf=requestAnimationFrame(frame);};
 const full=()=>{force=true;kick();};
 const click=e=>{if(d.hasAttribute('data-peek')&&!e.target.closest('a,button,input')){e.preventDefault();full();}};
 d._open=full;
 addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);d.addEventListener('focusin',full);d.addEventListener('click',click);
 const ro=new ResizeObserver(kick);ro.observe(d);frame();
 return()=>{cancelAnimationFrame(raf);removeEventListener('scroll',kick);removeEventListener('resize',kick);ro.disconnect();D.documentElement.style.removeProperty('--gt-v');};
}
function layoutWall(){
 if(!wall)return;
 const h=sheet?.dataset.mode==='wall'?sheet.offsetHeight:0;
 D.documentElement.style.setProperty('--gt-h',h+'px');
 const m=wall.main,top=m.getBoundingClientRect().top+scrollY,cut=wall.cut.getBoundingClientRect().bottom+scrollY;
 m.style.maxHeight=Math.max(0,Math.ceil(cut-top+10))+'px';
}
export async function wallReading(root,{kind='spot'}={}){
 pageCtx={root,kind};
 if(gateOff()||allows(gateState(),'free')||wall)return;
 const article=$(kind==='story'?'.ds-story-body':'.ds-article-layout .ds-prose',root);if(!article)return;
 await css();if(gateOff()||allows(gateState(),'free')||wall)return;
 const ps=[...article.querySelectorAll('p')].filter(p=>!p.closest('.ds-callout,.ds-photo-gallery')),n=kind==='story'?3:2;
 let cut=ps[Math.min(n,ps.length)-1]||article.firstElementChild||article;while(cut.parentElement&&cut.parentElement!==article)cut=cut.parentElement;
 const nodes=[];for(let el=cut;el&&el!==root;el=el.parentElement)for(let s=el.nextElementSibling;s;s=s.nextElementSibling)nodes.push(s);
 nodes.forEach(x=>x.setAttribute('inert',''));
 const fade=Object.assign(D.createElement('div'),{className:'gt-fade'});fade.setAttribute('aria-hidden','true');D.body.append(fade);
 D.body.classList.add('gt-walled');
 const ro=new ResizeObserver(layoutWall);[...root.children].forEach(c=>ro.observe(c));addEventListener('resize',layoutWall);
 wall={main:root,cut,nodes,fade,ro};
 await open('wall',{heading:'create a free account, or log in.'});
 if(sheet)ro.observe(sheet);layoutWall();
}
function unwall(){
 if(!wall)return;const w=wall;wall=null;
 w.nodes.forEach(x=>x.removeAttribute('inert'));w.fade.remove();w.ro.disconnect();removeEventListener('resize',layoutWall);
 w.main.style.maxHeight='';D.body.classList.remove('gt-walled');D.documentElement.style.removeProperty('--gt-h');
}
onGate(state=>{
 if(wall&&allows(state,'free'))unwall();
 else if(!wall&&pageCtx&&!gateOff()&&!allows(state,'free')){if(sheet)kill();wallReading(pageCtx.root,pageCtx);}
});
