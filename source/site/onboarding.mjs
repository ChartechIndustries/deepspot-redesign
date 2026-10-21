// New-user onboarding (/welcome/). Prototype: no backend, nothing is sent. The password is never stored.
// Passport data goes through the same storage the passport page reads (account draft, passport style, bio look, want-to-go).
import {STEPS,FINISH,readProgress,writeProgress,advance,goBack,isOnboarded,markOnboarded,resetOnboarding,passwordStrength,validateUsername,suggestUsernames,takenHandles,suggestSpots,archetypeName,validEmail} from './onboarding-state.mjs?v=ob1';
import {accountKey,readAccount,normalizeAccount,travelerStyles} from './account-state.mjs?v=pad1';
import {readSession,writeSession} from './gate-state.mjs?v=gate1';
import {G_ICON,A_ICON} from './brand-icons.mjs?v=ob1';
import {readLook,writeLook,readStyle,writeStyle,archCardsHTML,archGroups,styleTilesHTML,lookGroupHTML,pickStyle,cardHTML,biopHTML,moleImgHTML,mrz,syncPreview,fitPreview,bindTilt} from '../profile/passport-edit.mjs?v=ob1';
import {padHTML,initPad} from '../profile/sign-pad.mjs?v=pv3';
import {readWantToGo,writeWantToGo,addItem,removeAt,WTG_MAX,WTG_NAME_MAX} from '../profile/want-to-go.mjs?v=wtg1';
import {escapeHTML as esc,safeReturn} from '../profile/identity.mjs';
import {levelFor,memberLevel} from '../profile/passport-rules.mjs?v=pv2';
import {prepareCatalog} from '../browse/catalog.mjs';

const D=document,$=(s,r=D)=>r.querySelector(s),$$=(s,r=D)=>[...r.querySelectorAll(s)];
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
const LOGIN='https://www.deepspot.io/login';
const ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const theme=()=>D.documentElement.dataset.theme==='light'?'light':'dark';
const wide=()=>matchMedia('(min-width:1000px)').matches;

/* ---------- header (theme + phone menu, same as the other pages) ---------- */
function applyTheme(v){
 D.documentElement.dataset.theme=v;try{localStorage.setItem('deepspot-theme',v);}catch{}
 $('.br-theme').textContent=v==='light'?'☾ dark':'☼ light';$('.br-theme').setAttribute('aria-label',`Switch to ${v==='light'?'dark':'light'} mode`);
 const u=new URL(location.href);u.searchParams.set('theme',v);history.replaceState(null,'',u);
}
applyTheme(theme());
$('.br-theme').addEventListener('click',()=>applyTheme(theme()==='dark'?'light':'dark'));
$('.br-menu').addEventListener('click',()=>{const open=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!open;$('.br-menu').setAttribute('aria-expanded',String(open));$('.br-menu').setAttribute('aria-label',open?'Close navigation':'Open navigation');$('.br-menu').textContent=open?'×':'☰';});
function toast(t){const b=$('.br-toast');b.textContent=t;b.dataset.open='true';clearTimeout(toast.t);toast.t=setTimeout(()=>b.dataset.open='false',3200);}

/* ---------- entry rules ---------- */
const fromPath=(()=>{const u=new URL(safeReturn(params.get('from'))||'/','https://x.invalid');u.searchParams.delete('gate');u.searchParams.delete('onboard');const p=u.pathname+(u.search||'')+u.hash;return p==='/'?'':p;})();
const keep=new URLSearchParams();if(fromPath)keep.set('from',fromPath);if(params.get('force'))keep.set('force','1');keep.set('theme',theme());
if(params.get('reset')==='1'){resetOnboarding();keep.set('force','1');history.replaceState(null,'','/welcome/?'+keep);}
else if(isOnboarded()&&!params.get('force')){location.replace('/profile/?user=preview&theme='+theme());await new Promise(()=>{});}

/* ---------- state ---------- */
let prog=readProgress();
const stepParam=params.get('step');
if(stepParam!==null){const i=STEPS.findIndex(s=>s.id===stepParam);const n=i>=0?i:stepParam==='finish'?FINISH:Number(stepParam);if(Number.isInteger(n))prog.step=Math.min(FINISH,Math.max(0,n));}
else if(prog.step>0&&readSession().state==='out')prog.step=0;
if(stepParam===null&&params.get('force')&&isOnboarded()&&prog.step===FINISH)prog.step=0;   /* ?onboard=1 review run starts from the top, with your data filled in */
let taken=new Set(),catalog=[];
await Promise.all([
 fetch('/profile/profiles.json').then(r=>r.ok?r.json():null).then(j=>{taken=takenHandles(j?.profiles);}).catch(()=>{}),
 fetch('/featured-spots.json').then(r=>r.ok?r.json():null).then(j=>{if(j)catalog=prepareCatalog(j);}).catch(()=>{})
]);
const bySlug=new Map(catalog.map(s=>[s.id,s]));
const saveProg=()=>writeProgress(prog);
const saveAccount=patch=>{const next=normalizeAccount({...readAccount(),...patch});try{localStorage.setItem(accountKey,JSON.stringify(next));}catch{toast('This browser could not save your passport.');return null;}return next;};
const monthLabel=()=>new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});

