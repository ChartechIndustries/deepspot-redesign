import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeIDs,readIDs,writeValue,subscribeStore} from '../source/site/storage.mjs';
import {normalizeTrip,MAX_TRIP_STOPS} from '../source/site/trip-state.mjs';
import {loadProfile} from '../source/profile/data.mjs';

test('bookmarks recover from malformed storage without treating objects as a collection',()=>{
 for(const value of [null,{},42,'not-an-array'])assert.deepEqual(normalizeIDs(value),[]);
 assert.deepEqual(normalizeIDs(['a',null,'a',3,'','b']),['a','b']);
 globalThis.localStorage={getItem:()=>'{broken'};
 assert.deepEqual(readIDs('saved'),[]);
});
test('failed writes never report a successful save or broadcast new state',()=>{
 globalThis.window=new EventTarget();let changes=0;
 const cleanup=subscribeStore(['saved'],()=>changes++);
 globalThis.localStorage={setItem:()=>{throw Error('quota');}};
 assert.equal(writeValue('saved',['a']),false);assert.equal(changes,0);
 globalThis.localStorage={setItem:()=>{}};
 assert.equal(writeValue('saved',['a']),true);assert.equal(changes,1);
 cleanup();writeValue('saved',['b']);assert.equal(changes,1);
});
test('same-page, cross-tab, and back-navigation changes reach subscribed collections',()=>{
 globalThis.window=new EventTarget();let changes=0;
 const cleanup=subscribeStore(['saved'],()=>changes++);
 window.dispatchEvent(new CustomEvent('ds:storage',{detail:{key:'saved'}}));
 const event=new Event('storage');Object.defineProperty(event,'key',{value:'saved'});window.dispatchEvent(event);
 window.dispatchEvent(new Event('pageshow'));
 assert.equal(changes,3);cleanup();
});
test('trip normalization is stable between edits and reload and enforces the same limit',()=>{
 const ids=Array.from({length:MAX_TRIP_STOPS+1},(_,i)=>'/blog/'+i);
 const input={name:'',dayCount:3,spots:ids,days:{[ids[0]]:3},dayNotes:{3:'Allow a detour'}};
 const t=normalizeTrip(input,new Set(ids));assert.equal(t.spots.length,50);
 assert.deepEqual(normalizeTrip(t,new Set(ids)),t);
 assert.equal(t.days[ids[0]],3);assert.equal(t.dayNotes[3],'Allow a detour');
 assert.deepEqual(normalizeTrip(t),t);
});
test('verified public names resolve to one passport with the correct credited work',async()=>{
 globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(await readFile(new URL('../source'+path,import.meta.url),'utf8'))});
 for(const [alias,id,name] of [['kris','lampbane','Kris'],['lana-velkov','lanavelkov','Lana Velkov'],['lydia','korrgan','Lydia'],['six','sixbacteria','Six'],['saz','s4zr4ty','SAZ']]){
  const profile=await loadProfile(alias);assert.equal(profile.id,id);assert.equal(profile.name,name);
  assert.ok(profile.image);assert.ok(profile.records.length>0,alias+' must have credited work');
  assert.deepEqual((await loadProfile(id)).records,profile.records);
 }
});
