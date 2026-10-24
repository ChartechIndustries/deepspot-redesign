/* Shared dialog (2026-10-23, builder C). One modal for the whole site: big round close button (48 px hit area, sticky),
   Esc, tap outside, back button (history hash), focus trap, page behind blurred like the edit-profile dialog, phone = full-screen sheet
   that slides up and closes on a drag down. Reduced motion: no animation.
   openDialog({id,hash,kicker,title,html,opener,onClose,label}) -> {close,el}. Only one dialog is open at a time.
   Styles: ds-dialog.css (linked from the page; this module adds the link when a page forgot it). */
const FOCUS='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const X='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
let current=null;
function ensureCss(){
 if(document.querySelector('link[href*="ds-dialog.css?v=054fa378"]'))return;
 const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('./ds-dialog.css?v=054fa378',import.meta.url).pathname;document.head.append(l);
}
export function openDialog(o={}){
 if(current)current.close({silent:true});
 ensureCss();
 const d=document.createElement('dialog'),tid='ds-dlg-t-'+(o.id||'x');
 d.className='ds-dlg'+(o.className?' '+o.className:'');d.setAttribute('aria-labelledby',tid);if(o.id)d.id='ds-dlg-'+o.id;
 d.innerHTML=`<div class="ds-dlg-grab" aria-hidden="true"><i></i></div><div class="ds-dlg-scroll" tabindex="-1"><div class="ds-dlg-bar"><span class="ds-dlg-kick">${o.kicker||''}</span><button type="button" class="ds-dlg-x" aria-label="${o.label||'Close'}">${X}</button></div><div class="ds-dlg-in"><h2 id="${tid}" class="ds-dlg-h">${o.title||''}</h2>${o.html||''}</div></div>`;
 document.body.append(d);
 const sc=d.querySelector('.ds-dlg-scroll');
 let pushed=false,closed=false;
 const hash=o.hash?'#'+o.hash:'';
 if(hash&&location.hash!==hash){try{history.pushState({dsDlg:o.hash},'',location.pathname+location.search+hash);pushed=true;}catch{}}
 const finish=()=>{if(closed)return;closed=true;removeEventListener('popstate',pop);d.removeEventListener('keydown',keys);document.documentElement.classList.remove('ds-dlg-lock');
  try{d.close();}catch{}d.remove();if(current&&current.el===d)current=null;try{(o.opener||null)?.focus({preventScroll:true});}catch{}try{o.onClose?.();}catch{}};
 /* animate out, then remove */
 const leave=()=>{if(closed)return;if(calm()){finish();return;}d.classList.add('is-leaving');setTimeout(finish,230);};
 const pop=()=>{if(hash&&location.hash!==hash)leave();};
 /* UI close: pop the history entry we pushed (popstate then closes), else just drop the hash we were deep-linked with */
 const close=(opt={})=>{if(closed)return;
  if(opt.silent){finish();return;}
  if(pushed){pushed=false;try{history.back();}catch{leave();}setTimeout(()=>{if(!closed)leave();},300);}
  else{if(hash&&location.hash===hash){try{history.replaceState(history.state,'',location.pathname+location.search);}catch{}}leave();}};
 addEventListener('popstate',pop);
 d.addEventListener('cancel',e=>{e.preventDefault();close();});
 d.querySelector('.ds-dlg-x').addEventListener('click',()=>close());
 /* tap outside: a click on the backdrop lands on the dialog element with coordinates outside its box */
 d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
 /* focus trap */
 const keys=e=>{if(e.key!=='Tab')return;const f=[...d.querySelectorAll(FOCUS)].filter(x=>x.offsetParent!==null);if(!f.length){e.preventDefault();return;}
  const a=f[0],z=f[f.length-1];if(e.shiftKey&&(document.activeElement===a||document.activeElement===sc||document.activeElement===d)){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}};
 d.addEventListener('keydown',keys);
 /* phone sheet: drag the handle or the bar down (or pull down at the top of the text) to close */
 let y0=null,dy=0,t0=0,drag=false;
 const sheet=()=>matchMedia('(max-width:650px)').matches;
 const down=e=>{if(!sheet())return;const onBar=e.target.closest('.ds-dlg-grab,.ds-dlg-bar');if(!onBar&&sc.scrollTop>0)return;if(e.target.closest('.ds-dlg-x'))return;y0=e.clientY;dy=0;t0=performance.now();drag=false;};
 const move=e=>{if(y0===null)return;const m=e.clientY-y0;if(!drag){if(m>8){drag=true;try{d.setPointerCapture(e.pointerId);}catch{}d.classList.add('is-drag');}else if(m<-8){y0=null;return;}else return;}
  dy=Math.max(0,m);d.style.transform=`translateY(${dy}px)`;};
 const up=()=>{if(y0===null)return;const fast=dy/(performance.now()-t0)>.6;y0=null;d.classList.remove('is-drag');
  if(drag&&(dy>120||fast&&dy>40)){d.style.transition='transform .22s ease-in';d.style.transform='translateY(110%)';close();}
  else{d.style.transform='';}drag=false;};
 d.addEventListener('pointerdown',down);d.addEventListener('pointermove',move);d.addEventListener('pointerup',up);d.addEventListener('pointercancel',up);
 /* pull-down at the very top of the text (touch): the scroll area would rubber-band, so take over */
 let ty=null;d.addEventListener('touchstart',e=>{ty=sheet()&&sc.scrollTop<=0&&!e.target.closest('.ds-dlg-grab,.ds-dlg-bar')?e.touches[0].clientY:null;},{passive:true});
 d.addEventListener('touchmove',e=>{if(ty===null)return;const m=e.touches[0].clientY-ty;if(m>0&&sc.scrollTop<=0&&e.cancelable)e.preventDefault();},{passive:false});
 document.documentElement.classList.add('ds-dlg-lock');
 d.addEventListener('animationend',e=>{if(e.target===d&&!d.classList.contains('is-leaving'))d.classList.add('is-settled');});
 d.showModal();
 current={el:d,close};
 return current;
}
export const dialogOpen=()=>!!current;
