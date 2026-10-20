// One persistence boundary for bookmarks across the homepage, Browse and readers.
export const savedSpotKey='deepspot-saved-spots';
export const savedStoryKey='deepspot-saved-stories';
export function normalizeIDs(value){return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&id.length>0))]:[];}
export function readValue(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export function readIDs(key){return normalizeIDs(readValue(key,[]));}
export function writeValue(key,value){
 try{localStorage.setItem(key,JSON.stringify(value));}
 catch{return false;}
 window.dispatchEvent(new CustomEvent('ds:storage',{detail:{key,value}}));return true;
}
export function toggleID(key,id){const ids=new Set(readIDs(key));ids.has(id)?ids.delete(id):ids.add(id);return writeValue(key,[...ids]);}
export function subscribeStore(keys,callback){
 const change=event=>{const key=event.type==='ds:storage'?event.detail.key:event.key;if(key===null||keys.includes(key))callback(key);};
 const restore=()=>callback(null);
 window.addEventListener('ds:storage',change);window.addEventListener('storage',change);window.addEventListener('pageshow',restore);
 return ()=>{window.removeEventListener('ds:storage',change);window.removeEventListener('storage',change);window.removeEventListener('pageshow',restore);};
}