/* ---------- live passport (left) ---------- */
const lv=levelFor(0),member=memberLevel(lv.level);
const PH_MOLE='<span class="pp-mole pp-mole-empty ob-molePH" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg><span>your mole</span></span>';
const cardCol=$('.ob-card-col');
cardCol.innerHTML=`<div class="ed-stage ob-stage" data-bg="halftone"><span class="ed-plabel ob-plabel">your passport</span><div class="ob-stage-in"><div class="ed-cardw"><div class="ed-scale"><div class="pp-passobj-in ed-pobj" data-foil="none">${cardHTML({no:'draft',mole:PH_MOLE,lv,stamp:{name:'explorer',sub:member},name:'—',handle:'',joined:'',member,sigLabel:'my mark',sig:'<span>no mark yet</span>',mrz:mrz({name:'',handle:'',joined:''},0,lv)})}</div></div></div>${biopHTML(readLook(false))}</div><div class="ob-issued" aria-hidden="true"><span>issued</span><b></b></div><div class="ob-conf" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>`;
const stage=$('.ob-stage'),cardw=$('.ed-cardw',stage),scale=$('.ed-scale',stage),pobj=$('.ed-pobj',stage),biop=$('.ed-biop',stage),card=$('.pp-id9',stage);
bindTilt(stage,cardw,pobj);
let shown={mole:'',sig:''};
const pop=(el,frames,opt)=>{if(el&&!calm())el.animate(frames,opt);};
function paint(changed={}){
 const a=readAccount(),st=readStyle(true),lk=readLook(true);
 syncPreview({stage,pobj,biop},{name:a.name,username:a.username,bio:a.bio,arch:prog.data.arch?a.style:'',foil:st.foil,bg:st.bg,look:lk});
 const png=a.mole?.png||'';
 if(shown.mole!==png){
  shown.mole=png;const old=$('.pp-molebox .pp-mole',card),tmp=D.createElement('div');tmp.innerHTML=png?moleImgHTML(png,{alt:'your mole'}):PH_MOLE;const el=tmp.firstElementChild;old.replaceWith(el);
  if(png&&changed.mole)pop(el,[{scale:.4,opacity:0},{scale:1.12,opacity:1,offset:.6},{scale:1,opacity:1}],{duration:520,easing:'cubic-bezier(.2,.9,.3,1)'});
 }
 const art=a.signatureArt||'';
 if(changed.sigLive!==undefined||shown.sig!==art){
  const src=changed.sigLive!==undefined?changed.sigLive:art;shown.sig=art;
  const box=$('.pp-id9-sig',card);$$(':scope>:not(.pp-sig-l)',box).forEach(n=>n.remove());
  box.insertAdjacentHTML('beforeend',src?`<img src="${esc(src)}" alt="your mark" width="512" height="256">`:'<span>no mark yet</span>');
  if(src&&changed.sig)pop($('img',box),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:900,easing:'ease-out'});
 }
 $('.pp-id9-mrz',card).innerHTML=mrz({name:a.name,handle:a.username,joined:prog.step===FINISH?monthLabel():''},0,lv);
 $$('.pp-rows dd',card)[2].textContent=prog.step===FINISH?monthLabel():'—';
 $('.pp-id9-no',card).textContent=prog.step===FINISH?'issued':'draft';
 if(changed.arch){const s=$('.pp-id9-stamp',card);pop(s,[{scale:2.8,rotate:'-18deg',opacity:0},{scale:.92,rotate:'2deg',opacity:1,offset:.62},{scale:1,rotate:'0deg',opacity:1}],{duration:460,easing:'cubic-bezier(.2,.8,.3,1)'});pop(pobj,[{translate:'0 0'},{translate:'0 6px',offset:.62},{translate:'0 0'}],{duration:460});}
 if(changed.foil&&!calm()&&st.foil!=='none'){const t0=performance.now(),run=t=>{const k=Math.min(1,(t-t0)/800);pobj.style.setProperty('--gx',(k*100).toFixed(1)+'%');pobj.style.setProperty('--gy',(30+Math.sin(k*3.14)*30).toFixed(1)+'%');if(k<1)requestAnimationFrame(run);};requestAnimationFrame(run);}
}
function fit(){fitPreview({stage,cardw,scale,card:pobj.firstElementChild,biop},wide()?{reserve:40,padW:96,maxScale:1.28}:{reserve:18,padW:16,maxScale:.9});}
function layout(){
 const hb=$('.ob-header').getBoundingClientRect().bottom;D.documentElement.style.setProperty('--ob-top',Math.ceil(Math.max(0,hb))+'px');
 D.documentElement.classList.toggle('ob-app',wide());requestAnimationFrame(fit);
}
addEventListener('resize',layout);new ResizeObserver(()=>fit()).observe(stage);

