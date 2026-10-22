// New-user onboarding v2 (/welcome/). Prototype: no backend, nothing is sent. The password is never stored.
// Screen A = account (one screen). Then a short "issue" animation. Screen B = the passport itself: every part is a glowing
// slot on the card (v2.1: one face, no flip; bio sits between the photo and the mark), each opening a focused bottom sheet (phone) or popover (desktop).
// Passport data goes through the same storage the passport page reads (account draft, passport style, want-to-go).
import {FINISH,SLOTS,slotProgress,readProgress,writeProgress,isOnboarded,markOnboarded,resetOnboarding,passwordStrength,validateUsername,suggestUsernames,takenHandles,archetypeName,validEmail} from './onboarding-state.mjs?v=ob3';
import {accountKey,readAccount,normalizeAccount,travelerStyles} from './account-state.mjs?v=icons2';
import {readSession,writeSession} from './gate-state.mjs?v=gate1';
import {G_ICON,A_ICON} from './brand-icons.mjs?v=ob1';
const MAIL_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7.5 8 6 8-6"/></svg>';
import {readStyle,writeStyle,archCardsHTML,archGroups,styleGroupHTML,pickStyle,cardHTML,moleImgHTML,mrz,syncPreview,bindTilt,fitRows} from '../profile/passport-edit.mjs?v=mf1';
import {padHTML,initPad,inkURL} from '../profile/sign-pad.mjs?v=pv4';
import {escapeHTML as esc,safeReturn} from '../profile/identity.mjs';

const D=document,$=(s,r=D)=>r.querySelector(s),$$=(s,r=D)=>[...r.querySelectorAll(s)];
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
const LOGIN='https://www.deepspot.io/login';
const ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const theme=()=>D.documentElement.dataset.theme==='light'?'light':'dark';
const popMode=()=>matchMedia('(min-width:860px) and (min-height:600px)').matches;
const wideMode=()=>matchMedia('(min-width:1000px) and (min-height:600px) and (min-aspect-ratio:5/4)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
D.documentElement.classList.add('ob-lock');

/* ---------- header (theme button only: the page is a closed flow) ---------- */
function applyTheme(v){
 D.documentElement.dataset.theme=v;try{localStorage.setItem('deepspot-theme',v);}catch{}
 const b=$('.br-theme');b.innerHTML=v==='light'?'<span aria-hidden="true">☾</span><span class="ob-tl"> dark</span>':'<span aria-hidden="true">☼</span><span class="ob-tl"> light</span>';
 b.setAttribute('aria-label',`Switch to ${v==='light'?'dark':'light'} mode`);
 const u=new URL(location.href);u.searchParams.set('theme',v);history.replaceState(null,'',u);
}
applyTheme(theme());
$('.br-theme').addEventListener('click',()=>applyTheme(theme()==='dark'?'light':'dark'));
function toast(t){const b=$('.br-toast');b.textContent=t;b.dataset.open='true';clearTimeout(toast.t);toast.t=setTimeout(()=>b.dataset.open='false',3200);}

/* ---------- entry rules ---------- */
const fromPath=(()=>{const u=new URL(safeReturn(params.get('from'))||'/','https://x.invalid');u.searchParams.delete('gate');u.searchParams.delete('onboard');const p=u.pathname+(u.search||'')+u.hash;return p==='/'?'':p;})();
const keep=new URLSearchParams();if(fromPath)keep.set('from',fromPath);if(params.get('force'))keep.set('force','1');keep.set('theme',theme());
if(params.get('reset')==='1'){resetOnboarding();keep.set('force','1');history.replaceState(null,'','/welcome/?'+keep);}
else if(isOnboarded()&&!params.get('force')){location.replace('/profile/?user=preview&theme='+theme());await new Promise(()=>{});}

/* ---------- state ---------- */
let prog=readProgress();
const stepParam=params.get('step');
if(stepParam!==null){const m={account:0,passport:1,fill:1,finish:1},n=stepParam in m?m[stepParam]:Number(stepParam);if(Number.isInteger(n))prog.step=Math.min(1,Math.max(0,n));}
else if(prog.step>0&&readSession().state==='out')prog.step=0;
if(stepParam===null&&params.get('force')&&isOnboarded())prog.step=0;   /* ?onboard=1 review run starts from the top, with your data filled in */
if(prog.step>=FINISH)prog.step=1;
let taken=new Set();
await fetch('/profile/profiles.json').then(r=>r.ok?r.json():null).then(j=>{taken=takenHandles(j?.profiles);}).catch(()=>{});
const saveProg=()=>writeProgress(prog);
const saveAccount=patch=>{const next=normalizeAccount({...readAccount(),...patch});try{localStorage.setItem(accountKey,JSON.stringify(next));}catch{toast('This browser could not save your passport.');return null;}return next;};
const monthLabel=()=>new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});
const dayLabel=()=>new Date().toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
const debounce=(fn,ms=200)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};};

/* ---------- skeleton ---------- */
const main=$('#ob');
main.innerHTML=`<section class="ob-a" id="ob-a" aria-label="Create your account"></section><section class="ob-b" id="ob-b" aria-label="Fill in your passport" hidden></section>`;
const A=$('#ob-a'),B=$('#ob-b');

