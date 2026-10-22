import test from 'node:test';
import assert from 'node:assert/strict';
import {travelerStyles,travelerMark,travelerImage} from '../source/site/account-state.mjs';

const ALLOWED=new Set(['path','circle','ellipse','rect','line','polyline','polygon']);
const num=s=>s.match(/-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi)?.map(Number)||[];
const attr=(el,k)=>{const m=el.match(new RegExp(`\\s${k}="([^"]*)"`));return m?m[1]:null;};
// on the .5 grid; a .01 nudge is the usual zero-length dot (round cap) and counts as on-grid
const snapped=v=>Math.abs(v*2-Math.round(v*2))<=0.021;

// Absolute endpoints and control points of a path, all commands, abs + rel.
function walk(d){
 const toks=d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi)||[];
 let i=0,cmd='',x=0,y=0,sx=0,sy=0;const ends=[],ctrls=[];
 const n=()=>{const v=Number(toks[i++]);if(!Number.isFinite(v))throw new Error('bad number in '+d);return v;};
 while(i<toks.length){
  if(/[a-z]/i.test(toks[i]))cmd=toks[i++];else if(!cmd)throw new Error('no command in '+d);
  const rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase(),ox=rel?x:0,oy=rel?y:0;
  if(C==='Z'){x=sx;y=sy;cmd='';continue;}
  if(C==='M'||C==='L'||C==='T'){x=ox+n();y=oy+n();if(C==='M'){sx=x;sy=y;cmd=rel?'l':'L';}}
  else if(C==='H')x=ox+n();
  else if(C==='V')y=oy+n();
  else if(C==='C'){ctrls.push([ox+n(),oy+n()],[ox+n(),oy+n()]);x=ox+n();y=oy+n();}
  else if(C==='S'||C==='Q'){ctrls.push([ox+n(),oy+n()]);x=ox+n();y=oy+n();}
  else if(C==='A'){const rx=n(),ry=n();n();const fl=[n(),n()];if(rx<=0||ry<=0||fl.some(f=>f!==0&&f!==1))throw new Error('bad arc in '+d);x=ox+n();y=oy+n();}
  else throw new Error('unknown command '+cmd);
  ends.push([x,y]);
 }
 return {ends,ctrls};
}

test('45 archetypes, unique ids, every field filled',()=>{
 assert.equal(travelerStyles.length,45);
 assert.equal(new Set(travelerStyles.map(s=>s.id)).size,45);
 for(const s of travelerStyles)for(const k of ['id','name','group','description','path'])assert.ok(s[k],`${s.id} ${k}`);
});

for(const s of travelerStyles)test(`icon ${s.id} parses, stays on the grid, has at most one accent`,()=>{
 const body=s.path;
 // only self-closing allowed elements, nothing left over (balanced, no stray text)
 const els=body.match(/<[^>]+>/g)||[];
 assert.equal(els.join(''),body,'stray text or unclosed markup');
 assert.ok(els.length>0);
 let accents=0;
 for(const el of els){
  const tag=el.match(/^<([a-z]+)/)?.[1];
  assert.ok(ALLOWED.has(tag),`element <${tag}>`);
  assert.ok(el.endsWith('/>'),`not self-closing: ${el}`);
  assert.doesNotMatch(el,/\s(style|class|id|stroke-width|href)=/,'no per-element styling');
  const fill=attr(el,'fill');
  if(fill!==null){assert.equal(fill,'currentColor');accents++;}
  const tr=attr(el,'transform');
  if(tr!==null)assert.match(tr,/^rotate\(-?\d+ 12 12\)$/,'only rotations about the centre');
  if(tag==='path'){
   const {ends,ctrls}=walk(attr(el,'d'));
   const disc=attr(el,'stroke')==='none'; // dots(): solid discs, snapped by centre in tools/archetypes.py, edges fall where the radius puts them
   for(const [x,y] of ends){
    assert.ok(x>=2&&x<=22&&y>=2&&y<=22,`point ${x},${y} outside the 2..22 keyline`);
    if(!disc)assert.ok(snapped(+x.toFixed(6))&&snapped(+y.toFixed(6)),`point ${x},${y} not on the .5 grid`);
   }
   for(const [x,y] of ctrls)assert.ok(x>=0&&x<=24&&y>=0&&y<=24,`control ${x},${y} outside 0..24`);
  }else if(tag==='circle'||tag==='ellipse'){
   const cx=+attr(el,'cx'),cy=+attr(el,'cy'),rx=+(attr(el,'r')??attr(el,'rx')),ry=+(attr(el,'r')??attr(el,'ry'));
   assert.ok(snapped(cx)&&snapped(cy),'centre off grid');
   const R=tr?Math.max(rx,ry):0;
   assert.ok((tr?cx-R:cx-rx)>=2&&(tr?cx+R:cx+rx)<=22&&(tr?cy-R:cy-ry)>=2&&(tr?cy+R:cy+ry)<=22,'circle outside keyline');
  }else{
   for(const v of num(el.replace(/^<[a-z]+/,'')))assert.ok(v>=0&&v<=24);
  }
 }
 assert.ok(accents<=1,`${accents} solid accents`);
});

test('travelerMark sets the stroke family on every consumer',()=>{
 const m=travelerMark('ghost-hunter');
 assert.match(m,/^<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g style="stroke-width:var\(--arch-sw,2\);/);
 assert.ok(m.endsWith('</g></svg>'));
 assert.equal(travelerMark('nope'),travelerMark(travelerStyles[0].id));
 const img=decodeURIComponent(travelerImage('ghost-hunter').split(',')[1]);
 assert.match(img,/stroke-width="2"/);assert.match(img,/color="#0b1b27"/);
});
