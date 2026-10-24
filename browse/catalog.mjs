// The local prototype uses the same saved editorial collection as the homepage.
// Replace the fetch boundary with the live backend adapter when integrating.
export const primaryCategories=[['all','all'],['deep spot choice','DEEP SPOT CHOICE'],['weird/funny','WEIRD/FUNNY'],['history','HISTORICAL'],['roadside stops','ROADSIDE STOPS'],['art/sculpture','ART/SCULPTURE']];
const preferred=['frozen-aquarium-in-miyagi','tochigi-underground-quarry','south-london-s-most-notable-street-art-location','berlin-s-hill-of-nazi-rubble-cold-war-spies-and-graffiti','osaka-s-candy-colored-garbage-palace','a-soviet-prison-doubles-as-a-swimming-hole','the-place-in-malta-where-people-have-been-making-salt-for-centuries','a-suburban-london-warehouse-where-old-neon-signs-get-a-new-job','700-year-old-church-devoured-by-sand','coin-operated-grandmas-and-opium-den-dioramas-are-hidden-in-this-san-francisco-museum','a-melodic-sculpture-in-the-lancashire-countryside','tomb-of-christ-in-aomori'];
const aliases={'NATURE':'SIGHTSEEING/NATURE','FOOD AND BARS':'FOOD & BARS','ART/ARCHITECTURE':'ARCHITECTURE','TEMPLES, SHRINES AND CASTLES':'RELIGIOUS','AMUSEMENT PARKS, ZOOS AND MUSEUMS':'AMUSEMENT PARKS','AMUSEMENT PARKS, MUSEUMS':'AMUSEMENT PARKS','CAVES/RUINS':'RUINS/URBEX','RELIGIOUS, RELIGIOUS':'RELIGIOUS'};
export function normalizedTags(value){let text=String(value||'');for(const key of Object.keys(aliases).filter(key=>key.includes(',')).sort((a,b)=>b.length-a.length))text=text.replaceAll(key,aliases[key]);return [...new Set(text.split(/[·,]/).map(tag=>aliases[tag.trim()]||tag.trim()).filter(tag=>tag&&tag!=='SPOT'&&tag!=='Image not found'))];}
export function prepareCatalog(data){
 if(!Array.isArray(data))throw new TypeError('Expected a spot collection');
 const seen=new Set();
 return data.filter(spot=>spot?.id?.startsWith('/blog/')&&spot.title&&!spot.title.startsWith('PART OF:')&&!seen.has(spot.id)&&seen.add(spot.id)).map((spot,index)=>({...spot,tags:normalizedTags(spot.tags),order:index,rank:preferred.indexOf(spot.id.split('/').pop())})).sort((a,b)=>{
  const score=s=>s.rank>=0?1000-s.rank:s.image?500-s.order/1000:-s.order;
  return score(b)-score(a);
 });
}
export const categoryLabel=value=>primaryCategories.find(([,id])=>id===value)?.[0]||value.toLowerCase();
export function paginateCatalog(items,requestedPage=1,pageSize=12){
 const totalPages=Math.max(1,Math.ceil(items.length/pageSize));
 const page=Math.min(totalPages,Math.max(1,Number.isSafeInteger(Number(requestedPage))?Number(requestedPage):1));
 const start=(page-1)*pageSize;
 return {page,totalPages,start,items:items.slice(start,start+pageSize)};
}
export function filterCatalog(data,{query='',category='all',savedOnly=false,sort='curated'}={},saved=new Set()){
 const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 const result=data.filter(spot=>(category==='all'||spot.tags.includes(category))&&(!savedOnly||saved.has(spot.id))&&words.every(word=>[spot.title,spot.place,spot.description,spot.publisher,...spot.tags].filter(Boolean).join(' ').toLocaleLowerCase().includes(word)));
 if(sort==='az')result.sort((a,b)=>a.title.localeCompare(b.title));
 if(sort==='za')result.sort((a,b)=>b.title.localeCompare(a.title));
 return result;
}
