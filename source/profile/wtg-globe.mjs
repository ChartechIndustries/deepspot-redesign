// Want-to-go globe (2026-10-20 v2): the home page Earth — same fragment shader, earth-day.jpg + earth-clouds.jpg,
// colour halftone glyphs — with the places someone wants to go as pins in an HTML layer on top.
// Drag to turn, scroll / pinch / +− to zoom, tap a pin to bring it to the front. Turns slowly when idle.
const D2R=Math.PI/180;
const VS='attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}';
const FS=`precision highp float;
uniform sampler2D earth;
uniform sampler2D clouds;
uniform float time;
uniform float cloudAmt;
uniform vec2 resolution;
uniform vec2 viewport;
uniform vec2 center;
uniform float radius;
uniform float yaw;
uniform float pitch;
uniform float cell;
uniform vec3 bg;
uniform vec3 glowC;
uniform vec3 paper;
uniform float useSrc;
uniform float dayStyle;
float bayer2(vec2 p){return p.y<.5?(p.x<.5?0.:2.):(p.x<.5?3.:1.);}
float glyph(float s,float u,float v){
 bool cc=(u>=2.&&u<=3.&&v>=2.&&v<=3.);
 bool d4=((u==1.||u==4.)&&(v==1.||v==4.));
 bool in4=(u>=1.&&u<=4.&&v>=1.&&v<=4.);
 bool ring=in4&&(u==1.||u==4.||v==1.||v==4.);
 if(s<.5)return 0.;
 if(s<1.5)return cc?1.:0.;
 if(s<2.5)return d4?1.:0.;
 if(s<3.5)return ring?1.:0.;
 if(s<4.5)return in4?1.:0.;
 if(s<5.5)return in4?0.:1.;
 if(s<6.5)return d4?0.:1.;
 if(s<7.5)return cc?0.:1.;
 return 1.;
}
vec3 inkRamp(float t){
 vec3 k0=vec3(11.,15.,24.)/255.,k1=vec3(24.,48.,86.)/255.,k2=vec3(42.,108.,174.)/255.,k3=vec3(117.,164.,206.)/255.,k4=vec3(132.,179.,217.)/255.,k5=vec3(146.,193.,228.)/255.,k6=vec3(160.,209.,243.)/255.,k7=vec3(189.,224.,246.)/255.,k8=vec3(236.,247.,255.)/255.;
 float x=t*8.;
 if(x<1.)return mix(k0,k1,x);
 if(x<2.)return mix(k1,k2,x-1.);
 if(x<3.)return mix(k2,k3,x-2.);
 if(x<4.)return mix(k3,k4,x-3.);
 if(x<5.)return mix(k4,k5,x-4.);
 if(x<6.)return mix(k5,k6,x-5.);
 if(x<7.)return mix(k6,k7,x-6.);
 return mix(k7,k8,x-7.);
}
void main(){
 vec2 pixel=vec2(gl_FragCoord.x,resolution.y-gl_FragCoord.y)*viewport/resolution;
 vec2 grid=floor(pixel/cell),samplePoint=(grid+.5)*cell;
 vec2 n=vec2(samplePoint.x-center.x,center.y-samplePoint.y)/radius;
 float rr=dot(n,n);
 if(rr>=1.){
  float dd=sqrt(rr)-1.;
  vec2 nn=n/sqrt(rr);
  float le=smoothstep(.05,.85,max(0.,dot(vec3(nn,0.),vec3(0.,.62,.78))));
  float glow=exp(-dd*24.)*le*.32;
  gl_FragColor=vec4(mix(bg,glowC,glow),1.);return;
 }
 float z=sqrt(1.-rr);
 vec2 tilted=vec2(n.y*cos(pitch)+z*sin(pitch),z*cos(pitch)-n.y*sin(pitch));
 vec2 uv=vec2(fract((atan(n.x,tilted.y)+yaw)/6.28318530718+.5),.5-asin(clamp(tilted.x,-1.,1.))/3.14159265359);
 vec3 surface=texture2D(earth,uv).rgb;
 float ct=time;
 vec2 cuv=uv+vec2(ct*.0012,0.)+vec2(sin(uv.y*17.+ct*.55)*.0035+sin(uv.x*29.-ct*.4)*.002,cos(uv.x*13.+ct*.5)*.003+sin(uv.y*31.+ct*.35)*.0015);
 cuv=vec2(fract(cuv.x),clamp(cuv.y,0.,1.));
 float cl=texture2D(clouds,cuv).r*cloudAmt;
 surface=1.-(1.-surface)*(1.-cl);
 float lum=dot(surface,vec3(.2126,.7152,.0722));
 float lam=max(0.,dot(vec3(n,z),vec3(0.,.62,.78)));float light=smoothstep(.22,.86,lam);
 float rim=pow(1.-z,2.5);
 float rimLit=pow(1.-z,4.)*smoothstep(.1,.72,lam);
 float tone=pow(clamp((lum-.07)/(useSrc>.5?.95:.72),0.,1.),1.05)*max(light,min(1.,rim*1.1));
 tone=clamp(tone+rimLit*.28,0.,1.);
 vec3 ink=inkRamp(tone);
 vec3 paperC=mix(paper,vec3(.08,.72,1.),rimLit*.85);
 if(useSrc>.5){
  float shade=max(light,min(1.,rim*1.1));
  vec3 g=vec3(lum);
  vec3 sat=clamp(mix(g,surface,1.9)*1.15,0.,1.);
  ink=mix(bg,sat,smoothstep(0.,.6,shade));
  paperC=mix(paper,sat,.4);
 }
 ink=mix(ink,vec3(30.,190.,240.)/255.,rimLit*(useSrc>.5?.55:.85));
 float threshold=(4.*bayer2(mod(grid,2.))+bayer2(mod(floor(grid/2.),2.))+.5)/16.;
 float s=floor((1.-tone)*8.+threshold);
 vec2 f=floor(fract(pixel/cell)*6.);
 float cov=glyph(s,f.x,f.y);
 vec3 col=mix(paperC,ink,cov);
 if(dayStyle>.5){
  // Shrink individual marks continuously instead of deleting square tiles.
  float edge=smoothstep(0.,cell*3.5,radius*(1.-sqrt(rr)));
  vec2 local=fract(pixel/cell)-.5;
  float aa=viewport.x/resolution.x/cell;
  float dotRadius=.72*sqrt(edge);
  float mark=1.-smoothstep(max(0.,dotRadius-aa),dotRadius+aa,length(local));
  float mask=mix(mark,1.,smoothstep(.68,1.,edge))*smoothstep(0.,.13,edge);
  col=mix(bg,col,mask);
 }
 gl_FragColor=vec4(col,1.);
}`;
const imgP={};const img=src=>imgP[src]??=new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});
const themeColors=()=>document.documentElement.dataset.theme==='light'?{bg:[246/255,243/255,236/255],glow:[200/255,214/255,255/255],paper:[1,1,1]}:{bg:[12/255,16/255,27/255],glow:[24/255,44/255,110/255],paper:[1,1,1]};