/* ================= SCREEN A: account ================= */
const field=(id,label,control,hint='')=>`<div class="ob-f"><label for="${id}">${label}</label>${control}<p class="ob-hint" id="${id}-h" role="status" aria-live="polite">${hint}</p></div>`;
function setHint(input,text,bad=false){
 const h=D.getElementById(input.id+'-h');if(!h)return;h.textContent=text;h.classList.toggle('is-bad',bad);
 if(bad){input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',h.id);}else{input.removeAttribute('aria-invalid');}
}
function buildA(){
 const e=readSession().email,done=prog.done.includes('account');
 A.innerHTML=`<form class="ob-form" id="ob-form" novalidate aria-labelledby="ob-h">
  <h1 class="ob-h" id="ob-h" tabindex="-1">let’s get you <em>a passport.</em></h1>
  <div class="ob-pan ob-pan-choose" id="ob-choose"><div class="ob-pan-in"><div class="ob-big-l">
   <a class="ob-big" href="${LOGIN}" data-original target="_blank" rel="noopener" aria-label="Continue with Google (opens the DeepSpot sign-in in a new tab)">${G_ICON}<span>continue with Google</span></a>
   <a class="ob-big" href="${LOGIN}" data-original target="_blank" rel="noopener" aria-label="Continue with Apple (opens the DeepSpot sign-in in a new tab)">${A_ICON}<span>continue with Apple</span></a>
   <button type="button" class="ob-big ob-email-btn" aria-expanded="false" aria-controls="ob-emailf">${MAIL_ICON}<span>use email</span></button></div></div></div>
  <div class="ob-pan ob-pan-email" id="ob-emailf"><div class="ob-pan-in"><div class="ob-emailf">
  <button type="button" class="ob-prevlink"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>back</button>
  ${field('ob-email','email',`<input class="ob-in" id="ob-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${esc(e)}" required>`)}
  <div class="ob-f"><label for="ob-pw">password</label><div class="ob-pwrow"><input class="ob-in" id="ob-pw" name="password" type="password" autocomplete="new-password" placeholder="${done?'already set — leave empty':'10+ characters, mixed'}" aria-describedby="ob-pw-h"><button type="button" class="ob-show" aria-pressed="false" aria-controls="ob-pw">show</button></div><div class="ob-meter" data-score="0" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="ob-hint" id="ob-pw-h" role="status" aria-live="polite">at least 10 characters, mixed.</p></div>
  <div class="ob-check"><input type="checkbox" id="ob-terms" name="terms"${prog.data.terms?' checked':''}><label for="ob-terms">I agree to the <a href="/terms/" target="_blank" rel="noopener">terms</a> and <a href="/privacy/" target="_blank" rel="noopener">privacy policy</a></label></div><p class="ob-hint" id="ob-terms-h" role="status" aria-live="polite"></p>
  <button type="submit" class="ob-go"><span>issue my passport</span>${ARROW}</button></div></div></div>
  <p class="ob-note">preview: accounts connect at launch. your password is not kept.</p>
 </form>`;
 const f=$('#ob-form',A),pw=f.password,meter=$('.ob-meter',f);

 /* sign-up order: Google / Apple / use email first; the email fields open only after "use email" (back returns) */
 const emailBtn=$('.ob-email-btn',f),chooseP=$('#ob-choose',f),emailP=$('#ob-emailf',f);
 const setEmail=(on,focus=true)=>{
  f.classList.toggle('is-email',on);emailBtn.setAttribute('aria-expanded',String(on));
  chooseP.inert=on;emailP.inert=!on;
  if(!focus)return;
  const go=()=>(on?(f.email.value?pw:f.email):emailBtn).focus({preventScroll:true});
  calm()?go():setTimeout(go,on?120:60);
 };
 emailBtn.addEventListener('click',()=>setEmail(true));
 $('.ob-prevlink',f).addEventListener('click',()=>setEmail(false));
 f.addEventListener('keydown',e=>{if(e.key==='Escape'&&f.classList.contains('is-email')){e.preventDefault();setEmail(false);}});
 setEmail(done,false);
 pw.addEventListener('input',()=>{const s=passwordStrength(pw.value);meter.dataset.score=s.score;const h=$('#ob-pw-h',f);h.classList.remove('is-bad');pw.removeAttribute('aria-invalid');h.textContent=s.score?`${s.label}${s.ok?'.':' — use 10+ characters, mixed letters and numbers.'}`:'at least 10 characters, mixed.';});
 $('.ob-show',f).addEventListener('click',e=>{const b=e.currentTarget,on=pw.type==='password';pw.type=on?'text':'password';b.textContent=on?'hide':'show';b.setAttribute('aria-pressed',String(on));});
 f.email.addEventListener('input',()=>setHint(f.email,''));
 f.terms.addEventListener('change',()=>{const h=$('#ob-terms-h',f);h.textContent='';h.classList.remove('is-bad');f.terms.removeAttribute('aria-invalid');});
 f.addEventListener('submit',e=>{
  e.preventDefault();if(issuing)return;
  let bad=null;const email=f.email.value.trim();
  if(!validEmail(email)){setHint(f.email,email?'enter a valid email, like you@example.com.':'enter your email to continue.',true);bad??=f.email;}
  const s=passwordStrength(pw.value),has=prog.done.includes('account');
  if(!(has&&!pw.value)&&!s.ok){setHint(pw,pw.value?'use 10+ characters, mixed letters and numbers.':'choose a password.',true);bad??=pw;}
  if(!f.terms.checked){const h=$('#ob-terms-h',f);h.textContent='agree to the terms to continue.';h.classList.add('is-bad');f.terms.setAttribute('aria-invalid','true');f.terms.setAttribute('aria-describedby','ob-terms-h');bad??=f.terms;}
  if(bad){bad.focus();return;}
  const cur=readSession();writeSession({state:cur.state==='member'?'member':'free',email});
  pw.value='';prog.data.terms=true;
  if(!prog.done.includes('account'))prog.done.push('account');
  issue();
 });
 if(done&&matchMedia('(pointer:fine)').matches)(f.email.value?pw:f.email).focus({preventScroll:true});
}

/* ================= SCREEN B: the passport ================= */
const PH_MOLE='<span class="pp-mole pp-mole-empty ob-molePH" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg><span>your mole</span></span>';
const SLOT_LABEL={photo:'your mole',name:'your name',arch:'your explorer type',bio:'your bio',mark:'your mark',style:'your style'};
const SLOT_PILL={photo:'add photo',name:'add name',arch:'add type',bio:'add bio',mark:'sign here',style:'style'};
const slotBtn=(id,cls,inner='',extra='')=>`<button type="button" class="ob-slot ${cls}" data-slot="${id}"${extra}>${inner}</button>`;

function frontHTML(){
 return cardHTML({no:'draft',mole:PH_MOLE,lv:null,arch:'',noStamp:true,stamp:{name:'explorer',sub:'newcomer'},name:'—',handle:'',joined:'',member:'newcomer',sigLabel:'my mark',sig:'<span>no mark yet</span>',mrz:mrz({name:'',handle:'',joined:''},0,null)});
}
let stage,zone,rise,lift,cardw,scale,pobj,flip,front,topEl,tipEl,chipEl,finBtn,slotline;
const slotEls={};   // id -> [buttons]
const lit={};       // id -> elements that stay bright while that slot is being edited
let builtB=false;
function buildB(){
 if(builtB)return;builtB=true;
 B.innerHTML=`<div class="ed-stage ob-stage" data-bg="halftone">
  <div class="ob-top"><p class="ob-tip" id="ob-tip" role="status" aria-live="polite"></p><p class="ob-prog" id="ob-chip" role="status" aria-live="polite"></p></div>
  <div class="ob-zone"><div class="ob-rise"><div class="ob-lift"><div class="ed-cardw"><div class="ed-scale"><div class="pp-passobj-in ed-pobj" data-foil="none"><div class="ob-faces">${frontHTML()}</div></div>
   <div class="ob-reg" aria-hidden="true"><b>registered</b><i></i></div><div class="ob-issued" aria-hidden="true"><span>issued</span><b></b></div></div></div></div></div>
   <span class="ob-slotline" aria-hidden="true"></span><div class="ob-conf" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>
  <div class="ob-bar"><button type="button" class="ob-fin" id="ob-fin" aria-disabled="true" aria-describedby="ob-fin-h"><span>finish</span>${ARROW}</button><p class="sr-only" id="ob-fin-h"></p></div>
 </div>
 <div class="ob-layer" hidden><div class="ob-scrim" data-close></div><div class="ob-sheet" role="dialog" aria-modal="true" aria-labelledby="ob-sh-t" tabindex="-1"><span class="ob-arrow" aria-hidden="true"></span><div class="ob-grab" aria-hidden="true"><i></i></div><div class="ob-sh-h"><h2 id="ob-sh-t"></h2><button type="button" class="ob-sh-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><form class="ob-sh-form" novalidate><div class="ob-sh-b"></div><div class="ob-sh-f"><button type="submit" class="ob-go ob-sh-done"><span>done</span></button></div></form></div></div>`;
 stage=$('.ob-stage',B);zone=$('.ob-zone',B);rise=$('.ob-rise',B);lift=$('.ob-lift',B);cardw=$('.ed-cardw',B);scale=$('.ed-scale',B);pobj=$('.ed-pobj',B);flip=$('.ob-faces',B);
 front=$('.pp-id9',flip);topEl=$('.ob-top',B);tipEl=$('#ob-tip',B);chipEl=$('#ob-chip',B);finBtn=$('#ob-fin',B);slotline=$('.ob-slotline',B);
 /* front: three rows (name, user, type), then since; slots go on top of the real card parts */
 front.classList.add('ob-face','ob-front','pp-id9-tall');
 const body=$('.pp-id-body',front),rows=$$('.pp-rows>div',front);
 const lvlRow=rows[3];rows[2].before(lvlRow);lvlRow.querySelector('dt').textContent='type';lvlRow.querySelector('dd').textContent='choose';lvlRow.dataset.r='type';
 const rowsNow=$$('.pp-rows>div',front),molebox=$('.pp-molebox',front),sig=$('.pp-id9-sig',front),top=$('.pp-id-top',front),mrzEl=$('.pp-id9-mrz',front);
 [top,molebox,...rowsNow,sig,mrzEl].forEach(e=>e.classList.add('ob-dm'));
 molebox.insertAdjacentHTML('beforeend',slotBtn('photo','ob-s-photo'));
 body.insertAdjacentHTML('beforeend',slotBtn('name','ob-s-name')+slotBtn('arch','ob-s-arch'));
 sig.insertAdjacentHTML('beforeend',slotBtn('mark','ob-s-mark'));
 /* v2.2: the bio is a full-width band between the photo block and "my mark"; the style sticker sits at the bottom-right corner of the photo block */
 {const band=$('.pp-id9-bio',front);band.classList.add('ob-band');band.innerHTML=slotBtn('bio','ob-s-bio ob-dm','<span class="ob-bio-t" data-bio></span>');}
 body.insertAdjacentHTML('beforeend',`<button type="button" class="ob-slot ob-s-style ob-dm" data-slot="style"><span class="ob-sticker-in" aria-hidden="true"><b>✦</b><i>style</i></span></button>`);
 const stl=$('.ob-s-style',front),bioBtn=$('.ob-s-bio',front),stampEl=$('.pp-id9-stamp',front);stampEl.classList.add('ob-dm');
 for(const id of Object.keys(SLOT_LABEL)){slotEls[id]=$$(`[data-slot="${id}"]`,flip);slotEls[id].forEach(b=>b.dataset.lab=SLOT_PILL[id]);}
 lit.photo=[molebox];lit.name=[rowsNow[0],rowsNow[1]];lit.arch=[rowsNow[2],stampEl];lit.bio=[bioBtn];lit.mark=[sig];lit.style=[stl];
 /* never run into the sticker with a long type name */
 bindTilt(stage,cardw,pobj);
 /* events */
 flip.addEventListener('click',e=>{const b=e.target.closest('.ob-slot');if(b&&!finishing)openSheet(b.dataset.slot,b);});
 finBtn.addEventListener('click',finish);
 $('.ob-sh-x',B).addEventListener('click',()=>closeSheet('x'));
 $('.ob-scrim',B).addEventListener('pointerdown',()=>closeSheet('x'));
 $('.ob-sh-form',B).addEventListener('submit',e=>{e.preventDefault();closeSheet('done');});
 D.addEventListener('keydown',onKey,true);
 B.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.dataset.orig&&img.getAttribute('src')!==img.dataset.orig)img.src=img.dataset.orig;},true);
 const ro=new ResizeObserver(()=>{fit();relift();placePop();});ro.observe(zone);ro.observe(stage);
 addEventListener('resize',()=>{fit();relift();placePop();});
 if(visualViewport)visualViewport.addEventListener('resize',()=>{keyboard();relift();});
 wireDrag();
 setTimeout(()=>{import('./mole/mole-reveal.mjs?v=ld3').catch(()=>{});},600);   /* so the mole loading screen shows the instant the photo is tapped */
}

