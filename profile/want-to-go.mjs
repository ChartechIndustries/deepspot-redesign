/* "Want to go" list for the own passport. Items: {type:'spot',id} or {type:'place',name}. Stored on this browser only. */
export const WTG_KEY='deepspot-want-to-go-v1';
export const WTG_MAX=30;
export const WTG_NAME_MAX=60;
const clean=v=>typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,WTG_NAME_MAX).trim():'';
const keyOf=i=>i.type==='spot'?'s:'+i.id:'p:'+i.name.toLowerCase();
export function normalizeItem(raw){
 if(!raw||typeof raw!=='object')return null;
 if(raw.type==='spot'){const id=typeof raw.id==='string'?raw.id.trim():'';return id&&id.length<=120&&!/\s/.test(id)?{type:'spot',id}:null;}
 if(raw.type==='place'){const name=clean(raw.name);return name?{type:'place',name}:null;}
 return null;
}
export function normalizeList(raw,max=WTG_MAX){
 if(!Array.isArray(raw))return [];
 const seen=new Set(),out=[];
 for(const r of raw){const item=normalizeItem(r);if(!item)continue;const k=keyOf(item);if(seen.has(k))continue;seen.add(k);out.push(item);if(out.length>=max)break;}
 return out;
}
export function readWantToGo(){try{return normalizeList(JSON.parse(localStorage.getItem(WTG_KEY)||'[]'));}catch{return [];}}
export function writeWantToGo(list){try{localStorage.setItem(WTG_KEY,JSON.stringify(normalizeList(list)));return true;}catch{return false;}}
/* pure helpers: each returns {list,ok,reason} */
export function addItem(list,raw){
 const item=normalizeItem(raw);if(!item)return {list,ok:false,reason:'empty'};
 if(list.some(i=>keyOf(i)===keyOf(item)))return {list,ok:false,reason:'duplicate'};
 if(list.length>=WTG_MAX)return {list,ok:false,reason:'full'};
 return {list:[...list,item],ok:true,item};
}
export const removeAt=(list,i)=>i>=0&&i<list.length?list.filter((_,n)=>n!==i):list;
export function moveItem(list,i,dir){const j=i+dir;if(i<0||i>=list.length||j<0||j>=list.length)return list;const next=[...list];[next[i],next[j]]=[next[j],next[i]];return next;}
