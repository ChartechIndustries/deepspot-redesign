import {esc,icon} from './core.mjs';
export function galleryMarkup(photos){
 if(!photos?.length)return '';
 return `<section class="ds-photo-gallery" aria-label="Location photographs"><div class="ds-section-heading"><h2>take a closer look.</h2><span>${photos.length} ${photos.length===1?'photograph':'photographs'}</span></div><div class="ds-photo-thumbs">${photos.slice(0,3).map((p,i)=>`<button type="button" data-gallery-open="${i}" aria-label="Open photograph ${i+1} of ${photos.length}"><img src="${esc(p.src)}" alt="${esc(p.alt||'Location photograph')}" loading="lazy"><span>${i===2&&photos.length>3?'view all '+photos.length:'view photo '+(i+1)} ↗</span></button>`).join('')}</div></section>`;
}
export function wireGallery(root,photos){
 if(!photos?.length)return;
 root.querySelectorAll('[data-gallery-open]').forEach(opener=>opener.addEventListener('click',()=>{
  let index=Number(opener.dataset.galleryOpen)||0;
  const dialog=document.createElement('dialog');dialog.className='ds-photo-dialog';dialog.setAttribute('aria-label','Location photographs');
  dialog.innerHTML=`<header><span role="status" data-photo-count></span><button type="button" data-photo-close aria-label="Close photographs">close ×</button></header><div class="ds-photo-stage"><button type="button" data-photo-previous aria-label="Previous photograph">←</button><img alt=""><button type="button" data-photo-next aria-label="Next photograph">→</button></div><footer data-photo-caption></footer>`;
  const show=()=>{const p=photos[index],img=dialog.querySelector('img');img.src=p.src;img.alt=p.alt||'Location photograph';dialog.querySelector('[data-photo-count]').textContent=`${index+1} / ${photos.length}`;dialog.querySelector('[data-photo-caption]').innerHTML=p.links?.length?'Photo credit: '+p.links.map(l=>`<a href="${esc(l.url)}" data-original target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' / '):'Photography from the original DeepSpot entry.';};
  const move=direction=>{index=(index+direction+photos.length)%photos.length;show();};
  dialog.querySelector('[data-photo-previous]').onclick=()=>move(-1);dialog.querySelector('[data-photo-next]').onclick=()=>move(1);
  dialog.querySelectorAll('[data-photo-previous],[data-photo-next]').forEach(b=>b.hidden=photos.length<2);
  dialog.querySelector('[data-photo-close]').onclick=()=>dialog.close();
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{dialog.remove();opener.focus({preventScroll:true});});
  document.body.append(dialog);show();dialog.showModal();
 }));
}