/* ---------- fit the card to the screen ---------- */
function fit(){
 if(!builtB||B.hidden)return;
 const nh=flip.offsetHeight||690,wide=wideMode(),pop=popMode();
 let s;
 if(wide){   /* desktop: the card is the page. tip + progress on the left, finish on the right */
  const maxH=Math.min(innerHeight*.92,stage.clientHeight-16),maxW=stage.clientWidth-2*230-48;
  s=Math.min(maxW/440,maxH/nh,2.6);
 }else{
  const zw=zone.clientWidth,zh=zone.clientHeight;
  s=Math.min((pop?zw*.9:zw*.93)/440,(zh-6)/nh,pop?2.6:1.3);
 }
 s=Math.max(.3,s);
 scale.style.transform=`scale(${s.toFixed(4)})`;cardw.style.width=(440*s).toFixed(1)+'px';cardw.style.height=(nh*s).toFixed(1)+'px';
 zone.style.setProperty('--k',Math.max(1,s).toFixed(3));
 fitBio();fitRows(front);
}
/* bio on the card: biggest size that fits the band (2 to 3 lines), never cut mid-word; an ellipsis only as the last resort */
function fitBio(){
 if(!builtB||B.hidden)return;
 const t=$('[data-bio]',front),btn=t?.closest('button');if(!t||!btn||!btn.clientHeight)return;
 const cs=getComputedStyle(btn),avail=btn.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
 t.style.webkitLineClamp='none';t.style.display='block';
 let sz=19;
 for(;sz>=11;sz-=.5){t.style.fontSize=sz+'px';if(t.scrollHeight<=avail+.5&&t.scrollWidth<=t.clientWidth+1)break;}
 if(sz<11){sz=11;t.style.fontSize='11px';const lines=Math.max(1,Math.floor(avail/(11*1.22)));t.style.display='-webkit-box';t.style.webkitLineClamp=String(lines);}
}

