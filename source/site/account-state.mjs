export const accountKey='deepspot-profile-draft-v1';
export const travelerStyles=[
 {id:'explorer',name:'the explorer',description:'No path is too obscure. You love getting lost.',path:'<path d="M12 2v20M2 12h20M5 5l14 14M5 19 14 5"/>'},
 {id:'foodie',name:'the foodie',description:'You travel on your stomach. Ramen is life.',path:'<path d="M3 11h18a9 9 0 0 1-18 0ZM7 20h10M7 3v4m5-5v5m5-4v4"/>'},
 {id:'shutterbug',name:'the shutterbug',description:'Always chasing the perfect golden hour shot.',path:'<path d="M3 6h5l2-3h4l2 3h5v15H3Z"/><circle cx="12" cy="13" r="4"/>'},
 {id:'poet',name:'the poet',description:'Observing details and documenting every feeling.',path:'<path d="m4 17 12-12 4 4L8 21H4v-4ZM14 7l4 4M3 3h9M3 7h5"/>'},
 {id:'nomad',name:'the nomad',description:'Light packer, heavy experiences. Always on the move.',path:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="M8 5h8a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h8"/>'}
];
export function travelerMark(id){return `<svg viewBox="0 0 24 24" aria-hidden="true">${(travelerStyles.find(s=>s.id===id)||travelerStyles[0]).path}</svg>`;}
export function travelerImage(id){const mark=travelerMark(id).replace('aria-hidden="true"','xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none" stroke="#0b1b27" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"').replace('viewBox="0 0 24 24"','viewBox="-5 -5 34 34"').replace('>','><rect x="-5" y="-5" width="34" height="34" fill="#83cdce" stroke="none"/>');return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(mark);}
export const moleSlots=['Body/Shirt','Jackets','Mouth Area','Face','Eyes','Head/Hat'];
export const moleMaxPng=700000;
export function normalizeMole(value){
 const v=value&&typeof value==='object'?value:null;if(!v)return null;
 const png=typeof v.png==='string'&&v.png.length<moleMaxPng&&/^data:image\/(png|webp);base64,[a-z0-9+/=]+$/i.test(v.png)?v.png:'';
 if(!png)return null;
 const traits={};const src=v.traits&&typeof v.traits==='object'?v.traits:{};
 for(const slot of moleSlots){const id=src[slot];if(typeof id==='string'&&id.length<60&&/^[A-Za-z0-9_ .-]+\/[A-Za-z0-9_ .'-]+$/.test(id))traits[slot]=id;}
 const at=Number(v.rolledAt);
 return {traits,png,rolledAt:Number.isFinite(at)&&at>0?Math.floor(at):0};
}
export const artMaxPng=200000;
export const normalizeArt=v=>typeof v==='string'&&v.length<artMaxPng&&/^data:image\/png;base64,[a-z0-9+/=]+$/i.test(v)?v:'';
export function normalizeAccount(value){
 const v=value&&typeof value==='object'?value:{};
 const mole=normalizeMole(v.mole);
 const photo=typeof v.photo==='string'&&v.photo.length<1700000&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(v.photo)?v.photo:'';
 const clean=(key,max)=>String(v[key]||'').trim().slice(0,max);
 return {name:clean('name',50),username:clean('username',20).toLowerCase(),bio:clean('bio',400),signature:clean('signature',40),instagram:clean('instagram',60),twitter:clean('twitter',60),website:/^https?:\/\//i.test(clean('website',300))?clean('website',300):'',signatureArt:normalizeArt(v.signatureArt),avatarMode:v.avatarMode==='photo'?'photo':v.avatarMode==='mole'&&mole?'mole':'style',style:travelerStyles.some(s=>s.id===v.style)?v.style:'explorer',photo,mole};
}
export function readAccount(){try{return normalizeAccount(JSON.parse(localStorage.getItem(accountKey)));}catch{return normalizeAccount({});}}

export function avatarImage(d){return d.avatarMode==='photo'&&d.photo?d.photo:d.avatarMode==='mole'&&d.mole?d.mole.png:'';}
