// Preview sign-in state for the gate. No backend: kept in localStorage, never sent anywhere.
export const SESSION_KEY='deepspot-session-preview';
export const OFF_KEY='deepspot-gate-off';
export const STATES=['out','free','member'];
export const validEmail=v=>typeof v==='string'&&v.trim().length<=254&&/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(v.trim());
export function normalizeSession(raw){
 const state=STATES.includes(raw?.state)?raw.state:'out';
 const email=state!=='out'&&typeof raw?.email==='string'&&validEmail(raw.email)?raw.email.trim():'';
 return {state,email};
}
const store=s=>s||(typeof localStorage!=='undefined'?localStorage:null);
export function readSession(storage){
 try{return normalizeSession(JSON.parse(store(storage).getItem(SESSION_KEY)));}catch{return {state:'out',email:''};}
}
export function writeSession(next,storage){
 const s=normalizeSession(next);
 try{store(storage).setItem(SESSION_KEY,JSON.stringify(s));return s;}catch{return null;}
}
// ?gate=out|free|member|off review switch. Returns the value or null.
export function parseGateParam(search){
 const v=new URLSearchParams(search).get('gate');
 return v==='off'||STATES.includes(v)?v:null;
}
// Does a session state meet a requirement? need: 'free' | 'member'
export const allows=(state,need)=>need==='member'?state==='member':state!=='out';