/* ---------- step column frame ---------- */
const col=$('.ob-step-col');
col.innerHTML=`<div class="ob-top"><div class="ob-bar"><button type="button" class="ob-back" aria-label="Back one step"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg></button><p class="ob-count" aria-live="polite"></p><button type="button" class="ob-skip">skip for now</button></div><ol class="ob-track" aria-label="Setup progress">${STEPS.map(s=>`<li data-id="${s.id}"><i></i><span>${s.name}</span></li>`).join('')}</ol></div><div class="ob-view" id="ob-step" tabindex="-1"></div>`;
const view=$('.ob-view',col);
$('.ob-back',col).addEventListener('click',()=>leave('back'));
$('.ob-skip',col).addEventListener('click',()=>leave('skip'));
function topbar(){
 const i=prog.step,fin=i===FINISH;
 $$('.ob-track li',col).forEach((li,n)=>{const id=STEPS[n].id,past=n<i;li.classList.toggle('is-done',past&&prog.done.includes(id));li.classList.toggle('is-skipped',past&&!prog.done.includes(id));if(n===i&&!fin)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
 const nSkip=STEPS.filter((x,n)=>n<i&&!prog.done.includes(x.id)).length;
 $('.ob-count',col).textContent=fin?(nSkip?`done · ${nSkip} skipped`:'all 8 steps done'):`step ${i+1} of ${STEPS.length} · ${STEPS[i].name}`;
 $('.ob-back',col).hidden=i===0;
 const s=STEPS[i];$('.ob-skip',col).hidden=fin||!s.skip;
}

/* ---------- small helpers ---------- */
const heading=(a,b)=>`<h1 class="ob-h" id="ob-h" tabindex="-1">${a} <em>${b}</em></h1>`;
const go=(label,cls='')=>`<button type="submit" class="ob-go ${cls}"><span>${label}</span>${ARROW}</button>`;
const actions=(label,extra='')=>`<div class="ob-actions">${extra}${go(label)}</div>`;
const field=(id,label,control,hint='')=>`<div class="ob-f"><label for="${id}">${label}</label>${control}<p class="ob-hint" id="${id}-h" role="status" aria-live="polite">${hint}</p></div>`;
function setHint(input,text,bad=false){
 const h=D.getElementById(input.id+'-h');if(!h)return;h.textContent=text;h.classList.toggle('is-bad',bad);
 if(bad){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',h.id);}else{input.removeAttribute('aria-invalid');}
}
const debounce=(fn,ms=250)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};};

/* ---------- steps ---------- */
const S={};

S.account={
 head:()=>heading('let’s get you','a passport.'),
 lead:'free, and it takes about a minute.',
 label:'create my account',
 html(){
  const e=readSession().email,done=prog.done.includes('account');
  return `${field('ob-email','email address',`<input class="ob-in" id="ob-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${esc(e)}" required>`)}
  ${field('ob-pw','password',`<div class="ob-pwrow"><input class="ob-in" id="ob-pw" name="password" type="password" autocomplete="new-password" placeholder="${done?'already set — leave empty to keep it':'at least 10 characters'}" aria-describedby="ob-pw-h ob-meter-t"><button type="button" class="ob-show" aria-pressed="false" aria-controls="ob-pw">show</button></div><div class="ob-meter" data-score="0" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="ob-meter-t" id="ob-meter-t" aria-live="polite">use 10 or more characters, with letters and numbers mixed.</p>`)}
  <div class="ob-check"><input type="checkbox" id="ob-terms" name="terms"${prog.data.terms?' checked':''}><label for="ob-terms">I agree to the <a href="/terms/" target="_blank" rel="noopener">terms</a> and <a href="/privacy/" target="_blank" rel="noopener">privacy policy</a></label></div><p class="ob-hint" id="ob-terms-h" role="status" aria-live="polite"></p>
  <p class="ob-or"><span>or</span></p>
  <div class="ob-prov"><a class="ob-ghost" href="${LOGIN}" data-original target="_blank" rel="noopener">${G_ICON}continue with Google</a><a class="ob-ghost" href="${LOGIN}" data-original target="_blank" rel="noopener">${A_ICON}continue with Apple</a></div>
  <p class="ob-note">preview: accounts connect at launch — your password is not kept. Google and Apple open the DeepSpot sign-in in a new tab.</p>`;
 },
 mount(f){
  const pw=f.password,meter=$('.ob-meter',f),mt=$('#ob-meter-t',f);
  pw.addEventListener('input',()=>{const s=passwordStrength(pw.value);meter.dataset.score=s.score;mt.textContent=s.score?`${s.label}${s.ok?'':' — use 10 or more characters, with letters and numbers mixed.'}`:'use 10 or more characters, with letters and numbers mixed.';if(pw.hasAttribute('aria-invalid')&&s.ok)setHint(pw,'');});
  $('.ob-show',f).addEventListener('click',e=>{const b=e.currentTarget,on=pw.type==='password';pw.type=on?'text':'password';b.textContent=on?'hide':'show';b.setAttribute('aria-pressed',String(on));});
  f.email.addEventListener('input',()=>setHint(f.email,''));
  f.terms.addEventListener('change',()=>{const h=$('#ob-terms-h',f);h.textContent='';h.classList.remove('is-bad');f.terms.removeAttribute('aria-invalid');});
  f.email.focus({preventScroll:true});
 },
 submit(f){
  let bad=null;
  const email=f.email.value.trim();
  if(!validEmail(email)){setHint(f.email,email?'enter a valid email, like you@example.com.':'enter your email to continue.',true);bad??=f.email;}
  const s=passwordStrength(f.password.value),has=prog.done.includes('account');
  if(!(has&&!f.password.value)&&!s.ok){setHint(f.password,f.password.value?'use 10 or more characters, with letters and numbers mixed.':'choose a password.',true);bad??=f.password;}
  if(!f.terms.checked){const h=$('#ob-terms-h',f);h.textContent='agree to the terms to continue.';h.classList.add('is-bad');f.terms.setAttribute('aria-invalid','true');f.terms.setAttribute('aria-describedby','ob-terms-h');bad??=f.terms;}
  if(bad){bad.focus();return false;}
  const cur=readSession();writeSession({state:cur.state==='member'?'member':'free',email});
  f.password.value='';prog.data.terms=true;
  return true;
 }
};

S.name={
 head:()=>heading('what do explorers','call you?'),
 lead:'a name for your passport and a @username people can find you by.',
 label:'next',
 html(){
  const a=readAccount();
  return `${field('ob-name','display name',`<input class="ob-in ob-in-xl" id="ob-name" name="name" maxlength="50" autocomplete="nickname" placeholder="Your name" value="${esc(a.name)}" required>`)}
  ${field('ob-user','username',`<div class="ob-at"><span aria-hidden="true">@</span><input class="ob-in ob-in-xl" id="ob-user" name="username" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="username" value="${esc(a.username)}" aria-describedby="ob-user-h" required></div>`,'3 to 20 letters, numbers, dots or underscores.')}
  <div class="ob-sug" aria-label="Username ideas"><p class="ob-lab">ideas</p><div class="ob-chips" id="ob-sug"></div></div>`;
 },
 mount(f){
  const own=readAccount().username,rules={taken,own};
  const sug=()=>{const list=suggestUsernames(f.name.value,{taken}),box=$('#ob-sug',f);box.innerHTML=list.length?list.map(u=>`<button type="button" class="ob-chip" data-u="${esc(u)}">@${esc(u)}</button>`).join(''):'<span class="ob-muted">type your name to get ideas.</span>';};
  const check=()=>{if(!f.username.value.trim()){setHint(f.username,'3 to 20 letters, numbers, dots or underscores.');return;}const r=validateUsername(f.username.value,rules);setHint(f.username,r.ok?`@${r.value} is ${r.reason==='own'?'yours':'free'}.`:r.message,!r.ok);D.getElementById('ob-user-h').classList.toggle('is-ok',r.ok);};
  const save=debounce(()=>{saveAccount({name:f.name.value,username:f.username.value});paint();},200);
  f.name.addEventListener('input',()=>{setHint(f.name,'');sug();save();});
  f.username.addEventListener('input',()=>{check();save();});
  $('#ob-sug',f).addEventListener('click',e=>{const b=e.target.closest('[data-u]');if(!b)return;f.username.value=b.dataset.u;check();saveAccount({name:f.name.value,username:f.username.value});paint();f.username.focus();});
  sug();if(f.username.value)check();f.name.focus({preventScroll:true});
 },
 submit(f){
  const name=f.name.value.trim(),r=validateUsername(f.username.value,{taken,own:readAccount().username});let bad=null;
  if(!name){setHint(f.name,'enter a name.',true);bad=f.name;}
  if(!r.ok){setHint(f.username,r.message,true);bad??=f.username;}
  if(bad){bad.focus();return false;}
  saveAccount({name,username:r.value});return true;
 }
};

let rolling=false;
S.mole={
 head:()=>heading('roll your','mole.'),
 lead:'your passport picture. one of a kind, and it is yours.',
 label:'roll my mole',
 html(){return `<div class="ob-mole" id="ob-mole-slot"></div><p class="ob-note" id="ob-mole-n" role="status" aria-live="polite"></p>`;},
 mount(f){
  const slot=$('#ob-mole-slot',f),btn=$('.ob-go span',f);
  const draw=()=>{
   const png=readAccount().mole?.png;
   slot.innerHTML=png?`<span class="ob-mole-img">${moleImgHTML(png,{alt:'your mole'})}</span><button type="button" class="ob-ghost ob-again" data-roll>roll again</button>`:`<button type="button" class="ob-mole-ph" data-roll><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg><b>roll</b><span>tap to meet your mole</span></button>`;
   btn.textContent=png?'keep it':'roll my mole';f.dataset.has=png?'1':'';
  };
  const roll=async trigger=>{
   if(rolling)return;rolling=true;
   try{
    const {openMoleReveal}=await import('./mole/mole-reveal.mjs?v=rules1');
    const res=await openMoleReveal({trigger});
    if(res){const next=saveAccount({avatarMode:'mole',mole:{traits:res.traits,png:res.png,rolledAt:res.rolledAt}});if(!next?.mole)toast('That mole picture was too large to save.');else{paint({mole:true});draw();$('.ob-go',f).focus({preventScroll:true});$('#ob-mole-n',f).textContent='your mole is on your passport.';}}
   }catch(err){console.error(err);$('#ob-mole-n',f).textContent='the mole roll could not load. try again, or skip for now.';}
   finally{rolling=false;}
  };
  slot.addEventListener('click',e=>{const b=e.target.closest('[data-roll]');if(b)roll(b);});
  f._roll=()=>roll($('[data-roll]',f)||D.body);
  draw();
 },
 async submit(f){if(!f.dataset.has){await f._roll();return false;}return true;}
};

const pickText=id=>{const t=travelerStyles.find(x=>x.id===id);return t?`<b>${esc(t.name)}.</b> ${esc(t.description)}`:'';};
S.archetype={
 head:()=>heading('what kind of','explorer are you?'),
 lead:'pick the one that fits best. your posts will refine this later.',
 label:'next',
 html(){
  const a=readAccount(),sel=prog.data.arch?a.style:'',groups=archGroups(),g0=Math.max(0,groups.indexOf(travelerStyles.find(t=>t.id===sel)?.group));
  return `<div class="ob-tabs" role="tablist" aria-label="Archetype groups">${groups.map((g,i)=>`<button type="button" role="tab" class="ob-tab" id="ob-at-${i}" aria-controls="ob-ag-${i}" aria-selected="${i===g0}" tabindex="${i===g0?0:-1}">${esc(g)}</button>`).join('')}</div>
  <fieldset class="ob-arch"><legend class="sr-only">Traveler archetype</legend>${archCardsHTML(sel)}</fieldset>
  <p class="ob-hint ob-pick" id="ob-arch-h" role="status" aria-live="polite">${sel?pickText(sel):''}</p>`;
 },
 mount(f){
  const groups=archGroups(),panels=$$('.ob-ag',f),tabs=$$('.ob-tab',f);
  const open=i=>{tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1;});panels.forEach((p,n)=>p.hidden=n!==i);const t=tabs[i];t.scrollIntoView?.({block:'nearest',inline:'center',behavior:calm()?'auto':'smooth'});};
  open(Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-selected')==='true')));
  $('.ob-tabs',f).addEventListener('click',e=>{const t=e.target.closest('.ob-tab');if(t)open(tabs.indexOf(t));});
  $('.ob-tabs',f).addEventListener('keydown',e=>{const i=tabs.indexOf(D.activeElement);if(i<0)return;let n=null;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==null){e.preventDefault();open(n);tabs[n].focus();}});
  f.addEventListener('change',e=>{if(e.target.name!=='pp-arch')return;saveAccount({style:e.target.value});prog.data.arch=true;saveProg();paint({arch:true});const h=$('#ob-arch-h',f);h.innerHTML=pickText(e.target.value);h.classList.remove('is-bad');});
  const cur=f.querySelector('[name=pp-arch]:checked');(cur||tabs.find(t=>t.tabIndex===0))?.focus({preventScroll:true});
 },
 submit(f){if(!prog.data.arch){const h=$('#ob-arch-h',f);h.textContent='pick one, or skip for now.';h.classList.add('is-bad');return false;}return true;}
};

