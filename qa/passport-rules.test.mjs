import test from 'node:test';
import assert from 'node:assert/strict';
import {levelFor,memberLevel,memberRange,travelerType,standing,earnedStamps,TAG_TYPE} from '../source/profile/passport-rules.mjs';
import {travelerStyles} from '../source/site/account-state.mjs';

test('level = 1 + floor(sqrt(points/40)) with exact boundaries',()=>{
 for(const [p,l] of [[0,1],[39,1],[40,2],[159,2],[160,3],[250,3],[2100,8],[6800,14],[6760,14],[6759,13]])assert.equal(levelFor(p).level,l,String(p));
 assert.equal(levelFor(-5).level,1);assert.equal(levelFor('x').level,1);
 for(let p=0;p<20000;p+=7)assert.equal(levelFor(p).level,1+Math.floor(Math.sqrt(p/40)));
});
test('level progress runs from this level start to the next',()=>{
 const k=levelFor(6800);assert.deepEqual([k.from,k.to],[6760,7840]);assert.equal(k.pct,4);
 const z=levelFor(0);assert.deepEqual([z.from,z.to,z.pct],[0,40,0]);
});
test('member level ladder',()=>{
 const want={1:'newcomer',2:'newcomer',3:'scout',4:'scout',5:'explorer',6:'explorer',7:'pathfinder',8:'pathfinder',9:'trailblazer',10:'trailblazer',11:'cartographer',12:'cartographer',13:'cartographer',14:'legend',40:'legend'};
 for(const [l,n] of Object.entries(want))assert.equal(memberLevel(Number(l)),n);
 assert.deepEqual([0,2,5,6].map(memberRange),['1–2','5–6','11–13','14+']);
});
test('every mapped tag points at a real traveler style',()=>{
 const ids=new Set(travelerStyles.map(s=>s.id));for(const v of Object.values(TAG_TYPE))assert.ok(ids.has(v),v);
});
test('traveler type comes from posting categories',()=>{
 const spot=(...tags)=>({kind:'spot',tags});
 assert.equal(travelerType([]).id,null);
 const t=travelerType([spot('WEIRD/FUNNY'),spot('HISTORICAL','WEIRD/FUNNY'),spot('FOOD & BARS'),spot('DEEP SPOT CHOICE','ART/SCULPTURE')]);
 assert.equal(t.postings,4);assert.equal(t.id,'explorer');
 assert.deepEqual(t.ranked,[['explorer',2],['poet',2],['foodie',1]]);
 assert.equal(t.cats.some(c=>c[0]==='deep spot choice'),false);
 assert.equal(travelerType([spot('FOOD & BARS'),spot('SHOPPING')]).id,'foodie');
 assert.equal(travelerType([spot('ARCHITECTURE'),spot('SIGHTSEEING/NATURE')]).id,'shutterbug');
 assert.equal(travelerType([spot('ROADSIDE STOPS')]).id,'nomad');
 assert.equal(travelerType([{kind:'story',tag:'history & folklore'}]).id,'poet');
 assert.equal(travelerType([spot('UNKNOWN TAG')]).id,null);
});
test('ties go to the first style in the list',()=>{
 const t=travelerType([{kind:'spot',tags:['HISTORICAL']},{kind:'spot',tags:['FOOD & BARS']}]);assert.equal(t.id,'foodie');
});
test('standing finds rank, points and the gap to the next rank',()=>{
 const lb={allTime:[{name:'Kris',points:6800},{name:'Wayfarer',points:2100},{name:'Six',points:250}],monthly:[{name:'Kris',points:6800},{name:'Six',points:250}]};
 const s=standing(lb,['wayfarer']);assert.deepEqual([s.rankAll,s.rankMonth,s.points,s.ahead.name,s.ahead.gap],[2,null,2100,'Kris',4700]);
 assert.equal(standing(lb,['Nobody']),null);assert.equal(standing(lb,['kris']).ahead,null);
});
test('stamps are earned by real rules only',()=>{
 const p=(spots,stories,tags=[])=>({contrib:{spots,stories},records:[{tags}]});
 const ids=x=>earnedStamps(x).filter(s=>s.earned).map(s=>s.id);
 assert.deepEqual(ids(p(0,0)),[]);assert.deepEqual(ids({contrib:{spots:null,stories:null},records:[]}),[]);
 assert.deepEqual(ids(p(6,0)),['first-find']);assert.deepEqual(ids(p(39,0,['DEEP SPOT CHOICE'])),['first-find','deep-spot-choice','ten-spots']);
 assert.deepEqual(ids(p(0,1)),['first-find','story-writer']);
});
