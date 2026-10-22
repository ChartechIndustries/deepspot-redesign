import test from 'node:test';
import assert from 'node:assert/strict';
import {STEPS,FINISH,SLOTS,slotProgress,PROGRESS_KEY,ONBOARDED_KEY,normalizeProgress,readProgress,writeProgress,isOnboarded,markOnboarded,resetOnboarding,advance,goBack,welcomeURL,passwordStrength,validateUsername,suggestUsernames,takenHandles,tagsForArchetype,suggestSpots,RESERVED} from '../source/site/onboarding-state.mjs';
import {travelerStyles} from '../source/site/account-state.mjs';
const fake=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),m};};

test('v2: two screens (account, passport), finish after them',()=>{
 assert.deepEqual(STEPS.map(s=>s.id),['account','passport']);
 assert.equal(FINISH,2);
});

test('v2.1: six slots, three required, all on the front',()=>{
 assert.deepEqual(SLOTS.map(s=>s.id),['photo','name','arch','bio','mark','style']);
 assert.deepEqual(SLOTS.filter(s=>s.req).map(s=>s.id),['photo','name','arch']);
 assert.ok(SLOTS.every(s=>!('face' in s)));
});

test('slot states and progress chip',()=>{
 const empty=slotProgress({});
 assert.deepEqual([empty.done,empty.total,empty.canFinish,empty.next],[0,6,false,'photo']);
 assert.deepEqual(empty.missing,['photo','name','arch']);
 const half=slotProgress({mole:true,name:'Ann',username:''});   // name needs a username too
 assert.equal(half.states.name,false);assert.equal(half.done,1);assert.equal(half.next,'name');
 const req=slotProgress({mole:true,name:'Ann',username:'ann',arch:true});
 assert.deepEqual([req.done,req.canFinish,req.missing,req.next],[3,true,[],'bio']);
 const all=slotProgress({mole:true,name:'Ann',username:'ann',arch:true,bio:' hi ',sig:true,style:true});
 assert.deepEqual([all.done,all.canFinish,all.next],[6,true,'']);
 assert.equal(slotProgress({bio:'   '}).states.bio,false);
 assert.equal(slotProgress({places:3}).done,0);   // places left onboarding
 assert.equal(slotProgress(null).done,0);
});

test('progress normalizes junk to step 0',()=>{
 for(const raw of [null,undefined,'x',[],{step:'a'},{step:-4},{step:1.5},{}]){const p=normalizeProgress(raw);assert.equal(p.step,0);assert.deepEqual(p.done,[]);}
 assert.equal(normalizeProgress({step:99}).step,FINISH);
 assert.equal(normalizeProgress({step:1}).step,1);
 assert.deepEqual(normalizeProgress({done:['account','nope','account',4]}).done,['account']);
 assert.equal(normalizeProgress({data:{terms:'yes'}}).data.terms,false);
 assert.equal(normalizeProgress({data:{terms:true,sign:'name',style:true}}).data.style,true);
 assert.equal(normalizeProgress({data:{style:'x'}}).data.style,false);
 assert.equal(normalizeProgress({data:{sign:'x'}}).data.sign,'pad');
});

test('progress reads, writes and resumes from storage',()=>{
 const s=fake();
 assert.equal(readProgress(s).step,0);
 writeProgress({step:1,done:['account'],data:{arch:true}},s);
 const r=readProgress(s);assert.equal(r.step,1);assert.deepEqual(r.done,['account']);assert.equal(r.data.arch,true);
 s.setItem(PROGRESS_KEY,'{bad');assert.equal(readProgress(s).step,0);
});

test('advance and back stay inside the two screens',()=>{
 let p=normalizeProgress(null);
 p=advance(p);assert.equal(p.step,1);assert.deepEqual(p.done,['account']);
 p=goBack(p);assert.equal(p.step,0);
 assert.equal(goBack(normalizeProgress(null)).step,0);
 let q=normalizeProgress({step:1});q=advance(q);assert.equal(q.step,FINISH);q=advance(q);assert.equal(q.step,FINISH);
});

test('onboarded flag and reset',()=>{
 const s=fake();
 assert.equal(isOnboarded(s),false);
 markOnboarded(s,1234);assert.equal(isOnboarded(s),true);assert.equal(s.getItem(ONBOARDED_KEY),'1234');
 writeProgress({step:5},s);s.setItem('deepspot-profile-draft-v1','{}');s.setItem('deepspot-want-to-go-v1','[]');s.setItem('keep-me','1');
 resetOnboarding(s);
 assert.equal(isOnboarded(s),false);assert.equal(s.getItem(PROGRESS_KEY),null);assert.equal(s.getItem('deepspot-profile-draft-v1'),null);assert.equal(s.getItem('keep-me'),'1');
});

test('welcome URL only carries a real return path',()=>{
 assert.equal(welcomeURL('/spot/?id=x'),'/welcome/?from=%2Fspot%2F%3Fid%3Dx');
 assert.equal(welcomeURL(''),'/welcome/');
 assert.equal(welcomeURL('/'),'/welcome/');
 assert.equal(welcomeURL(null),'/welcome/');
});

