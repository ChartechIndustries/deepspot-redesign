/* Passport items (trophy case). PLACEHOLDERS for the release: names, notes and art are not final.
   Who holds what is rolled from the passport id until live accounts send real item data. */
const S=d=>`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ITEMS=[
 {id:'founder-pin',name:'founding explorer pin',kind:'badge',rarity:'rare',color:'#07d653',note:'Given to the first members who joined before launch.',
  art:S('<path d="M24 5 29 17l13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1Z"/><circle cx="24" cy="23" r="4"/>')},
 {id:'radar-shard',name:'radar dome shard',kind:'relic',rarity:'uncommon',color:'#83cdce',note:'A piece of the old listening station. Earned for a cold war spot.',
  art:S('<path d="M8 34a16 16 0 0 1 32 0"/><path d="M14 34a10 10 0 0 1 20 0"/><path d="M24 34V20"/><path d="m24 20 9-9"/><path d="M6 40h36"/>')},
 {id:'field-compass',name:'brass field compass',kind:'tool',rarity:'common',color:'#f2c14e',note:'Earned for a first approved spot.',
  art:S('<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="12"/><path d="m28 20-6 2-2 6 6-2Z"/><path d="M24 4v3M24 41v3M4 24h3M41 24h3"/>')},
 {id:'race-cup',name:'monthly race cup',kind:'trophy',rarity:'one of one',color:'#3c60ff',note:'First place in a monthly giveaway race.',
  art:S('<path d="M15 7h18v9a9 9 0 0 1-18 0Z"/><path d="M15 10H9a6 6 0 0 0 6 7M33 10h6a6 6 0 0 1-6 7"/><path d="M24 25v8M17 41h14M19 33h10l2 8H17Z"/>')},
 {id:'first-light',name:'first light medal',kind:'medal',rarity:'uncommon',color:'#e57a8a',note:'Earned for a spot with a sunrise photo.',
  art:S('<path d="m17 4 7 12 7-12"/><circle cx="24" cy="30" r="12"/><path d="M18 32a6 6 0 0 1 12 0M24 22v2M17 26l1.5 1.5M31 26l-1.5 1.5"/>')},
 {id:'mole-lantern',name:'mole lantern',kind:'tool',rarity:'common',color:'#f2c14e',note:'For going underground: a mine, a bunker or a cave.',
  art:S('<path d="M20 6h8M24 6v4"/><path d="M16 14h16v22H16Z"/><path d="M14 14h20M14 36h20M18 40h12"/><path d="M24 20c3 3 3 7 0 10-3-3-3-7 0-10Z"/>')},
 {id:'halftone-globe',name:'halftone globe',kind:'collectible',rarity:'rare',color:'#b69cff',note:'Earned for spots on three continents.',
  art:S('<circle cx="24" cy="22" r="15"/><path d="M9 22h30M24 7c-5 5-5 25 0 30M24 7c5 5 5 25 0 30"/><path d="M18 41h12M24 37v4"/>')},
 {id:'quarry-key',name:'quarry key',kind:'relic',rarity:'rare',color:'#6fa8dc',note:'Opens nothing. Earned for an underground cathedral.',
  art:S('<circle cx="15" cy="24" r="8"/><circle cx="15" cy="24" r="3"/><path d="M23 24h20M37 24v6M42 24v5"/>')},
 {id:'bridge-plank',name:'rope bridge plank',kind:'relic',rarity:'common',color:'#c9a27a',note:'Earned for a spot you had to walk a long way to reach.',
  art:S('<path d="M6 16c12 8 24 8 36 0M6 30c12 8 24 8 36 0"/><path d="M12 20v14M20 22v14M28 22v14M36 20v14"/>')},
 {id:'golden-shovel',name:'golden shovel',kind:'trophy',rarity:'one of one',color:'#f2c14e',note:'For the explorer who dug up the most new spots this year.',
  art:S('<path d="M30 6l12 12"/><path d="m36 12-14 14"/><path d="M22 26 10 30a4 4 0 0 0-2 2l-2 10 10-2a4 4 0 0 0 2-2l4-12"/>')},
];
const RANK={'one of one':0,rare:1,uncommon:2,common:3};
/* deterministic roll: same passport, same shelf */
function hash(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function itemsFor(profile){
 if(profile.localPreview)return ['founder-pin','field-compass','mole-lantern','halftone-globe','radar-shard','bridge-plank'].map(id=>ITEMS.find(i=>i.id===id));
 let h=hash(profile.id);const pool=ITEMS.filter(i=>i.rarity!=='one of one'),n=4+h%4,out=[];
 while(out.length<n&&pool.length){h=Math.imul(h^h>>>15,2246822507)>>>0;out.push(pool.splice(h%pool.length,1)[0]);}
 if(profile.standing?.rankAll===1)out.unshift(ITEMS.find(i=>i.id==='race-cup'));
 return out.sort((a,b)=>RANK[a.rarity]-RANK[b.rarity]);
}
