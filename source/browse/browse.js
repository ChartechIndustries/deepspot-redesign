import {readIDs,writeValue,subscribeStore} from '../site/storage.mjs?v=f4e726a0';
import {primaryCategories,prepareCatalog,filterCatalog,categoryLabel,paginateCatalog} from './catalog.mjs?v=776ebad9';
import {authorLink} from '../profile/identity.mjs?v=744e89b9';
import {followTab,tabFades} from '../site/core.mjs?v=65b48136';
import {imgAttrs} from '../site/img.mjs?v=61371a3b';
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>';
const savedKey='deepspot-saved-spots';
let saved=new Set(readIDs(savedKey));
let data=[],toastTimer,searchTimer;
let state={query:'',category:'all',sort:'curated',view:'grid',savedOnly:false,page:1};
function readURL(){const p=new URLSearchParams(location.search);state={query:p.get('q')||'',category:p.get('category')||'all',sort:['az','za'].includes(p.get('sort'))?p.get('sort'):'curated',view:p.get('view')==='list'?'list':'grid',savedOnly:p.get('saved')==='1',page:Math.max(1,Number.isSafeInteger(Number(p.get('page')))?Number(p.get('page')):1)};}
function writeURL(push=false){const url=new URL(location.href);for(const [key,value]of Object.entries({q:state.query.trim(),category:state.category==='all'?'':state.category,sort:state.sort==='curated'?'':state.sort,view:state.view==='grid'?'':state.view,saved:state.savedOnly?'1':'',page:state.page>1?String(state.page):''}))value?url.searchParams.set(key,value):url.searchParams.delete(key);history[push?'pushState':'replaceState'](null,'',url);}
function theme(next,save){document.documentElement.dataset.theme=next;if(save){try{localStorage.setItem('deepspot-theme',next);}catch{}}const light=next==='light';$('.br-theme').textContent=light?'☾ dark':'☼ light';$('.br-theme').setAttribute('aria-label',`Switch to ${light?'dark':'light'} mode`);const url=new URL(location.href);url.searchParams.set('theme',next);history.replaceState(null,'',url);document.querySelectorAll('a[href]').forEach(a=>{const dest=new URL(a.href);if(dest.origin===location.origin&&['/','/browse/','/profile/'].includes(dest.pathname)){dest.searchParams.set('theme',next);a.href=dest.pathname+dest.search+dest.hash;}});}
theme(document.documentElement.dataset.theme);
$('.br-theme').addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark',true));
$('.br-menu').addEventListener('click',()=>{const open=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!open;$('.br-menu').setAttribute('aria-expanded',String(open));$('.br-menu').setAttribute('aria-label',open?'Close navigation':'Open navigation');$('.br-menu').textContent=open?'×':'☰';if(open)$('#mobile-nav a').focus();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#mobile-nav').hidden){$('.br-menu').click();$('.br-menu').focus();}});
$('.br-tabs').innerHTML=primaryCategories.map(([label,id])=>`<button type="button" data-category="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('');
function sync(){
 $('#spot-search').value=state.query;$('#spot-sort').value=state.sort;
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
 {const row=$('.br-tabs'),on=row.querySelector('[aria-pressed=true]');tabFades(row);if(on)followTab(row,on,{smooth:sync.did===true});sync.did=true;}
 $('#more-categories').value=primaryCategories.some(([,id])=>id===state.category)?'':state.category;
 $('.br-saved').setAttribute('aria-pressed',String(state.savedOnly));$('#saved-count').textContent=saved.size;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 $('#browse-results').dataset.layout=state.view;
}
function excerpt(text){text=String(text||'').trim();return /[.!?…]$/.test(text)?text:text.replace(/\s+\S*$/,'')+'…';}
function card(spot,index){
 const isSaved=saved.has(spot.id),title=esc(spot.title),href='https://www.deepspot.io'+spot.id;
 const tags=spot.tags.filter(t=>t!=='DEEP SPOT CHOICE').slice(0,2);
 return `<article class="br-card"><div class="br-photo"><a class="br-photo-link" href="${esc(href)}" target="_blank" rel="noopener" aria-label="Read ${title}">${spot.image?`<img${imgAttrs(spot.image,'(max-width:700px) 92vw, (max-width:1100px) 46vw, 440px')} alt="${esc(spot.place)}" loading="${index<3?'eager':'lazy'}" decoding="async" width="660" height="440">`:`<div class="br-no-photo" aria-label="Photo unavailable in this preview"><span>deep<br>spot.</span><small>photo unavailable</small></div>`}</a><button class="br-bookmark" type="button" data-save="${esc(spot.id)}" aria-label="${isSaved?'Unsave':'Save'} ${title}" aria-pressed="${isSaved}">${bookmark}</button>${spot.tags.includes('DEEP SPOT CHOICE')?'<span class="br-choice">deep spot choice</span>':''}</div><div class="br-card-copy"><p class="br-tags">${tags.map(t=>`<span>${esc(categoryLabel(t))}</span>`).join('')}</p><h2><a href="${esc(href)}" target="_blank" rel="noopener">${title}</a></h2><p class="br-place">${esc(spot.place)}</p><p class="br-desc">${esc(excerpt(spot.description))}</p><footer class="br-credit">${spot.publisher?authorLink(spot.publisher,{avatar:true}):'<span class="br-credit-text">publisher credit unavailable</span>'}<a class="br-read" href="${esc(href)}" target="_blank" rel="noopener" aria-label="Read ${title}">↗</a></footer></div></article>`;
}
function renderFilters(){const chips=[];if(state.category!=='all')chips.push(['category',categoryLabel(state.category)]);if(state.query.trim())chips.push(['query',`“${state.query.trim()}”`]);if(state.savedOnly)chips.push(['savedOnly','saved spots']);$('#active-filters').hidden=!chips.length;$('#active-filters').innerHTML=chips.map(([key,label])=>`<button type="button" data-clear="${key}" aria-label="Remove ${esc(label)} filter">${esc(label)} ×</button>`).join('')+(chips.length?'<button type="button" data-reset>clear all</button>':'');}
function render(){
 const matches=filterCatalog(data,state,saved),pagination=paginateCatalog(matches,state.page),shown=pagination.items,grid=$('#browse-results');
 state.page=pagination.page;writeURL();
 sync();renderFilters();$('#result-count').textContent=matches.length;const noun=matches.length===1?'deep spot':'deep spots';$('#result-label').textContent=state.savedOnly?'saved '+noun:state.query||state.category!=='all'?noun+' found':noun+' to discover';const filtered=state.savedOnly||state.query.trim()||state.category!=='all';$('#pill-count').textContent=matches.length;$('#pill-label').textContent=state.savedOnly?'saved':filtered?'found':matches.length===1?'spot':'spots';
 if(!matches.length){grid.innerHTML=`<div class="br-empty"><h2>${state.savedOnly?'No saved spots found':'No deep spots found'}</h2><p>${state.savedOnly?'Tap a bookmark on any spot to keep it here.':'Try a different place, publisher, or category.'}</p><button class="br-pill" type="button" data-reset>explore all spots <span>↗</span></button></div>`;}
 else grid.innerHTML=shown.map(card).join('');
 grid.setAttribute('aria-busy','false');$('#shown-count').textContent=matches.length?`Showing ${pagination.start+1}–${pagination.start+shown.length} of ${matches.length} ${matches.length===1?'deep spot':'deep spots'}`:'';renderPages(pagination.totalPages,matches.length);
 writeURL();
}
function update(patch){clearTimeout(searchTimer);state={...state,query:$('#spot-search').value,...patch,page:1};render();}
function notify(message){clearTimeout(toastTimer);$('.br-toast').textContent=message;$('.br-toast').dataset.open='true';toastTimer=setTimeout(()=>$('.br-toast').dataset.open='false',2100);}
function renderPages(totalPages,total){
 const nav=$('#page-navigation');nav.hidden=totalPages<=1||!total;
 if(nav.hidden){nav.innerHTML='';return;}
 const edgePages=state.page<=2?[2,3]:state.page>=totalPages-1?[totalPages-2,totalPages-1]:[];
 const numbers=[...new Set([1,...edgePages,state.page-1,state.page,state.page+1,totalPages])].filter(n=>n>=1&&n<=totalPages).sort((a,b)=>a-b);
 const pageButton=n=>`<button type="button" data-page="${n}" aria-label="Page ${n}" ${n===state.page?'aria-current="page"':''}>${n}</button>`;
 const parts=[];numbers.forEach((n,i)=>{if(i&&n-numbers[i-1]>1)parts.push('<span class="br-page-gap" aria-hidden="true">…</span>');parts.push(pageButton(n));});
 nav.innerHTML=`<button type="button" class="br-page-direction br-page-prev" data-page="${state.page-1}" aria-label="Previous page" ${state.page===1?'disabled':''}>← <span>Previous</span></button><div class="br-page-numbers">${parts.join('')}</div><button type="button" class="br-page-direction br-page-next" data-page="${state.page+1}" aria-label="Next page" ${state.page===totalPages?'disabled':''}><span>Next</span> →</button>`;
}
function showPage(page){if(page===state.page)return;clearTimeout(searchTimer);state.query=$('#spot-search').value;state.page=page;writeURL(true);render();$('#browse-results').focus({preventScroll:true});$('.br-collection').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
document.addEventListener('click',event=>{
 const pageButton=event.target.closest('[data-page]');if(pageButton&&!pageButton.disabled)showPage(Number(pageButton.dataset.page));
 const category=event.target.closest('[data-category]');if(category)update({category:category.dataset.category});
 const view=event.target.closest('[data-view]');if(view){state.view=view.dataset.view;sync();writeURL();}
 if(event.target.closest('[data-reset]'))update({query:'',category:'all',savedOnly:false});
 const clear=event.target.closest('[data-clear]');if(clear)update({[clear.dataset.clear]:clear.dataset.clear==='category'?'all':clear.dataset.clear==='savedOnly'?false:''});
 const button=event.target.closest('[data-save]');if(button){const id=button.dataset.save;const next=new Set(readIDs(savedKey));next.has(id)?next.delete(id):next.add(id);if(!writeValue(savedKey,[...next])){notify('Could not save this bookmark. Please try again.');return;}notify(next.has(id)?'saved for your next detour':'removed from saved spots');if(state.savedOnly)$('.br-saved').focus();}

});
$('#spot-search').addEventListener('input',event=>{clearTimeout(searchTimer);const query=event.target.value;searchTimer=setTimeout(()=>update({query}),150);});
$('#more-categories').addEventListener('change',event=>update({category:event.target.value||'all'}));
$('#spot-sort').addEventListener('change',event=>update({sort:event.target.value}));
$('.br-saved').addEventListener('click',()=>update({savedOnly:!state.savedOnly}));
window.addEventListener('popstate',()=>{readURL();render();{const tp=new URLSearchParams(location.search).get('theme');theme(tp==='light'||tp==='dark'?tp:document.documentElement.dataset.theme);}});
subscribeStore([savedKey],()=>{saved=new Set(readIDs(savedKey));$('#saved-count').textContent=saved.size;if(state.savedOnly&&data.length)render();else document.querySelectorAll('[data-save]').forEach(b=>{const on=saved.has(b.dataset.save);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',b.getAttribute('aria-label').replace(/^(Save|Unsave)/,on?'Unsave':'Save'));});});

readURL();sync();
try{
 const response=await fetch('/featured-spots.json');if(!response.ok)throw Error('Catalog unavailable');data=prepareCatalog(await response.json());
 const extra=[...new Set(data.flatMap(s=>s.tags))].filter(tag=>!primaryCategories.some(([,id])=>id===tag)).sort();
 $('#more-categories').insertAdjacentHTML('beforeend',extra.map(tag=>`<option value="${esc(tag)}">${esc(categoryLabel(tag))}</option>`).join(''));
 if(state.category!=='all'&&!data.some(s=>s.tags.includes(state.category)))state.category='all';
 render();
}catch{ $('#browse-results').setAttribute('aria-busy','false');$('#browse-results').innerHTML='<div class="br-empty"><h2>Unable to load deep spots</h2><p>We couldn’t load the spots. Please refresh and try again.</p><button class="br-pill" type="button" id="retry-catalog">try again ↗</button></div>';$('#retry-catalog').addEventListener('click',()=>location.reload());}
// Keep the shared footer pointed at this local redesign.
const footer=$('deepspot-cta');if(footer){footer.querySelectorAll('a[href="https://www.deepspot.io/browse"]').forEach(a=>a.href='/browse/');footer.querySelectorAll('.ds-footer-logo,.ds-footer-nav a').forEach(a=>{if(a.classList.contains('ds-footer-logo')||a.textContent.trim()==='home')a.href='/?theme='+document.documentElement.dataset.theme;});}
