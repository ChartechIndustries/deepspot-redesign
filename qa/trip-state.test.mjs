import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTrip} from '../source/site/trip-state.mjs';

test('a shared trip retains day assignments and daily notes',()=>{
 const trip={name:'A detour',spots:['/blog/oya'],days:{'/blog/oya':2},dayCount:2,notes:'Take the train',dayNotes:{2:'Bring a camera'}};
 const restored=normalizeTrip(JSON.parse(JSON.stringify(trip)),new Set(['/blog/oya']));
 assert.equal(restored.days['/blog/oya'],2);
 assert.equal(restored.dayNotes[2],'Bring a camera');
 assert.equal(restored.notes,'Take the train');
});
test('unknown and duplicate stops cannot create invalid route entries',()=>{
 const restored=normalizeTrip({spots:['a','a','missing','b'],dayCount:3.5,days:{a:99,b:-1},dayNotes:{99:'not a real day'}},new Set(['a','b']));
 assert.deepEqual(restored.spots,['a','b']);
 assert.deepEqual(restored.days,{a:3,b:1});
 assert.equal(restored.dayCount,3);
 assert.equal(restored.dayNotes[99],undefined);
});
test('empty or malformed trip state has a usable first day',()=>{
 const restored=normalizeTrip(null,new Set());
 assert.equal(restored.dayCount,1);
 assert.deepEqual(restored.spots,[]);
 assert.equal(restored.name,'my next detour');
});