const PROMPTS=['I go looking for…','My weirdest find was…','Next on my list:'];
S.bio={
 head:()=>heading('say','hi.'),
 lead:'a few lines for your passport. tap a starter if you are stuck.',
 label:'next',
 html(){
  const a=readAccount();
  return `<div class="ob-f"><label for="ob-bio">bio <i id="ob-bio-n">${a.bio.length}/400</i></label><textarea class="ob-in ob-ta" id="ob-bio" name="bio" maxlength="400" rows="5" placeholder="who you are, where you go, what you look for.">${esc(a.bio)}</textarea></div>
  <div class="ob-sug"><p class="ob-lab">starters</p><div class="ob-chips">${PROMPTS.map(p=>`<button type="button" class="ob-chip" data-p="${esc(p)}">${esc(p)}</button>`).join('')}</div></div>`;
 },
 mount(f){
  const t=f.bio,n=$('#ob-bio-n',f),save=debounce(()=>{saveAccount({bio:t.value});paint();},200);
  const count=()=>{n.textContent=t.value.length+'/400';};
  t.addEventListener('input',()=>{count();save();});
  $('.ob-chips',f).addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const p=b.dataset.p,cur=t.value;t.value=(cur&&!/\s$/.test(cur)?cur+(/[.!?…:]$/.test(cur)?' ':'\n'):cur)+p+' ';t.value=t.value.slice(0,400);t.focus();t.setSelectionRange(t.value.length,t.value.length);count();saveAccount({bio:t.value});paint();});
  t.focus({preventScroll:true});t.setSelectionRange(t.value.length,t.value.length);
 },
 submit(f){saveAccount({bio:f.bio.value});return true;}
};

