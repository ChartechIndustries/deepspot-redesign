import {accountKey,readAccount,normalizeAccount,artMaxPng} from '../site/account-state.mjs?v=1c064097';
import {escapeHTML as esc} from './identity.mjs?v=38b679eb';
// Passport art pad. Strokes live on a 640x180 canvas (wide and short, like the passport's mark line) shown at the column width; the paper and dot grid are CSS.
// v2.2: on save the drawing is cropped to its ink (+ small padding) so the card's mark line can scale it up to fill the line.
export const padSize={w:640,h:180};
export const inkPad=6;
/* crop a canvas to the bounds of its drawn ink (alpha > 8) + padding; returns a PNG data URL, or '' when blank */
export function inkCanvas(cv,pad=inkPad){
 const W=cv.width,H=cv.height,d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
 let x0=W,y0=H,x1=-1,y1=-1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return null;
 x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
 const c=document.createElement('canvas');c.width=x1-x0+1;c.height=y1-y0+1;c.getContext('2d').drawImage(cv,x0,y0,c.width,c.height,0,0,c.width,c.height);
 return c;
}
export const inkURL=(cv,pad=inkPad)=>inkCanvas(cv,pad)?.toDataURL('image/png')||'';
const colors=[['black','#111111'],['white','#ffffff'],['gray','#8a8f98'],['red','#e5302d'],['orange','#f28a1a'],['yellow','#f7d21b'],['green','#3fb44a'],['teal','#19b3b0'],['blue','#2a5bd7'],['indigo','#4b3fa8'],['pink','#f07db5'],['brown','#7b4a26']];
const icons={
 free:'<path d="m4 20 1-5L16 4l4 4L9 19Z"/><path d="m13 7 4 4"/>',
 pixel:'<path d="M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4Z"/><path d="M14 17h6m-3-3v6"/>',
 small:'<circle cx="12" cy="12" r="2"/>',
 big:'<circle cx="12" cy="12" r="6.5"/>',
 erase:'<path d="m4 15 9-9 7 7-6 6H8Z"/><path d="m9 10 7 7M10 20h10"/>',
 undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
 clear:'<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
 save:'<path d="m5 12 5 5 9-10"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
const tool=(id,label,pressed,cls='')=>`<button type="button" class="sp-chip${cls}" data-tool="${id}"${pressed===undefined?'':` aria-pressed="${pressed}"`}>${icon(id)}<span>${label}</span></button>`;
export function padHTML(profile){
 const edit=!!profile.localPreview,name=esc(profile.name);
 const top=`<div class="pp-id-top"><span>deepspot · ${edit?'my mark':'their mark'}</span><span>${edit?'draw · save':'read only'}</span></div>`;
 if(!edit&&!profile.signatureArt)return `<div class="pp-card pp-markcard" id="pp-pad" data-mode="empty">${top}<div class="sp-paper sp-empty"><svg viewBox="0 0 24 24" aria-hidden="true">${icons.free}</svg><strong>no art yet.</strong><span>${name} hasn’t drawn a mark on this passport.</span></div></div>`;
 const paper=`<div class="sp-paper">${edit?`<canvas width="${padSize.w}" height="${padSize.h}" role="img" aria-label="Drawing canvas for your passport art. Draw with a mouse, finger or pen."></canvas>`:`<img src="${esc(profile.signatureArt)}" alt="${name}’s passport drawing" width="${padSize.w}" height="${padSize.h}">`}</div>`;
 return `<div class="pp-card pp-markcard" id="pp-pad" data-mode="${edit?'edit':'view'}">${top}${paper}${edit?`<div class="sp-tools" role="toolbar" aria-label="Drawing tools"><div class="sp-group" role="group" aria-label="Brush">${tool('free','smooth',true)}${tool('pixel','pixel',false)}${tool('erase','eraser',false)}</div><div class="sp-group" role="group" aria-label="Size">${tool('small','small',true)}${tool('big','big',false)}</div><div class="sp-group" role="group" aria-label="Actions">${tool('undo','undo')}${tool('clear','clear')}${tool('save','save',undefined,' sp-save')}</div></div><div class="sp-palette" role="group" aria-label="Colors">${colors.map(([n,c],i)=>`<button type="button" class="sp-swatch" style="--c:${c}" data-color="${c}" aria-label="${n}" title="${n}" aria-pressed="${i===0}"></button>`).join('')}</div><p class="sp-status" role="status" aria-live="polite">Pick a brush and draw.</p>`:''}</div>`;
}
export function initPad(root,{art,onSave}={}){
 const cv=root.querySelector('canvas');if(!cv)return;
 const ctx=cv.getContext('2d',{willReadFrequently:true}),{w:W,h:H}=padSize,$=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const st={mode:'free',big:false,erase:false,color:colors[0][1]},undo=[];let drag=null,dirty=false,clearTimer;
 const status=text=>$('.sp-status').textContent=text;
 const press=(sel,on)=>$$(sel).forEach(b=>b.setAttribute('aria-pressed',String(on(b))));
 const sync=()=>{$('[data-tool=undo]').disabled=!undo.length;};
 const arm=on=>{const b=$('[data-tool=clear]');clearTimeout(clearTimer);b.dataset.confirm=on?'true':'';b.querySelector('span').textContent=on?'sure?':'clear';if(on){status('Press clear again to erase everything.');clearTimer=setTimeout(()=>{arm(false);status('Clear cancelled.');},3500);}};
 const push=()=>{undo.push(ctx.getImageData(0,0,W,H));if(undo.length>20)undo.shift();sync();};
 const pos=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height,p:e.pointerType==='pen'&&e.pressure>0?.35+e.pressure*.9:1};};
 const width=p=>(st.erase?(st.big?24:10):(st.big?11:4))*p;
 const cells=(cx,cy)=>{const n=st.erase?(st.big?4:2):(st.big?2:1),o=n>1?n/2:0;if(st.erase)ctx.clearRect((cx-o)*4,(cy-o)*4,n*4,n*4);else ctx.fillRect((cx-o)*4,(cy-o)*4,n*4,n*4);};
 const cellAt=p=>[Math.floor(p.x/4),Math.floor(p.y/4)];
 function line(a,b){let [x0,y0]=a;const [x1,y1]=b,dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;for(;;){cells(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}}
 const style=()=>{ctx.globalCompositeOperation=st.erase&&st.mode==='free'?'destination-out':'source-over';ctx.strokeStyle=ctx.fillStyle=st.erase?'#000':st.color;ctx.lineCap=ctx.lineJoin='round';};
 function down(e){
  if(e.button>0||drag)return;e.preventDefault();cv.setPointerCapture(e.pointerId);arm(false);push();style();
  const p=pos(e);drag={id:e.pointerId,last:p,mid:p,cell:cellAt(p)};
  if(st.mode==='pixel')cells(...drag.cell);else{ctx.lineWidth=width(p.p);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y);ctx.stroke();}
  dirty=true;
 }
 function move(e){
  if(!drag||e.pointerId!==drag.id)return;
  const list=e.getCoalescedEvents?.();
  for(const ev of (list&&list.length?list:[e])){
   const p=pos(ev);
   if(st.mode==='pixel'){const c=cellAt(p);if(c[0]!==drag.cell[0]||c[1]!==drag.cell[1]){line(drag.cell,c);drag.cell=c;}}
   else{const mid={x:(drag.last.x+p.x)/2,y:(drag.last.y+p.y)/2};ctx.lineWidth=width(p.p);ctx.beginPath();ctx.moveTo(drag.mid.x,drag.mid.y);ctx.quadraticCurveTo(drag.last.x,drag.last.y,mid.x,mid.y);ctx.stroke();drag.mid=mid;}
   drag.last=p;
  }
 }
 function up(e){
  if(!drag||e.pointerId!==drag.id)return;
  if(st.mode==='free'){ctx.lineWidth=width(drag.last.p);ctx.beginPath();ctx.moveTo(drag.mid.x,drag.mid.y);ctx.lineTo(drag.last.x,drag.last.y);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';drag=null;status('Unsaved. Press save to keep it.');
 }
 cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
 const blank=()=>{const d=ctx.getImageData(0,0,W,H).data;for(let i=3;i<d.length;i+=4)if(d[i])return false;return true;};
 function encode(){const c=inkCanvas(cv);if(!c)return '';let url=c.toDataURL('image/png');if(url.length<artMaxPng)return url;const t=document.createElement('canvas');t.width=Math.max(1,c.width>>1);t.height=Math.max(1,c.height>>1);t.getContext('2d').drawImage(c,0,0,t.width,t.height);url=t.toDataURL('image/png');return url.length<artMaxPng?url:'';}
 function save(){
  const empty=blank(),url=empty?'':encode();
  if(!empty&&!url){status('Too detailed to save. Clear a little and try again.');return;}
  try{const draft=readAccount();localStorage.setItem(accountKey,JSON.stringify(normalizeAccount({...draft,signatureArt:url})));}catch{status('Could not save. Browser storage is full or blocked.');return;}
  dirty=false;onSave?.(url);status(empty?'Drawing removed from your passport.':'Saved to your passport.');
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-tool],[data-color]');if(!b)return;const t=b.dataset.tool;
  if(b.dataset.color){st.color=b.dataset.color;st.erase=false;press('[data-color]',x=>x===b);press('[data-tool=erase]',()=>false);return;}
  if(t!=='clear')arm(false);
  if(t==='free'||t==='pixel'){st.mode=t;press('[data-tool=free],[data-tool=pixel]',x=>x===b);}
  else if(t==='small'||t==='big'){st.big=t==='big';press('[data-tool=small],[data-tool=big]',x=>x===b);}
  else if(t==='erase'){st.erase=!st.erase;b.setAttribute('aria-pressed',String(st.erase));}
  else if(t==='undo'){const s=undo.pop();if(s){ctx.putImageData(s,0,0);dirty=true;status('Undone.');}sync();}
  else if(t==='clear'){if(b.dataset.confirm==='true'){arm(false);push();ctx.clearRect(0,0,W,H);dirty=true;status('Cleared. Press save to keep it.');}else if(blank())status('The pad is already empty.');else arm(true);}
  else if(t==='save')save();
 });
 root.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();$('[data-tool=undo]').click();}});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 if(art){const img=new Image();img.onload=()=>{const m=10,k=Math.min((W-2*m)/img.naturalWidth,(H-2*m)/img.naturalHeight),w=img.naturalWidth*k,h=img.naturalHeight*k;ctx.drawImage(img,(W-w)/2,(H-h)/2,w,h);};img.src=art;}
 sync();
}