/* ---------- paint the card from saved data ---------- */
let shown={mole:'',sig:'',bio:null,arch:''};
const pop=(el,frames,opt)=>{if(el&&!calm())el.animate(frames,opt);};
const stampIn=els=>{for(const e of els||[])pop(e,[{transform:'scale(1.22)',opacity:.35,filter:'contrast(1.6) brightness(.8)'},{transform:'scale(.97)',opacity:1,offset:.55,filter:'none'},{transform:'scale(1)',opacity:1,filter:'none'}],{duration:440,easing:'cubic-bezier(.2,.9,.3,1)'});};
function snap(){
 const a=readAccount();
 return {mole:!!a.mole?.png,name:a.name,username:a.username,arch:prog.data.arch,sig:!!a.signatureArt,style:prog.data.style,bio:a.bio,};
}
function paint(changed={}){
 if(!builtB)return;
 const a=readAccount(),st=readStyle(true);
 syncPreview({stage,pobj},{name:a.name,username:a.username,arch:prog.data.arch?a.style:'',foil:st.foil,bg:st.bg},{empty:'—'});
 {const dd=$$('.pp-rows dd',front),nm=(a.name||'').trim(),un=(a.username||'').trim().replace(/^@/,'');if(!nm)dd[0].textContent='your name';if(!un)dd[1].textContent='@username';}
 const typeDd=$('[data-r=type] dd',front),has=prog.data.arch;
 typeDd.textContent=has?archetypeName(a.style).replace(/^the /,''):'choose';typeDd.classList.toggle('is-ph',!has);
 /* mole */
 const png=a.mole?.png||'';
 if(shown.mole!==png){
  shown.mole=png;const old=$('.pp-molebox .pp-mole',front),tmp=D.createElement('div');tmp.innerHTML=png?moleImgHTML(png,{alt:'your mole'}):PH_MOLE;const el=tmp.firstElementChild;old.replaceWith(el);
  if(png&&changed.mole)pop(el,[{scale:.4,opacity:0},{scale:1.12,opacity:1,offset:.6},{scale:1,opacity:1}],{duration:520,easing:'cubic-bezier(.2,.9,.3,1)'});
 }
 /* mark */
 const art=a.signatureArt||'';
 if(changed.sigLive!==undefined||shown.sig!==art){
  const src=changed.sigLive!==undefined?changed.sigLive:art;shown.sig=art;
  const box=$('.pp-id9-sig',front);$$(':scope>img,:scope>span:not(.pp-sig-l)',box).forEach(n=>n.remove());
  box.insertAdjacentHTML('afterbegin',src?`<img src="${esc(src)}" alt="your mark" width="512" height="256">`:'<span>no mark yet</span>');
  if(src&&changed.sig)pop($('img',box),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:900,easing:'ease-out'});
 }
 /* since / number / mrz */
 const fin=finishing;
 $$('.pp-rows dd',front)[3].textContent=fin?monthLabel():'—';
 $('.pp-id9-no',front).textContent=fin?'issued':'draft';
 const mz=mrz({name:a.name,handle:a.username,joined:fin?monthLabel():''},0,null);
 $('.pp-id9-mrz',front).innerHTML=mz;
 /* bio: on the front, between the photo and the mark */
 const bt=$('[data-bio]',front),bio=(a.bio||'').trim();
 if(shown.bio!==bio){shown.bio=bio;bt.textContent=bio||'say hi. a few lines about you.';bt.classList.toggle('is-ph',!bio);fitBio();}
 fitRows(front);
 slots(changed);
}
/* slot outlines, labels, progress chip, finish button */
function slots(changed={}){
 const p=slotProgress(snap());
 for(const s of SLOTS){
  const done=p.states[s.id];
  slotEls[s.id].forEach((b,i)=>{
   const has=done;
   b.classList.toggle('is-empty',!has);b.classList.toggle('is-done',has);b.classList.toggle('is-req',s.req);b.classList.toggle('is-next',s.req&&p.next===s.id&&!has&&!finishing);
   b.setAttribute('aria-label',`${has?'Change':'Add'} ${SLOT_LABEL[s.id]}${s.req&&!done?' — required':''}`);
  });
 }
 chipEl.innerHTML=`<b>${p.done}</b> / ${p.total}`;chipEl.setAttribute('aria-label',`${p.done} of ${p.total} parts filled in`);
 finBtn.setAttribute('aria-disabled',String(!p.canFinish));finBtn.classList.toggle('is-ready',p.canFinish);
 $('#ob-fin-h',B).textContent=p.canFinish?'':`Still needed: ${p.missing.map(id=>SLOT_LABEL[id]).join(', ')}.`;
 if(changed.ck)for(const b of slotEls[changed.ck]){b.classList.remove('is-ck');void b.offsetWidth;b.classList.add('is-ck');setTimeout(()=>b.classList.remove('is-ck'),620);}
 setTip();
}
let tipTimer=0;
function setTip(text){
 clearTimeout(tipTimer);
 if(text){tipEl.textContent=text;tipTimer=setTimeout(()=>setTip(),3200);return;}
 tipEl.innerHTML='<b>tap the glowing parts</b> to fill in your passport.';
}
function nudge(id){
 if(!id)return;const b=slotEls[id][0];
 const go=()=>{b.classList.remove('is-nudge');void b.offsetWidth;b.classList.add('is-nudge');setTimeout(()=>b.classList.remove('is-nudge'),900);};
 go();
 setTip(`add ${SLOT_LABEL[id]} first.`);
}

/* ================= editors ================= */
const E={};
const PROMPTS=['I go looking for…','My weirdest find was…','Next on my list:'];

