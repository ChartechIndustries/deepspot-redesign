import test from 'node:test';
import assert from 'node:assert/strict';
import {SESSION_KEY,normalizeSession,validEmail,readSession,writeSession,parseGateParam,allows} from '../source/site/gate-state.mjs';
const fake=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),m};};
test('empty or malformed state is signed out',()=>{
 for(const raw of [null,undefined,{},{state:'admin'},'free',[]])assert.deepEqual(normalizeSession(raw),{state:'out',email:''});
 assert.deepEqual(readSession(fake()),{state:'out',email:''});
 const s=fake();s.setItem(SESSION_KEY,'{bad json');assert.deepEqual(readSession(s),{state:'out',email:''});
});
test('email format check',()=>{
 for(const ok of ['a@b.co','first.last+tag@sub.example.org',' a@b.co '])assert.equal(validEmail(ok),true,ok);
 for(const bad of ['','a','a@b','a@b.','@b.co','a b@c.co','a@@b.co',null,42,'a@b..co'])assert.equal(validEmail(bad),false,String(bad));
});
test('free and member keep a valid email; signed out drops it',()=>{
 assert.deepEqual(normalizeSession({state:'free',email:' me@x.io '}),{state:'free',email:'me@x.io'});
 assert.deepEqual(normalizeSession({state:'member',email:'nope'}),{state:'member',email:''});
 assert.deepEqual(normalizeSession({state:'out',email:'me@x.io'}),{state:'out',email:''});
});
test('write then read round-trips and rejects unknown states',()=>{
 const s=fake();
 assert.deepEqual(writeSession({state:'free',email:'me@x.io'},s),{state:'free',email:'me@x.io'});
 assert.deepEqual(readSession(s),{state:'free',email:'me@x.io'});
 writeSession({state:'bogus',email:'me@x.io'},s);
 assert.deepEqual(readSession(s),{state:'out',email:''});
 assert.equal(writeSession({state:'free'},{getItem(){},setItem(){throw Error('full');}}),null);
});
test('review switch parses only known values',()=>{
 assert.equal(parseGateParam('?gate=off'),'off');
 assert.equal(parseGateParam('?x=1&gate=member'),'member');
 assert.equal(parseGateParam('?gate=nope'),null);
 assert.equal(parseGateParam(''),null);
});
test('requirements: free needs a session, member needs member',()=>{
 assert.equal(allows('out','free'),false);assert.equal(allows('free','free'),true);assert.equal(allows('member','free'),true);
 assert.equal(allows('out','member'),false);assert.equal(allows('free','member'),false);assert.equal(allows('member','member'),true);
});
