export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function profileId(name){return String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
export function safeReturn(value){
 try{const url=new URL(value,'https://preview.invalid');return url.origin==='https://preview.invalid'&&['/','/browse/','/spot/','/story/','/stories/','/guides/','/guide/','/community/','/leaderboard/','/saved/','/adventures/','/tours/','/plan-trip/','/map/','/account/','/inbox/','/invites/'].includes(url.pathname)?url.pathname+url.search+url.hash:null;}catch{return null;}
}
export function profileHref(id,{from,theme}={}){
 const current=typeof location==='undefined'?null:location;
 theme??=typeof document==='undefined'?'dark':document.documentElement.dataset.theme;
 from??=current?current.pathname+current.search+current.hash:null;
 const params=new URLSearchParams({user:id,theme:theme==='light'?'light':'dark'});
 const back=safeReturn(from);if(back)params.set('from',back);
 return '/profile/?'+params;
}
export function authorLink(name,{className='',avatar=false,from}={}){
 const initials=String(name).split(/\s+/).slice(0,2).map(word=>word[0]).join('');
 return `<a class="ds-author ${escapeHTML(className)}" href="${escapeHTML(profileHref(profileId(name),{from}))}" aria-label="View ${escapeHTML(name)}’s profile">${avatar?`<span class="br-avatar" aria-hidden="true">${escapeHTML(initials)}</span>`:''}<span>by <strong>${escapeHTML(name)}</strong></span></a>`;
}
