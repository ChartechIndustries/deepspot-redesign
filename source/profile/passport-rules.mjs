import {stampArt} from './passport-art.mjs?v=89a3954f';
// Passport v2 rules. Everything here is derived from real data (leaderboard points, postings); nothing is invented.
export const POINTS={spot:50,upvote:10};
// level = 1 + floor(sqrt(points / 40)). Level L starts at 40*(L-1)^2 points.
export const levelStart=level=>40*(level-1)**2;
export function levelFor(points){
 const p=Math.max(0,Math.floor(Number(points)||0));let level=1;while(40*level*level<=p)level++;
 const from=levelStart(level),to=levelStart(level+1);
 return {level,points:p,from,to,pct:Math.round((p-from)/(to-from)*100)};
}
export const memberLevels=[[1,'newcomer'],[3,'scout'],[5,'explorer'],[7,'pathfinder'],[9,'trailblazer'],[11,'cartographer'],[14,'legend']];
export function memberLevel(level){let name=memberLevels[0][1];for(const [from,title] of memberLevels)if(level>=from)name=title;return name;}
export const memberRange=index=>{const from=memberLevels[index][0],next=memberLevels[index+1];return next?(next[0]-from>1?`${from}–${next[0]-1}`:String(from)):from+'+';};
// Catalog tag (lowercase) -> traveler style id (travelerStyles in account-state.mjs). One table, edit here.
export const TAG_TYPE={
 'weird/funny':'oddball','roadside stops':'oddball','ruins/urbex':'urbex-rat','caves/ruins':'worm-lord','cryptids/monsters':'monster-hunter','cemeteries/death':'undertaker','retro':'liminalist',
 'geology/caves':'rock-hound','sightseeing/nature':'trailblazer','nature':'trailblazer','aquatic':'beach-bum','hotsprings':'hot-spring-hunter','parks/gardens':'botanist',
 'historical':'history-buff','castles/estates':'history-buff','shrines and castles':'history-buff','endangered':'archaeologist','religious':'prophet','temples':'prophet',
 'military/war':'warlord','museums':'museum-snob','zoos and museums':'museum-snob',
 'food & bars':'forager','food and bars':'forager','shopping':'forager',
 'science/technology':'science-geek','infrastructure/industry':'bureaucrat',
 'art/sculpture':'artsy-fartsy','architecture':'architect','art/architecture':'architect',
 'recreation':'adrenaline-junkie','amusement parks':'adrenaline-junkie','inns/hotels':'nomad','zoos/aquariums':'furball'
};
// Tie order = the archetype list order (travelerStyles in account-state.mjs).
export const typeOrder=['occultist','urbex-rat','dungeon-diver','ghost-hunter','monster-hunter','oddball','conspiracy-theorist','undertaker','folklorist','liminalist','mad-scientist','rock-hound','worm-lord','trailblazer','beach-bum','pirate','hot-spring-hunter','happy-camper','archaeologist','prophet','history-buff','warlord','museum-snob','anthropologist','prospector','jailbird','decadent-gourmand','taboo-gourmand','forager','night-goblin','pub-crawler','science-geek','astronaut','grease-monkey','bureaucrat','futurist','botanist','artsy-fartsy','weeb','bookworm','architect','mystic','adrenaline-junkie','nomad','furball'];
// records: [{kind:'spot', tags:[…]}]. Each posting adds one point to every style its categories map to.
export function travelerType(records){
 const cats=new Map(),score={};
 for(const r of records){
  const styles=new Set();
  for(const raw of r.tags||[]){
   const key=String(raw||'').trim().toLowerCase();if(!key||key==='deep spot choice')continue;
   cats.set(key,(cats.get(key)||0)+1);const style=TAG_TYPE[key];if(style)styles.add(style);
  }
  for(const s of styles)score[s]=(score[s]||0)+1;
 }
 const ranked=typeOrder.map(id=>[id,score[id]||0]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
 return {postings:records.length,id:ranked[0]?.[0]||null,ranked,cats:[...cats].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))};
}
// Leaderboard standing by name/alias. Ranks are positions in the saved snapshot lists.
export function standing(leaderboard,names){
 const ids=new Set(names.map(n=>String(n).toLowerCase())),at=list=>list.findIndex(r=>ids.has(String(r.name).toLowerCase()));
 const all=leaderboard?.allTime||[],month=leaderboard?.monthly||[],i=at(all),m=at(month);
 if(i<0&&m<0)return null;
 const row=all[i]||month[m];
 return {points:row.points,rankAll:i<0?null:i+1,rankMonth:m<0?null:m+1,total:all.length,ahead:i>0?{name:all[i-1].name,gap:all[i-1].points-row.points}:null};
}
const word=(x,y)=>`<text class="pp-stamp-word" x="60" y="${y}" text-anchor="middle">${x}</text>`;
const art={
 'ten-spots':'<path d="M60 7 105 33v54L60 113 15 87V33Z"/><path d="M60 15 98 37v46L60 105 22 83V37Z" stroke-dasharray="2 4"/><path d="m37 50 6-5v31"/><rect x="51" y="45" width="15" height="31" rx="7.5"/><path d="M82 54v15m-7.5-7.500h15"/>'+word('10+ SPOTS',96),
};
const wrap=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${body}</svg>`;
// Stamps are earned by real rules only. `test(p)` receives the loaded profile.
export const stamps=[
 {id:'first-find',name:'first find',color:'#3c60ff',description:'Every explorer starts somewhere. A first contribution to the DeepSpot collection.',hint:'add your first spot',svg:()=>stampArt(0),test:p=>(p.contrib.spots||0)>0},
 {id:'deep-spot-choice',name:'deep spot choice',color:'#14713d',description:'A discovery worth a closer look. One of your spots carries the DeepSpot Choice tag.',hint:'get a spot picked as a deep spot choice',svg:()=>stampArt(2),test:p=>p.records.some(r=>r.tags?.includes('DEEP SPOT CHOICE'))},
 {id:'ten-spots',name:'ten spots',color:'#176972',description:'Ten or more spots added to the map.',hint:'add 10 spots',svg:()=>wrap(art['ten-spots']),test:p=>(p.contrib.spots||0)>=10},
];
export const earnedStamps=profile=>stamps.map(s=>({...s,earned:!!s.test(profile)}));