E.name={
 title:'your name',
 html(){
  const a=readAccount();
  return `<div class="ob-f"><label for="ob-name">display name</label><input class="ob-in" id="ob-name" name="name" maxlength="50" autocomplete="nickname" placeholder="Your name" value="${esc(a.name)}"><p class="ob-hint" id="ob-name-h" role="status" aria-live="polite"></p></div>
  <div class="ob-f"><label for="ob-user">username</label><div class="ob-at"><span aria-hidden="true">@</span><input class="ob-in" id="ob-user" name="username" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="username" value="${esc(a.username)}" aria-describedby="ob-user-h"></div><p class="ob-hint" id="ob-user-h" role="status" aria-live="polite">3 to 20 letters, numbers, dots or underscores.</p></div>
  <div class="ob-sug"><p class="ob-lab">ideas</p><div class="ob-chips" id="ob-sug"></div></div>`;
 },
 mount(h){
  const f=h.closest('form'),own=readAccount().username,rules={taken,own};
  const sug=()=>{const list=suggestUsernames(f.name.value,{taken}),box=$('#ob-sug',f);box.innerHTML=list.length?list.map(u=>`<button type="button" class="ob-chip" data-u="${esc(u)}">@${esc(u)}</button>`).join(''):'<span class="ob-muted">type your name to get ideas.</span>';};
  const check=()=>{const h2=D.getElementById('ob-user-h');if(!f.username.value.trim()){setHint(f.username,'3 to 20 letters, numbers, dots or underscores.');h2.classList.remove('is-ok');return null;}const r=validateUsername(f.username.value,rules);setHint(f.username,r.ok?`@${r.value} is ${r.reason==='own'?'yours':'free'}.`:r.message,!r.ok);h2.classList.toggle('is-ok',r.ok);return r;};
  const live=debounce(()=>{const r=validateUsername(f.username.value,rules);saveAccount({name:f.name.value,...(r.ok?{username:r.value}:{})});paint();},140);
  f.name.addEventListener('input',()=>{setHint(f.name,'');sug();live();});
  f.username.addEventListener('input',()=>{check();live();});
  $('#ob-sug',f).addEventListener('click',e=>{const b=e.target.closest('[data-u]');if(!b)return;f.username.value=b.dataset.u;check();saveAccount({name:f.name.value,username:b.dataset.u});paint();f.username.focus();});
  sug();if(f.username.value)check();
 },
 done(h){
  const f=h.closest('form'),name=f.name.value.trim(),r=validateUsername(f.username.value,{taken,own:readAccount().username});let bad=null;
  if(!name){setHint(f.name,'enter a name.',true);bad=f.name;}
  if(!r.ok){setHint(f.username,r.message,true);bad??=f.username;}
  if(bad){bad.focus();return false;}
  saveAccount({name,username:r.value});return true;
 },
 close(h){const f=h.closest('form'),r=validateUsername(f.username.value,{taken,own:readAccount().username}),n=f.name.value.trim();if(n||r.ok)saveAccount({...(n?{name:n}:{}),...(r.ok?{username:r.value}:{})});},
 focus:'#ob-name'
};

/* shared sticky tab bar for the long sheets (explorer type, style): tap = scroll to the group, scroll-spy marks the tab, arrow keys move */
function wireTabs(h,secSel,g0){
  const tabs=$$('.ob-tab',h),secs=$$(secSel,h),bar=$('.ob-tabbar',h),nav=$('.ob-tabs',h);
  let lock=0,cur=-1;
  const mark=i=>{if(i===cur)return;cur=i;tabs.forEach((t,n)=>t.setAttribute('aria-current',String(n===i)));const t=tabs[i];if(t){const l=t.offsetLeft-(nav.clientWidth-t.offsetWidth)/2;nav.scrollTo({left:Math.max(0,l),behavior:calm()?'auto':'smooth'});}};
  const secTop=s=>s.getBoundingClientRect().top-h.getBoundingClientRect().top+h.scrollTop-bar.offsetHeight-10;
  /* the last group must be able to reach the top, so its tab can be reached too */
  const pad=()=>{const last=secs[secs.length-1];last.style.minHeight=Math.max(0,h.clientHeight-bar.offsetHeight)+'px';};
  const spy=()=>{
   if(performance.now()<lock)return;
   const y=h.scrollTop+6;let n=0;secs.forEach((s,i)=>{if(secTop(s)<=y)n=i;});
   if(h.scrollTop+h.clientHeight>=h.scrollHeight-2)n=secs.length-1;
   mark(n);
  };
  const go=i=>{mark(i);lock=performance.now()+(calm()?60:700);h.scrollTo({top:secTop(secs[i]),behavior:calm()?'auto':'smooth'});};
  pad();addEventListener('resize',pad);
  h.addEventListener('scroll',spy,{passive:true});
  nav.addEventListener('click',e=>{const t=e.target.closest('.ob-tab');if(t)go(tabs.indexOf(t));});
  nav.addEventListener('keydown',e=>{const i=tabs.indexOf(D.activeElement);if(i<0)return;let n=null;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==null){e.preventDefault();tabs[n].focus();go(n);}});
  cur=-1;mark(g0);
  if(g0>0)requestAnimationFrame(()=>{h.scrollTop=secTop(secs[g0]);spy();});
}

const pickText=id=>{const t=travelerStyles.find(x=>x.id===id);return t?`<b>${esc(t.name)}.</b> ${esc(t.description)}`:'';};
E.arch={
 title:'your explorer type',
 html(){
  const a=readAccount(),sel=prog.data.arch?a.style:'',groups=archGroups(),g0=Math.max(0,groups.indexOf(travelerStyles.find(t=>t.id===sel)?.group));
  return `<p class="ob-hint ob-pick" id="ob-arch-h" role="status" aria-live="polite">${sel?pickText(sel):'pick the one that fits best. your posts refine it later.'}</p>
  <div class="ob-tabbar"><nav class="ob-tabs" aria-label="Archetype groups">${groups.map((g,i)=>`<button type="button" class="ob-tab" id="ob-at-${i}" aria-controls="ob-ag-${i}" aria-current="${i===g0}">${esc(g)}</button>`).join('')}</nav></div>
  <fieldset class="ob-arch"><legend class="sr-only">Traveler archetype</legend>${archCardsHTML(sel)}</fieldset>`;
 },
 mount(h){
  wireTabs(h,'.ob-ag',Math.max(0,$$('.ob-tab',h).findIndex(t=>t.getAttribute('aria-current')==='true')));
  h.addEventListener('change',e=>{if(e.target.name!=='pp-arch')return;saveAccount({style:e.target.value});prog.data.arch=true;saveProg();paint();$('#ob-arch-h',h).innerHTML=pickText(e.target.value);});
 },
 done(){return true;},
 focus:'.ob-tab[aria-current=true]'
};

