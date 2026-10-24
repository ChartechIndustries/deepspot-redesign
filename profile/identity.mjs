export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function profileId(name){return String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
export function safeReturn(value){
 try{const url=new URL(value,'https://preview.invalid');return url.origin==='https://preview.invalid'&&['/deepspot-redesign/','/deepspot-redesign/browse/','/deepspot-redesign/spot/','/deepspot-redesign/guides/','/deepspot-redesign/guide/','/deepspot-redesign/community/','/deepspot-redesign/leaderboard/','/deepspot-redesign/saved/','/deepspot-redesign/adventures/','/deepspot-redesign/tours/','/deepspot-redesign/plan-trip/','/deepspot-redesign/map/','/deepspot-redesign/account/','/deepspot-redesign/inbox/','/deepspot-redesign/invites/'].includes(url.pathname)?url.pathname+url.search+url.hash:null;}catch{return null;}
}
export function profileHref(id,{from,theme}={}){
 const current=typeof location==='undefined'?null:location;
 theme??=typeof document==='undefined'?'dark':document.documentElement.dataset.theme;
 from??=current?current.pathname+current.search+current.hash:null;
 const params=new URLSearchParams({user:id,theme:theme==='light'?'light':'dark'});
 const back=safeReturn(from);if(back)params.set('from',back);
 return '/deepspot-redesign/profile/?'+params;
}
// Profile pictures (mole renders) by profile id or display-name id. Names without one get initials.
const PICS={lampbane:'lampbane',kris:'lampbane',wayfarer:'wayfarer',kisekikana:'kisekikana',numberone:'numberone',joelle:'joelle',annebelle:'annebelle',lanavelkov:'lanavelkov','lana-velkov':'lanavelkov',s4zr4ty:'s4zr4ty',saz:'s4zr4ty',korrgan:'korrgan',lydia:'korrgan',sixbacteria:'sixbacteria',six:'sixbacteria'};
const RINGS=['#07d653','#3c60ff','#83cdce','#f2c94c','#e86a8f','#b59cf0'];
export function avatarHTML(name,{className=''}={}){
 const id=profileId(name),pic=PICS[id],ring=RINGS[[...id].reduce((a,c)=>a+c.charCodeAt(0),0)%RINGS.length];
 const initials=String(name).split(/\s+/).slice(0,2).map(word=>word[0]||'').join('').toUpperCase();
 return pic?`<span class="ds-av ${escapeHTML(className)}" style="--av:${ring}" aria-hidden="true"><img src="/deepspot-redesign/community-assets/moles/${pic}.webp" alt="" loading="lazy" decoding="async"></span>`:`<span class="ds-av ds-av-text ${escapeHTML(className)}" style="--av:${ring}" aria-hidden="true">${escapeHTML(initials)}</span>`;
}
export function authorLink(name,{className='',avatar=true,from}={}){
 return `<a class="ds-author ${escapeHTML(className)}" href="${escapeHTML(profileHref(profileId(name),{from}))}" aria-label="View ${escapeHTML(name)}’s profile">${avatar?avatarHTML(name):''}<span>by <strong>${escapeHTML(name)}</strong></span></a>`;
}