S.mark={
 head:()=>heading('sign your','passport.'),
 lead:'draw your mark on the pad, or let us write your name.',
 label:'sign it',
 html(){const a=readAccount();return `<div class="ob-pad" id="ob-pad-w">${padHTML({localPreview:true,name:a.name||'Your name',signatureArt:a.signatureArt})}</div><div class="ob-padx"><button type="button" class="ob-ghost" data-hand>use my name in handwriting</button><p class="ob-note" id="ob-mark-n" role="status" aria-live="polite"></p></div>`;},
 mount(f){
  const a=readAccount(),root=$('#pp-pad',f);
  initPad(root,{art:a.signatureArt,onSave:()=>{paint({sig:true});}});
  const cv=$('canvas',root);let t;
  cv.addEventListener('pointerup',()=>{clearTimeout(t);t=setTimeout(()=>paint({sigLive:cv.toDataURL('image/png')}),30);});
  $('[data-hand]',f).addEventListener('click',async()=>{
   const name=readAccount().name||'';if(!name){$('#ob-mark-n',f).textContent='add your name first (go back one step).';return;}
   try{await D.fonts.load('600 110px Caveat');}catch{}
   const ctx=cv.getContext('2d');ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,cv.width,cv.height);
   let size=130;const fam='Caveat,"Segoe Script","Brush Script MT",cursive';ctx.font=`600 ${size}px ${fam}`;
   const w=ctx.measureText(name).width,max=cv.width-60;if(w>max)size=Math.floor(size*max/w);
   ctx.font=`600 ${size}px ${fam}`;ctx.fillStyle='#111';ctx.textBaseline='middle';ctx.textAlign='center';ctx.save();ctx.translate(cv.width/2,cv.height/2+6);ctx.rotate(-.05);ctx.fillText(name,0,0);ctx.restore();
   prog.data.sign='name';saveProg();paint({sigLive:cv.toDataURL('image/png')});
   $('[data-tool=save]',root).click();
   $('#ob-mark-n',f).textContent='your name is on the pad. draw over it, or press sign it.';
  });
  f._save=()=>$('[data-tool=save]',root).click();
 },
 submit(f){f._save();return true;}
};

