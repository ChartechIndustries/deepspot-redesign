// Ambient halftone field: turbulent, domain-warped noise drawn with the hero Earth's glyph set
// (same 6x6 glyph cells + 4x4 Bayer threshold as the globe shader in page-C89T775K-v51.js).
// Transparent canvas; the host sets opacity. Pauses offscreen / hidden tab; one still frame for reduced motion.

const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform vec2 res;uniform float time,cell;uniform vec3 ink;
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
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
 return mix(mix(dot(h2(i),f),dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)),dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);}
float turb(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*abs(noise(p));p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.01+vec2(5.2,1.3);a*=.5;}return s;}
void main(){
 vec2 pixel=gl_FragCoord.xy,grid=floor(pixel/cell),uv=(grid+.5)*cell/res.y*2.2;
 float t=time*.016;
 vec2 q=vec2(fbm(uv+vec2(0.,t)),fbm(uv+vec2(5.2,1.3)-t*.6));
 vec2 r=vec2(fbm(uv+3.*q+vec2(1.7,9.2)+t*.4),fbm(uv+3.*q+vec2(8.3,2.8)-t*.3));
 float tone=clamp(turb(uv+2.4*r)*1.9-.12,0.,1.);
 float threshold=(4.*bayer2(mod(grid,2.))+bayer2(mod(floor(grid/2.),2.))+.5)/16.;
 float s=floor(tone*8.+threshold);
 vec2 f=floor(fract(pixel/cell)*6.);
 float cov=glyph(s,f.x,f.y);
 gl_FragColor=vec4(ink*cov,cov);
}`;

export function halftoneField(host,{cell=6,ink=()=>[1,1,1],fps=24}={}){
 const cv=document.createElement('canvas');cv.className='hf-canvas';cv.setAttribute('aria-hidden','true');
 const gl=cv.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false});
 if(!gl)return {stop(){}};
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;};
 const vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return {stop(){}};
 const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return {stop(){}};
 gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const U={res:gl.getUniformLocation(pr,'res'),time:gl.getUniformLocation(pr,'time'),cell:gl.getUniformLocation(pr,'cell'),ink:gl.getUniformLocation(pr,'ink')};
 host.prepend(cv);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let raf=0,visible=false,last=0,t0=performance.now(),dpr=1;
 const size=()=>{dpr=Math.min(devicePixelRatio||1,1.5);const w=Math.max(1,Math.round(host.clientWidth*dpr)),h=Math.max(1,Math.round(host.clientHeight*dpr));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;gl.viewport(0,0,w,h);}};
 const draw=now=>{size();gl.uniform2f(U.res,cv.width,cv.height);gl.uniform1f(U.time,(now-t0)/1000);gl.uniform1f(U.cell,Math.round(cell*dpr));gl.uniform3fv(U.ink,ink());gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);};
 const loop=now=>{raf=0;if(!visible||document.hidden||reduce.matches)return;if(now-last>=1000/fps){last=now;draw(now);}raf=requestAnimationFrame(loop);};
 const kick=()=>{if(reduce.matches){draw(t0+40000);return;}if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(loop);};
 const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;kick();});io.observe(host);
 const ro=new ResizeObserver(()=>{if(reduce.matches||!raf)draw(reduce.matches?t0+40000:performance.now());});ro.observe(host);
 const vis=()=>kick();document.addEventListener('visibilitychange',vis);reduce.addEventListener?.('change',kick);
 draw(t0+40000);
 const theme=new MutationObserver(()=>draw(performance.now()));theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-panel-color']});
 return {stop(){cancelAnimationFrame(raf);io.disconnect();ro.disconnect();theme.disconnect();document.removeEventListener('visibilitychange',vis);cv.remove();}};
}
