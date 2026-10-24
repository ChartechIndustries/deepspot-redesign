/* Small card variants of local photos (made by tools/make_card_images.py). Originals stay for full-size views.
   cardSet(src) -> {src, srcset} for a local photo that has variants, else {src}.   imgAttrs(src,sizes) -> ' src=".." srcset=".." sizes=".."'
   The optional first path part is the site base (the GitHub Pages build serves the site under /<repo>/). */
const LOCAL=/^(\/[^/]+)?\/(spots|editorial-assets(?:\/ext)?|site\/assets)\/([^/?#]+)\.(?:jpe?g|png|webp)$/i;
export function cardSet(src){
 const m=typeof src==='string'&&LOCAL.exec(src);
 if(!m||/\/editorial-assets\/cards\//.test(src))return {src};
 const base=`${m[1]||''}/editorial-assets/cards/${m[3]}`;
 return {src:`${base}.webp`,srcset:`${base}-400.webp 400w, ${base}.webp 800w`};
}
export function imgAttrs(src,sizes='(max-width:700px) 92vw, 440px'){
 const c=cardSet(src);const e=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
 return ` src="${e(c.src)}"${c.srcset?` srcset="${c.srcset}" sizes="${e(sizes)}"`:''}`;
}
