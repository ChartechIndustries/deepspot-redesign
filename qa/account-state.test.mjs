import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAccount,travelerImage} from '../source/site/account-state.mjs';

test('profile draft excludes account credentials and statistics',()=>{
 const value=normalizeAccount({name:'Explorer',email:'private@example.test',password:'not-a-real-password',xp:500,level:8,username:'EXPLORER'});
 assert.equal(value.name,'Explorer');
 assert.equal(value.username,'explorer');
 for(const key of ['email','password','xp','level'])assert.equal(key in value,false);
});
test('external photos and executable website URLs cannot become draft media',()=>{
 const value=normalizeAccount({photo:'https://example.test/photo.png',website:'javascript:alert(1)',style:'unknown'});
 assert.equal(value.photo,'');assert.equal(value.website,'');assert.equal(value.style,'oddball');
 assert.equal(normalizeAccount({style:'poet'}).style,'history-buff');assert.equal(normalizeAccount({style:'ghost-hunter'}).style,'ghost-hunter');
});
test('bounded draft text and generated traveler marks remain portable',()=>{
 const value=normalizeAccount({name:'n'.repeat(100),bio:'b'.repeat(500),signature:'s'.repeat(80),website:'https://example.test/'});
 assert.equal(value.name.length,50);assert.equal(value.bio.length,400);assert.equal(value.signature.length,40);
 assert.equal(value.website,'https://example.test/');
 const svg=decodeURIComponent(travelerImage('nomad').split(',')[1]);
 assert.match(svg,/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
 assert.match(svg,/<rect/);assert.match(svg,/<circle/);
});
test('mole draft keeps a small png and known traits only',()=>{
 const png='data:image/webp;base64,'+'A'.repeat(1000);
 const v=normalizeAccount({avatarMode:'mole',mole:{png,traits:{'Head/Hat':'Head_Hat/Wizard',Bogus:'x/y','Eyes':'<script>'},rolledAt:5}});
 assert.equal(v.avatarMode,'mole');assert.deepEqual(v.mole.traits,{'Head/Hat':'Head_Hat/Wizard'});
 assert.equal(normalizeAccount({avatarMode:'mole',mole:{png:'https://x.test/a.png'}}).avatarMode,'style');
 assert.equal(normalizeAccount({avatarMode:'mole',mole:{png:'data:image/png;base64,'+'A'.repeat(800000)}}).mole,null);
});
test('signature art keeps a small png data url only',()=>{
 const art='data:image/png;base64,'+'A'.repeat(1000);
 assert.equal(normalizeAccount({signatureArt:art}).signatureArt,art);
 assert.equal(normalizeAccount({}).signatureArt,'');
 assert.equal(normalizeAccount({signatureArt:'data:image/jpeg;base64,AAAA'}).signatureArt,'');
 assert.equal(normalizeAccount({signatureArt:'https://x.test/a.png'}).signatureArt,'');
 assert.equal(normalizeAccount({signatureArt:'data:image/png;base64,<svg>'}).signatureArt,'');
 assert.equal(normalizeAccount({signatureArt:'data:image/png;base64,'+'A'.repeat(210000)}).signatureArt,'');
});
