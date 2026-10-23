(async()=>{
const {readIDs,writeValue,subscribeStore}=await import('/site/storage.mjs?v=f4e726a0');
const categories=[['all',null],['deep spot choice','DEEP SPOT CHOICE'],['weird/funny','WEIRD/FUNNY'],['history','HISTORICAL'],['roadside stops','ROADSIDE STOPS'],['art/sculpture','ART/SCULPTURE']];
const curatedOrder=[
 '/blog/frozen-aquarium-in-miyagi',
 '/blog/tochigi-underground-quarry',
 '/blog/south-london-s-most-notable-street-art-location',
 '/blog/berlin-s-hill-of-nazi-rubble-cold-war-spies-and-graffiti',
 '/blog/osaka-s-candy-colored-garbage-palace',
 '/blog/the-place-in-malta-where-people-have-been-making-salt-for-centuries'
];
const covers={
 'frozen-aquarium-in-miyagi':{headline:'every fish here is dead.',place:'Kesennuma, Japan',position:'center'},
 'tochigi-underground-quarry':{headline:'a cathedral, carved underground.',place:'Utsunomiya, Japan',position:'center 53%'},
 'south-london-s-most-notable-street-art-location':{headline:'london’s underground canvas.',place:'Leake Street, London',position:'center 55%'}
};
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
class FeaturedSpots extends HTMLElement{
 async connectedCallback(){
  if(this.ready)return;
  this.ready=true;this.active=0;this.saved=new Set();
  const bannerTag=new URLSearchParams(location.search).get('banners')==='studies'?'deepspot-interlude':'deepspot-news';
  if(!document.querySelector(bannerTag))this.before(document.createElement(bannerTag));
  this.saved=new Set(readIDs('deepspot-saved-spots'));
  this.unsubscribeSaved=subscribeStore(['deepspot-saved-spots'],()=>{this.saved=new Set(readIDs('deepspot-saved-spots'));this.querySelectorAll('[data-fs-save]').forEach(b=>{const on=this.saved.has(b.dataset.fsSave);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',b.getAttribute('aria-label').replace(/^(Save|Unsave)/,on?'Unsave':'Save'));});});
  try{
   const response=await fetch('/featured-spots.json',{cache:'no-store'});if(!response.ok)throw Error();
   this.profiles=await import('/profile/identity.mjs?v=38b679eb');this.img=await import('/site/img.mjs?v=61371a3b');this.data=await response.json();this.render();if(location.hash==='#fs-heading')this.querySelector('.fs-heading').scrollIntoView({block:'start'});
  }catch{this.innerHTML='<p class="fs-error">Spots could not load. Please refresh.</p>';return}
  this.addEventListener('click',event=>{
   const tab=event.target.closest('[data-fs-tab]'),save=event.target.closest('[data-fs-save]');
   if(tab){this.active=Number(tab.dataset.fsTab);this.render();this.querySelector('[aria-selected=true]').focus({preventScroll:true})}
   if(save){
    const id=save.dataset.fsSave;
    const next=new Set(readIDs('deepspot-saved-spots'));next.has(id)?next.delete(id):next.add(id);
    if(!writeValue('deepspot-saved-spots',[...next])){let status=this.querySelector('.fs-save-status');if(!status){status=document.createElement('p');status.className='fs-save-status';status.setAttribute('role','status');this.append(status);}status.textContent='Could not save this bookmark. Please try again.';return;}
    this.saved=next;
    save.setAttribute('aria-pressed',this.saved.has(id));
    save.setAttribute('aria-label',(this.saved.has(id)?'Unsave ':'Save ')+this.data.find(spot=>spot.id===id).title);
   }
  });
  this.addEventListener('keydown',event=>{
   if(!event.target.matches('[role=tab]'))return;
   if(event.key==='ArrowRight')this.active=(this.active+1)%6;
   else if(event.key==='ArrowLeft')this.active=(this.active+5)%6;
   else if(event.key==='Home')this.active=0;
   else if(event.key==='End')this.active=5;
   else return;
   event.preventDefault();this.render();this.querySelector('[aria-selected=true]').focus({preventScroll:true});
  });
 }
 disconnectedCallback(){this.countObserver?.disconnect();this.unsubscribeSaved?.()}
 countMarkup(count){
  const settled=this.countAnimated||matchMedia('(prefers-reduced-motion: reduce)').matches;
  return [...String(count)].map((digit,index)=>{
   const end=20+Number(digit);
   return `<span class="fs-digit"><span class="fs-digit-track ${settled?'is-settled':''}" style="--digit:${end};--delay:${index*90}ms">${Array.from({length:end+1},(_,n)=>`<span>${n%10}</span>`).join('')}</span></span>`;
  }).join('');
 }
 observeCount(){
  this.countObserver?.disconnect();
  if(this.countAnimated||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  this.countObserver=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   this.countAnimated=true;
   this.querySelectorAll('.fs-digit-track').forEach(track=>track.classList.add('is-rolling'));
   this.countObserver.disconnect();
  },{threshold:.55});
  this.countObserver.observe(this.querySelector('.fs-heading'));
 }
 selected(){
  const tag=categories[this.active][1];
  const ranked=this.data.filter(spot=>!tag||spot.tags.includes(tag)).sort((a,b)=>{
   const rank=spot=>{
    const index=curatedOrder.indexOf(spot.id);
    return (spot.image?100:0)+(index<0?0:50-index)+(spot.publisher?1:0);
   };
   return rank(b)-rank(a);
  });
  return ranked.slice(0,6);
 }
 card(spot,index){
  const feature=index<3,cover=covers[spot.id.split('/').pop()],title=feature&&cover?cover.headline:spot.title;
  const place=cover?.place||spot.place;
  const link='https://www.deepspot.io'+spot.id;
  return `<article class="fs-card ${feature?'fs-feature':'fs-standard'} ${index===0?'fs-main-feature':''}">
   <div class="fs-photo">
    ${spot.image?`<img${this.img.imgAttrs(spot.image,feature?'(max-width:700px) 92vw, 640px':'(max-width:700px) 92vw, 360px')} alt="${escape(place)}" loading="lazy" style="object-position:${cover?.position||'center'}">`:`<div class="fs-no-photo"><span>deep<br>spot.</span><small>photo unavailable</small></div>`}
    <button class="fs-save" data-fs-save="${escape(spot.id)}" aria-label="${this.saved.has(spot.id)?'Unsave':'Save'} ${escape(spot.title)}" aria-pressed="${this.saved.has(spot.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg></button>
    ${!feature&&spot.tags.includes('DEEP SPOT CHOICE')?'<span class="fs-choice">deep spot choice</span>':''}
   </div>
   <div class="fs-copy">
    ${feature?`<p class="fs-place">${escape(place)}</p>`:''}
    <h3><a href="${escape(link)}" target="_blank" rel="noopener" aria-label="${escape(spot.title)}">${escape(title)}</a></h3>
    ${feature?'':`<p class="fs-place">${escape(place)}</p><p class="fs-description">${escape(spot.description)}</p>`}
    <footer><span class="fs-credit">${spot.publisher?this.profiles.authorLink(spot.publisher,{from:location.pathname+location.search+'#fs-heading'}):'publisher credit unavailable'}</span><a class="fs-arrow" href="${escape(link)}" target="_blank" rel="noopener" aria-label="Read ${escape(spot.title)}">↗</a></footer>
   </div>
  </article>`;
 }
 render(){
  const spots=this.selected();
  const count=this.data.filter(spot=>!spot.title.startsWith('PART OF:')).length;
  this.innerHTML=`<section class="fs-section" aria-labelledby="fs-heading"><div class="fs-section-heading"><h2 class="fs-heading" id="fs-heading" aria-label="discover ${count} deepspots"><span aria-hidden="true">discover</span><span class="fs-count" aria-hidden="true">${this.countMarkup(count)}</span><span class="fs-heading-word" aria-hidden="true">deepspots</span></h2></div><div class="fs-box">
   <div class="fs-tabs" role="tablist" aria-label="Deep spot categories">${categories.map(([label],index)=>`<button id="fs-tab-${index}" role="tab" aria-selected="${index===this.active}" aria-controls="fs-panel" tabindex="${index===this.active?0:-1}" data-fs-tab="${index}">${label}</button>`).join('')}</div>
   <div id="fs-panel" role="tabpanel" aria-labelledby="fs-tab-${this.active}" class="fs-grid">
    <div class="fs-lead-grid">${spots.slice(0,3).map((spot,index)=>this.card(spot,index)).join('')}</div>
    <div class="fs-secondary-grid">${spots.slice(3).map((spot,index)=>this.card(spot,index+3)).join('')}</div>
   </div>
   <div class="fs-browse-link"><a href="/browse/">browse all deep spots ↗</a></div>
  </div></section>`;
  this.observeCount();
 }
}
customElements.define('deepspot-featured',FeaturedSpots);
})();