S.style={
 head:()=>heading('make it','yours.'),
 lead:'pick a field, a foil and a bio colour. the card changes as you pick.',
 label:'next',
 html(){const st=readStyle(true),lk=readLook(true);return `<section class="ob-sec" aria-label="Passport style">${styleTilesHTML(st)}</section><section class="ob-sec" aria-label="Bio colour">${lookGroupHTML(lk,'bg','bio colour')}<p class="ob-note">type and alignment for your bio are in edit profile.</p></section>`;},
 mount(f){
  f.addEventListener('change',e=>{
   if(/^cz-/.test(e.target.name||'')){const st=pickStyle(f,readStyle(true));writeStyle(st);paint({foil:e.target.name==='cz-foil'});}
   else if(e.target.name==='pp-look-bg'){const lk={...readLook(true),bg:e.target.value};writeLook(lk);paint();}
  });
  (f.querySelector('[name=cz-bg]:checked')||f.querySelector('input'))?.focus({preventScroll:true});
 },
 submit(f){writeStyle(pickStyle(f,readStyle(true)));writeLook({...readLook(true),bg:f.querySelector('[name=pp-look-bg]:checked')?.value||'panel'});return true;}
};

/* places */
const stem=s=>s.split('/').pop().replace(/\.[a-z]+$/i,'');
const thumbOf=s=>{const i=typeof s.image==='string'&&s.image.startsWith('/')?s.image:'';return i?`/editorial-assets/cards/${stem(i)}.webp`:'';};
const PIN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const placeRow=(it,i)=>{
 const s=it.type==='spot'?bySlug.get(it.id):null,name=it.type==='spot'?(s?.title||it.id.split('/').pop().replaceAll('-',' ')):it.name,th=s?thumbOf(s):'';
 return `<li class="ob-pl"><span class="ob-pl-i">${th?`<img src="${esc(th)}" data-orig="${esc(s.image)}" alt="" width="120" height="90" loading="lazy">`:PIN}</span><span class="ob-pl-t"><b>${esc(name)}</b><i>${esc(s?s.place:'your pick')}</i></span><button type="button" class="ob-pl-x" data-rm="${i}" aria-label="Remove ${esc(name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></li>`;
};
S.places={
 head:()=>heading('where do you','want to go?'),
 lead:'add 3 or more. they go on your map.',
 label:'issue my passport',
 html(){
  return `<div class="ob-f"><label for="ob-pl-in">add a place</label><div class="ob-plrow"><div class="ob-combo"><input class="ob-in" id="ob-pl-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="ob-pl-lb" autocomplete="off" maxlength="${WTG_NAME_MAX}" placeholder="a spot, a city, anywhere"><ul id="ob-pl-lb" class="ob-lb" role="listbox" aria-label="Matching deep spots" hidden></ul></div><button type="button" class="ob-add" data-add>add</button></div><p class="ob-hint" id="ob-pl-in-h" role="status" aria-live="polite"></p></div>
  <p class="ob-lab" id="ob-pl-count"></p><ul class="ob-pls" id="ob-pls"></ul>
  <div class="ob-sug" id="ob-sugwrap"><p class="ob-lab" id="ob-sug-t"></p><ul class="ob-sp" id="ob-sp"></ul></div>`;
 },
 mount(f){
  const inp=$('#ob-pl-in',f),lb=$('#ob-pl-lb',f);let list=readWantToGo(),matches=[],active=-1,pick=null;
  const arch=prog.data.arch?readAccount().style:'';
  const say=(t,bad=false)=>{const h=$('#ob-pl-in-h',f);h.textContent=t;h.classList.toggle('is-bad',bad);};
  const commit=next=>{list=next;writeWantToGo(list);render();};
  const render=()=>{
   $('#ob-pls',f).innerHTML=list.map(placeRow).join('');
   $('#ob-pl-count',f).textContent=list.length>=3?`${list.length} places added`:`${list.length} of 3 added · add ${3-list.length} more`;
   const have=list.filter(i=>i.type==='spot').map(i=>i.id),sg=suggestSpots(catalog,arch,{n:6+have.length,have}),spots=sg.spots.slice(0,6);
   $('#ob-sug-t',f).textContent=!spots.length?'':sg.matched>=spots.length?`picked for ${archetypeName(arch)}`:sg.matched>0?`picked for ${archetypeName(arch)}, plus popular spots`:'popular spots';
   $('#ob-sugwrap',f).hidden=!spots.length;
   $('#ob-sp',f).innerHTML=spots.map(s=>`<li><button type="button" class="ob-spot" data-id="${esc(s.id)}"><span class="ob-spot-i"><img src="${esc(thumbOf(s))}" data-orig="${esc(s.image)}" alt="" width="240" height="180" loading="lazy"></span><b>${esc(s.title)}</b><i>${esc(s.place||'')}</i><span class="ob-spot-a">+ add</span></button></li>`).join('');
  };
  const close=()=>{lb.hidden=true;inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');active=-1;};
  const suggest=()=>{
   const q=inp.value.trim().toLowerCase();pick=null;if(q.length<2){close();return;}
   const have=new Set(list.filter(i=>i.type==='spot').map(i=>i.id)),score=s=>{const t=s.title.toLowerCase(),p=(s.place||'').toLowerCase();return t.startsWith(q)||p.startsWith(q)?0:t.includes(q)?1:p.includes(q)?2:-1;};
   matches=catalog.filter(s=>!have.has(s.id)&&score(s)>=0).sort((a,b)=>score(a)-score(b)).slice(0,6);
   if(!matches.length){close();return;}
   lb.innerHTML=matches.map((s,i)=>`<li role="option" id="ob-o${i}" aria-selected="false" data-i="${i}"><strong>${esc(s.title)}</strong><span>${esc(s.place||'')}</span></li>`).join('');
   lb.hidden=false;inp.setAttribute('aria-expanded','true');active=-1;
  };
  const setActive=i=>{active=i;$$('[role=option]',lb).forEach((o,n)=>o.setAttribute('aria-selected',String(n===i)));if(i>=0){inp.setAttribute('aria-activedescendant','ob-o'+i);lb.children[i].scrollIntoView({block:'nearest'});}else inp.removeAttribute('aria-activedescendant');};
  const choose=i=>{const s=matches[i];if(!s)return;inp.value=s.title.slice(0,WTG_NAME_MAX);pick=s;close();inp.focus();};
  const addCurrent=()=>{
   const text=inp.value.trim();let raw=null;
   if(pick)raw={type:'spot',id:pick.id};else if(text){const ex=catalog.find(s=>s.title.trim().toLowerCase()===text.toLowerCase());raw=ex?{type:'spot',id:ex.id}:{type:'place',name:text};}
   const r=addItem(list,raw);
   if(!r.ok){say(r.reason==='duplicate'?'already on your list.':r.reason==='full'?`list is full. ${WTG_MAX} places max.`:'type a place first.',true);inp.focus();return;}
   inp.value='';pick=null;close();say('');commit(r.list);inp.focus();
  };
  inp.addEventListener('input',()=>{say('');suggest();});
  inp.addEventListener('blur',()=>setTimeout(close,120));
  inp.addEventListener('keydown',e=>{
   const open=!lb.hidden;
   if(e.key==='ArrowDown'&&matches.length){e.preventDefault();if(!open)suggest();if(!lb.hidden)setActive(Math.min(active+1,matches.length-1));}
   else if(e.key==='ArrowUp'&&open){e.preventDefault();setActive(Math.max(active-1,-1));}
   else if(e.key==='Enter'){if(open&&active>=0){e.preventDefault();choose(active);}else if(inp.value.trim()){e.preventDefault();addCurrent();}}
   else if(e.key==='Escape'&&open){e.preventDefault();close();}
  });
  lb.addEventListener('mousedown',e=>e.preventDefault());
  lb.addEventListener('click',e=>{const o=e.target.closest('[role=option]');if(o){choose(+o.dataset.i);addCurrent();}});
  $('[data-add]',f).addEventListener('click',addCurrent);
  f.addEventListener('click',e=>{
   const rm=e.target.closest('[data-rm]');if(rm){const i=+rm.dataset.rm;commit(removeAt(list,i));($(`[data-rm="${Math.min(i,list.length-1)}"]`,f)||inp).focus();return;}
   const sp=e.target.closest('[data-id]');if(sp){const r=addItem(list,{type:'spot',id:sp.dataset.id});if(r.ok){commit(r.list);say('');}else say(r.reason==='full'?`list is full. ${WTG_MAX} places max.`:'already on your list.',true);}
  });
  f.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.dataset.orig&&img.getAttribute('src')!==img.dataset.orig)img.src=img.dataset.orig;},true);
  render();inp.focus({preventScroll:true});
 },
 submit(f){const inp=$('#ob-pl-in',f);if(inp.value.trim()){const r=addItem(readWantToGo(),{type:'place',name:inp.value.trim()});if(r.ok)writeWantToGo(r.list);}return true;}
};