E.mark={
 title:'your mark',
 html(){const a=readAccount();return `<div class="ob-pad" id="ob-pad-w">${padHTML({localPreview:true,name:a.name||'Your name',signatureArt:a.signatureArt})}</div><div class="ob-padx"><button type="button" class="ob-ghost" data-hand>use my name in handwriting</button><p class="ob-note" id="ob-mark-n" role="status" aria-live="polite"></p></div>`;},
 mount(h){
  const a=readAccount(),root=$('#pp-pad',h);
  initPad(root,{art:a.signatureArt,onSave:()=>{paint({sig:true});}});
  const cv=$('canvas',root);let t;
  cv.addEventListener('pointerup',()=>{clearTimeout(t);t=setTimeout(()=>paint({sigLive:inkURL(cv)}),30);});
  $('[data-hand]',h).addEventListener('click',async()=>{
   const name=readAccount().name||'';if(!name){$('#ob-mark-n',h).textContent='add your name first.';return;}
   try{await D.fonts.load('600 110px Caveat');}catch{}
   const ctx=cv.getContext('2d');ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,cv.width,cv.height);
   let size=104;const fam='Caveat,"Segoe Script","Brush Script MT",cursive';ctx.font=`600 ${size}px ${fam}`;
   const w=ctx.measureText(name).width,max=cv.width-60;if(w>max)size=Math.floor(size*max/w);
   ctx.font=`600 ${size}px ${fam}`;ctx.fillStyle='#111';ctx.textBaseline='middle';ctx.textAlign='center';ctx.save();ctx.translate(cv.width/2,cv.height/2+4);ctx.rotate(-.05);ctx.fillText(name,0,0);ctx.restore();
   prog.data.sign='name';saveProg();paint({sigLive:inkURL(cv)});
   $('[data-tool=save]',root).click();
   $('#ob-mark-n',h).textContent='your name is on the pad. draw over it, or press done.';
  });
  h._save=()=>$('[data-tool=save]',root).click();
 },
 done(h){h._save?.();return true;},
 close(h){h._save?.();}
};

const STYLE_GROUPS=[['bg','backgrounds','The field behind your passport.'],['foil','foils','A finish on the card. Move your mouse over the card to see it shine.']];
E.style={
 title:'your style',
 html(){
  const st=readStyle(true);
  return `<div class="ob-tabbar"><nav class="ob-tabs" aria-label="Style groups">${STYLE_GROUPS.map(([k,l],i)=>`<button type="button" class="ob-tab" id="ob-st-${i}" aria-controls="ob-sg-${i}" aria-current="${i===0}">${l}</button>`).join('')}</nav></div>
  <div class="ob-sgs">${STYLE_GROUPS.map(([k,l,hint],i)=>`<section class="ob-ag ob-sg" id="ob-sg-${i}" aria-labelledby="ob-sgh-${i}"><h3 class="ob-ag-h" id="ob-sgh-${i}">${l}</h3>${styleGroupHTML(st,k,l,hint)}</section>`).join('')}</div>`;
 },
 mount(h){
  wireTabs(h,'.ob-sg',0);
  h.addEventListener('change',e=>{
   if(!/^cz-/.test(e.target.name||''))return;
   writeStyle(pickStyle(h.closest('form'),readStyle(true)));prog.data.style=true;saveProg();paint({foil:e.target.name==='cz-foil'});
  });
 },
 done(){return true;},
 focus:'.ob-tab[aria-current=true]'
};

E.bio={
 title:'your bio',
 html(){
  const a=readAccount();
  return `<div class="ob-f"><label for="ob-bio">about you <i id="ob-bio-n">${a.bio.length}/400</i></label><textarea class="ob-in ob-ta" id="ob-bio" name="bio" maxlength="400" rows="5" placeholder="who you are, where you go, what you look for.">${esc(a.bio)}</textarea></div>
  <div class="ob-sug"><p class="ob-lab">starters</p><div class="ob-chips">${PROMPTS.map(p=>`<button type="button" class="ob-chip" data-p="${esc(p)}">${esc(p)}</button>`).join('')}</div></div>`;
 },
 mount(h){
  const t=h.querySelector('textarea'),n=$('#ob-bio-n',h),save=debounce(()=>{saveAccount({bio:t.value});paint();},150);
  const count=()=>{n.textContent=t.value.length+'/400';};
  t.addEventListener('input',()=>{count();save();});
  $('.ob-chips',h).addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const p=b.dataset.p,cur=t.value;t.value=(cur&&!/\s$/.test(cur)?cur+(/[.!?…:]$/.test(cur)?' ':'\n'):cur)+p+' ';t.value=t.value.slice(0,400);t.focus();t.setSelectionRange(t.value.length,t.value.length);count();saveAccount({bio:t.value});paint();});
  setTimeout(()=>t.setSelectionRange(t.value.length,t.value.length),0);
 },
 done(h){saveAccount({bio:h.querySelector('textarea').value});return true;},
 close(h){saveAccount({bio:h.querySelector('textarea').value});},
 focus:'#ob-bio'
};

