// A still photo rendered through the hero Earth halftone: same 6x6 glyph cells, 4x4 Bayer threshold and
// ink ramp (k0..k8) as the globe shader in page-C89T775K-v51.js. Static render on load, resize and theme change.
// WebGL can only read same-origin photos (remote hosts send no CORS header, and probing them logs errors). Anything else falls back to a CSS grayscale photo with a dot overlay.
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform sampler2D img;uniform vec2 res,isz;uniform float cell,light;uniform vec3 bg;
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
 vec2 pixel=vec2(gl_FragCoord.x,res.y-gl_FragCoord.y);
 vec2 grid=floor(pixel/cell),sp=(grid+.5)*cell;
 float sc=max(res.x/isz.x,res.y/isz.y);
 vec2 uv=(sp-res*.5)/(sc*isz)+.5;
 float lum=dot(texture2D(img,uv).rgb,vec3(.2126,.7152,.0722));
 float tone=.9*smoothstep(.14,.8,lum); /* stronger contrast so the photo reads through the glyphs */
 float d=light>.5?1.-tone:tone;
 float threshold=(4.*bayer2(mod(grid,2.))+bayer2(mod(floor(grid/2.),2.))+.5)/16.;
 float s=floor(d*8.+threshold);
 vec2 f=floor(fract(pixel/cell)*6.);
 float cov=glyph(s,f.x,f.y);
 vec3 ink=light>.5?mix(vec3(24.,48.,86.)/255.,vec3(42.,108.,174.)/255.,tone):inkRamp(tone);
 gl_FragColor=vec4(mix(bg,ink,cov),1.);
}`;
const BG={dark:[12/255,16/255,27/255],light:[246/255,243/255,236/255]};
const load=(src,cors)=>new Promise(res=>{const im=new Image();if(cors)im.crossOrigin='anonymous';im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src;});
function fallback(host,src){
 const im=document.createElement('img');im.className='pp-ht-img';im.alt='';im.src=src;im.decoding='async';host.dataset.mode='css';host.replaceChildren(im);
 return {stop(){host.replaceChildren();}};
}
export async function halftonePhoto(host,sources,{cell=6}={}){
 const list=[].concat(sources).filter(Boolean);
 let img=null,used=null;
 for(const s of list.filter(s=>s.startsWith('/'))){img=await load(s,true);if(img){used=s;break;}}
 if(!img)return fallback(host,list[0]||'/spots/oya.jpg');
 const cv=document.createElement('canvas');cv.className='pp-ht-canvas';cv.setAttribute('aria-hidden','true');
 const gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:true});
 if(!gl)return fallback(host,used);
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;};
 const vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return fallback(host,used);
 const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return fallback(host,used);
 gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);}catch{return fallback(host,used);}
 const U=n=>gl.getUniformLocation(pr,n);
 host.dataset.mode='gl';host.replaceChildren(cv);
 const draw=()=>{
  const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.round(host.clientWidth*dpr)),h=Math.max(1,Math.round(host.clientHeight*dpr));
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
  const light=document.documentElement.dataset.theme==='light';
  gl.viewport(0,0,w,h);gl.uniform2f(U('res'),w,h);gl.uniform2f(U('isz'),img.naturalWidth,img.naturalHeight);gl.uniform1f(U('cell'),Math.round(cell*dpr));gl.uniform1f(U('light'),light?1:0);gl.uniform3fv(U('bg'),BG[light?'light':'dark']);
  gl.drawArrays(gl.TRIANGLES,0,3);
 };
 draw();
 let timer=0;const ro=new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(draw,150);});ro.observe(host);
 const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 return {stop(){clearTimeout(timer);ro.disconnect();theme.disconnect();host.replaceChildren();}};
}
