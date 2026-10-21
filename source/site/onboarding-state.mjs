// New-user onboarding: pure helpers (no DOM). Prototype only: everything stays in localStorage, nothing is sent.
import {TAG_TYPE} from '../profile/passport-rules.mjs?v=pv2';
import {accountKey,travelerStyles} from './account-state.mjs?v=pad1';
import {validEmail} from './gate-state.mjs?v=gate1';
export {validEmail};

export const ONBOARDED_KEY='deepspot-onboarded-v1';
export const PROGRESS_KEY='deepspot-onboarding-v1';
// Keys the onboarding writes through the existing passport (kept as strings so this file stays DOM free).
export const PASSPORT_KEYS=[accountKey,'deepspot-passport-style-v1','deepspot-bio-look-v1','deepspot-want-to-go-v1'];

export const STEPS=[
 {id:'account',name:'account',skip:false},
 {id:'name',name:'name',skip:false},
 {id:'mole',name:'mole',skip:true},
 {id:'archetype',name:'archetype',skip:true},
 {id:'bio',name:'bio',skip:true},
 {id:'mark',name:'mark',skip:true},
 {id:'style',name:'style',skip:true},
 {id:'places',name:'places',skip:true}
];
export const FINISH=STEPS.length;   // step index of the finish screen

/* ---------- progress ---------- */
export function normalizeProgress(raw){
 const v=raw&&typeof raw==='object'?raw:{};
 const n=Number(v.step);
 const step=Number.isInteger(n)?Math.min(FINISH,Math.max(0,n)):0;
 const ids=new Set(STEPS.map(s=>s.id));
 const list=a=>Array.isArray(a)?[...new Set(a.filter(x=>typeof x==='string'&&ids.has(x)))]:[];
 const d=v.data&&typeof v.data==='object'?v.data:{};
 return {step,done:list(v.done),skipped:list(v.skipped),data:{terms:d.terms===true,arch:d.arch===true,sign:d.sign==='name'?'name':'pad'}};
}
const store=s=>s||(typeof localStorage!=='undefined'?localStorage:null);
export function readProgress(storage){try{return normalizeProgress(JSON.parse(store(storage).getItem(PROGRESS_KEY)));}catch{return normalizeProgress(null);}}
export function writeProgress(p,storage){const v=normalizeProgress(p);try{store(storage).setItem(PROGRESS_KEY,JSON.stringify(v));return v;}catch{return null;}}
export function isOnboarded(storage){try{return !!store(storage).getItem(ONBOARDED_KEY);}catch{return false;}}
export function markOnboarded(storage,now=Date.now()){try{store(storage).setItem(ONBOARDED_KEY,String(now));return true;}catch{return false;}}
export function resetOnboarding(storage){const s=store(storage);for(const k of [PROGRESS_KEY,ONBOARDED_KEY,...PASSPORT_KEYS])try{s.removeItem(k);}catch{}}
/* move forward / back; `skip` records the step as skipped instead of done */
export function advance(p,{skip=false}={}){
 const id=STEPS[p.step]?.id,next=normalizeProgress({...p,step:p.step+1,done:id&&!skip?[...p.done,id]:p.done,skipped:id&&skip?[...p.skipped,id]:p.skipped});
 if(id&&!skip)next.skipped=next.skipped.filter(x=>x!==id);
 return next;
}
export const goBack=p=>normalizeProgress({...p,step:Math.max(0,p.step-1)});
/* "/welcome/?from=<safe path>" (safe = already checked by safeReturn) */
export function welcomeURL(safePath){const u=new URLSearchParams();if(safePath&&safePath!=='/')u.set('from',safePath);const q=u.toString();return '/welcome/'+(q?'?'+q:'');}

/* ---------- password (never stored or sent: only the strength is worked out) ---------- */
export function passwordStrength(pw){
 const p=typeof pw==='string'?pw:'';
 const kinds=[/[a-z]/,/[A-Z]/,/\d/,/[^A-Za-z0-9]/].filter(r=>r.test(p)).length;
 if(!p)return {score:0,ok:false,label:'',kinds:0};
 const longEnough=p.length>=10,mixed=kinds>=2;
 let score=1;
 if(p.length>=8&&mixed)score=2;
 if(longEnough&&mixed)score=3;
 if(longEnough&&kinds>=3&&p.length>=12)score=4;
 return {score,ok:longEnough&&mixed,label:['','weak','fair','good','strong'][score],kinds};
}

