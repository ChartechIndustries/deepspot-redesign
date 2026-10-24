import {profileId} from './identity.mjs?v=744e89b9';
import {readAccount} from '../site/account-state.mjs?v=1c064097';
import {normalizedTags} from '../browse/catalog.mjs?v=776ebad9';
import {levelFor,memberLevel,travelerType,standing,earnedStamps} from './passport-rules.mjs?v=dcb74f9b';
async function json(url){const response=await fetch(url);if(!response.ok)throw Error('Profile collection unavailable');return response.json();}
/* "since" for your own passport = the month onboarding was finished (real: stored when the passport was issued) */
const joinedLabel=()=>{try{const t=Number(localStorage.getItem('deepspot-onboarded-v1'));return t>0?new Date(t).toLocaleDateString('en-US',{month:'short',year:'numeric'}):null;}catch{return null;}};
const local=src=>typeof src==='string'&&src.startsWith('/')?src:'';
/* remote photos on DeepSpot's own image host (r2.dev) are real posting photos: show them; only local files have 800px cards */
const photo=src=>typeof src==='string'&&(src.startsWith('/')||/^https:\/\/[a-z0-9.-]+\.r2\.dev\//i.test(src))?src:'';
const stem=src=>src.split('/').pop().replace(/\.[a-z]+$/i,'');
const finish=p=>{
 p.level=p.points==null?null:levelFor(p.points);p.member=p.level?memberLevel(p.level.level):'contributor';
 p.type=travelerType(p.records);
 p.places=[...new Set(p.records.filter(r=>r.kind==='spot').map(r=>r.region||r.place).filter(Boolean))];
 p.stamps=earnedStamps(p);return p;
};
export async function loadProfile(id){
 if(id==='preview'){
  const draft=readAccount();
  return finish({id:'preview',name:draft.name||'Your name here',handle:draft.username||null,joined:joinedLabel(),localPreview:true,mole:draft.mole?.png||'',bio:draft.bio||null,signatureArt:draft.signatureArt||null,socials:{instagram:draft.instagram,twitter:draft.twitter,website:draft.website},points:0,standing:null,contrib:{spots:null},records:[],style:draft.style,
   notice:'A passport draft stored on this browser. Points, postings and stamps appear when your live account is connected.'});
 }
 const [directory,catalog,content]=await Promise.all([json('/profile/profiles.json'),json('/featured-spots.json'),json('/site/content.json')]);
 const sample=directory.profiles.find(profile=>profile.id===id||(profile.aliases||[]).some(name=>profileId(name)===id));
 const names=[...new Set([...catalog.map(s=>s.publisher)].filter(Boolean))];
 const name=sample?.name||names.find(name=>profileId(name)===id);if(!name)return null;
 const aliases=[name,...(sample?.aliases||[])],identities=new Set(aliases.map(n=>n.toLowerCase()));
 const seen=new Set();
 const spots=catalog.filter(s=>s.id?.startsWith('/blog/')&&s.title&&!s.title.startsWith('PART OF:')&&identities.has(s.publisher?.toLowerCase())&&!seen.has(s.id)&&seen.add(s.id));
 const spotRecord=s=>{const slug=s.id.split('/').pop(),img=photo(s.image),loc=local(s.image);return {id:s.id,name:s.title,place:s.place,region:content.spots?.[slug]?.region||'',image:img,card:loc?'/editorial-assets/cards/'+stem(loc)+'.webp':'',href:'/spot/?id='+encodeURIComponent(slug),kind:'spot',tags:normalizedTags(s.tags),date:s.date||''};};
 const records=spots.map(spotRecord);
 const stand=standing(content.leaderboard,aliases),verified=!!sample?.verifiedSnapshot;
 // Totals are the verified snapshot when we have one; otherwise what this collection shows.
 return finish({id:sample?.id||id,name,handle:sample?.handle||null,joined:sample?.joined||null,localPreview:false,known:!!sample,image:sample?.image||null,mole:sample?`/community-assets/moles/${sample.id}.webp`:'',bio:null,signatureArt:null,socials:null,
  points:stand?stand.points:null,standing:stand,contrib:verified?{spots:sample.spots}:{spots:spots.length},records,verified,
  notice:verified?'Totals captured from DeepSpot on October 8, 2026. Points and ranks come from the community leaderboard snapshot. Postings below are the ones in this preview’s collection.':'Postings from this site’s current collection. Full profile details are not connected yet.'});
}
