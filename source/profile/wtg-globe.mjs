// Want-to-go globe (2026-10-20): a shaded halftone sphere in the site's Earth style, with the places someone wants to go as pins.
// Canvas 2D, orthographic projection. Land comes from land-mask.png (derived from the site's earth-surface.jpg).
// The globe turns slowly; drag to turn it; tap a pin to bring it to the front. The selected pin's card sits above the globe
// with a stem down to the pin (the host draws the card; this module reports where the stem should end).
const R2D=180/Math.PI,D2R=Math.PI/180;
let maskP;
const loadMask=()=>maskP??=new Promise(res=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);res({w:img.width,h:img.height,d:x.getImageData(0,0,img.width,img.height).data});};img.onerror=()=>res(null);img.src=new URL('./land-mask.png',import.meta.url).href;});

export function mountGlobe(host,{pins=[],onSelect=()=>{},onStem=()=>{}}={}){
 const cv=document.createElement('canvas');cv.className='wg-canvas';cv.setAttribute('aria-hidden','true');host.prepend(cv);
 const ctx=cv.getContext('2d');
 const calm=matchMedia('(prefers-reduced-motion: reduce)');
 let mask=null,lon0=-140,lat0=18,tLon=null,tLat=null,sel=-1,raf=0,last=0,drag=null,visible=true,size=0,dpr=1,P=pins,hits=[];
 loadMask().then(m=>{mask=m;draw();});
 const colors=()=>{const s=getComputedStyle(host);return {land:s.getPropertyValue('--wg-land').trim()||'#f5f4ee',sea:s.getPropertyValue('--wg-sea').trim()||'#3c60ff',pin:s.getPropertyValue('--wg-pin').trim()||'#07d653',ink:s.getPropertyValue('--wg-ink').trim()||'#0b1b27'};};
 const project=(lat,lon)=>{const la=lat*D2R,lo=(lon-lon0)*D2R,c0=lat0*D2R;const x=Math.cos(la)*Math.sin(lo),y=Math.cos(c0)*Math.sin(la)-Math.sin(c0)*Math.cos(la)*Math.cos(lo),z=Math.sin(c0)*Math.sin(la)+Math.cos(c0)*Math.cos(la)*Math.cos(lo);return {x,y,z};};
 const isLand=(lat,lon)=>{if(!mask)return false;let u=((lon+180)/360)%1;if(u<0)u+=1;const v=(90-lat)/180;const px=Math.min(mask.w-1,Math.floor(u*mask.w)),py=Math.min(mask.h-1,Math.max(0,Math.floor(v*mask.h)));return mask.d[(py*mask.w+px)*4]>127;};
 function fit(){dpr=Math.min(devicePixelRatio||1,2);const w=host.clientWidth,h=host.clientHeight;size=Math.max(10,Math.min(w,h*1.6));cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';}
 function geom(){const w=cv.width/dpr,h=cv.height/dpr,r=Math.min(w*.44,h*.36);return {w,h,r,cx:w/2,cy:h-r-24};}
 function draw(){
  const {w,h,r,cx,cy}=geom(),C=colors();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  /* sphere body with soft shading */
  const g=ctx.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r*1.05);g.addColorStop(0,'rgba(255,255,255,.10)');g.addColorStop(.6,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.35)');
  ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle=C.sea;ctx.globalAlpha=.16;ctx.fill();ctx.globalAlpha=1;
  /* halftone land: dot size follows lambert light from the upper left */
  const cell=Math.max(5,Math.round(r/46)),L=[-.45,-.55,.7],ll=Math.hypot(...L);
  ctx.fillStyle=C.land;
  for(let py=cy-r;py<cy+r;py+=cell)for(let px=cx-r;px<cx+r;px+=cell){
   const x=(px+cell/2-cx)/r,y=(py+cell/2-cy)/r,q=x*x+y*y;if(q>=1)continue;const z=Math.sqrt(1-q);
   /* inverse orthographic */
   const c0=lat0*D2R,lat=Math.asin(z*Math.sin(c0)-y*Math.cos(c0))*R2D,lon=lon0+Math.atan2(x,z*Math.cos(c0)+y*Math.sin(c0))*R2D;
   const lit=Math.max(0,(x*L[0]+y*L[1]+z*L[2])/ll),land=isLand(lat,lon);
   const t=land?.35+.65*lit:.12*lit;if(t<.05)continue;
   const rr=cell*.5*Math.min(1,t);ctx.globalAlpha=land?1:.5;ctx.beginPath();ctx.arc(px+cell/2,py+cell/2,rr,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle=C.land;ctx.globalAlpha=.25;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;
  /* pins */
  hits=[];let stem=null;
  P.forEach((p,i)=>{if(p.lat==null)return;const v=project(p.lat,p.lon);if(v.z<.02)return;const x=cx+v.x*r,y=cy-v.y*r,on=i===sel,s=on?1.35:1;
   ctx.globalAlpha=Math.min(1,.35+v.z);ctx.fillStyle=on?C.pin:C.land;ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-7*s,y-10*s,x-8*s,y-20*s,x,y-21*s);ctx.bezierCurveTo(x+8*s,y-20*s,x+7*s,y-10*s,x,y);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.arc(x,y-14*s,2.6*s,0,7);ctx.fillStyle=C.ink;ctx.fill();ctx.globalAlpha=1;
   hits.push({i,x,y:y-12*s,r:14});if(on)stem={x,y:y-21*s};});
  onStem(stem,{w,h});
 }
 const shortest=(a,b)=>{let d=((b-a)%360+540)%360-180;return a+d;};
 function tick(now){raf=0;if(!visible||document.hidden)return;const dt=Math.min(64,now-(last||now));last=now;
  if(drag){}else if(tLon!=null){lon0+=(tLon-lon0)*.08;lat0+=(tLat-lat0)*.08;if(Math.abs(tLon-lon0)<.05&&Math.abs(tLat-lat0)<.05){lon0=tLon;lat0=tLat;tLon=tLat=null;}}
  else if(!calm.matches)lon0+=dt*.004;
  draw();if(!calm.matches||tLon!=null||drag)raf=requestAnimationFrame(tick);}
 const kick=()=>{if(!raf)raf=requestAnimationFrame(tick);};
 function focus(i){sel=i;const p=P[i];if(p?.lat!=null){tLon=shortest(lon0,p.lon);tLat=Math.max(-50,Math.min(50,p.lat));}kick();onSelect(i);}
 cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,lon:lon0,lat:lat0,moved:false};cv.setPointerCapture(e.pointerId);});
 cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;const {r}=geom();lon0=drag.lon-dx/r*60;lat0=Math.max(-60,Math.min(60,drag.lat+dy/r*60));tLon=tLat=null;kick();});
 cv.addEventListener('pointerup',e=>{const d=drag;drag=null;if(d&&!d.moved){const b=cv.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;const h=hits.find(h=>Math.hypot(h.x-x,h.y-y)<h.r);if(h)focus(h.i);}kick();});
 cv.addEventListener('pointercancel',()=>{drag=null;});
 const ro=new ResizeObserver(()=>{fit();draw();});ro.observe(host);
 const io=new IntersectionObserver(([en])=>{visible=en.isIntersecting;kick();});io.observe(host);
 const theme=new MutationObserver(()=>draw());theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 fit();draw();kick();
 return {focus,set(p){P=p;if(sel>=P.length)sel=-1;draw();},get sel(){return sel;},stop(){cancelAnimationFrame(raf);ro.disconnect();io.disconnect();theme.disconnect();cv.remove();}};
}