/* ---------- username ---------- */
export const RESERVED=['admin','administrator','deepspot','deep','support','help','mod','moderator','staff','team','root','system','official','null','undefined','api','www','mail','about','contact','settings','profile','welcome','preview','account','login','logout','signup','membership','community','browse','map','tours','guides','stories','terms','privacy','everyone','explorer','anonymous','you','me'];
export const USERNAME_MIN=3,USERNAME_MAX=20;
const clean=v=>String(v??'').trim().replace(/^@+/,'').toLowerCase();
/* taken: Set of lower-case handles that exist; own: the viewer's current handle (always allowed) */
export function validateUsername(raw,{taken=new Set(),reserved=RESERVED,own=''}={}){
 const v=clean(raw);
 if(!v)return {ok:false,reason:'empty',value:v,message:'pick a username.'};
 if(v.length<USERNAME_MIN)return {ok:false,reason:'short',value:v,message:`at least ${USERNAME_MIN} characters.`};
 if(v.length>USERNAME_MAX)return {ok:false,reason:'long',value:v,message:`${USERNAME_MAX} characters at most.`};
 if(!/^[a-z0-9._]+$/.test(v))return {ok:false,reason:'chars',value:v,message:'letters, numbers, dots and underscores only.'};
 if(/^[._]|[._]$/.test(v))return {ok:false,reason:'edge',value:v,message:'start and end with a letter or number.'};
 if(/[._]{2}/.test(v))return {ok:false,reason:'repeat',value:v,message:'no two dots or underscores in a row.'};
 if(own&&v===clean(own))return {ok:true,reason:'own',value:v,message:'this is your username.'};
 if(reserved.includes(v))return {ok:false,reason:'reserved',value:v,message:'that one is reserved.'};
 if(taken.has(v))return {ok:false,reason:'taken',value:v,message:'already taken.'};
 return {ok:true,reason:'free',value:v,message:'free.'};
}
const slug=s=>String(s||'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').trim().split(/\s+/).filter(Boolean);
/* deterministic suggestions from a display name */
export function suggestUsernames(name,{taken=new Set(),reserved=RESERVED,n=4}={}){
 const w=slug(name);if(!w.length)return [];
 const first=w[0],last=w.length>1?w[w.length-1]:'',all=w.join('');
 const raw=[all,last?first+'.'+last:'',last?first+'_'+last:'',last?first[0]+last:'',first+'.explorer',first+'.deep',first+'_spot',all+'_dsp',first+'.finds',first+'2026',first+'.wanders'];
 const out=[];
 for(const c of raw){const r=validateUsername(c,{taken,reserved});if(r.ok&&!out.includes(r.value))out.push(r.value);if(out.length>=n)break;}
 let i=2;while(out.length<Math.min(n,3)&&i<40){const r=validateUsername(all+i,{taken,reserved});if(r.ok&&!out.includes(r.value))out.push(r.value);i++;}
 return out;
}
/* every handle and id that exists on the saved profile list (lower-case) */
export function takenHandles(profiles){
 const set=new Set();
 for(const p of Array.isArray(profiles)?profiles:[])for(const x of [p?.handle,p?.id,...(Array.isArray(p?.aliases)?p.aliases:[])]){const v=clean(x).replace(/[^a-z0-9._]/g,'');if(v)set.add(v);}
 return set;
}

/* ---------- archetype -> catalog tags (TAG_TYPE reversed) ---------- */
export function tagsForArchetype(id){return Object.entries(TAG_TYPE).filter(([,t])=>t===id).map(([tag])=>tag);}
const low=a=>(Array.isArray(a)?a:String(a||'').split('·')).map(t=>String(t).trim().toLowerCase()).filter(Boolean);
export const hasPhoto=s=>typeof s?.image==='string'&&s.image.startsWith('/');
/* catalog: prepared spots (best first). Returns {spots, matched} where matched = how many came from the archetype's tags. */
export function suggestSpots(catalog,archId,{n=6,have=[]}={}){
 const skip=new Set(have),tags=new Set(tagsForArchetype(archId));
 const pool=(Array.isArray(catalog)?catalog:[]).filter(s=>s&&s.id&&hasPhoto(s)&&!skip.has(s.id));
 const hit=tags.size?pool.filter(s=>low(s.tags).some(t=>tags.has(t))):[];
 const out=hit.slice(0,n),matched=out.length;
 for(const s of pool){if(out.length>=n)break;if(!out.includes(s))out.push(s);}
 return {spots:out,matched,tags:[...tags]};
}
export const archetypeName=id=>travelerStyles.find(t=>t.id===id)?.name||'';