/* ---------- finish ---------- */
function finishHTML(){
 const a=readAccount(),n=readWantToGo().length;
 return `<div class="ob-fin">${heading('your passport is','ready.')}<p class="ob-lead">issued ${new Date().toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'}).toLowerCase()} to ${esc(a.name||'you')}. it is saved on this browser${n?`, with ${n} ${n===1?'place':'places'} on your map`:''}.</p>
 <div class="ob-fin-b"><button type="button" class="ob-go" data-fin="passport"><span>see my passport</span>${ARROW}</button><button type="button" class="ob-ghost" data-fin="share">share it</button><button type="button" class="ob-ghost" data-fin="explore">start exploring</button></div>
 ${fromPath?`<p class="ob-back-l"><a href="${esc(fromPath)}">← back to what you were reading</a></p>`:''}<p class="ob-note">preview: accounts connect at launch. nothing was sent anywhere.</p></div>`;
}
function finishDone(to){
 markOnboarded();
 const u=new URL(to,location.origin);u.searchParams.set('theme',theme());if(fromPath&&u.pathname==='/profile/')u.searchParams.set('from',fromPath);location.assign(u.pathname+u.search);
}

/* ---------- render a step ---------- */
function stepHTML(i){
 const s=S[STEPS[i].id];
 return `<form class="ob-form" id="ob-form" novalidate data-step="${STEPS[i].id}" aria-labelledby="ob-h"><div class="ob-body">${s.head()}<p class="ob-lead">${s.lead}</p>${s.html()}</div>${actions(s.label)}</form>`;
}
let busy=false;
async function show(i,{dir=1}={}){
 prog.step=i;saveProg();
 const out=view.firstElementChild;
 if(out&&!calm()){try{await out.animate([{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-24*dir}px)`}],{duration:140,easing:'ease-in'}).finished;}catch{}}
 if(i===FINISH){view.innerHTML=finishHTML();}
 else{
  view.innerHTML=stepHTML(i);
  const f=$('#ob-form',view);f.addEventListener('submit',async e=>{
   e.preventDefault();if(busy)return;busy=true;
   try{const ok=await S[STEPS[prog.step].id].submit(f);if(ok){prog=advance(prog);saveProg();await show(prog.step,{dir:1});}}finally{busy=false;}
  });
  S[STEPS[i].id].mount(f);
 }
 topbar();paint();layout();
 if(i===FINISH)celebrate();else stage.classList.remove('is-final');
 if(!wide())window.scrollTo({top:0,behavior:'auto'});
 if(!calm())view.firstElementChild.animate([{opacity:0,transform:`translateX(${28*dir}px)`},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.8,.3,1)'});
 /* focus moves to the heading on every step change */
 $('#ob-h',view)?.focus({preventScroll:true});
 requestAnimationFrame(fit);
}
async function leave(kind){
 if(busy)return;busy=true;
 try{
  const id=STEPS[prog.step]?.id,f=$('#ob-form',view);
  if(id==='mark'&&f?._save)f._save();
  if(kind==='back'){prog=goBack(prog);saveProg();await show(prog.step,{dir:-1});}
  else{prog=advance(prog,{skip:true});saveProg();await show(prog.step,{dir:1});}
 }finally{busy=false;}
}
function celebrate(){
 const a=readAccount();
 $('.ob-issued b',stage).textContent=new Date().toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
 stage.classList.remove('is-final');void stage.offsetWidth;stage.classList.add('is-final');
 if(!calm()){pobj.animate([{transform:'perspective(1600px) rotateY(-100deg) scale(.9)',opacity:.2},{transform:'perspective(1600px) rotateY(8deg) scale(1.02)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:900,easing:'cubic-bezier(.2,.8,.3,1)'});}
}
view.addEventListener('click',e=>{const b=e.target.closest('[data-fin]');if(!b)return;const k=b.dataset.fin;finishDone(k==='passport'?'/profile/?user=preview&welcome=1':k==='share'?'/profile/?user=preview&welcome=1&share=1':'/browse/');});

layout();
await show(prog.step,{dir:1});
requestAnimationFrame(()=>{layout();fit();});