export function mountGlobe(host,{pins=[],onSelect=()=>{}}={}){
 const cv=document.createElement('canvas');cv.className='wg-canvas';cv.setAttribute('aria-hidden','true');host.prepend(cv);
 const layer=document.createElement('div');layer.className='wg-pins';host.append(layer);
 const zoomUI=document.createElement('div');zoomUI.className='wg-zoom';zoomUI.innerHTML='<button type="button" data-z="1" aria-label="Zoom in">+</button><button type="button" data-z="-1" aria-label="Zoom out">−</button>';host.append(zoomUI);
 const gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false});
 const calm=matchMedia('(prefers-reduced-motion: reduce)');
 let P=pins,sel=-1,yaw=139,pitch=25,zoom=1,tYaw=null,tPitch=null,tZoom=null,raf=0,last=0,visible=true,drag=null,touches=new Map(),pinch=null,ready=false,U={},dpr=1,W=0,H=0;
 if(!gl){host.classList.add('wg-nogl');}
 else{
  const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  for(const k of ['resolution','viewport','center','radius','yaw','pitch','cell','bg','glowC','paper','useSrc','dayStyle','clouds','time','cloudAmt','earth'])U[k]=gl.getUniformLocation(pr,k);
  const tex=(unit,im,wrap)=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wrap);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   if(im)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0]));};
  Promise.all([img('/earth-day.jpg'),img('/earth-clouds.jpg')]).then(([e,c])=>{tex(0,e,gl.CLAMP_TO_EDGE);tex(1,c,gl.REPEAT);gl.uniform1i(U.earth,0);gl.uniform1i(U.clouds,1);gl.activeTexture(gl.TEXTURE0);ready=!!e;kick();});
 }
 const geom=()=>{const r=Math.min(W,H)*.4*zoom;return {r,cx:W/2,cy:H/2};};
 function fit(){dpr=Math.min(devicePixelRatio||1,2);W=host.clientWidth;H=host.clientHeight;cv.width=Math.max(1,Math.round(W*dpr));cv.height=Math.max(1,Math.round(H*dpr));cv.style.width=W+'px';cv.style.height=H+'px';}
 const proj=(lat,lon)=>{const {r,cx,cy}=geom(),f=lat*D2R,a=lon*D2R-yaw*D2R,p=pitch*D2R,nx=Math.cos(f)*Math.sin(a),tx=Math.sin(f),ty=Math.cos(f)*Math.cos(a),ny=tx*Math.cos(p)-ty*Math.sin(p),z=tx*Math.sin(p)+ty*Math.cos(p);return {x:cx+nx*r,y:cy-ny*r,z};};
 function drawGL(now){
  if(!gl||!ready)return;const {r,cx,cy}=geom(),C=themeColors();
  gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(U.resolution,cv.width,cv.height);gl.uniform2f(U.viewport,W,H);gl.uniform2f(U.center,cx,cy);gl.uniform1f(U.radius,r);
  gl.uniform1f(U.yaw,yaw*D2R);gl.uniform1f(U.pitch,pitch*D2R);gl.uniform1f(U.cell,Math.max(4.5,Math.min(6,r/145)));
  gl.uniform3f(U.bg,...C.bg);gl.uniform3f(U.glowC,...C.glow);gl.uniform3f(U.paper,...C.paper);gl.uniform1f(U.useSrc,1);gl.uniform1f(U.dayStyle,0);gl.uniform1f(U.time,now/1000);gl.uniform1f(U.cloudAmt,.75);
  gl.drawArrays(gl.TRIANGLES,0,3);
 }
 function drawPins(){
  if(layer.childElementCount!==P.length){layer.innerHTML=P.map((p,i)=>`<button type="button" class="wg-pin" data-i="${i}" tabindex="-1"><i aria-hidden="true"></i><span class="wg-tag"><b></b><small></small></span></button>`).join('');}
  [...layer.children].forEach((el,i)=>{const p=P[i];if(p.lat==null){el.hidden=true;return;}const v=proj(p.lat,p.lon);const show=v.z>.05;el.hidden=!show;if(!show)return;
   el.style.transform=`translate(${v.x.toFixed(1)}px,${v.y.toFixed(1)}px)`;el.style.opacity=Math.min(1,.4+v.z).toFixed(2);el.classList.toggle('is-sel',i===sel);el.style.zIndex=i===sel?50:Math.round(v.z*10);
   const t=el.querySelector('.wg-tag');if(i===sel){t.querySelector('b').textContent=p.name;t.querySelector('small').textContent=p.place||'';}el.setAttribute('aria-label',p.name);});
 }
 const shortest=(a,b)=>a+(((b-a)%360+540)%360-180);
 function frame(now){
  raf=0;if(!visible||document.hidden)return;const dt=Math.min(64,now-(last||now));last=now;let moving=false;
  if(tYaw!=null){yaw+=(tYaw-yaw)*.09;pitch+=(tPitch-pitch)*.09;if(Math.abs(tYaw-yaw)<.05&&Math.abs(tPitch-pitch)<.05){yaw=tYaw;pitch=tPitch;tYaw=tPitch=null;}moving=true;}
  else if(!drag&&!pinch&&!calm.matches&&zoom<1.3){yaw-=dt*.003;moving=true;}
  if(tZoom!=null){zoom+=(tZoom-zoom)*.15;if(Math.abs(tZoom-zoom)<.002){zoom=tZoom;tZoom=null;}moving=true;}
  drawGL(now);drawPins();if(moving||drag||pinch||!calm.matches)raf=requestAnimationFrame(frame);
 }
 const kick=()=>{if(!raf)raf=requestAnimationFrame(frame);};
 /* the shader's yaw puts longitude (yaw) at the front, so "look at" a place = yaw:=lon, pitch:=-lat */
 function focus(i){sel=i;const p=P[i];if(p?.lat!=null){tYaw=shortest(yaw,p.lon);tPitch=Math.max(-70,Math.min(70,p.lat));}kick();onSelect(i);}
 const setZoom=z=>{tZoom=Math.max(1,Math.min(6,z));kick();};
 zoomUI.addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(b)setZoom((tZoom??zoom)*(b.dataset.z==='1'?1.6:1/1.6));});
 host.addEventListener('wheel',e=>{e.preventDefault();setZoom((tZoom??zoom)*Math.exp(-e.deltaY*.0015));},{passive:false});
 layer.addEventListener('click',e=>{const b=e.target.closest('.wg-pin');if(b)focus(+b.dataset.i);});
 cv.addEventListener('pointerdown',e=>{touches.set(e.pointerId,{x:e.clientX,y:e.clientY});cv.setPointerCapture(e.pointerId);
  if(touches.size===2){const [a,b]=[...touches.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:zoom};drag=null;}else drag={x:e.clientX,y:e.clientY,yaw,pitch};tYaw=tPitch=null;kick();});
 cv.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&touches.size===2){const [a,b]=[...touches.values()];zoom=Math.max(1,Math.min(6,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));tZoom=null;kick();return;}
  if(drag){const {r}=geom(),k=57.3/r;yaw=drag.yaw-(e.clientX-drag.x)*k;pitch=Math.max(-80,Math.min(80,drag.pitch-(e.clientY-drag.y)*k));kick();}});
 const up=e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null;if(!touches.size)drag=null;kick();};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 const ro=new ResizeObserver(()=>{fit();kick();});ro.observe(host);
 const io=new IntersectionObserver(([en])=>{visible=en.isIntersecting;kick();});io.observe(host);
 const theme=new MutationObserver(()=>kick());theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 fit();kick();
 return {focus,set(p){P=p;layer.innerHTML='';if(sel>=P.length)sel=-1;kick();},get sel(){return sel;},stop(){cancelAnimationFrame(raf);ro.disconnect();io.disconnect();theme.disconnect();cv.remove();layer.remove();zoomUI.remove();}};
}
