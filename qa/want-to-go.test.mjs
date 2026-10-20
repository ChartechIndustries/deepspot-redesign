import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeList,normalizeItem,addItem,removeAt,moveItem,WTG_MAX} from '../source/profile/want-to-go.mjs';

test('bad input gives empty or skips',()=>{
 for(const bad of [null,undefined,'x',5,{},{type:'spot'}])assert.deepEqual(normalizeList(bad),[]);
 assert.deepEqual(normalizeList([null,1,'a',{type:'x'},{type:'spot',id:5},{type:'spot',id:''},{type:'place',name:'  '},{type:'place',name:5},{type:'spot',id:'has space'}]),[]);
});
test('trim, collapse spaces, cut to 60',()=>{
 assert.deepEqual(normalizeItem({type:'place',name:'  Lisbon   old  town '}),{type:'place',name:'Lisbon old town'});
 assert.equal(normalizeItem({type:'place',name:'a'.repeat(100)}).name.length,60);
});
test('extra fields are dropped',()=>{
 assert.deepEqual(normalizeItem({type:'spot',id:'/blog/x',name:'evil',html:'<b>'}),{type:'spot',id:'/blog/x'});
});
test('dedupe: spots by id, places case-insensitive',()=>{
 const l=normalizeList([{type:'spot',id:'/blog/a'},{type:'spot',id:'/blog/a'},{type:'place',name:'Paris'},{type:'place',name:' paris '},{type:'place',name:'Rome'}]);
 assert.deepEqual(l,[{type:'spot',id:'/blog/a'},{type:'place',name:'Paris'},{type:'place',name:'Rome'}]);
});
test('max 30',()=>{
 const l=normalizeList(Array.from({length:50},(_,i)=>({type:'place',name:'p'+i})));
 assert.equal(l.length,WTG_MAX);assert.equal(l[29].name,'p29');
});
test('addItem: ok, duplicate, full, empty',()=>{
 let r=addItem([],{type:'place',name:'Oslo'});assert.ok(r.ok);assert.equal(r.list.length,1);
 r=addItem(r.list,{type:'place',name:'oslo'});assert.equal(r.reason,'duplicate');
 r=addItem(r.list,{type:'place',name:' '});assert.equal(r.reason,'empty');
 const full=Array.from({length:30},(_,i)=>({type:'place',name:'p'+i}));
 assert.equal(addItem(full,{type:'place',name:'new'}).reason,'full');
});
test('removeAt and moveItem',()=>{
 const l=[{type:'place',name:'a'},{type:'place',name:'b'},{type:'place',name:'c'}];
 assert.deepEqual(removeAt(l,1).map(x=>x.name),['a','c']);
 assert.equal(removeAt(l,9),l);
 assert.deepEqual(moveItem(l,2,-1).map(x=>x.name),['a','c','b']);
 assert.deepEqual(moveItem(l,0,1).map(x=>x.name),['b','a','c']);
 assert.equal(moveItem(l,0,-1),l);assert.equal(moveItem(l,2,1),l);
 assert.equal(l[0].name,'a');
});