test('password strength: length >= 10 and mixed',()=>{
 assert.deepEqual([passwordStrength('').score,passwordStrength('').ok],[0,false]);
 assert.equal(passwordStrength('abc').ok,false);
 assert.equal(passwordStrength('abcdefghijkl').ok,false);       // long but one kind
 assert.equal(passwordStrength('Abcdef1').ok,false);            // mixed but short
 assert.equal(passwordStrength('Abcdefg123').ok,true);          // 10, mixed
 assert.equal(passwordStrength('correct Horse 9 staple!').score,4);
 assert.equal(passwordStrength('abcdefgh1').score,2);
 assert.equal(passwordStrength(null).score,0);
 assert.equal(passwordStrength('Abcdefg123').label,'good');
});

test('username validation',()=>{
 const taken=new Set(['lampbane','kris']);
 const v=(u,o)=>validateUsername(u,{taken,...o});
 assert.equal(v('').reason,'empty');
 assert.equal(v('ab').reason,'short');
 assert.equal(v('a'.repeat(21)).reason,'long');
 assert.equal(v('has space').reason,'chars');
 assert.equal(v('émile').reason,'chars');
 assert.equal(v('.dot').reason,'edge');
 assert.equal(v('dot.').reason,'edge');
 assert.equal(v('a..b').reason,'repeat');
 assert.equal(v('admin').reason,'reserved');
 assert.equal(v('@Admin').reason,'reserved');
 assert.equal(v('LampBane').reason,'taken');
 assert.equal(v('@lampbane').reason,'taken');
 assert.equal(v('lampbane',{own:'lampbane'}).ok,true);
 const ok=v('  @Mole_Finder.9 ');assert.deepEqual([ok.ok,ok.value],[true,'mole_finder.9']);
 for(const r of RESERVED)assert.equal(v(r).ok,false,r);
});

test('username suggestions are valid, free, distinct, deterministic',()=>{
 const taken=new Set(['jane.doe']);
 const a=suggestUsernames('Jane Doe',{taken}),b=suggestUsernames('Jane Doe',{taken});
 assert.deepEqual(a,b);
 assert.ok(a.length>=3&&a.length<=4);
 assert.equal(new Set(a).size,a.length);
 assert.ok(!a.includes('jane.doe'));
 for(const u of a)assert.equal(validateUsername(u,{taken}).ok,true,u);
 assert.ok(suggestUsernames('Zoë Ñandú').every(u=>/^[a-z0-9._]+$/.test(u)));
 assert.deepEqual(suggestUsernames(''),[]);
 assert.deepEqual(suggestUsernames('!!!'),[]);
 assert.ok(suggestUsernames('Al').length>=1);     // short name still gets something valid
});

test('taken handles come from ids, handles and aliases',()=>{
 const set=takenHandles([{id:'lampbane',handle:'lampbane',aliases:['Kris','lampbane']},{id:'wayfarer',handle:null},null]);
 assert.ok(set.has('lampbane')&&set.has('kris')&&set.has('wayfarer'));
 assert.equal(takenHandles(null).size,0);
});

test('archetype -> tags is TAG_TYPE reversed',()=>{
 assert.ok(tagsForArchetype('history-buff').includes('historical'));
 assert.ok(tagsForArchetype('history-buff').includes('castles/estates'));
 assert.deepEqual(tagsForArchetype('urbex-rat'),['ruins/urbex']);
 assert.deepEqual(tagsForArchetype('occultist'),[]);   // no catalog tag maps to it
 assert.deepEqual(tagsForArchetype('nope'),[]);
});

test('spot suggestions: matching tags first, photos only, padded with the curated top, no repeats',()=>{
 const spot=(id,tags,image='/spots/x.jpg')=>({id:'/blog/'+id,title:id,tags,image});
 const cat=[spot('a',['FOOD & BARS']),spot('b',['HISTORICAL','ROADSIDE STOPS']),spot('c',['HISTORICAL'],'https://x.r2.dev/p.jpg'),spot('d',['CASTLES/ESTATES']),spot('e',['RUINS/URBEX']),spot('f',['HISTORICAL'])];
 const r=suggestSpots(cat,'history-buff',{n:3});
 assert.deepEqual(r.spots.map(s=>s.title),['b','d','f']);
 assert.equal(r.matched,3);
 const pad=suggestSpots(cat,'urbex-rat',{n:3});
 assert.deepEqual(pad.spots.map(s=>s.title),['e','a','b']);
 assert.equal(pad.matched,1);
 const none=suggestSpots(cat,'occultist',{n:2});
 assert.equal(none.matched,0);assert.deepEqual(none.spots.map(s=>s.title),['a','b']);
 const skip=suggestSpots(cat,'history-buff',{n:2,have:['/blog/b']});
 assert.deepEqual(skip.spots.map(s=>s.title),['d','f']);
 assert.ok(!suggestSpots(cat,'history-buff',{n:6}).spots.some(s=>s.title==='c'));   // no local photo
 assert.deepEqual(suggestSpots(null,'x').spots,[]);
 assert.ok(travelerStyles.length===45);
});
