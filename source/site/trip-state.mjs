export const MAX_TRIP_STOPS=50;
export function normalizeTrip(value, knownIDs) {
 const source=value&&typeof value==='object'?value:{};
 const dayCount=Math.min(14,Math.max(1,Math.floor(Number(source.dayCount)||1)));
 const spots=[...new Set(Array.isArray(source.spots)?source.spots:[])].filter(id=>typeof id==='string'&&id&&(!knownIDs||knownIDs.has(id))).slice(0,MAX_TRIP_STOPS);
 const days=Object.fromEntries(spots.map(id=>[id,Math.min(dayCount,Math.max(1,Math.floor(Number(source.days?.[id])||1)))]));
 const dayNotes=Object.fromEntries(Array.from({length:dayCount},(_,i)=>[i+1,String(source.dayNotes?.[i+1]||'').slice(0,2000)]));
 return {name:String(source.name||'my next detour').slice(0,100),spots,days,notes:String(source.notes||'').slice(0,4000),dayNotes,dayCount};
}