/* ================= sheet / popover ================= */
const layer=()=>$('.ob-layer',B),sheetEl=()=>$('.ob-sheet',B),hostEl=()=>$('.ob-sh-b',B);
let openId=null,trigger=null,before='',closing=false,finishing=false,issuing=false;
const relevant=id=>JSON.stringify([snap(),id==='style'?readStyle(true):0,id==='arch'?readAccount().style:0,id==='mark'?readAccount().signatureArt:0,id==='photo'?readAccount().mole?.png:0]);
function setEditing(on,id){
 front.classList.toggle('is-editing',on);
 $$('.ob-dm.is-lit',flip).forEach(e=>e.classList.remove('is-lit'));
 $$('.ob-slot.is-active',flip).forEach(e=>e.classList.remove('is-active'));
 if(on){(lit[id]||[]).forEach(e=>e.classList.add('is-lit'));slotEls[id].forEach(e=>e.classList.add('is-active'));}
}
async function rollMole(trig){
 let res=null;
 try{
  const {openMoleReveal}=await import('./mole/mole-reveal.mjs?v=ld3');
  res=await openMoleReveal({trigger:trig});
 }catch(err){console.error(err);setTip('the mole roll could not load. try again.');return;}
 if(res){const next=saveAccount({avatarMode:'mole',mole:{traits:res.traits,png:res.png,rolledAt:res.rolledAt}});if(!next?.mole)toast('That mole picture was too large to save.');else{paint({mole:true,ck:'photo'});setTimeout(()=>stampIn(lit.photo),0);}}
 trig?.focus?.({preventScroll:true});
}
function openSheet(id,trig){
 if(openId||closing||finishing||issuing)return;
 if(id==='photo'){rollMole(trig);return;}
 const ed=E[id];if(!ed)return;
 openId=id;trigger=trig;before=relevant(id);
 const sh=sheetEl(),host=hostEl(),ly=layer();
 $('#ob-sh-t',B).textContent=ed.title;host.innerHTML=ed.html();sh.dataset.open=id;sh.classList.remove('is-open','is-pop');
 sh.classList.toggle('is-pop',popMode());host.scrollTop=0;
 ly.hidden=false;ly.dataset.mode=popMode()?'pop':'sheet';
 stage.inert=true;$('.ob-bar',B).inert=true;$('.ob-header')?.setAttribute('inert','');
 setEditing(true,id);
 sh.style.maxHeight=maxSheetH()+'px';keyboard();
 ed.mount(host);
 void sh.offsetWidth;sh.classList.add('is-open');
 relift();placePop();
 const sel=typeof ed.focus==='function'?ed.focus():ed.focus;const f=(sel&&$(sel,host))||sh;
 setTimeout(()=>f.focus({preventScroll:true}),calm()?0:60);
}
async function closeSheet(kind='x'){
 if(!openId||closing)return;
 const id=openId,ed=E[id],host=hostEl(),sh=sheetEl();
 if(kind==='done'&&ed.done&&ed.done(host)===false)return;
 if(kind!=='done')ed.close?.(host);
 closing=true;
 const changed=relevant(id)!==before;
 sh.classList.remove('is-open');lift.style.transform='';
 setEditing(false);
 stage.inert=false;$('.ob-bar',B).inert=false;$('.ob-header')?.removeAttribute('inert');
 paint(changed?{ck:id}:{});
 if(changed&&slotProgress(snap()).states[id])setTimeout(()=>stampIn(lit[id]),60);
 await wait(calm()?0:230);
 layer().hidden=true;host.innerHTML='';openId=null;closing=false;
 const t=trigger;trigger=null;(t&&t.isConnected?t:slotEls[id][0])?.focus({preventScroll:true});
}
function onKey(e){
 if(!openId)return;
 if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSheet('x');return;}
 if(e.key!=='Tab')return;
 const sh=sheetEl(),f=$$('button,input,textarea,select,a[href],[tabindex]:not([tabindex="-1"])',sh).filter(x=>!x.disabled&&x.offsetParent!==null&&!x.closest('[hidden]')&&getComputedStyle(x).visibility!=='hidden');
 if(!f.length){e.preventDefault();return;}
 const first=f[0],last=f[f.length-1];
 if(!sh.contains(D.activeElement)){e.preventDefault();first.focus();}
 else if(e.shiftKey&&D.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&D.activeElement===last){e.preventDefault();first.focus();}
}
const vvH=()=>visualViewport?visualViewport.height:innerHeight;
const maxSheetH=()=>Math.round(openId==='arch'?(popMode()?Math.min(innerHeight*.8,760,vvH()-16):Math.min(innerHeight*.92,vvH()-16)):Math.min(innerHeight*(openId==='style'&&!popMode()?(innerHeight>=780?.56:innerHeight>=640?.62:.7):.7),vvH()-16,popMode()?640:9999));
/* the soft keyboard on a phone: keep the sheet above it */
function keyboard(){
 const sh=sheetEl();if(!sh||!openId)return;
 const kb=popMode()?0:Math.max(0,Math.round(innerHeight-(visualViewport?visualViewport.height+visualViewport.offsetTop:innerHeight)));
 sh.style.setProperty('--kb',kb+'px');sh.style.maxHeight=maxSheetH()+'px';
}
/* phone: the card shrinks into the space above the sheet so the live change stays visible */
let liftDX=0;
const popW=()=>openId==='arch'?Math.min(560,innerWidth-32):Math.min(400,innerWidth-32);
function relift(){
 if(openId&&popMode()&&builtB&&openId==='arch'){   /* desktop, big sheet: slide the card left so the sheet fits beside it */
  lift.style.transition='none';lift.style.transform='';const cr=cardw.getBoundingClientRect();void lift.offsetWidth;lift.style.transition='';
  const need=popW()+26+16,room=innerWidth-cr.right;
  liftDX=-Math.min(Math.max(0,need-room),Math.max(0,cr.left-16));
  lift.style.transform=liftDX?`translateX(${liftDX.toFixed(1)}px)`:'';return;
 }
 liftDX=0;
 if(!openId||popMode()||!builtB){lift&&(lift.style.transform='');return;}
 const sh=sheetEl(),kb=parseInt(sh.style.getPropertyValue('--kb'))||0,h=sh.offsetHeight;
 const botY=vvH()-kb*0-h-8;
 lift.style.transition='none';lift.style.transform='';
 const r=cardw.getBoundingClientRect(),topY=topEl.getBoundingClientRect().bottom+4,avail=botY-topY;
 const s=Math.min(1,avail/r.height),ty=topY+(avail-r.height*s)/2-r.top;
 void lift.offsetWidth;lift.style.transition='';
 if(s<(openId==='style'?.26:.42)){lift.style.transform='';return;}   /* too little room: the sheet covers the card */
 lift.style.transform=`translateY(${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
}
/* desktop: popover next to the card, level with the slot */
function placePop(){
 if(!openId||!popMode())return;
 const sh=sheetEl(),slot=trigger&&trigger.isConnected?trigger:slotEls[openId][0],cr0=cardw.getBoundingClientRect(),sr0=slot.getBoundingClientRect();
 const curX=new DOMMatrix(getComputedStyle(lift).transform).m41||0,dx=liftDX-curX;   /* where the card ends up once the slide finishes */
 const cr={left:cr0.left+dx,right:cr0.right+dx,width:cr0.width};const sr={left:sr0.left+dx,top:sr0.top,width:sr0.width,height:sr0.height};
 const H=sh.offsetHeight,gap=26,roomR=innerWidth-cr.right-gap-16,roomL=cr.left-gap-16,WM=popW();
 let W=WM,x,side='left';
 if(roomR>=Math.min(330,WM)){W=Math.min(WM,roomR);x=cr.right+gap;side='left';}
 else if(roomL>=Math.min(330,WM)){W=Math.min(WM,roomL);x=cr.left-gap-W;side='right';}
 else{x=Math.max(16,Math.min(innerWidth-W-16,sr.left+sr.width/2-W/2));side='';}
 const hb=wideMode()?(B.getBoundingClientRect().top+4):(topEl.getBoundingClientRect().bottom||0);
 const y=Math.max(hb+8,Math.min(innerHeight-H-12,sr.top+sr.height/2-H/2));
 sh.style.width=W+'px';sh.style.left=x+'px';sh.style.top=y+'px';sh.dataset.side=side;
 sh.style.setProperty('--ay',Math.max(28,Math.min(H-28,sr.top+sr.height/2-y))+'px');
}
/* swipe down to close (phone) */
function wireDrag(){
 const sh=sheetEl();let d=null;
 const start=e=>{if(popMode()||e.button>0||e.target.closest('.ob-sh-x'))return;d={y:e.clientY,t:performance.now(),dy:0,id:e.pointerId};e.currentTarget.setPointerCapture?.(e.pointerId);sh.style.transition='none';};
 const move=e=>{if(!d||e.pointerId!==d.id)return;d.dy=Math.max(0,e.clientY-d.y);sh.style.transform=`translateY(${d.dy}px)`;};
 const end=e=>{if(!d||e.pointerId!==d.id)return;const v=d.dy/Math.max(1,performance.now()-d.t);sh.style.transition='';sh.style.transform='';const go=d.dy>90||(v>.6&&d.dy>30);d=null;if(go)closeSheet('x');};
 for(const el of [$('.ob-grab',B),$('.ob-sh-h',B)]){el.addEventListener('pointerdown',start);el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);}
}

/* ================= animation helpers ================= */
const live=[],waiters=[];let skipped=false;
function anim(el,frames,opt){
 if(!el)return Promise.resolve();
 const a=el.animate(frames,{fill:'both',...opt});live.push(a);if(skipped)a.finish();
 return a.finished.catch(()=>{});
}
const pause=ms=>skipped?Promise.resolve():new Promise(r=>{const t=setTimeout(r,ms);waiters.push(()=>{clearTimeout(t);r();});});
function skipAll(){skipped=true;live.forEach(a=>{try{a.finish();}catch{}});waiters.splice(0).forEach(f=>f());}
const resetAnim=()=>{live.splice(0).forEach(a=>{try{a.cancel();}catch{}});skipped=false;};
const shake=(amp=4)=>anim(stage,[{translate:'0 0'},{translate:`${-amp}px ${amp*.5}px`,offset:.2},{translate:`${amp}px ${-amp*.4}px`,offset:.45},{translate:`${-amp*.6}px 0`,offset:.7},{translate:'0 0'}],{duration:260,easing:'ease-out'});

/* ================= issue animation (after the account screen) ================= */
async function issue(){
 if(issuing)return;issuing=true;
 prog.step=1;saveProg();buildB();paint();
 const onTap=()=>skipAll();
 if(calm()){
  A.hidden=true;B.hidden=false;fit();B.animate([{opacity:0},{opacity:1}],{duration:200});issuing=false;
  const f=slotEls.photo[0];f.focus({preventScroll:true});return;
 }
 resetAnim();
 B.classList.add('is-issuing');
 D.addEventListener('pointerdown',onTap,true);
 await anim(A,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-30px) scale(.98)'}],{duration:240,easing:'ease-in'});
 A.hidden=true;B.hidden=false;fit();
 /* the card starts under the slot and prints up out of it */
 const zr=zone.getBoundingClientRect(),cr=cardw.getBoundingClientRect(),D0=zr.bottom-cr.top+16;
 zone.classList.add('is-print');
 anim(slotline,[{opacity:0,transform:'scaleX(.4)'},{opacity:1,transform:'scaleX(1)'}],{duration:220,easing:'ease-out'});
 await anim(rise,[{transform:`translateY(${D0}px)`},{transform:'translateY(-14px)',offset:.74},{transform:'translateY(0)'}],{duration:820,easing:'cubic-bezier(.22,.8,.32,1)',delay:120});
 /* small red stamp */
 const reg=$('.ob-reg',B);$('i',reg).textContent=dayLabel();
 const base='translate(-50%,-50%) rotate(-9deg)';
 anim(reg,[{opacity:0,transform:`${base} scale(2.4)`},{opacity:1,transform:`${base} scale(.94)`,offset:.62},{opacity:1,transform:`${base} scale(1)`}],{duration:280,easing:'cubic-bezier(.2,.8,.3,1)'});
 await pause(150);shake(3);
 await pause(520);
 /* the stamp shrinks into the number box */
 const nb=$('.pp-id9-no',front).getBoundingClientRect(),rr=reg.getBoundingClientRect();
 const dx=(nb.left+nb.width/2)-(rr.left+rr.width/2),dy=(nb.top+nb.height/2)-(rr.top+rr.height/2),k=(cardw.getBoundingClientRect().width/440)||1;
 await anim(reg,[{opacity:1,transform:`${base} scale(1)`},{opacity:0,transform:`translate(calc(-50% + ${dx/k}px),calc(-50% + ${dy/k}px)) rotate(-9deg) scale(.2)`}],{duration:320,easing:'ease-in'});
 D.removeEventListener('pointerdown',onTap,true);
 zone.classList.remove('is-print');B.classList.remove('is-issuing');
 live.splice(0).forEach(a=>{try{a.cancel();}catch{}});skipped=false;
 issuing=false;paint();
 slotEls.photo[0].focus({preventScroll:true});
}

/* ================= finish: the ISSUED stamp ================= */
async function finish(){
 if(finishing||issuing||openId)return;
 const p=slotProgress(snap());
 if(!p.canFinish){nudge(p.next);return;}
 finishing=true;markOnboarded();
 B.classList.add('is-finishing');
 paint();
 $('.ob-issued b',B).textContent=dayLabel();
 const go=()=>{const u=new URL('/profile/?user=preview&welcome=1',location.origin);u.searchParams.set('theme',theme());if(fromPath)u.searchParams.set('from',fromPath);location.assign(u.pathname+u.search);};
 if(calm()){stage.classList.add('is-final');await wait(900);go();return;}
 resetAnim();
 let canSkip=false;D.addEventListener('pointerdown',()=>{if(canSkip)go();},true);
 anim(pobj,[{transform:'perspective(1600px) rotateY(0) scale(1)'},{transform:'perspective(1600px) rotateY(-14deg) scale(1.03)',offset:.4},{transform:'perspective(1600px) rotateY(7deg) scale(1.02)',offset:.75},{transform:'perspective(1600px) rotateY(0) scale(1)'}],{duration:780,easing:'cubic-bezier(.3,.8,.3,1)'});
 await pause(430);
 stage.classList.add('is-final');
 await pause(250);shake(5);canSkip=true;
 await pause(1250);go();
}

/* ================= go ================= */
function showStart(){
 if(prog.step===0){buildA();A.hidden=false;B.hidden=true;$('#ob-h')?.focus({preventScroll:true});}
 else{buildB();A.hidden=true;B.hidden=false;fit();paint();setTip();}
}
showStart();
addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
