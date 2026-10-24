import {esc,$,icon,action,pageTitle,spotURL,photo,saveButton,empty,savedIDs,trip,keys,subscribeStore,localURL} from './core.mjs?v=65b48136';
import {authorLink} from '../profile/identity.mjs?v=744e89b9';
export function renderFieldbook(root,{spots}){
 let query='';
 root.innerHTML=pageTitle('Your','fieldbook.','Keep the places that pull you in. Make a trip out of them when you’re ready.')+`<section class="ds-fieldbook-trip" aria-label="Your trip"></section><div class="ds-fieldbook-tools"><label class="ds-search-field">${icon('search')}<input id="fieldbook-search" type="search" placeholder="Search your fieldbook…" aria-label="Search your fieldbook"></label></div><p class="ds-note">Saved on this browser.</p><div id="fieldbook-results" tabindex="-1"></div><p id="fieldbook-count" class="ds-note" role="status"></p>`;
 const show=()=>{
  const selected=savedIDs(),saved=spots.filter(s=>selected.has(s.id));
  const t=trip(),stops=t.spots.map(id=>spots.find(s=>s.id===id)).filter(Boolean);
  $('.ds-fieldbook-trip',root).innerHTML=`<div class="ds-fieldbook-trip-art" aria-hidden="true">${stops[0]?.image?photo(stops[0]):icon('route')}</div><div><span class="ds-eyebrow">${stops.length?stops.length+' '+(stops.length===1?'stop':'stops')+' · '+t.dayCount+' '+(t.dayCount===1?'day':'days'):'your next adventure'}</span><h2>${stops.length?esc(t.name):'a few finds. a whole trip.'}</h2><p>${stops.length?'Pick up where you left off.':'Bring your saved places together and take the long way.'}</p></div>${action(stops.length?'continue planning':'start a trip','/plan-trip/')}`;
  const list=saved.filter(s=>(s.title+' '+(s.place||'')+' '+(s.publisher||s.author||'')).toLowerCase().includes(query.toLowerCase().trim()));
  const target=$('#fieldbook-results',root);target.className='ds-fieldbook-list';
  target.innerHTML=list.length?list.map(s=>`<article class="ds-fieldbook-item"><a class="ds-fieldbook-image" href="${spotURL(s)}">${photo(s)}</a><div class="ds-fieldbook-copy"><span class="ds-eyebrow">${esc(s.tags.slice(0,2).join(' · ').toLowerCase())}</span><h2><a href="${spotURL(s)}">${esc(s.title)}</a></h2><p>${esc(s.place)}</p>${s.publisher?authorLink(s.publisher):''}</div><div class="ds-fieldbook-actions"><button class="ds-button secondary" type="button" data-trip-add="${esc(s.id)}">${t.spots.includes(s.id)?'in your trip':'add to trip'} ${icon(t.spots.includes(s.id)?'route':'plus')}</button>${saveButton(s)}</div></article>`).join(''):empty(query?'nothing matches yet.':'the start of something good.',query?'Try another title, place, or author.':'Save a place while you browse. It will be waiting here.','/browse/','find a deep spot');
  $('#fieldbook-count',root).textContent=list.length?`${list.length} ${list.length===1?'place':'places'}`:'';
 };
 $('#fieldbook-search',root).oninput=e=>{query=e.target.value;show();};
 subscribeStore([keys.saved,keys.trip],()=>{
  const focused=document.activeElement,wasInside=$('#fieldbook-results',root).contains(focused),oldIndex=[...root.querySelectorAll('.ds-fieldbook-item')].indexOf(focused.closest?.('.ds-fieldbook-item'));
  const selector=focused.matches?.('[data-trip-add]')?'[data-trip-add]':'[data-save-spot]';
  show();if(wasInside){const items=root.querySelectorAll('.ds-fieldbook-item');(items[Math.min(Math.max(oldIndex,0),items.length-1)]?.querySelector(selector)||root.querySelector('#fieldbook-search')).focus({preventScroll:true});}
 });
 show();
}
