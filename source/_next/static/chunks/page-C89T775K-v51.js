import { r as e, t } from "./rolldown-runtime-C60lm6uB.js";
import { i as n, n as r, r as i } from "./framework-D_rUT4EX.js";
var a = e(n(), 1);
var TEX_MAP = {
    day: `/earth-day.jpg`,
    night: `/earth-night.jpg`,
    atmos: `/earth-surface.jpg`,
    neon: `/earth-neon.png`,
  },
  __P = new URLSearchParams(
    typeof location == `undefined` ? `` : location.search,
  ),
  TEX = TEX_MAP[__P.get(`tex`)] || TEX_MAP.day,
  THEME = __P.get(`theme`) === `light` ? `light` : `dark`,
  COLOR = __P.get(`color`) === `1` || (!__P.has(`color`) && !__P.has(`tex`)),
  THEME_COLORS =
    THEME === `light`
      ? {
          bg: [246 / 255, 243 / 255, 236 / 255],
          glow: [200 / 255, 214 / 255, 255 / 255],
          paper: [1, 1, 1],
        }
      : {
          bg: [12 / 255, 16 / 255, 27 / 255],
          glow: [24 / 255, 44 / 255, 110 / 255],
          paper: [1, 1, 1],
        };
const CLOUDS =
  __P.get(`clouds`) !== `0` && (TEX === TEX_MAP.day || TEX === TEX_MAP.neon);
const CLOUD_AMT = CLOUDS ? (COLOR ? (TEX === TEX_MAP.day ? 0.75 : 0.45) : 0.85) : 0;
typeof window != `undefined` &&
  __P.get(`raf`) === `timer` &&
  ((window.requestAnimationFrame = (cb) =>
    setTimeout(() => cb(performance.now()), 16)),
  (window.cancelAnimationFrame = (id) => clearTimeout(id)));
typeof document != `undefined` &&
  (document.documentElement.dataset.theme = THEME);
function __mountVariantSwitch() {
  if (typeof document == `undefined`) return;
  if (!document.body) return;
  if (document.querySelector(`.variant-switch`)) return;
  let el = document.createElement(`div`);
  el.className = `variant-switch`;
  for (let [href, label, on] of [
    [
      `?tex=day&theme=dark`,
      `Day \xB7 Dark`,
      TEX === TEX_MAP.day && THEME === `dark` && !COLOR,
    ],
    [
      `?tex=day&theme=light`,
      `Day \xB7 Light`,
      TEX === TEX_MAP.day && THEME === `light` && !COLOR,
    ],
    [
      `?tex=night&theme=dark`,
      `Night \xB7 Dark`,
      TEX === TEX_MAP.night && THEME === `dark` && !COLOR,
    ],
    [
      `?tex=night&theme=light`,
      `Night \xB7 Light`,
      TEX === TEX_MAP.night && THEME === `light` && !COLOR,
    ],
    [
      `?tex=day&theme=dark&color=1`,
      `Day \xB7 Color`,
      TEX === TEX_MAP.day && THEME === `dark` && COLOR,
    ],
    [
      `?tex=day&theme=light&color=1`,
      `Day · Color Light`,
      TEX === TEX_MAP.day && THEME === `light` && COLOR,
    ],
    [
      `?tex=night&theme=dark&color=1`,
      `Night \xB7 Color`,
      TEX === TEX_MAP.night && THEME === `dark` && COLOR,
    ],
    [
      `?tex=neon&theme=dark`,
      `Neon \xB7 Dark`,
      TEX === TEX_MAP.neon && THEME === `dark` && !COLOR,
    ],
    [
      `?tex=neon&theme=dark&color=1`,
      `Neon \xB7 Color`,
      TEX === TEX_MAP.neon && THEME === `dark` && COLOR,
    ],
  ]) {
    let link = document.createElement(`a`);
    ((link.href = href), (link.textContent = label));
    if (on) link.className = `on`;
    el.appendChild(link);
  }
  document.body.appendChild(el);
}
typeof document != `undefined` &&
  (document.body
    ? __mountVariantSwitch()
    : document.addEventListener(`DOMContentLoaded`, __mountVariantSwitch));
function o(e) {
  // color=1 mode not mirrored in the 2D fallback
  let t = document.createElement(`canvas`);
  ((t.width = e.width), (t.height = e.height));
  let n = t.getContext(`2d`, { willReadFrequently: !0 });
  n.drawImage(e, 0, 0);
  let r = n.getImageData(0, 0, t.width, t.height).data,
    i = document.createElement(`canvas`);
  ((i.width = 216), (i.height = 576));
  let a = i.getContext(`2d`),
    glyph = (step, u, v) => {
      let cc = u >= 2 && u <= 3 && v >= 2 && v <= 3,
        d4 = (u === 1 || u === 4) && (v === 1 || v === 4),
        in4 = u >= 1 && u <= 4 && v >= 1 && v <= 4,
        ring = in4 && (u === 1 || u === 4 || v === 1 || v === 4);
      return step < 1
        ? 0
        : step === 1
          ? cc
            ? 1
            : 0
          : step === 2
            ? d4
              ? 1
              : 0
            : step === 3
              ? ring
                ? 1
                : 0
              : step === 4
                ? in4
                  ? 1
                  : 0
                : step === 5
                  ? in4
                    ? 0
                    : 1
                  : step === 6
                    ? d4
                      ? 0
                      : 1
                    : step === 7
                      ? cc
                        ? 0
                        : 1
                      : 1;
    },
    inkRamp = (tone) => {
      let stops = [
          [11, 15, 24],
          [40, 62, 94],
          [70, 118, 170],
          [117, 164, 206],
          [132, 179, 217],
          [146, 193, 228],
          [160, 209, 243],
          [189, 224, 246],
          [220, 236, 250],
        ],
        x = Math.max(0, Math.min(1, tone)) * 8,
        seg = Math.min(7, Math.floor(x)),
        f = x - seg,
        lo = stops[seg],
        hi = stops[seg + 1];
      return `rgb(${Math.round(lo[0] + (hi[0] - lo[0]) * f)},${Math.round(lo[1] + (hi[1] - lo[1]) * f)},${Math.round(lo[2] + (hi[2] - lo[2]) * f)})`;
    };
  for (let row = 0; row < 24; row++) {
    let ink = inkRamp(row / 23);
    for (let step = 0; step <= 8; step++) {
      ((a.fillStyle = `#fff`),
        a.fillRect(step * 24, row * 24, 24, 24),
        (a.fillStyle = ink));
      for (let u = 0; u < 6; u++)
        for (let v = 0; v < 6; v++)
          glyph(step, u, v) &&
            a.fillRect(step * 24 + u * 4, row * 24 + v * 4, 4, 4);
    }
  }
  let o = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  return (e, n, a, s, c, l, u, pitch = 0) => {
    e.clearRect(0, 0, n, a);
    let d = Math.max(4.5, Math.min(6, l / 145)),
      f = Math.PI / 180, cp = Math.cos(pitch*f), sp = Math.sin(pitch*f);
    for (let p = 0, m = d / 2; m < a; m += d, p++)
      for (let g = 0, h = d / 2; h < n; h += d, g++) {
        let _ = (h - s) / l,
          v = (c - m) / l,
          y = _ * _ + v * v;
        if (y >= 1) continue;
        let b = Math.sqrt(1 - y),
          x =
            ((((Math.atan2(_, b*cp-v*sp) + u * f) / (2 * Math.PI) + 0.5) % 1) + 1) % 1,
          S = 0.5 - Math.asin(Math.max(-1,Math.min(1,v*cp+b*sp))) / Math.PI,
          C =
            (Math.min(t.height - 1, Math.max(0, Math.floor(S * t.height))) *
              t.width +
              Math.min(t.width - 1, Math.max(0, Math.floor(x * t.width)))) *
            4,
          w = (r[C] * 0.2126 + r[C + 1] * 0.7152 + r[C + 2] * 0.0722) / 255,
          T = Math.max(0, -_ * 0.92 + v * 0.36 + b * 0.15),
          lit = ((q) => {
            q = Math.min(1, Math.max(0, (q - 0.22) / 0.64));
            return q * q * (3 - 2 * q);
          })(T),
          D = (1 - b) ** 2.5,
          k = D,
          E =
            Math.pow(Math.min(1, Math.max(0, (w - 0.1) / 0.65)), 1.3) *
            Math.max(lit, Math.min(1, D * 1.1)),
          A = Math.min(1, Math.max(0, E + k * 0.6)),
          M = Math.min(
            8,
            Math.floor((1 - A) * 8 + (o[(p % 4) * 4 + (g % 4)] + 0.5) / 16),
          ),
          N = Math.round(A * 23);
        e.drawImage(i, M * 24, N * 24, 24, 24, h - d / 2, m - d / 2, d, d);
      }
  };
}
function s(e, cl, baked, t) {
  let n = t.getContext(`webgl`, {
    alpha: !1,
    antialias: !1,
    depth: !1,
    stencil: !1,
    preserveDrawingBuffer: !1,
  });
  if (!n) {
    let n = t.getContext(`2d`),
      r = o(baked || e);
    return {
      render: (e, i, a, o, s, c, pitch = 0) => {
        (n.setTransform(t.width / e, 0, 0, t.height / i, 0, 0),
          r(n, e, i, a, o, s, c, pitch));
      },
      dispose: () => {},
      gpu: !1,
    };
  }
  let r = (e, t) => {
      let r = n.createShader(e);
      if (
        (n.shaderSource(r, t),
        n.compileShader(r),
        !n.getShaderParameter(r, n.COMPILE_STATUS))
      ) {
        let e = n.getShaderInfoLog(r);
        throw (n.deleteShader(r), Error(e || `Shader compilation failed`));
      }
      return r;
    },
    i = r(
      n.VERTEX_SHADER,
      `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`,
    ),
    a = r(
      n.FRAGMENT_SHADER,
      `
precision highp float;
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
  float le=smoothstep(.05,.85,max(0.,dot(vec3(nn,0.),vec3(-.92,.36,.15))));
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
 float lam=max(0.,dot(vec3(n,z),vec3(-.92,.36,.15)));float light=smoothstep(.22,.86,lam);
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
}`,
    ),
    s = n.createProgram();
  if (
    (n.attachShader(s, i),
    n.attachShader(s, a),
    n.linkProgram(s),
    !n.getProgramParameter(s, n.LINK_STATUS))
  )
    throw Error(`Earth program failed to link`);
  n.useProgram(s);
  let c = n.createBuffer();
  (n.bindBuffer(n.ARRAY_BUFFER, c),
    n.bufferData(
      n.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      n.STATIC_DRAW,
    ));
  let l = n.getAttribLocation(s, `position`);
  (n.enableVertexAttribArray(l),
    n.vertexAttribPointer(l, 2, n.FLOAT, !1, 0, 0));
  let u = n.createTexture();
  (n.activeTexture(n.TEXTURE0),
    n.bindTexture(n.TEXTURE_2D, u),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE),
    n.texImage2D(n.TEXTURE_2D, 0, n.RGB, n.RGB, n.UNSIGNED_BYTE, e),
    n.uniform1i(n.getUniformLocation(s, `earth`), 0));
  let u2 = n.createTexture();
  (n.activeTexture(n.TEXTURE1),
    n.bindTexture(n.TEXTURE_2D, u2),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.REPEAT),
    n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE),
    cl
      ? n.texImage2D(n.TEXTURE_2D, 0, n.RGB, n.RGB, n.UNSIGNED_BYTE, cl)
      : n.texImage2D(
          n.TEXTURE_2D,
          0,
          n.RGB,
          1,
          1,
          0,
          n.RGB,
          n.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0]),
        ),
    n.uniform1i(n.getUniformLocation(s, `clouds`), 1),
    n.activeTexture(n.TEXTURE0));
  let d = Object.fromEntries(
    [
      `resolution`,
      `viewport`,
      `center`,
      `radius`,
      `yaw`,
      `pitch`,
      `cell`,
      `bg`,
      `glowC`,
      `paper`,
      `useSrc`,
      `dayStyle`,
      `clouds`,
      `time`,
      `cloudAmt`,
    ].map((e) => [e, n.getUniformLocation(s, e)]),
  );
  return {
    gpu: !0,
    render: (e, r, i, a, o, s, pitch = 0) => {
      (n.viewport(0, 0, t.width, t.height),
        n.uniform2f(d.resolution, t.width, t.height),
        n.uniform2f(d.viewport, e, r),
        n.uniform2f(d.center, i, a),
        n.uniform1f(d.radius, o),
        n.uniform1f(d.yaw, (s * Math.PI) / 180),
        n.uniform1f(d.pitch, pitch * Math.PI / 180),
        n.uniform1f(d.cell, Math.max(4.5, Math.min(6, o / 145))),
        n.uniform3f(
          d.bg,
          THEME_COLORS.bg[0],
          THEME_COLORS.bg[1],
          THEME_COLORS.bg[2],
        ),
        n.uniform3f(
          d.glowC,
          THEME_COLORS.glow[0],
          THEME_COLORS.glow[1],
          THEME_COLORS.glow[2],
        ),
        n.uniform3f(
          d.paper,
          THEME_COLORS.paper[0],
          THEME_COLORS.paper[1],
          THEME_COLORS.paper[2],
        ),
        n.uniform1f(d.useSrc, COLOR ? 1 : 0),
        n.uniform1f(d.dayStyle, TEX === TEX_MAP.day && !COLOR ? 1 : 0),
        n.uniform1f(d.time, performance.now() / 1e3),
        n.uniform1f(d.cloudAmt, CLOUD_AMT),
        n.drawArrays(n.TRIANGLES, 0, 3));
    },
    dispose: () => {
      (n.deleteTexture(u),
        n.deleteTexture(u2),
        n.deleteBuffer(c),
        n.deleteProgram(s),
        n.deleteShader(i),
        n.deleteShader(a));
    },
  };
}
var c = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  l = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  u = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) =>
      n ? n.toUpperCase() : t.toLowerCase(),
    ),
  d = (e) => {
    let t = u(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  f = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  p = (e) => {
    for (let t in e)
      if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
    return !1;
  },
  m = (0, a.createContext)({}),
  h = () => (0, a.useContext)(m),
  g = (0, a.forwardRef)(
    (
      {
        color: e,
        size: t,
        strokeWidth: n,
        absoluteStrokeWidth: r,
        className: i = ``,
        children: o,
        iconNode: s,
        ...l
      },
      u,
    ) => {
      let {
          size: d = 24,
          strokeWidth: m = 2,
          absoluteStrokeWidth: g = !1,
          color: _ = `currentColor`,
          className: v = ``,
        } = h() ?? {},
        y = (r ?? g) ? (Number(n ?? m) * 24) / Number(t ?? d) : (n ?? m);
      return (0, a.createElement)(
        `svg`,
        {
          ref: u,
          ...f,
          width: t ?? d ?? f.width,
          height: t ?? d ?? f.height,
          stroke: e ?? _,
          strokeWidth: y,
          className: c(`lucide`, v, i),
          ...(!o && !p(l) && { "aria-hidden": `true` }),
          ...l,
        },
        [
          ...s.map(([e, t]) => (0, a.createElement)(e, t)),
          ...(Array.isArray(o) ? o : [o]),
        ],
      );
    },
  ),
  _ = (e, t) => {
    let n = (0, a.forwardRef)(({ className: n, ...r }, i) =>
      (0, a.createElement)(g, {
        ref: i,
        iconNode: t,
        className: c(`lucide-${l(d(e))}`, `lucide-${e}`, n),
        ...r,
      }),
    );
    return ((n.displayName = d(e)), n);
  },
  v = _(`arrow-right`, [
    [`path`, { d: `M5 12h14`, key: `1ays0h` }],
    [`path`, { d: `m12 5 7 7-7 7`, key: `xquz4c` }],
  ]),
  y = _(`arrow-up-right`, [
    [`path`, { d: `M7 7h10v10`, key: `1tivn9` }],
    [`path`, { d: `M7 17 17 7`, key: `1vkiza` }],
  ]),
  b = _(`chevron-right`, [[`path`, { d: `m9 18 6-6-6-6`, key: `mthhwq` }]]),
  x = _(`earth`, [
    [`path`, { d: `M21.54 15H17a2 2 0 0 0-2 2v4.54`, key: `1djwo0` }],
    [
      `path`,
      {
        d: `M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17`,
        key: `1tzkfa`,
      },
    ],
    [
      `path`,
      {
        d: `M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05`,
        key: `14pb5j`,
      },
    ],
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
  ]),
  S = _(`map-pin`, [
    [
      `path`,
      {
        d: `M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0`,
        key: `1r0f0z`,
      },
    ],
    [`circle`, { cx: `12`, cy: `10`, r: `3`, key: `ilqhr7` }],
  ]),
  C = _(`pause`, [
    [
      `rect`,
      { x: `14`, y: `3`, width: `5`, height: `18`, rx: `1`, key: `kaeet6` },
    ],
    [
      `rect`,
      { x: `5`, y: `3`, width: `5`, height: `18`, rx: `1`, key: `1wsw3u` },
    ],
  ]),
  w = _(`play`, [
    [
      `path`,
      {
        d: `M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`,
        key: `10ikf1`,
      },
    ],
  ]),
  T = _(`x`, [
    [`path`, { d: `M18 6 6 18`, key: `1bl5f8` }],
    [`path`, { d: `m6 6 12 12`, key: `d8bk6v` }],
  ]);
function E(e, t) {
  return function (n, ...r) {
    let i = new URL(e);
    return (
      i.searchParams.set(`code`, n.toString()),
      r.forEach((e) => i.searchParams.append(`args[]`, e)),
      `${t} error #${n}; visit ${i} for the full message.`
    );
  };
}
var D = E(`https://base-ui.com/production-error`, `Base UI`),
  O = a.createContext(void 0);
function k(e) {
  let t = a.useContext(O);
  if (!e && t === void 0) throw Error(D(27));
  return t;
}
var A = {};
function j(e, t) {
  let n = a.useRef(A);
  return (n.current === A && (n.current = e(t)), n);
}
function M(e, t, n, r) {
  let i = j(P).current;
  return (ee(i, e, t, n, r) && te(i, [e, t, n, r]), i.callback);
}
function N(e) {
  let t = j(P).current;
  return (F(t, e) && te(t, e), t.callback);
}
function P() {
  return { callback: null, cleanup: null, refs: [] };
}
function ee(e, t, n, r, i) {
  return (
    e.refs[0] !== t || e.refs[1] !== n || e.refs[2] !== r || e.refs[3] !== i
  );
}
function F(e, t) {
  return e.refs.length !== t.length || e.refs.some((e, n) => e !== t[n]);
}
function te(e, t) {
  if (((e.refs = t), t.every((e) => e == null))) {
    e.callback = null;
    return;
  }
  e.callback = (n) => {
    if (((e.cleanup &&= (e.cleanup(), null)), n != null)) {
      let r = Array(t.length).fill(null);
      for (let e = 0; e < t.length; e += 1) {
        let i = t[e];
        if (i != null)
          switch (typeof i) {
            case `function`: {
              let t = i(n);
              typeof t == `function` && (r[e] = t);
              break;
            }
            case `object`:
              i.current = n;
              break;
            default:
          }
      }
      e.cleanup = () => {
        for (let e = 0; e < t.length; e += 1) {
          let n = t[e];
          if (n != null)
            switch (typeof n) {
              case `function`: {
                let t = r[e];
                typeof t == `function` ? t() : n(null);
                break;
              }
              case `object`:
                n.current = null;
                break;
              default:
            }
        }
      };
    }
  };
}
var ne = 19;
function re(e) {
  return ne >= e;
}
function ie(e) {
  if (!a.isValidElement(e)) return null;
  let t = e,
    n = t.props;
  return (re(19) ? n?.ref : t.ref) ?? null;
}
function I(e, t) {
  if (e && !t) return e;
  if (!e && t) return t;
  if (e || t) return { ...e, ...t };
}
function L() {}
var R = Object.freeze([]),
  z = Object.freeze({});
function B(e, t) {
  let n = {};
  for (let r in e) {
    let i = e[r];
    if (t?.hasOwnProperty(r)) {
      let e = t[r](i);
      e != null && Object.assign(n, e);
      continue;
    }
    i === !0
      ? (n[`data-${r.toLowerCase()}`] = ``)
      : i && (n[`data-${r.toLowerCase()}`] = i.toString());
  }
  return n;
}
function V(e, t) {
  return typeof e == `function` ? e(t) : e;
}
function ae(e, t) {
  return typeof e == `function` ? e(t) : e;
}
var H = {};
function oe(e, t, n, r, i) {
  if (!n && !r && !i && !e) return ce(t);
  let a = ce(e);
  return (
    t && (a = le(a, t)),
    n && (a = le(a, n)),
    r && (a = le(a, r)),
    i && (a = le(a, i)),
    a
  );
}
function se(e) {
  if (e.length === 0) return H;
  if (e.length === 1) return ce(e[0]);
  let t = ce(e[0]);
  for (let n = 1; n < e.length; n += 1) t = le(t, e[n]);
  return t;
}
function ce(e) {
  return pe(e) ? { ...me(e, H) } : ue(e);
}
function le(e, t) {
  return pe(t) ? me(t, e) : de(e, t);
}
function ue(e) {
  let t = { ...e };
  for (let e in t) {
    let n = t[e];
    fe(e, n) && (t[e] = ge(n));
  }
  return t;
}
function de(e, t) {
  if (!t) return e;
  for (let n in t) {
    let r = t[n];
    switch (n) {
      case `style`:
        e[n] = I(e.style, r);
        break;
      case `className`:
        e[n] = ve(e.className, r);
        break;
      default:
        fe(n, r) ? (e[n] = he(e[n], r)) : (e[n] = r);
    }
  }
  return e;
}
function fe(e, t) {
  let n = e.charCodeAt(0),
    r = e.charCodeAt(1),
    i = e.charCodeAt(2);
  return (
    n === 111 &&
    r === 110 &&
    i >= 65 &&
    i <= 90 &&
    (typeof t == `function` || t === void 0)
  );
}
function pe(e) {
  return typeof e == `function`;
}
function me(e, t) {
  return pe(e) ? e(t) : (e ?? H);
}
function he(e, t) {
  return t
    ? e
      ? (...n) => {
          let r = n[0];
          if (ye(r)) {
            let i = r;
            _e(i);
            let a = t(...n);
            return (i.baseUIHandlerPrevented || e?.(...n), a);
          }
          let i = t(...n);
          return (e?.(...n), i);
        }
      : ge(t)
    : e;
}
function ge(e) {
  return (
    e &&
    ((...t) => {
      let n = t[0];
      return (ye(n) && _e(n), e(...t));
    })
  );
}
function _e(e) {
  return (
    (e.preventBaseUIHandler = () => {
      e.baseUIHandlerPrevented = !0;
    }),
    e
  );
}
function ve(e, t) {
  return t ? (e ? t + ` ` + e : t) : e;
}
function ye(e) {
  return typeof e == `object` && !!e && `nativeEvent` in e;
}
function be(e, t, n = {}) {
  let r = t.render,
    i = xe(t, n);
  return n.enabled === !1 ? null : we(e, r, i, n.state ?? z);
}
function xe(e, t = {}) {
  let { className: n, style: r, render: i } = e,
    {
      state: a = z,
      ref: o,
      props: s,
      stateAttributesMapping: c,
      enabled: l = !0,
    } = t,
    u = l ? V(n, a) : void 0,
    d = l ? ae(r, a) : void 0,
    f = l ? B(a, c) : z,
    p = l && s ? Se(s) : void 0,
    m = l ? (I(f, p) ?? {}) : z;
  return (
    typeof document < `u` &&
      (l
        ? Array.isArray(o)
          ? (m.ref = N([m.ref, ie(i), ...o]))
          : (m.ref = M(m.ref, ie(i), o))
        : M(null, null)),
    l
      ? (u !== void 0 && (m.className = ve(m.className, u)),
        d !== void 0 && (m.style = I(m.style, d)),
        m)
      : z
  );
}
function Se(e) {
  return Array.isArray(e) ? se(e) : oe(void 0, e);
}
var Ce = Symbol.for(`react.lazy`);
function we(e, t, n, r) {
  if (t) {
    if (typeof t == `function`) return t(n, r);
    let e = oe(n, t.props);
    e.ref = n.ref;
    let i = t;
    return (
      i?.$$typeof === Ce && (i = a.Children.toArray(t)[0]),
      a.cloneElement(i, e)
    );
  }
  if (e && typeof e == `string`) return Te(e, n);
  throw Error(D(8));
}
function Te(e, t) {
  return e === `button`
    ? (0, a.createElement)(`button`, { type: `button`, ...t, key: t.key })
    : e === `img`
      ? (0, a.createElement)(`img`, { alt: ``, ...t, key: t.key })
      : a.createElement(e, t);
}
var Ee = (function (e) {
    return (
      (e.startingStyle = `data-starting-style`),
      (e.endingStyle = `data-ending-style`),
      e
    );
  })({}),
  De = { "data-starting-style": `` },
  Oe = { "data-ending-style": `` },
  ke = {
    transitionStatus(e) {
      return e === `starting` ? De : e === `ending` ? Oe : null;
    },
  };
(function (e) {
  return (
    (e.open = `data-open`),
    (e.closed = `data-closed`),
    (e[(e.startingStyle = Ee.startingStyle)] = `startingStyle`),
    (e[(e.endingStyle = Ee.endingStyle)] = `endingStyle`),
    (e.anchorHidden = `data-anchor-hidden`),
    (e.side = `data-side`),
    (e.align = `data-align`),
    e
  );
})({});
var Ae = { "data-open": `` },
  je = { "data-closed": `` },
  Me = { "data-anchor-hidden": `` },
  Ne = {
    open(e) {
      return e ? Ae : je;
    },
    anchorHidden(e) {
      return e ? Me : null;
    },
  },
  Pe = { ...Ne, ...ke },
  Fe = a.forwardRef(function (e, t) {
    let { render: n, className: r, style: i, forceRender: a = !1, ...o } = e,
      s = k(),
      c = s.useState(`open`),
      l = s.useState(`nested`),
      u = s.useState(`mounted`);
    return be(`div`, e, {
      state: { open: c, transitionStatus: s.useState(`transitionStatus`) },
      ref: [s.context.backdropRef, t],
      stateAttributesMapping: Pe,
      props: [
        {
          role: `presentation`,
          hidden: !u,
          style: { userSelect: `none`, WebkitUserSelect: `none` },
        },
        o,
      ],
      enabled: a || !l,
    });
  });
function Ie() {
  return !0;
}
function Le(e) {
  return Be(e) ? (e.nodeName || ``).toLowerCase() : `#document`;
}
function Re(e) {
  var t;
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  );
}
function ze(e) {
  return ((Be(e) ? e.ownerDocument : e.document) || window.document)
    ?.documentElement;
}
function Be(e) {
  return Ie() ? e instanceof Node || e instanceof Re(e).Node : !1;
}
function Ve(e) {
  return Ie() ? e instanceof Element || e instanceof Re(e).Element : !1;
}
function U(e) {
  return Ie() ? e instanceof HTMLElement || e instanceof Re(e).HTMLElement : !1;
}
function He(e) {
  return !Ie() || typeof ShadowRoot > `u`
    ? !1
    : e instanceof ShadowRoot || e instanceof Re(e).ShadowRoot;
}
function Ue(e) {
  let { overflow: t, overflowX: n, overflowY: r, display: i } = Ge(e);
  return (
    /auto|scroll|overlay|hidden|clip/.test(t + r + n) &&
    i !== `inline` &&
    i !== `contents`
  );
}
function We(e) {
  return /^(html|body|#document)$/.test(Le(e));
}
function Ge(e) {
  return Re(e).getComputedStyle(e);
}
function Ke(e) {
  if (Le(e) === `html`) return e;
  let t = e.assignedSlot || e.parentNode || (He(e) && e.host) || ze(e);
  return He(t) ? t.host : t;
}
var qe = { ...a },
  Je = qe.useInsertionEffect,
  Ye = Je && Je !== qe.useLayoutEffect ? Je : (e) => e();
function W(e) {
  let t = j(Xe).current;
  return ((t.next = e), Ye(t.effect), t.trampoline);
}
function Xe() {
  let e = {
    next: void 0,
    callback: Ze,
    trampoline: (...t) => e.callback?.(...t),
    effect: () => {
      e.callback = e.next;
    },
  };
  return e;
}
function Ze() {}
var G = typeof document < `u` ? a.useLayoutEffect : () => {},
  Qe = a.createContext(void 0);
function $e(e = !1) {
  let t = a.useContext(Qe);
  if (t === void 0 && !e) throw Error(D(16));
  return t;
}
function et(e) {
  let {
      focusableWhenDisabled: t,
      disabled: n,
      composite: r = !1,
      tabIndex: i = 0,
      isNativeButton: o,
    } = e,
    s = r && t !== !1,
    c = r && t === !1;
  return {
    props: a.useMemo(() => {
      let e = {
        onKeyDown(e) {
          n && t && e.key !== `Tab` && e.preventDefault();
        },
      };
      return (
        r || ((e.tabIndex = i), !o && n && (e.tabIndex = t ? i : -1)),
        ((o && (t || s)) || (!o && n)) && (e[`aria-disabled`] = n),
        o && (!t || c) && (e.disabled = n),
        e
      );
    }, [r, n, t, s, c, o, i]),
  };
}
function K(e) {
  return e?.ownerDocument || document;
}
function tt(e, t, { detail: n = 0 } = {}) {
  e.dispatchEvent(
    new (Re(e).PointerEvent)(`click`, {
      bubbles: !0,
      cancelable: !0,
      composed: !0,
      detail: n,
      shiftKey: t.shiftKey,
      ctrlKey: t.ctrlKey,
      altKey: t.altKey,
      metaKey: t.metaKey,
    }),
  );
}
function nt(e = {}) {
  let {
      disabled: t = !1,
      focusableWhenDisabled: n,
      tabIndex: r = 0,
      native: i = !0,
      composite: o,
    } = e,
    s = a.useRef(null),
    c = $e(!0),
    l = o ?? c !== void 0,
    { props: u } = et({
      focusableWhenDisabled: n,
      disabled: t,
      composite: l,
      tabIndex: r,
      isNativeButton: i,
    }),
    d = a.useCallback(() => {
      let e = s.current;
      rt(e) &&
        l &&
        t &&
        u.disabled === void 0 &&
        e.disabled &&
        (e.disabled = !1);
    }, [t, u.disabled, l]);
  return (
    G(d, [d]),
    {
      getButtonProps: a.useCallback(
        (e = {}) => {
          let {
            onClick: n,
            onMouseDown: r,
            onKeyUp: a,
            onKeyDown: o,
            onPointerDown: s,
            ...c
          } = e;
          return oe(
            {
              onClick(e) {
                if (t) {
                  e.preventDefault();
                  return;
                }
                n?.(e);
              },
              onMouseDown(e) {
                t || r?.(e);
              },
              onKeyDown(e) {
                if (t || (_e(e), o?.(e), e.baseUIHandlerPrevented)) return;
                let n = e.target === e.currentTarget,
                  r = e.currentTarget,
                  a = rt(r),
                  s = !i && it(r),
                  c = n && (i ? a : !s),
                  u = e.key === `Enter`,
                  d = e.key === ` `,
                  f = r.getAttribute(`role`),
                  p =
                    f?.startsWith(`menuitem`) ||
                    f === `option` ||
                    f === `gridcell`;
                if (n && l && d) {
                  if (e.defaultPrevented && p) return;
                  (e.preventDefault(),
                    (!i || a) && (e.preventBaseUIHandler(), tt(r, e)));
                  return;
                }
                if (!c || i || (!d && !u)) {
                  n && s && d && e.preventDefault();
                  return;
                }
                e.defaultPrevented ||
                  (e.preventDefault(),
                  u && (e.preventBaseUIHandler(), tt(r, e)));
              },
              onKeyUp(e) {
                if (!t) {
                  if (
                    (_e(e),
                    a?.(e),
                    e.target === e.currentTarget &&
                      i &&
                      l &&
                      rt(e.currentTarget) &&
                      e.key === ` `)
                  ) {
                    e.preventDefault();
                    return;
                  }
                  e.baseUIHandlerPrevented ||
                    (e.target === e.currentTarget &&
                      !i &&
                      !l &&
                      !e.defaultPrevented &&
                      e.key === ` ` &&
                      (e.preventBaseUIHandler(), tt(e.currentTarget, e)));
                }
              },
              onPointerDown(e) {
                if (t) {
                  e.preventDefault();
                  return;
                }
                s?.(e);
              },
            },
            i ? { type: `button` } : { role: `button` },
            u,
            c,
          );
        },
        [t, u, l, i],
      ),
      buttonRef: W((e) => {
        ((s.current = e), d());
      }),
    }
  );
}
function rt(e) {
  return U(e) && e.tagName === `BUTTON`;
}
function it(e) {
  return U(e) && e.tagName === `A` && !!e.href;
}
var at = `none`,
  ot = `trigger-press`,
  st = `outside-press`,
  ct = `close-press`,
  lt = `focus-out`,
  ut = `escape-key`,
  dt = `imperative-action`;
function ft(e, t, n, r) {
  let i = !1,
    a = !1,
    o = r ?? z;
  return {
    reason: e,
    event: t ?? new Event(`base-ui`),
    cancel() {
      i = !0;
    },
    allowPropagation() {
      a = !0;
    },
    get isCanceled() {
      return i;
    },
    get isPropagationAllowed() {
      return a;
    },
    trigger: n,
    ...o,
  };
}
var pt = a.forwardRef(function (e, t) {
    let {
        render: n,
        className: r,
        style: i,
        disabled: a = !1,
        nativeButton: o = !0,
        ...s
      } = e,
      c = k(),
      l = c.useState(`open`),
      { getButtonProps: u, buttonRef: d } = nt({ disabled: a, native: o }),
      f = { disabled: a };
    function p(e) {
      l && c.setOpen(!1, ft(ct, e.nativeEvent));
    }
    return be(`button`, e, {
      state: f,
      ref: [t, d],
      props: [{ onClick: p }, s, u],
    });
  }),
  mt = 0;
function ht(e, t = `mui`) {
  let [n, r] = a.useState(e),
    i = e || n;
  return (
    a.useEffect(() => {
      n ?? ((mt += 1), r(`${t}-${mt}`));
    }, [n, t]),
    i
  );
}
var gt = qe.useId;
function _t(e, t) {
  if (gt !== void 0) {
    let n = gt();
    return e ?? (t ? `${t}-${n}` : n);
  }
  return ht(e, t);
}
function vt(e) {
  return _t(e, `base-ui`);
}
var yt = a.forwardRef(function (e, t) {
  let { render: n, className: r, style: i, id: a, ...o } = e,
    s = k(),
    c = vt(a);
  return (
    s.useSyncedValueWithCleanup(`descriptionElementId`, c),
    be(`p`, e, { ref: t, props: [{ id: c }, o] })
  );
});
function bt(e) {
  a.useEffect(e, R);
}
var xt = 0,
  St = class e {
    static create() {
      return new e();
    }
    currentId = xt;
    start(e, t) {
      (this.clear(),
        (this.currentId = setTimeout(() => {
          ((this.currentId = xt), t());
        }, e)));
    }
    isStarted() {
      return this.currentId !== xt;
    }
    clear = () => {
      this.currentId !== xt &&
        (clearTimeout(this.currentId), (this.currentId = xt));
    };
    disposeEffect = () => this.clear;
  };
function Ct() {
  let e = j(St.create).current;
  return (bt(e.disposeEffect), e);
}
function wt() {
  return typeof navigator > `u`
    ? { userAgent: ``, platform: ``, maxTouchPoints: 0 }
    : {
        userAgent: navigator.userAgent,
        platform: navigator.platform ?? ``,
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
      };
}
var { userAgent: Tt, platform: Et, maxTouchPoints: Dt } = wt(),
  Ot = Tt.toLowerCase(),
  kt = Et.toLowerCase(),
  At = /^i(os$|p)/.test(kt) || (kt === `macintel` && Dt > 1),
  jt = `android`,
  Mt = kt === jt || Ot.includes(jt),
  Nt = !At && kt.startsWith(`mac`);
(kt.startsWith(`win`), !Mt && /^(linux|chrome os)/.test(kt));
var Pt = Nt || At,
  Ft = typeof CSS < `u` && !!CSS.supports?.(`-webkit-backdrop-filter:none`);
(!Ft && Ot.includes(`firefox`), !Ft && Ot.includes(`chrom`));
var It = Pt,
  Lt = /jsdom|happydom/.test(Ot);
function Rt(e) {
  (e.preventDefault(), e.stopPropagation());
}
function zt(e) {
  return `nativeEvent` in e;
}
function Bt(e) {
  return e.pointerType === `` && e.isTrusted
    ? !0
    : Mt && e.pointerType
      ? e.type === `click` && e.buttons === 1
      : e.detail === 0 && !e.pointerType;
}
function Vt(e) {
  return Lt
    ? !1
    : (!Mt && e.width === 0 && e.height === 0) ||
        (Mt &&
          e.width === 1 &&
          e.height === 1 &&
          e.pressure === 0 &&
          e.detail === 0 &&
          e.pointerType === `mouse`) ||
        (e.width < 1 &&
          e.height < 1 &&
          e.pressure === 0 &&
          e.detail === 0 &&
          e.pointerType === `touch`);
}
function Ht(e) {
  let t = e.type;
  return t === `click` || t === `mousedown` || t === `keydown` || t === `keyup`;
}
var Ut = `data-base-ui-focusable`;
function Wt(e) {
  let t = e.activeElement;
  for (; t?.shadowRoot?.activeElement != null;) t = t.shadowRoot.activeElement;
  return t;
}
function q(e, t) {
  if (!e || !t) return !1;
  let n = t.getRootNode?.();
  if (e.contains(t)) return !0;
  if (n && He(n)) {
    let n = t;
    for (; n;) {
      if (e === n) return !0;
      n = n.parentNode || n.host;
    }
  }
  return !1;
}
function Gt(e) {
  return `composedPath` in e ? e.composedPath()[0] : e.target;
}
function Kt(e, t) {
  if (t == null) return !1;
  if (`composedPath` in e) return e.composedPath().includes(t);
  let n = e;
  return n.target != null && t.contains(n.target);
}
function qt(e) {
  return e.matches(`html,body`);
}
function Jt(e) {
  return (
    U(e) &&
    e.matches(
      `input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])`,
    )
  );
}
function Yt(e) {
  return e ? e.getAttribute(`role`) === `combobox` && Jt(e) : !1;
}
function Xt(e) {
  return e
    ? e.hasAttribute(`data-base-ui-focusable`)
      ? e
      : e.querySelector(`[data-base-ui-focusable]`) || e
    : null;
}
function J(e, t, n, r) {
  return (
    e.addEventListener(t, n, r),
    () => {
      e.removeEventListener(t, n, r);
    }
  );
}
function Zt(...e) {
  return () => {
    for (let t = 0; t < e.length; t += 1) {
      let n = e[t];
      n && n();
    }
  };
}
function Qt(e) {
  let t = j($t, e).current;
  return ((t.next = e), G(t.effect), t);
}
function $t(e) {
  let t = {
    current: e,
    next: e,
    effect: () => {
      t.current = t.next;
    },
  };
  return t;
}
var en = null;
globalThis.requestAnimationFrame;
var tn = new (class {
    callbacks = [];
    callbacksCount = 0;
    nextId = 1;
    startId = 1;
    isScheduled = !1;
    tick = (e) => {
      this.isScheduled = !1;
      let t = this.callbacks,
        n = this.callbacksCount;
      if (
        ((this.callbacks = []),
        (this.callbacksCount = 0),
        (this.startId = this.nextId),
        n > 0)
      )
        for (let n = 0; n < t.length; n += 1) t[n]?.(e);
    };
    request(e) {
      let t = this.nextId;
      return (
        (this.nextId += 1),
        this.callbacks.push(e),
        (this.callbacksCount += 1),
        (this.isScheduled ||= (requestAnimationFrame(this.tick), !0)),
        t
      );
    }
    cancel(e) {
      let t = e - this.startId;
      t < 0 ||
        t >= this.callbacks.length ||
        ((this.callbacks[t] = null), --this.callbacksCount);
    }
  })(),
  nn = class e {
    static create() {
      return new e();
    }
    static request(e) {
      return tn.request(e);
    }
    static cancel(e) {
      return tn.cancel(e);
    }
    currentId = en;
    request(e) {
      (this.cancel(),
        (this.currentId = tn.request(() => {
          ((this.currentId = en), e());
        })));
    }
    cancel = () => {
      this.currentId !== en &&
        (tn.cancel(this.currentId), (this.currentId = en));
    };
    disposeEffect = () => this.cancel;
  };
function rn() {
  let e = j(nn.create).current;
  return (bt(e.disposeEffect), e);
}
var an = {
    clipPath: `inset(50%)`,
    overflow: `hidden`,
    whiteSpace: `nowrap`,
    border: 0,
    padding: 0,
    width: 1,
    height: 1,
    margin: -1,
  },
  on = { ...an, position: `fixed`, top: 0, left: 0 };
({ ...an });
var Y = i(),
  sn = a.forwardRef(function (e, t) {
    let [n, r] = a.useState();
    G(() => {
      It && Ft && r(`button`);
    }, []);
    let i = { tabIndex: 0, role: n };
    return (0, Y.jsx)(`span`, {
      ...e,
      ref: t,
      style: on,
      "aria-hidden": n ? void 0 : !0,
      ...i,
      "data-base-ui-focus-guard": ``,
    });
  });
function cn(e) {
  return e.visibility === `hidden` || e.visibility === `collapse`;
}
function ln(e, t = e ? Ge(e) : null) {
  return !e || !e.isConnected || !t || cn(t)
    ? !1
    : typeof e.checkVisibility == `function`
      ? e.checkVisibility()
      : t.display !== `none` && t.display !== `contents`;
}
var un = `a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]`;
function dn(e) {
  let t = e.assignedSlot;
  if (t) return t;
  if (e.parentElement) return e.parentElement;
  let n = e.getRootNode();
  return He(n) ? n.host : null;
}
function fn(e) {
  for (let t of Array.from(e.children)) if (Le(t) === `summary`) return t;
  return null;
}
function pn(e, t) {
  let n = fn(t);
  return !!n && (e === n || q(n, e));
}
function mn(e) {
  let t = e ? Le(e) : ``;
  return (
    e != null &&
    e.matches(un) &&
    (t !== `summary` ||
      (e.parentElement != null &&
        Le(e.parentElement) === `details` &&
        fn(e.parentElement) === e)) &&
    (t !== `details` || fn(e) == null) &&
    (t !== `input` || e.type !== `hidden`)
  );
}
function hn(e) {
  if (!mn(e) || !e.isConnected || e.matches(`:disabled`)) return !1;
  for (let t = e; t; t = dn(t)) {
    let n = t !== e,
      r = Le(t) === `slot`;
    if (
      t.hasAttribute(`inert`) ||
      (n && Le(t) === `details` && !t.open && !pn(e, t)) ||
      t.hasAttribute(`hidden`) ||
      (!r && !gn(t, n))
    )
      return !1;
  }
  return !0;
}
function gn(e, t) {
  let n = Ge(e);
  return t ? n.display !== `none` : ln(e, n);
}
function _n(e) {
  let t = e.tabIndex;
  if (t < 0) {
    let t = Le(e);
    if (
      t === `details` ||
      t === `audio` ||
      t === `video` ||
      (U(e) && e.isContentEditable)
    )
      return 0;
  }
  return t;
}
function vn(e) {
  if (Le(e) !== `input`) return null;
  let t = e;
  return t.type === `radio` && t.name !== `` ? t : null;
}
function yn(e, t) {
  let n = vn(e);
  if (!n) return !0;
  let r = t.find((e) => {
    let t = vn(e);
    return t?.name === n.name && t.form === n.form && t.checked;
  });
  return r
    ? r === n
    : t.find((e) => {
        let t = vn(e);
        return t?.name === n.name && t.form === n.form;
      }) === n;
}
function bn(e) {
  if (U(e) && Le(e) === `slot`) {
    let t = e.assignedElements({ flatten: !0 });
    if (t.length > 0) return t;
  }
  return U(e) && e.shadowRoot
    ? Array.from(e.shadowRoot.children)
    : Array.from(e.children);
}
function xn(e, t) {
  bn(e).forEach((e) => {
    (mn(e) && t.push(e), xn(e, t));
  });
}
function Sn(e, t, n) {
  bn(e).forEach((e) => {
    (U(e) && e.matches(t) && n.push(e), Sn(e, t, n));
  });
}
function Cn(e) {
  return hn(e) && _n(e) >= 0;
}
function wn(e) {
  let t = [];
  return (xn(e, t), t.filter(hn));
}
function Tn(e) {
  let t = wn(e);
  return t.filter((e) => _n(e) >= 0 && yn(e, t));
}
function En(e, t) {
  let n = Tn(e),
    r = n.length;
  if (r === 0) return;
  let i = Wt(K(e)),
    a = n.indexOf(i);
  return n[a === -1 ? (t === 1 ? 0 : r - 1) : a + t];
}
function Dn(e) {
  return En(K(e).body, 1) || e;
}
function On(e) {
  return En(K(e).body, -1) || e;
}
function kn(e, t) {
  let n = t || e.currentTarget,
    r = e.relatedTarget;
  return !r || !q(n, r);
}
function An(e) {
  Tn(e).forEach((e) => {
    ((e.dataset.tabindex = e.getAttribute(`tabindex`) || ``),
      e.setAttribute(`tabindex`, `-1`));
  });
}
function jn(e) {
  let t = [];
  (Sn(e, `[data-tabindex]`, t),
    t.forEach((e) => {
      let t = e.dataset.tabindex;
      (delete e.dataset.tabindex,
        t ? e.setAttribute(`tabindex`, t) : e.removeAttribute(`tabindex`));
    }));
}
function Mn(e, t, n = !0) {
  return e
    .filter((e) => e.parentId === t)
    .flatMap((t) => [...(!n || t.context?.open ? [t] : []), ...Mn(e, t.id, n)]);
}
function Nn(e, t) {
  let n = [],
    r = e.find((e) => e.id === t)?.parentId;
  for (; r;) {
    let t = e.find((e) => e.id === r);
    ((r = t?.parentId), t && (n = n.concat(t)));
  }
  return n;
}
function Pn(e) {
  return `data-base-ui-${e}`;
}
var Fn = 0;
function In(e, t = {}) {
  let { preventScroll: n = !1, sync: r = !1, shouldFocus: i } = t;
  cancelAnimationFrame(Fn);
  function a() {
    (i && !i()) || e?.focus({ preventScroll: n });
  }
  if (r) return (a(), L);
  let o = requestAnimationFrame(a);
  return (
    (Fn = o),
    () => {
      Fn === o && (cancelAnimationFrame(o), (Fn = 0));
    }
  );
}
var Ln = { inert: new WeakMap(), "aria-hidden": new WeakMap() },
  Rn = `data-base-ui-inert`,
  zn = { inert: new WeakSet(), "aria-hidden": new WeakSet() },
  Bn = new WeakMap(),
  Vn = 0;
function Hn(e) {
  return zn[e];
}
function Un(e) {
  return e ? (He(e) ? e.host : Un(e.parentNode)) : null;
}
var Wn = (e, t) =>
    t
      .map((t) => {
        if (e.contains(t)) return t;
        let n = Un(t);
        return e.contains(n) ? n : null;
      })
      .filter((e) => e != null),
  Gn = (e) => {
    let t = new Set();
    return (
      e.forEach((e) => {
        let n = e;
        for (; n && !t.has(n);) (t.add(n), (n = n.parentNode));
      }),
      t
    );
  },
  Kn = (e, t, n) => {
    let r = [],
      i = (e) => {
        !e ||
          n.has(e) ||
          Array.from(e.children).forEach((e) => {
            Le(e) !== `script` && (t.has(e) ? i(e) : r.push(e));
          });
      };
    return (i(e), r);
  };
function qn(e, t, n, r, { mark: i = !0 }) {
  let a = null;
  r ? (a = `inert`) : n && (a = `aria-hidden`);
  let o = null,
    s = null,
    c = Wn(t, e),
    l = i ? Kn(t, Gn(c), new Set(c)) : [],
    u = [],
    d = [];
  if (a) {
    let e = Ln[a],
      n = Hn(a);
    ((s = n), (o = e));
    let r = Wn(t, Array.from(t.querySelectorAll(`[aria-live]`))),
      i = c.concat(r);
    Kn(t, Gn(i), new Set(i)).forEach((t) => {
      let r = t.getAttribute(a),
        i = r !== null && r !== `false`,
        o = (e.get(t) || 0) + 1;
      (e.set(t, o),
        u.push(t),
        o === 1 && i && n.add(t),
        i || t.setAttribute(a, a === `inert` ? `` : `true`));
    });
  }
  return (
    i &&
      l.forEach((e) => {
        let t = (Bn.get(e) || 0) + 1;
        (Bn.set(e, t), d.push(e), t === 1 && e.setAttribute(Rn, ``));
      }),
    (Vn += 1),
    () => {
      (o &&
        u.forEach((e) => {
          let t = (o.get(e) || 0) - 1;
          (o.set(e, t),
            t || (!s?.has(e) && a && e.removeAttribute(a), s?.delete(e)));
        }),
        i &&
          d.forEach((e) => {
            let t = (Bn.get(e) || 0) - 1;
            (Bn.set(e, t), t || e.removeAttribute(Rn));
          }),
        --Vn,
        Vn ||
          ((Ln.inert = new WeakMap()),
          (Ln[`aria-hidden`] = new WeakMap()),
          (zn.inert = new WeakSet()),
          (zn[`aria-hidden`] = new WeakSet()),
          (Bn = new WeakMap())));
    }
  );
}
function Jn(e, t = {}) {
  let { ariaHidden: n = !1, inert: r = !1, mark: i = !0 } = t,
    a = K(e[0]).body;
  return qn(e, a, n, r, { mark: i });
}
var Yn = { clipPath: `inset(50%)`, position: `fixed`, top: 0, left: 0 },
  Xn = e(r(), 1),
  Zn = a.createContext(null),
  Qn = () => a.useContext(Zn),
  $n = Pn(`portal`);
function er(e = {}) {
  let { ref: t, container: n, componentProps: r = z, elementProps: i } = e,
    o = _t(),
    s = Qn()?.portalNode,
    [c, l] = a.useState(null),
    [u, d] = a.useState(null),
    f = W((e) => {
      e !== null && d(e);
    }),
    p = a.useRef(null);
  G(() => {
    if (n === null) {
      p.current && ((p.current = null), d(null), l(null));
      return;
    }
    let e = (n && (Be(n) ? n : n.current)) ?? s ?? document.body;
    if (e == null) {
      p.current && ((p.current = null), d(null), l(null));
      return;
    }
    p.current !== e && ((p.current = e), d(null), l(e));
  }, [n, s]);
  let m = be(`div`, r, { ref: [t, f], props: [{ id: o, [$n]: `` }, i] }),
    h = c && m ? Xn.createPortal(m, c) : null;
  return {
    node: u,
    nodeId: a.isValidElement(m) ? m.props.id : void 0,
    subtree: h,
  };
}
var tr = a.forwardRef(function (e, t) {
  let {
      render: n,
      className: r,
      style: i,
      children: o,
      container: s,
      ...c
    } = e,
    {
      node: l,
      nodeId: u,
      subtree: d,
    } = er({ container: s, ref: t, componentProps: e, elementProps: c }),
    f = a.useRef(null),
    p = a.useRef(null),
    m = a.useRef(null),
    h = a.useRef(null),
    [g, _] = a.useState(null),
    v = a.useRef(!1),
    y = g?.modal,
    b = g?.open,
    x = !!g && !g.modal && g.open && !!l;
  (a.useEffect(() => {
    if (!l || y) return;
    function e(e) {
      l &&
        e.relatedTarget &&
        kn(e) &&
        (e.type === `focusin`
          ? (v.current &&= (jn(l), !1))
          : (An(l), (v.current = !0)));
    }
    return Zt(J(l, `focusin`, e, !0), J(l, `focusout`, e, !0));
  }, [l, y]),
    G(() => {
      !l || b !== !0 || !v.current || (jn(l), (v.current = !1));
    }, [b, l]));
  let S = a.useMemo(
    () => ({
      beforeOutsideRef: f,
      afterOutsideRef: p,
      beforeInsideRef: m,
      afterInsideRef: h,
      portalNode: l,
      setFocusManagerState: _,
    }),
    [l],
  );
  return (0, Y.jsxs)(a.Fragment, {
    children: [
      d,
      (0, Y.jsxs)(Zn.Provider, {
        value: S,
        children: [
          x &&
            l &&
            (0, Y.jsx)(sn, {
              "data-type": `outside`,
              ref: f,
              onFocus: (e) => {
                kn(e, l)
                  ? m.current?.focus()
                  : On(g ? g.domReference : null)?.focus();
              },
            }),
          x && l && (0, Y.jsx)(`span`, { "aria-owns": u, style: Yn }),
          l && Xn.createPortal(o, l),
          x &&
            l &&
            (0, Y.jsx)(sn, {
              "data-type": `outside`,
              ref: p,
              onFocus: (e) => {
                kn(e, l)
                  ? h.current?.focus()
                  : (Dn(g ? g.domReference : null)?.focus(),
                    g?.closeOnFocusOut &&
                      g?.onOpenChange(!1, ft(`focus-out`, e.nativeEvent)));
              },
            }),
        ],
      }),
    ],
  });
});
function nr() {
  let e = new Map();
  return {
    emit(t, n) {
      e.get(t)?.forEach((e) => e(n));
    },
    on(t, n) {
      (e.has(t) || e.set(t, new Set()), e.get(t).add(n));
    },
    off(t, n) {
      e.get(t)?.delete(n);
    },
  };
}
var rr = a.createContext(null),
  ir = a.createContext(null),
  ar = () => a.useContext(rr)?.id || null,
  or = (e) => {
    let t = a.useContext(ir);
    return e ?? t;
  };
function sr(e) {
  return e == null ? e : `current` in e ? e.current : e;
}
function cr(e, t) {
  let n = Re(Gt(e));
  return e instanceof n.KeyboardEvent
    ? `keyboard`
    : e instanceof n.FocusEvent
      ? t || `keyboard`
      : `pointerType` in e
        ? e.pointerType || `keyboard`
        : `touches` in e
          ? `touch`
          : e instanceof n.MouseEvent
            ? t || (e.detail === 0 ? `keyboard` : `mouse`)
            : ``;
}
var lr = 20,
  ur = [];
function dr() {
  ur = ur.filter((e) => e.deref()?.isConnected);
}
function fr(e) {
  (dr(),
    e &&
      Le(e) !== `body` &&
      (ur.push(new WeakRef(e)), ur.length > lr && (ur = ur.slice(-lr))));
}
function pr() {
  return (dr(), ur[ur.length - 1]?.deref());
}
function mr(e) {
  return e ? (Cn(e) ? e : Tn(e)[0] || e) : null;
}
function hr(e) {
  if (
    (e.hasAttribute(`tabindex`) && !e.hasAttribute(`data-tabindex`)) ||
    !e.getAttribute(`role`)?.includes(`dialog`)
  )
    return;
  let t = wn(e).filter((e) => {
      let t = e.getAttribute(`data-tabindex`) || ``;
      return Cn(e) || (e.hasAttribute(`data-tabindex`) && !t.startsWith(`-`));
    }),
    n = e.getAttribute(`tabindex`);
  t.length === 0
    ? n !== `0` &&
      (e.setAttribute(`tabindex`, `0`), e.setAttribute(`data-tabindex`, `0`))
    : (n !== `-1` ||
        (e.hasAttribute(`data-tabindex`) &&
          e.getAttribute(`data-tabindex`) !== `-1`)) &&
      (e.setAttribute(`tabindex`, `-1`), e.setAttribute(`data-tabindex`, `-1`));
}
function gr(e) {
  let {
      context: t,
      children: n,
      disabled: r = !1,
      initialFocus: i = !0,
      returnFocus: o = !0,
      restoreFocus: s = !1,
      modal: c = !0,
      closeOnFocusOut: l = !0,
      openInteractionType: u = ``,
      nextFocusableElement: d,
      previousFocusableElement: f,
      beforeContentFocusGuardRef: p,
      externalTree: m,
      getInsideElements: h,
    } = e,
    g = `rootStore` in t ? t.rootStore : t,
    _ = g.useState(`open`),
    v = g.useState(`domReferenceElement`),
    y = g.useState(`floatingElement`),
    { events: b, dataRef: x } = g.context,
    S = W(() => x.current.floatingContext?.nodeId),
    C = i === !1,
    w = Yt(v) && C,
    T = Qt(i),
    E = Qt(o),
    D = Qt(u),
    O = Qt(_),
    k = or(m),
    A = Qn(),
    j = a.useRef(!1),
    N = a.useRef(!1),
    P = a.useRef(!1),
    ee = a.useRef(null),
    F = a.useRef(``),
    te = a.useRef(``),
    ne = a.useRef(null),
    re = a.useRef(null),
    ie = M(ne, p, A?.beforeInsideRef),
    I = M(re, A?.afterInsideRef),
    L = Ct(),
    R = Ct(),
    z = rn(),
    B = A != null,
    V = Xt(y),
    ae = W((e = V) => (e ? Tn(e) : [])),
    H = W(() => h?.().filter((e) => e != null) ?? []);
  (a.useEffect(() => {
    if (r || !c) return;
    function e(e) {
      e.key === `Tab` && q(V, Wt(K(V))) && ae().length === 0 && !w && Rt(e);
    }
    return J(K(V), `keydown`, e);
  }, [r, V, c, w, ae]),
    a.useEffect(() => {
      if (r || !_) return;
      let e = K(V);
      function t() {
        P.current = !1;
      }
      function n(e) {
        let t = Gt(e),
          n = H();
        ((P.current = !(
          q(y, t) ||
          q(v, t) ||
          q(A?.portalNode, t) ||
          n.some((e) => e === t || q(e, t))
        )),
          (te.current = e.pointerType || `keyboard`),
          t?.closest(`[data-base-ui-click-trigger]`) &&
            ((N.current = !0),
            R.start(0, () => {
              N.current = !1;
            })));
      }
      function i() {
        te.current = `keyboard`;
      }
      return Zt(
        J(e, `pointerdown`, n, !0),
        J(e, `pointerup`, t, !0),
        J(e, `pointercancel`, t, !0),
        J(e, `keydown`, i, !0),
        t,
      );
    }, [r, y, v, V, _, A, R, H]),
    a.useEffect(() => {
      if (r || !l) return;
      let e = K(V);
      function t() {
        ((N.current = !0),
          R.start(0, () => {
            N.current = !1;
          }));
      }
      function n(e) {
        let t = Gt(e);
        Cn(t) && (ee.current = t);
      }
      function i(t) {
        let n = t.relatedTarget,
          r = t.currentTarget,
          i = Gt(t);
        (c && n == null && i != null && q(y, i) && fr(i),
          queueMicrotask(() => {
            let a = S(),
              o = g.context.triggerElements,
              l = H(),
              u =
                n?.hasAttribute(Pn(`focus-guard`)) &&
                [
                  ne.current,
                  re.current,
                  A?.beforeInsideRef.current,
                  A?.afterInsideRef.current,
                  A?.beforeOutsideRef.current,
                  A?.afterOutsideRef.current,
                  sr(f),
                  sr(d),
                ].includes(n),
              p = !(
                q(v, n) ||
                q(y, n) ||
                q(n, y) ||
                q(A?.portalNode, n) ||
                l.some((e) => e === n || q(e, n)) ||
                o.hasMatchingElement((e) => q(e, n)) ||
                u ||
                (k &&
                  (Mn(k.nodesRef.current, a).find(
                    (e) =>
                      q(e.context?.elements.floating, n) ||
                      q(e.context?.elements.domReference, n),
                  ) ||
                    Nn(k.nodesRef.current, a).find(
                      (e) =>
                        [
                          e.context?.elements.floating,
                          Xt(e.context?.elements.floating),
                        ].includes(n) || e.context?.elements.domReference === n,
                    )))
              );
            if (
              (r === v && V && hr(V),
              s && r !== v && !ln(i) && Wt(e) === e.body)
            ) {
              if (U(V) && (V.focus(), s === `popup`)) {
                z.request(() => {
                  V.focus();
                });
                return;
              }
              let e = ae(),
                t = ee.current,
                n = (t && e.includes(t) ? t : null) || e[e.length - 1] || V;
              U(n) && n.focus();
            }
            if (x.current.insideReactTree) {
              x.current.insideReactTree = !1;
              return;
            }
            (w || !c) &&
              n &&
              p &&
              !N.current &&
              (w || n !== pr()) &&
              ((j.current = !0), g.setOpen(!1, ft(lt, t)));
          }));
      }
      function a() {
        P.current ||
          ((x.current.insideReactTree = !0),
          L.start(0, () => {
            x.current.insideReactTree = !1;
          }));
      }
      let o = U(v) ? v : null;
      if (!(!y && !o))
        return Zt(
          o && J(o, `focusout`, i),
          o && J(o, `pointerdown`, t),
          y && J(y, `focusin`, n),
          y && J(y, `focusout`, i),
          y && A && J(y, `focusout`, a, !0),
        );
    }, [r, v, y, V, c, k, A, g, l, s, ae, w, S, x, L, R, z, d, f, H]),
    a.useEffect(() => {
      if (r || !y || !_) return;
      let e = Array.from(
          A?.portalNode?.querySelectorAll(`[${Pn(`portal`)}]`) || [],
        ),
        t = (k ? Nn(k.nodesRef.current, S()) : []).find((e) =>
          Yt(e.context?.elements.domReference || null),
        )?.context?.elements.domReference,
        n = Jn(
          [
            y,
            ...e,
            ne.current,
            re.current,
            A?.beforeOutsideRef.current,
            A?.afterOutsideRef.current,
            ...H(),
            t,
            sr(f),
            sr(d),
            w ? v : null,
          ].filter((e) => e != null),
          { ariaHidden: c || w, mark: !1 },
        ),
        i = Jn([y, ...e].filter((e) => e != null));
      return () => {
        (i(), n());
      };
    }, [_, r, v, y, c, A, w, k, S, d, f, H]),
    G(() => {
      if (!_ || r || !U(V)) return;
      ((F.current = ``), (te.current = ``));
      let e = K(V),
        t = Wt(e);
      queueMicrotask(() => {
        let n = T.current,
          r = typeof n == `function` ? n(D.current || ``) : n;
        if (r === void 0 || r === !1 || q(V, t)) return;
        let i = null,
          a = () => ((i ??= ae(V)), i[0] || V),
          o;
        ((o = r === !0 || r === null ? a() : sr(r)), (o ||= a()));
        let s = q(V, Wt(e));
        In(o, {
          preventScroll: o === V,
          shouldFocus() {
            if (!O.current) return !1;
            if (s) return !0;
            let t = Wt(e);
            return !(t !== o && q(V, t));
          },
        });
      });
    }, [r, _, V, ae, T, D, O]),
    G(() => {
      if (r || !V) return;
      let e = K(V),
        t = Wt(e),
        n = D.current == null;
      fr(t);
      function i(e) {
        if (
          (e.open || (F.current = cr(e.nativeEvent, te.current)),
          e.reason === `trigger-hover` &&
            e.nativeEvent.type === `mouseleave` &&
            (j.current = !0),
          e.reason === `outside-press`)
        )
          if (e.nested) j.current = !1;
          else if (Bt(e.nativeEvent) || Vt(e.nativeEvent)) j.current = !1;
          else {
            let e = !1;
            (K(V)
              .createElement(`div`)
              .focus({
                get preventScroll() {
                  return ((e = !0), !1);
                },
              }),
              e ? (j.current = !1) : (j.current = !0));
          }
      }
      b.on(`openchange`, i);
      function a(e) {
        let r = E.current,
          i = typeof r == `function` ? r(e) : r;
        if (i === void 0 || i === !1) return null;
        i === null && (i = !0);
        let a = v?.isConnected ? v : null,
          o = t?.isConnected && Le(t) !== `body` ? t : null,
          s = n ? o || a : a || o;
        return (
          (s ||= pr() || null),
          typeof i == `boolean` ? s : sr(i) || s || null
        );
      }
      return () => {
        b.off(`openchange`, i);
        let t = Wt(e),
          n = H(),
          r =
            q(y, t) ||
            n.some((e) => e === t || q(e, t)) ||
            (k &&
              Mn(k.nodesRef.current, S(), !1).some((e) =>
                q(e.context?.elements.floating, t),
              )),
          o = E.current,
          s = F.current,
          c = a(s);
        queueMicrotask(() => {
          let n = mr(c),
            i = typeof o != `boolean`;
          if (
            o &&
            !j.current &&
            U(n) &&
            (!(!i && n !== t && t !== e.body) || r)
          ) {
            let e = { preventScroll: !0 };
            (s === `keyboard` && (e.focusVisible = !0), n.focus(e));
          }
          j.current = !1;
        });
      };
    }, [r, y, V, E, D, b, k, v, S, H]),
    G(() => {
      if (!Ft || _ || !y) return;
      let e = Wt(K(y));
      !U(e) || !Jt(e) || (q(y, e) && e.blur());
    }, [_, y]),
    G(() => {
      if (!(r || !A))
        return (
          A.setFocusManagerState({
            modal: c,
            closeOnFocusOut: l,
            open: _,
            onOpenChange: g.setOpen,
            domReference: v,
          }),
          () => {
            A.setFocusManagerState(null);
          }
        );
    }, [r, A, c, _, g, l, v]),
    G(() => {
      if (!(r || !V))
        return (
          hr(V),
          () => {
            queueMicrotask(dr);
          }
        );
    }, [r, V]));
  let oe = !r && (c ? !w : !0) && (B || c);
  return (0, Y.jsxs)(a.Fragment, {
    children: [
      oe &&
        (0, Y.jsx)(sn, {
          "data-type": `inside`,
          ref: ie,
          onFocus: (e) => {
            if (c) {
              let e = ae();
              In(e[e.length - 1]);
            } else
              A?.portalNode &&
                ((j.current = !1),
                kn(e, A.portalNode)
                  ? Dn(v)?.focus()
                  : sr(f ?? A.beforeOutsideRef)?.focus());
          },
        }),
      n,
      oe &&
        (0, Y.jsx)(sn, {
          "data-type": `inside`,
          ref: I,
          onFocus: (e) => {
            c
              ? In(ae()[0])
              : A?.portalNode &&
                (l && (j.current = !0),
                kn(e, A.portalNode)
                  ? On(v)?.focus()
                  : sr(d ?? A.afterOutsideRef)?.focus());
          },
        }),
    ],
  });
}
function _r() {
  return !1;
}
function vr(e) {
  return {
    escapeKey: typeof e == `boolean` ? e : (e?.escapeKey ?? !1),
    outsidePress: typeof e == `boolean` ? e : (e?.outsidePress ?? !0),
  };
}
function yr(e, t = {}) {
  let {
      enabled: n = !0,
      escapeKey: r = !0,
      outsidePress: i = !0,
      outsidePressEvent: o = `sloppy`,
      referencePress: s = _r,
      bubbles: c,
      externalTree: l,
    } = t,
    u = `rootStore` in e ? e.rootStore : e,
    d = u.useState(`open`),
    f = u.useState(`floatingElement`),
    { dataRef: p } = u.context,
    m = or(l),
    h = W(typeof i == `function` ? i : () => !1),
    g = typeof i == `function` ? h : i,
    _ = g !== !1,
    v = W(() => o),
    { escapeKey: y, outsidePress: b } = vr(c),
    x = a.useRef(!1),
    S = a.useRef(!1),
    C = a.useRef(!1),
    w = a.useRef(!1),
    T = a.useRef(``),
    E = a.useRef(null),
    D = Ct(),
    O = Ct(),
    k = W(() => {
      (O.clear(), (p.current.insideReactTree = !1));
    }),
    A = W((e) => {
      let t = p.current.floatingContext?.nodeId;
      return (m ? Mn(m.nodesRef.current, t) : []).some(
        (t) => t.context?.open && !t.context.dataRef.current[e],
      );
    }),
    j = W(
      (e) =>
        Kt(e, u.select(`floatingElement`)) ||
        Kt(e, u.select(`domReferenceElement`)),
    ),
    M = W((e) => {
      s() && u.setOpen(!1, ft(ot, e.nativeEvent));
    }),
    N = W((e) => {
      if (
        !d ||
        !n ||
        !r ||
        e.key !== `Escape` ||
        w.current ||
        (!y && A(`__escapeKeyBubbles`))
      )
        return;
      let t = ft(ut, zt(e) ? e.nativeEvent : e);
      (u.setOpen(!1, t),
        t.isCanceled || e.preventDefault(),
        !y && !t.isPropagationAllowed && e.stopPropagation());
    }),
    P = W(() => {
      ((p.current.insideReactTree = !0), O.start(0, k));
    }),
    ee = W((e) => {
      if (!d || !n || e.button !== 0) return;
      let t = Gt(e.nativeEvent);
      q(u.select(`floatingElement`), t) &&
        (x.current || ((x.current = !0), (S.current = !1)));
    }),
    F = W((e) => {
      !d ||
        !n ||
        ((e.defaultPrevented || e.nativeEvent.defaultPrevented) &&
          x.current &&
          (S.current = !0));
    });
  a.useEffect(() => {
    if (!d || !n) return k;
    ((p.current.__escapeKeyBubbles = y), (p.current.__outsidePressBubbles = b));
    let e = new St(),
      t = new St();
    function i() {
      (e.clear(), (w.current = !0));
    }
    function a() {
      e.start(Ft ? 5 : 0, () => {
        w.current = !1;
      });
    }
    function o() {
      ((C.current = !0),
        t.start(0, () => {
          C.current = !1;
        }));
    }
    function s() {
      ((x.current = !1), (S.current = !1));
    }
    function c() {
      let e = T.current,
        t = e === `pen` || !e ? `mouse` : e,
        n = v(),
        r = typeof n == `function` ? n() : n;
      return typeof r == `string` ? r : r[t];
    }
    function l(e) {
      let t = c();
      return (
        (t === `intentional` && e.type !== `click`) ||
        (t === `sloppy` && e.type === `click`)
      );
    }
    function h(e) {
      let t = p.current.floatingContext?.nodeId,
        n =
          m &&
          Mn(m.nodesRef.current, t).some((t) =>
            Kt(e, t.context?.elements.floating),
          );
      return j(e) || n;
    }
    function O(e) {
      if (l(e)) {
        (e.type !== `click` && !j(e) && (t.clear(), (C.current = !1)), k());
        return;
      }
      if (p.current.insideReactTree) {
        k();
        return;
      }
      let n = Gt(e),
        r = `[${Pn(`inert`)}]`,
        i = Ve(n) ? n.getRootNode() : null,
        a = Array.from(
          (He(i) ? i : K(u.select(`floatingElement`))).querySelectorAll(r),
        ),
        o = u.context.triggerElements;
      if (n && (o.hasElement(n) || o.hasMatchingElement((e) => q(e, n))))
        return;
      let s = Ve(n) ? n : null;
      for (; s && !We(s);) {
        let e = Ke(s);
        if (We(e) || !Ve(e)) break;
        s = e;
      }
      if (!(
        a.length &&
        Ve(n) &&
        !qt(n) &&
        !q(n, u.select(`floatingElement`)) &&
        a.every((e) => !q(s, e))
      )) {
        if (U(n) && !(`touches` in e)) {
          let t = We(n),
            r = Ge(n),
            i = /auto|scroll/,
            a = t || i.test(r.overflowX),
            o = t || i.test(r.overflowY),
            s = a && n.clientWidth > 0 && n.scrollWidth > n.clientWidth,
            c = o && n.clientHeight > 0 && n.scrollHeight > n.clientHeight,
            l = r.direction === `rtl`,
            u =
              c &&
              (l
                ? e.offsetX <= n.offsetWidth - n.clientWidth
                : e.offsetX > n.clientWidth),
            d = s && e.offsetY > n.clientHeight;
          if (u || d) return;
        }
        if (!h(e)) {
          if (c() === `intentional` && C.current) {
            (t.clear(), (C.current = !1));
            return;
          }
          (typeof g == `function` && !g(e)) ||
            A(`__outsidePressBubbles`) ||
            (u.setOpen(!1, ft(st, e)), k());
        }
      }
    }
    function M(e) {
      c() !== `sloppy` ||
        e.pointerType === `touch` ||
        !u.select(`open`) ||
        !n ||
        j(e) ||
        O(e);
    }
    function P(e) {
      if (c() !== `sloppy` || !u.select(`open`) || !n || j(e)) return;
      let t = e.touches[0];
      t &&
        ((E.current = {
          startTime: Date.now(),
          startX: t.clientX,
          startY: t.clientY,
          dismissOnTouchEnd: !1,
          dismissOnMouseDown: !0,
        }),
        D.start(1e3, () => {
          E.current &&
            ((E.current.dismissOnTouchEnd = !1),
            (E.current.dismissOnMouseDown = !1));
        }));
    }
    function ee(e, t) {
      let n = Gt(e);
      if (!n) return;
      let r = J(n, e.type, () => {
        (t(e), r());
      });
    }
    function F(e) {
      ((T.current = `touch`), ee(e, P));
    }
    function te(e) {
      (D.clear(),
        e.type === `pointerdown` && (T.current = e.pointerType),
        !(
          e.type === `mousedown` &&
          E.current &&
          !E.current.dismissOnMouseDown
        ) &&
          ee(e, (e) => {
            e.type === `pointerdown` ? M(e) : O(e);
          }));
    }
    function ne(e) {
      if (!x.current) return;
      let n = S.current;
      if ((s(), c() === `intentional`)) {
        if (e.type === `pointercancel`) {
          n && o();
          return;
        }
        if (!h(e)) {
          if (n) {
            o();
            return;
          }
          (typeof g == `function` && !g(e)) ||
            (t.clear(), (C.current = !0), k());
        }
      }
    }
    function re(e) {
      if (c() !== `sloppy` || !E.current || j(e)) return;
      let t = e.touches[0];
      if (!t) return;
      let n = Math.abs(t.clientX - E.current.startX),
        r = Math.abs(t.clientY - E.current.startY),
        i = Math.sqrt(n * n + r * r);
      (i > 5 && (E.current.dismissOnTouchEnd = !0),
        i > 10 && (O(e), D.clear(), (E.current = null)));
    }
    function ie(e) {
      ee(e, re);
    }
    function I(e) {
      c() !== `sloppy` ||
        !E.current ||
        j(e) ||
        (E.current.dismissOnTouchEnd && O(e), D.clear(), (E.current = null));
    }
    function L(e) {
      ee(e, I);
    }
    let R = K(f),
      z = Zt(
        r &&
          Zt(
            J(R, `keydown`, N),
            J(R, `compositionstart`, i),
            J(R, `compositionend`, a),
          ),
        _ &&
          Zt(
            J(R, `click`, te, !0),
            J(R, `pointerdown`, te, !0),
            J(R, `pointerup`, ne, !0),
            J(R, `pointercancel`, ne, !0),
            J(R, `mousedown`, te, !0),
            J(R, `mouseup`, ne, !0),
            J(R, `touchstart`, F, !0),
            J(R, `touchmove`, ie, !0),
            J(R, `touchend`, L, !0),
          ),
      );
    return () => {
      (z(), e.clear(), t.clear(), s(), (C.current = !1), k());
    };
  }, [p, f, r, _, g, d, n, y, b, N, k, v, A, j, m, u, D]);
  let te = a.useMemo(
      () => ({ onKeyDown: N, onPointerDown: M, onClick: M }),
      [N, M],
    ),
    ne = a.useMemo(
      () => ({
        onKeyDown: N,
        onPointerDown: F,
        onMouseDown: F,
        onClickCapture: P,
        onMouseDownCapture(e) {
          (P(), ee(e));
        },
        onPointerDownCapture(e) {
          (P(), ee(e));
        },
        onMouseUpCapture: P,
        onTouchEndCapture: P,
        onTouchMoveCapture: P,
      }),
      [N, P, ee, F],
    );
  return a.useMemo(
    () => (n ? { reference: te, floating: ne, trigger: te } : {}),
    [n, te, ne],
  );
}
var br = t((e) => {
    var t = n();
    function r(e, t) {
      return (e === t && (e !== 0 || 1 / e == 1 / t)) || (e !== e && t !== t);
    }
    var i = typeof Object.is == `function` ? Object.is : r,
      a = t.useState,
      o = t.useEffect,
      s = t.useLayoutEffect,
      c = t.useDebugValue;
    function l(e, t) {
      var n = t(),
        r = a({ inst: { value: n, getSnapshot: t } }),
        i = r[0].inst,
        l = r[1];
      return (
        s(
          function () {
            ((i.value = n), (i.getSnapshot = t), u(i) && l({ inst: i }));
          },
          [e, n, t],
        ),
        o(
          function () {
            return (
              u(i) && l({ inst: i }),
              e(function () {
                u(i) && l({ inst: i });
              })
            );
          },
          [e],
        ),
        c(n),
        n
      );
    }
    function u(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var n = t();
        return !i(e, n);
      } catch {
        return !0;
      }
    }
    function d(e, t) {
      return t();
    }
    var f =
      window.document === void 0 || window.document.createElement === void 0
        ? d
        : l;
    e.useSyncExternalStore =
      t.useSyncExternalStore === void 0 ? f : t.useSyncExternalStore;
  }),
  xr = t((e, t) => {
    t.exports = br();
  }),
  Sr = t((e) => {
    var t = n(),
      r = xr();
    function i(e, t) {
      return (e === t && (e !== 0 || 1 / e == 1 / t)) || (e !== e && t !== t);
    }
    var a = typeof Object.is == `function` ? Object.is : i,
      o = r.useSyncExternalStore,
      s = t.useRef,
      c = t.useEffect,
      l = t.useMemo,
      u = t.useDebugValue;
    e.useSyncExternalStoreWithSelector = function (e, t, n, r, i) {
      var d = s(null);
      if (d.current === null) {
        var f = { hasValue: !1, value: null };
        d.current = f;
      } else f = d.current;
      d = l(
        function () {
          function e(e) {
            if (!o) {
              if (((o = !0), (s = e), (e = r(e)), i !== void 0 && f.hasValue)) {
                var t = f.value;
                if (i(t, e)) return (c = t);
              }
              return (c = e);
            }
            if (((t = c), a(s, e))) return t;
            var n = r(e);
            return i !== void 0 && i(t, n) ? ((s = e), t) : ((s = e), (c = n));
          }
          var o = !1,
            s,
            c,
            l = n === void 0 ? null : n;
          return [
            function () {
              return e(t());
            },
            l === null
              ? void 0
              : function () {
                  return e(l());
                },
          ];
        },
        [t, n, r, i],
      );
      var p = o(e, d[0], d[1]);
      return (
        c(
          function () {
            ((f.hasValue = !0), (f.value = p));
          },
          [p],
        ),
        u(p),
        p
      );
    };
  }),
  Cr = t((e, t) => {
    t.exports = Sr();
  }),
  wr = [],
  Tr = void 0;
function Er() {
  return Tr;
}
function Dr(e) {
  wr.push(e);
}
var Or = xr(),
  kr = Cr(),
  Ar = re(19) ? Nr : Pr;
function jr(e, t, n, r, i) {
  return Ar(e, t, n, r, i);
}
function Mr(e, t, n, r, i) {
  let o = a.useCallback(() => t(e.getSnapshot(), n, r, i), [e, t, n, r, i]);
  return (0, Or.useSyncExternalStore)(e.subscribe, o, o);
}
Dr({
  before(e) {
    ((e.syncIndex = 0),
      e.didInitialize ||
        ((e.syncTick = 1),
        (e.syncHooks = []),
        (e.didChangeStore = !0),
        (e.getSnapshot = () => {
          let t = !1;
          for (let n = 0; n < e.syncHooks.length; n += 1) {
            let r = e.syncHooks[n],
              i = r.selector(r.store.state, r.a1, r.a2, r.a3);
            Object.is(r.value, i) || ((t = !0), (r.value = i));
          }
          return (t && (e.syncTick += 1), e.syncTick);
        })));
  },
  after(e) {
    e.syncHooks.length > 0 &&
      (e.didChangeStore &&
        ((e.didChangeStore = !1),
        (e.subscribe = (t) => {
          let n = new Set();
          for (let t of e.syncHooks) n.add(t.store);
          let r = [];
          for (let e of n) r.push(e.subscribe(t));
          return () => {
            for (let e of r) e();
          };
        })),
      (0, Or.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getSnapshot));
  },
});
function Nr(e, t, n, r, i) {
  let a = Er();
  if (!a) return Mr(e, t, n, r, i);
  let o = a.syncIndex;
  a.syncIndex += 1;
  let s;
  return (
    a.didInitialize
      ? ((s = a.syncHooks[o]),
        (s.store !== e ||
          s.selector !== t ||
          !Object.is(s.a1, n) ||
          !Object.is(s.a2, r) ||
          !Object.is(s.a3, i)) &&
          (s.store !== e && (a.didChangeStore = !0),
          (s.store = e),
          (s.selector = t),
          (s.a1 = n),
          (s.a2 = r),
          (s.a3 = i),
          (s.value = t(e.getSnapshot(), n, r, i))))
      : ((s = {
          store: e,
          selector: t,
          a1: n,
          a2: r,
          a3: i,
          value: t(e.getSnapshot(), n, r, i),
        }),
        a.syncHooks.push(s)),
    s.value
  );
}
function Pr(e, t, n, r, i) {
  return (0, kr.useSyncExternalStoreWithSelector)(
    e.subscribe,
    e.getSnapshot,
    e.getSnapshot,
    (e) => t(e, n, r, i),
  );
}
var Fr = class {
    constructor(e) {
      ((this.state = e), (this.listeners = new Set()), (this.updateTick = 0));
    }
    subscribe = (e) => (
      this.listeners.add(e),
      () => {
        this.listeners.delete(e);
      }
    );
    getSnapshot = () => this.state;
    setState(e) {
      if (this.state === e) return;
      ((this.state = e), (this.updateTick += 1));
      let t = this.updateTick;
      for (let n of this.listeners) {
        if (t !== this.updateTick) return;
        n(e);
      }
    }
    update(e) {
      for (let t in e)
        if (!Object.is(this.state[t], e[t])) {
          this.setState({ ...this.state, ...e });
          return;
        }
    }
    set(e, t) {
      Object.is(this.state[e], t) || this.setState({ ...this.state, [e]: t });
    }
    notifyAll() {
      let e = { ...this.state };
      this.setState(e);
    }
    use(e, t, n, r) {
      return jr(this, e, t, n, r);
    }
  },
  Ir = class extends Fr {
    constructor(e, t = {}, n) {
      (super(e), (this.context = t), (this.selectors = n));
    }
    useSyncedValue(e, t) {
      a.useDebugValue(e);
      let n = this;
      G(() => {
        n.state[e] !== t && n.set(e, t);
      }, [n, e, t]);
    }
    useSyncedValueWithCleanup(e, t) {
      let n = this;
      G(
        () => (
          n.state[e] !== t && n.set(e, t),
          () => {
            n.set(e, void 0);
          }
        ),
        [n, e, t],
      );
    }
    useSyncedValues(e) {
      let t = this;
      G(() => {
        t.update(e);
      }, [t, ...Object.values(e)]);
    }
    useControlledProp(e, t) {
      a.useDebugValue(e);
      let n = this,
        r = t !== void 0;
      G(() => {
        r && !Object.is(n.state[e], t) && n.setState({ ...n.state, [e]: t });
      }, [n, e, t, r]);
    }
    select(e, t, n, r) {
      let i = this.selectors[e];
      return i(this.state, t, n, r);
    }
    useState(e, t, n, r) {
      return (a.useDebugValue(e), jr(this, this.selectors[e], t, n, r));
    }
    useContextCallback(e, t) {
      a.useDebugValue(e);
      let n = W(t ?? L);
      this.context[e] = n;
    }
    useStateSetter(e) {
      let t = a.useRef(void 0);
      return (
        t.current === void 0 &&
          (t.current = (t) => {
            this.set(e, t);
          }),
        t.current
      );
    }
    observe(e, t) {
      let n;
      n = typeof e == `function` ? e : this.selectors[e];
      let r = n(this.state);
      return (
        t(r, r, this),
        this.subscribe((e) => {
          let i = n(e);
          if (!Object.is(r, i)) {
            let e = r;
            ((r = i), t(i, e, this));
          }
        })
      );
    }
  },
  Lr = {
    open: (e) => e.open,
    transitionStatus: (e) => e.transitionStatus,
    domReferenceElement: (e) => e.domReferenceElement,
    referenceElement: (e) => e.positionReference ?? e.referenceElement,
    floatingElement: (e) => e.floatingElement,
    floatingId: (e) => e.floatingId,
  },
  Rr = class extends Ir {
    constructor(e) {
      let {
        syncOnly: t,
        nested: n,
        onOpenChange: r,
        triggerElements: i,
        ...a
      } = e;
      (super(
        {
          ...a,
          positionReference: a.referenceElement,
          domReferenceElement: a.referenceElement,
        },
        {
          onOpenChange: r,
          dataRef: { current: {} },
          events: nr(),
          nested: n,
          triggerElements: i,
        },
        Lr,
      ),
        (this.syncOnly = t));
    }
    syncOpenEvent = (e, t) => {
      (!e || !this.state.open || (t != null && Ht(t))) &&
        (this.context.dataRef.current.openEvent = e ? t : void 0);
    };
    dispatchOpenChange = (e, t) => {
      this.syncOpenEvent(e, t.event);
      let n = {
        open: e,
        reason: t.reason,
        nativeEvent: t.event,
        nested: this.context.nested,
        triggerElement: t.trigger,
      };
      this.context.events.emit(`openchange`, n);
    };
    setOpen = (e, t) => {
      if (this.syncOnly) {
        this.context.onOpenChange?.(e, t);
        return;
      }
      (this.dispatchOpenChange(e, t), this.context.onOpenChange?.(e, t));
    };
  };
function zr(e) {
  let {
      popupStore: t,
      treatPopupAsFloatingElement: n = !1,
      floatingRootContext: r,
      floatingId: i,
      nested: o,
      onOpenChange: s,
    } = e,
    c = t.useState(`open`),
    l = t.useState(`activeTriggerElement`),
    u = t.useState(n ? `popupElement` : `positionerElement`),
    d = t.context.triggerElements,
    f = s,
    p = a.useRef(null);
  r === void 0 &&
    p.current === null &&
    (p.current = new Rr({
      open: c,
      transitionStatus: void 0,
      referenceElement: l,
      floatingElement: u,
      triggerElements: d,
      onOpenChange: f,
      floatingId: i,
      syncOnly: !0,
      nested: o,
    }));
  let m = r ?? p.current;
  return (
    t.useSyncedValue(`floatingId`, i),
    G(() => {
      let e = {
        open: c,
        floatingId: i,
        referenceElement: l,
        floatingElement: u,
      };
      (Ve(l) && (e.domReferenceElement = l),
        m.state.positionReference === m.state.referenceElement &&
          (e.positionReference = l),
        m.update(e));
    }, [c, i, l, u, m]),
    (m.context.onOpenChange = f),
    (m.context.nested = o),
    m
  );
}
function Br(e, t = !1, n = !1) {
  let [r, i] = a.useState(e && t ? `idle` : void 0),
    [o, s] = a.useState(e);
  return (
    e && !o && (s(!0), i(`starting`)),
    !e && o && r !== `ending` && !n && i(`ending`),
    !e && !o && r === `ending` && i(void 0),
    G(() => {
      if (!e && o && r !== `ending` && n) {
        let e = nn.request(() => {
          i(`ending`);
        });
        return () => {
          nn.cancel(e);
        };
      }
    }, [e, o, r, n]),
    G(() => {
      if (!e || t) return;
      let n = nn.request(() => {
        i(void 0);
      });
      return () => {
        nn.cancel(n);
      };
    }, [t, e]),
    G(() => {
      if (!e || !t) return;
      e && o && r !== `idle` && i(`starting`);
      let n = nn.request(() => {
        i(`idle`);
      });
      return () => {
        nn.cancel(n);
      };
    }, [t, e, o, r]),
    { mounted: o, setMounted: s, transitionStatus: r }
  );
}
function Vr(e, t = !1) {
  let n = rn();
  return W((r, i = null) => {
    n.cancel();
    let a = sr(e);
    if (a == null) return;
    let o = a,
      s = () => {
        Xn.flushSync(r);
      };
    if (
      typeof o.getAnimations != `function` ||
      globalThis.BASE_UI_ANIMATIONS_DISABLED
    ) {
      r();
      return;
    }
    function c() {
      Promise.all(o.getAnimations().map((e) => e.finished)).then(
        () => {
          i?.aborted || s();
        },
        () => {
          if (!i?.aborted) {
            if (
              o
                .getAnimations()
                .some((e) => e.pending || e.playState !== `finished`)
            ) {
              c();
              return;
            }
            s();
          }
        },
      );
    }
    if (t) {
      let e = `data-starting-style`;
      if (!o.hasAttribute(e)) {
        n.request(c);
        return;
      }
      let t = new MutationObserver(() => {
        o.hasAttribute(e) || (t.disconnect(), c());
      });
      (t.observe(o, { attributes: !0, attributeFilter: [e] }),
        i?.addEventListener(`abort`, () => t.disconnect(), { once: !0 }));
      return;
    }
    n.request(c);
  });
}
function Hr(e) {
  let { enabled: t = !0, open: n, ref: r, onComplete: i } = e,
    o = W(i),
    s = Vr(r, n);
  a.useEffect(() => {
    if (!t) return;
    let e = new AbortController();
    return (
      s(o, e.signal),
      () => {
        e.abort();
      }
    );
  }, [t, n, o, s]);
}
var Ur = { tabIndex: -1, [Ut]: `` };
function Wr(e) {
  return (t) => (t === `touch` ? e.current : !0);
}
function Gr(e, t = !1) {
  let n = _t(),
    r = ar() != null,
    i = j(() => e(n, r)).current;
  return (
    zr({
      popupStore: i,
      treatPopupAsFloatingElement: t,
      floatingRootContext: i.state.floatingRootContext,
      floatingId: n,
      nested: r,
      onOpenChange: i.setOpen,
    }),
    i
  );
}
function Kr({ handle: e, store: t }) {
  return (G(() => e.attachStore(t), [e, t]), null);
}
function qr(e, t, n, r = !1) {
  t
    ? (e.preventUnmountingOnClose = !1)
    : r && (e.preventUnmountingOnClose = !0);
  let i = n?.id ?? null;
  (i || t) && ((e.activeTriggerId = i), (e.activeTriggerElement = n ?? null));
}
function Jr(e, t = {}) {
  let { closeOnActiveTriggerUnmount: n = !1 } = t,
    r = a.useRef(null),
    i = e.useState(`open`);
  G(() => {
    if (!i) {
      ((r.current = null),
        e.state.triggerCount !== 0 && e.set(`triggerCount`, 0));
      return;
    }
    let t = e.context.triggerElements.size,
      a = {};
    e.state.triggerCount !== t && (a.triggerCount = t);
    let o = e.select(`activeTriggerId`),
      s = null;
    if (o) {
      let t = e.context.triggerElements.getById(o);
      if (t)
        ((r.current = o),
          t !== e.state.activeTriggerElement && (a.activeTriggerElement = t));
      else {
        for (let [t, n] of e.context.triggerElements.entries())
          if (n === e.state.activeTriggerElement) {
            ((a.activeTriggerId = t),
              (a.activeTriggerElement = n),
              (r.current = t));
            break;
          }
        a.activeTriggerId === void 0 &&
          (r.current === o ? (s = o) : (r.current = null));
      }
    } else r.current = null;
    if (!s && !o && t === 1) {
      let t = e.context.triggerElements.entries().next();
      if (!t.done) {
        let [e, n] = t.value;
        ((a.activeTriggerId = e),
          (a.activeTriggerElement = n),
          (r.current = e));
      }
    }
    ((a.triggerCount !== void 0 ||
      a.activeTriggerId !== void 0 ||
      a.activeTriggerElement !== void 0) &&
      e.update(a),
      s &&
        n &&
        queueMicrotask(() => {
          if (
            e.select(`open`) &&
            e.select(`activeTriggerId`) === s &&
            !e.context.triggerElements.getById(s)
          ) {
            let t = ft(at);
            (e.setOpen(!1, t),
              t.isCanceled ||
                e.update({
                  activeTriggerId: null,
                  activeTriggerElement: null,
                }));
          }
        }));
  }, [
    i,
    e,
    e.useState(`triggerCount`),
    e.useState(`activeTriggerId`),
    e.useState(`activeTriggerElement`),
    n,
  ]);
}
function Yr(e, t, n) {
  let { mounted: r, setMounted: i, transitionStatus: a } = Br(e),
    o = t.useState(`preventUnmountingOnClose`),
    s = e ? !1 : o;
  t.useSyncedValues({
    mounted: r,
    transitionStatus: a,
    preventUnmountingOnClose: s,
  });
  let c = W(() => {
    (i(!1),
      t.update({
        activeTriggerId: null,
        activeTriggerElement: null,
        mounted: !1,
        preventUnmountingOnClose: !1,
      }),
      n?.(),
      t.context.onOpenChangeComplete?.(!1));
  });
  return (
    Hr({
      enabled: r && !e && !s,
      open: e,
      ref: t.context.popupRef,
      onComplete() {
        e || c();
      },
    }),
    { forceUnmount: c, transitionStatus: a }
  );
}
function Xr(e, t) {
  (e.useSyncedValues(t),
    G(
      () => () => {
        e.update({
          activeTriggerProps: z,
          inactiveTriggerProps: z,
          popupProps: z,
        });
      },
      [e],
    ));
}
function Zr(e, t) {
  (G(() => {
    !t && e.state.openMethod !== null && e.set(`openMethod`, null);
  }, [t, e]),
    G(
      () => () => {
        e.state.openMethod !== null && e.set(`openMethod`, null);
      },
      [e],
    ));
}
var Qr = class {
  constructor() {
    this.idMap = new Map();
  }
  add(e, t) {
    this.idMap.set(e, t);
  }
  delete(e) {
    this.idMap.delete(e);
  }
  hasElement(e) {
    for (let t of this.idMap.values()) if (t === e) return !0;
    return !1;
  }
  hasMatchingElement(e) {
    for (let t of this.idMap.values()) if (e(t)) return !0;
    return !1;
  }
  getById(e) {
    return this.idMap.get(e);
  }
  entries() {
    return this.idMap.entries();
  }
  elements() {
    return this.idMap.values();
  }
  get size() {
    return this.idMap.size;
  }
};
function $r() {
  return new Rr({
    open: !1,
    transitionStatus: void 0,
    floatingElement: null,
    referenceElement: null,
    triggerElements: new Qr(),
    floatingId: void 0,
    syncOnly: !1,
    nested: !1,
    onOpenChange: void 0,
  });
}
function ei() {
  return {
    open: !1,
    openProp: void 0,
    mounted: !1,
    transitionStatus: void 0,
    floatingRootContext: $r(),
    floatingId: void 0,
    triggerCount: 0,
    preventUnmountingOnClose: !1,
    payload: void 0,
    activeTriggerId: null,
    activeTriggerElement: null,
    triggerIdProp: void 0,
    popupElement: null,
    positionerElement: null,
    activeTriggerProps: z,
    inactiveTriggerProps: z,
    popupProps: z,
  };
}
function ti(e, t, n = !1) {
  return new Rr({
    open: !1,
    transitionStatus: void 0,
    floatingElement: null,
    referenceElement: null,
    triggerElements: e,
    floatingId: t,
    syncOnly: !0,
    nested: n,
    onOpenChange: void 0,
  });
}
var ni = (e) => e.triggerIdProp ?? e.activeTriggerId,
  ri = (e) => e.openProp ?? e.open,
  ii = (e) => (e.popupElement?.id ?? e.floatingId) || void 0;
function ai(e, t) {
  return t !== void 0 && ri(e) && ni(e) === t;
}
function oi(e, t) {
  return ai(e, t)
    ? !0
    : t !== void 0 && ri(e) && ni(e) == null && e.triggerCount === 1;
}
var si = {
    open: ri,
    mounted: (e) => e.mounted,
    transitionStatus: (e) => e.transitionStatus,
    floatingRootContext: (e) => e.floatingRootContext,
    triggerCount: (e) => e.triggerCount,
    preventUnmountingOnClose: (e) => e.preventUnmountingOnClose,
    payload: (e) => e.payload,
    activeTriggerId: ni,
    activeTriggerElement: (e) => (e.mounted ? e.activeTriggerElement : null),
    popupId: ii,
    isTriggerActive: (e, t) => t !== void 0 && ni(e) === t,
    isOpenedByTrigger: (e, t) => ai(e, t),
    isMountedByTrigger: (e, t) => t !== void 0 && ni(e) === t && e.mounted,
    triggerProps: (e, t) => (t ? e.activeTriggerProps : e.inactiveTriggerProps),
    triggerPopupId: (e, t) => (oi(e, t) ? ii(e) : void 0),
    popupProps: (e) => e.popupProps,
    popupElement: (e) => e.popupElement,
    positionerElement: (e) => e.positionerElement,
  },
  ci = a.createContext(void 0);
function li() {
  let e = a.useContext(ci);
  if (e === void 0) throw Error(D(26));
  return e;
}
var ui = new Set([
    `ArrowUp`,
    `ArrowDown`,
    `ArrowLeft`,
    `ArrowRight`,
    `Home`,
    `End`,
  ]),
  di = {
    ...Ne,
    ...ke,
    nestedDialogOpen(e) {
      return e ? { "data-nested-dialog-open": `` } : null;
    },
  },
  fi = a.forwardRef(function (e, t) {
    let {
        render: n,
        className: r,
        style: i,
        finalFocus: a,
        initialFocus: o,
        ...s
      } = e,
      c = k(),
      l = c.useState(`descriptionElementId`),
      u = c.useState(`disablePointerDismissal`),
      d = c.useState(`floatingRootContext`),
      f = c.useState(`popupProps`),
      p = c.useState(`modal`),
      m = c.useState(`mounted`),
      h = c.useState(`nested`),
      g = c.useState(`nestedOpenDialogCount`),
      _ = c.useState(`open`),
      v = c.useState(`openMethod`),
      y = c.useState(`titleElementId`),
      b = c.useState(`transitionStatus`),
      x = c.useState(`role`),
      S = d.useState(`floatingId`);
    (li(),
      Hr({
        open: _,
        ref: c.context.popupRef,
        onComplete() {
          _ && c.context.onOpenChangeComplete?.(!0);
        },
      }));
    let C = o === void 0 ? Wr(c.context.popupRef) : o,
      w = g > 0,
      T = c.useStateSetter(`popupElement`),
      E = be(`div`, e, {
        state: { open: _, nested: h, transitionStatus: b, nestedDialogOpen: w },
        props: [
          f,
          {
            id: S,
            "aria-labelledby": y,
            "aria-describedby": l,
            role: x,
            ...Ur,
            hidden: !m,
            onKeyDown(e) {
              ui.has(e.key) && e.stopPropagation();
            },
            style: { "--nested-dialogs": g },
          },
          s,
        ],
        ref: [t, c.context.popupRef, T],
        stateAttributesMapping: di,
      });
    return (0, Y.jsx)(gr, {
      context: d,
      openInteractionType: v,
      disabled: !m,
      closeOnFocusOut: !u,
      initialFocus: C,
      returnFocus: a,
      modal: p !== !1,
      restoreFocus: `popup`,
      children: E,
    });
  });
function pi(e) {
  return re(19) ? e : e ? `true` : void 0;
}
var mi = a.forwardRef(function (e, t) {
    let { cutout: n, ...r } = e,
      i;
    if (n) {
      let e = n.getBoundingClientRect();
      i = `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${e.left}px ${e.top}px,${e.left}px ${e.bottom}px,${e.right}px ${e.bottom}px,${e.right}px ${e.top}px,${e.left}px ${e.top}px)`;
    }
    return (0, Y.jsx)(`div`, {
      ref: t,
      role: `presentation`,
      "data-base-ui-inert": ``,
      ...r,
      style: {
        position: `fixed`,
        inset: 0,
        userSelect: `none`,
        WebkitUserSelect: `none`,
        clipPath: i,
      },
    });
  }),
  hi = a.forwardRef(function (e, t) {
    let { keepMounted: n = !1, ...r } = e,
      i = k(),
      a = i.useState(`mounted`),
      o = i.useState(`modal`),
      s = i.useState(`open`);
    return a || n
      ? (0, Y.jsx)(ci.Provider, {
          value: n,
          children: (0, Y.jsxs)(tr, {
            ref: t,
            ...r,
            children: [
              a &&
                o === !0 &&
                (0, Y.jsx)(mi, {
                  ref: i.context.internalBackdropRef,
                  inert: pi(!s),
                }),
              e.children,
            ],
          }),
        })
      : null;
  }),
  gi = {},
  _i = {},
  vi = ``;
function yi(e, t) {
  return Ue(e) ? e : t;
}
function bi(e, t, n) {
  return /hidden|clip/.test(e.getComputedStyle(yi(t, n)).overflowY);
}
function xi(e) {
  if (typeof document > `u`) return !1;
  let t = K(e);
  return Re(t).innerWidth - t.documentElement.clientWidth > 0;
}
function Si(e) {
  if (
    !(
      typeof CSS < `u` &&
      CSS.supports &&
      CSS.supports(`scrollbar-gutter`, `stable`)
    ) ||
    typeof document > `u`
  )
    return !1;
  let t = K(e),
    n = t.documentElement,
    r = t.body,
    i = yi(n, r),
    a = i.style.overflowY,
    o = n.style.scrollbarGutter;
  ((n.style.scrollbarGutter = `stable`), (i.style.overflowY = `scroll`));
  let s = i.offsetWidth;
  i.style.overflowY = `hidden`;
  let c = i.offsetWidth;
  return ((i.style.overflowY = a), (n.style.scrollbarGutter = o), s === c);
}
function Ci(e) {
  let t = K(e),
    n = t.documentElement,
    r = t.body,
    i = yi(n, r),
    a = { overflowY: i.style.overflowY, overflowX: i.style.overflowX };
  return (
    Object.assign(i.style, { overflowY: `hidden`, overflowX: `hidden` }),
    () => {
      Object.assign(i.style, a);
    }
  );
}
function wi(e) {
  let t = K(e),
    n = t.documentElement,
    r = t.body,
    i = Re(n),
    a = 0,
    o = 0,
    s = !1,
    c = nn.create();
  if (Ft && (i.visualViewport?.scale ?? 1) !== 1) return () => {};
  function l() {
    let t = i.getComputedStyle(n),
      c = i.getComputedStyle(r),
      l = (t.scrollbarGutter || ``).includes(`both-edges`)
        ? `stable both-edges`
        : `stable`;
    ((a = n.scrollTop),
      (o = n.scrollLeft),
      (gi = {
        scrollbarGutter: n.style.scrollbarGutter,
        overflowY: n.style.overflowY,
        overflowX: n.style.overflowX,
      }),
      (vi = n.style.scrollBehavior),
      (_i = {
        position: r.style.position,
        height: r.style.height,
        width: r.style.width,
        boxSizing: r.style.boxSizing,
        overflowY: r.style.overflowY,
        overflowX: r.style.overflowX,
        scrollBehavior: r.style.scrollBehavior,
      }));
    let u = n.scrollHeight > n.clientHeight,
      d = n.scrollWidth > n.clientWidth,
      f = t.overflowY === `scroll` || c.overflowY === `scroll`,
      p = t.overflowX === `scroll` || c.overflowX === `scroll`,
      m = Math.max(0, i.innerWidth - r.clientWidth),
      h = Math.max(0, i.innerHeight - r.clientHeight),
      g = parseFloat(c.marginTop) + parseFloat(c.marginBottom),
      _ = parseFloat(c.marginLeft) + parseFloat(c.marginRight),
      v = yi(n, r);
    if (((s = Si(e)), s)) {
      ((n.style.scrollbarGutter = l),
        (v.style.overflowY = `hidden`),
        (v.style.overflowX = `hidden`));
      return;
    }
    (Object.assign(n.style, {
      scrollbarGutter: l,
      overflowY: `hidden`,
      overflowX: `hidden`,
    }),
      (u || f) && (n.style.overflowY = `scroll`),
      (d || p) && (n.style.overflowX = `scroll`),
      Object.assign(r.style, {
        position: `relative`,
        height: g || h ? `calc(100dvh - ${g + h}px)` : `100dvh`,
        width: _ || m ? `calc(100vw - ${_ + m}px)` : `100vw`,
        boxSizing: `border-box`,
        overflowY: `hidden`,
        overflowX: `hidden`,
        scrollBehavior: `unset`,
      }),
      (r.scrollTop = a),
      (r.scrollLeft = o),
      n.setAttribute(`data-base-ui-scroll-locked`, ``),
      (n.style.scrollBehavior = `unset`));
  }
  function u() {
    (Object.assign(n.style, gi),
      Object.assign(r.style, _i),
      s ||
        ((n.scrollTop = a),
        (n.scrollLeft = o),
        n.removeAttribute(`data-base-ui-scroll-locked`),
        (n.style.scrollBehavior = vi)));
  }
  function d() {
    (u(), c.request(l));
  }
  l();
  let f = J(i, `resize`, d);
  return () => {
    (c.cancel(), u(), typeof i.removeEventListener == `function` && f());
  };
}
var Ti = new (class {
  lockCount = 0;
  restore = null;
  timeoutLock = St.create();
  timeoutUnlock = St.create();
  acquire(e) {
    return (
      (this.lockCount += 1),
      this.lockCount === 1 &&
        this.restore === null &&
        this.timeoutLock.start(0, () => this.lock(e)),
      this.release
    );
  }
  release = () => {
    (--this.lockCount,
      this.lockCount === 0 &&
        this.restore &&
        this.timeoutUnlock.start(0, this.unlock));
  };
  unlock = () => {
    this.lockCount === 0 &&
      this.restore &&
      (this.restore?.(), (this.restore = null));
  };
  lock(e) {
    if (this.lockCount === 0 || this.restore !== null) return;
    let t = K(e),
      n = t.documentElement,
      r = t.body,
      i = Re(n);
    if (bi(i, n, r)) {
      let t = new i.MutationObserver(() => {
          bi(i, n, r) || (t.disconnect(), (this.restore = null), this.lock(e));
        }),
        a = { attributes: !0 };
      (t.observe(n, a), t.observe(r, a), (this.restore = () => t.disconnect()));
      return;
    }
    let a = At || !xi(e);
    this.restore = a ? Ci(e) : wi(e);
  }
})();
function Ei(e = !0, t = null) {
  G(() => {
    if (e) return Ti.acquire(t);
  }, [e, t]);
}
function Di({ store: e, parentContext: t, isDrawer: n }) {
  let r = e.useState(`open`),
    i = e.useState(`disablePointerDismissal`),
    o = e.useState(`modal`),
    s = e.useState(`popupElement`),
    c = e.useState(`floatingRootContext`),
    [l, u] = a.useState(0),
    [d, f] = a.useState(0),
    p = l === 0,
    m = yr(c, {
      outsidePressEvent() {
        return e.context.internalBackdropRef.current ||
          e.context.backdropRef.current
          ? `intentional`
          : {
              mouse: o === `trap-focus` ? `sloppy` : `intentional`,
              touch: `sloppy`,
            };
      },
      outsidePress(t) {
        if (
          !e.context.outsidePressEnabledRef.current ||
          (`button` in t && t.button !== 0)
        )
          return !1;
        if (`touches` in t) {
          if (t.type === `touchend`) {
            if (t.changedTouches.length !== 1 || t.touches.length !== 0)
              return !1;
          } else if (t.touches.length !== 1) return !1;
        }
        let n = Gt(t);
        if (p && !i) {
          if (o) {
            let t = e.context.internalBackdropRef.current,
              r = e.context.backdropRef.current;
            return t || r
              ? t === n ||
                  r === n ||
                  (q(n, s) && !n?.hasAttribute(`data-base-ui-portal`))
              : !0;
          }
          return !0;
        }
        return !1;
      },
      escapeKey: p,
    });
  return (
    Ei(r && o === !0, s),
    e.useContextCallback(`onNestedDialogOpen`, (e, t) => {
      (u(e), f(t));
    }),
    G(
      () => (
        t?.onNestedDialogOpen &&
          (r
            ? t.onNestedDialogOpen(l + 1, d + +!!n)
            : t.onNestedDialogOpen(0, 0)),
        () => {
          t?.onNestedDialogOpen && r && t.onNestedDialogOpen(0, 0);
        }
      ),
      [n, r, l, d, t],
    ),
    Xr(e, {
      activeTriggerProps: m.reference,
      inactiveTriggerProps: m.trigger,
      popupProps: m.floating,
      nestedOpenDialogCount: l,
      nestedOpenDrawerCount: d,
    }),
    null
  );
}
var Oi = {
    ...si,
    modal: (e) => e.modal,
    nested: (e) => e.nested,
    nestedOpenDialogCount: (e) => e.nestedOpenDialogCount,
    nestedOpenDrawerCount: (e) => e.nestedOpenDrawerCount,
    disablePointerDismissal: (e) => e.disablePointerDismissal,
    openMethod: (e) => e.openMethod,
    descriptionElementId: (e) => e.descriptionElementId,
    titleElementId: (e) => e.titleElementId,
    viewportElement: (e) => e.viewportElement,
    role: (e) => e.role,
  },
  ki = class extends Ir {
    constructor(e, t, n) {
      let r = new Qr(),
        i = Ai(e, r, t, n);
      super(i, ji(r), Oi);
    }
    setOpen = (e, t) => {
      if (
        ((t.preventUnmountOnClose = () => {
          this.set(`preventUnmountingOnClose`, !0);
        }),
        !e &&
          t.trigger == null &&
          this.state.activeTriggerId != null &&
          (t.trigger = this.state.activeTriggerElement ?? void 0),
        this.context.onOpenChange?.(e, t),
        t.isCanceled)
      )
        return;
      this.state.floatingRootContext.dispatchOpenChange(e, t);
      let n = { open: e };
      (qr(n, e, t.trigger), this.update(n));
    };
  };
function Ai(e, t, n, r = !1) {
  let i = {
    ...ei(),
    modal: !0,
    disablePointerDismissal: !1,
    viewportElement: null,
    descriptionElementId: void 0,
    titleElementId: void 0,
    openMethod: null,
    nested: !1,
    nestedOpenDialogCount: 0,
    nestedOpenDrawerCount: 0,
    role: `dialog`,
    ...e,
  };
  return ((i.floatingRootContext = ti(t, n, r)), i);
}
function ji(e) {
  return {
    popupRef: a.createRef(),
    backdropRef: a.createRef(),
    internalBackdropRef: a.createRef(),
    outsidePressEnabledRef: { current: !0 },
    triggerElements: e,
    onOpenChange: void 0,
    onOpenChangeComplete: void 0,
  };
}
function Mi(e, t) {
  let {
      children: n,
      open: r,
      defaultOpen: i = !1,
      onOpenChange: o,
      onOpenChangeComplete: s,
      disablePointerDismissal: c = !1,
      modal: l = !0,
      actionsRef: u,
      handle: d,
      triggerId: f,
      defaultTriggerId: p = null,
    } = t,
    m = e === `drawer`,
    h = e === `alert-dialog`,
    g = h ? !0 : l,
    _ = h || c,
    v = h ? `alertdialog` : `dialog`,
    y = k(!0),
    b = { modal: g, disablePointerDismissal: _, nested: y != null, role: v },
    x = Gr(
      (e, t) =>
        new ki(
          { open: i, openProp: r, activeTriggerId: p, triggerIdProp: f, ...b },
          e,
          t,
        ),
      !0,
    );
  (x.useControlledProp(`openProp`, r),
    x.useControlledProp(`triggerIdProp`, f),
    x.useSyncedValues(b),
    x.useContextCallback(`onOpenChange`, o),
    x.useContextCallback(`onOpenChangeComplete`, s));
  let S = x.useState(`open`),
    C = x.useState(`mounted`),
    w = x.useState(`payload`);
  (Zr(x, S), Jr(x));
  let { forceUnmount: T } = Yr(S, x);
  a.useImperativeHandle(
    u,
    () => ({ unmount: T, close: () => x.setOpen(!1, ft(dt)) }),
    [T, x],
  );
  let E = S || C;
  return (0, Y.jsxs)(O.Provider, {
    value: x,
    children: [
      d && (0, Y.jsx)(Kr, { handle: d, store: x }),
      E && (0, Y.jsx)(Di, { store: x, parentContext: y?.context, isDrawer: m }),
      typeof n == `function` ? n({ payload: w }) : n,
    ],
  });
}
function Ni(e) {
  return Mi(`dialog`, e);
}
var Pi = a.forwardRef(function (e, t) {
  let { render: n, className: r, style: i, id: a, ...o } = e,
    s = k(),
    c = vt(a);
  return (
    s.useSyncedValueWithCleanup(`titleElementId`, c),
    be(`h2`, e, { ref: t, props: [{ id: c }, o] })
  );
});
function Fi(e) {
  var t,
    n,
    r = ``;
  if (typeof e == `string` || typeof e == `number`) r += e;
  else if (typeof e == `object`)
    if (Array.isArray(e)) {
      var i = e.length;
      for (t = 0; t < i; t++)
        e[t] && (n = Fi(e[t])) && (r && (r += ` `), (r += n));
    } else for (n in e) e[n] && (r && (r += ` `), (r += n));
  return r;
}
function Ii() {
  for (var e, t, n = 0, r = ``, i = arguments.length; n < i; n++)
    (e = arguments[n]) && (t = Fi(e)) && (r && (r += ` `), (r += t));
  return r;
}
var Li = (e, t) => {
    let n = Array(e.length + t.length);
    for (let t = 0; t < e.length; t++) n[t] = e[t];
    for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
    return n;
  },
  Ri = (e, t) => ({ classGroupId: e, validator: t }),
  zi = (e = new Map(), t = null, n) => ({
    nextPart: e,
    validators: t,
    classGroupId: n,
  }),
  Bi = `-`,
  Vi = [],
  Hi = `arbitrary..`,
  Ui = (e) => {
    let t = Ki(e),
      { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
    return {
      getClassGroupId: (e) => {
        if (e.startsWith(`[`) && e.endsWith(`]`)) return Gi(e);
        let n = e.split(Bi);
        return Wi(n, +(n[0] === `` && n.length > 1), t);
      },
      getConflictingClassGroupIds: (e, t) => {
        if (t) {
          let t = r[e],
            i = n[e];
          return t ? (i ? Li(i, t) : t) : i || Vi;
        }
        return n[e] || Vi;
      },
    };
  },
  Wi = (e, t, n) => {
    if (e.length - t === 0) return n.classGroupId;
    let r = e[t],
      i = n.nextPart.get(r);
    if (i) {
      let n = Wi(e, t + 1, i);
      if (n) return n;
    }
    let a = n.validators;
    if (a === null) return;
    let o = t === 0 ? e.join(Bi) : e.slice(t).join(Bi),
      s = a.length;
    for (let e = 0; e < s; e++) {
      let t = a[e];
      if (t.validator(o)) return t.classGroupId;
    }
  },
  Gi = (e) =>
    e.slice(1, -1).indexOf(`:`) === -1
      ? void 0
      : (() => {
          let t = e.slice(1, -1),
            n = t.indexOf(`:`),
            r = t.slice(0, n);
          return r ? Hi + r : void 0;
        })(),
  Ki = (e) => {
    let { theme: t, classGroups: n } = e;
    return qi(n, t);
  },
  qi = (e, t) => {
    let n = zi();
    for (let r in e) {
      let i = e[r];
      Ji(i, n, r, t);
    }
    return n;
  },
  Ji = (e, t, n, r) => {
    let i = e.length;
    for (let a = 0; a < i; a++) {
      let i = e[a];
      Yi(i, t, n, r);
    }
  },
  Yi = (e, t, n, r) => {
    if (typeof e == `string`) {
      Xi(e, t, n);
      return;
    }
    if (typeof e == `function`) {
      Zi(e, t, n, r);
      return;
    }
    Qi(e, t, n, r);
  },
  Xi = (e, t, n) => {
    let r = e === `` ? t : $i(t, e);
    r.classGroupId = n;
  },
  Zi = (e, t, n, r) => {
    if (ea(e)) {
      Ji(e(r), t, n, r);
      return;
    }
    (t.validators === null && (t.validators = []), t.validators.push(Ri(n, e)));
  },
  Qi = (e, t, n, r) => {
    let i = Object.entries(e),
      a = i.length;
    for (let e = 0; e < a; e++) {
      let [a, o] = i[e];
      Ji(o, $i(t, a), n, r);
    }
  },
  $i = (e, t) => {
    let n = e,
      r = t.split(Bi),
      i = r.length;
    for (let e = 0; e < i; e++) {
      let t = r[e],
        i = n.nextPart.get(t);
      (i || ((i = zi()), n.nextPart.set(t, i)), (n = i));
    }
    return n;
  },
  ea = (e) => `isThemeGetter` in e && e.isThemeGetter === !0,
  ta = (e) => {
    if (e < 1) return { get: () => void 0, set: () => {} };
    let t = 0,
      n = Object.create(null),
      r = Object.create(null),
      i = (i, a) => {
        ((n[i] = a),
          t++,
          t > e && ((t = 0), (r = n), (n = Object.create(null))));
      };
    return {
      get(e) {
        let t = n[e];
        if (t !== void 0) return t;
        if ((t = r[e]) !== void 0) return (i(e, t), t);
      },
      set(e, t) {
        e in n ? (n[e] = t) : i(e, t);
      },
    };
  },
  na = `!`,
  ra = `:`,
  ia = [],
  aa = (e, t, n, r, i) => ({
    modifiers: e,
    hasImportantModifier: t,
    baseClassName: n,
    maybePostfixModifierPosition: r,
    isExternal: i,
  }),
  oa = (e) => {
    let { prefix: t, experimentalParseClassName: n } = e,
      r = (e) => {
        let t = [],
          n = 0,
          r = 0,
          i = 0,
          a,
          o = e.length;
        for (let s = 0; s < o; s++) {
          let o = e[s];
          if (n === 0 && r === 0) {
            if (o === ra) {
              (t.push(e.slice(i, s)), (i = s + 1));
              continue;
            }
            if (o === `/`) {
              a = s;
              continue;
            }
          }
          o === `[`
            ? n++
            : o === `]`
              ? n--
              : o === `(`
                ? r++
                : o === `)` && r--;
        }
        let s = t.length === 0 ? e : e.slice(i),
          c = s,
          l = !1;
        s.endsWith(na)
          ? ((c = s.slice(0, -1)), (l = !0))
          : s.startsWith(na) && ((c = s.slice(1)), (l = !0));
        let u = a && a > i ? a - i : void 0;
        return aa(t, l, c, u);
      };
    if (t) {
      let e = t + ra,
        n = r;
      r = (t) =>
        t.startsWith(e) ? n(t.slice(e.length)) : aa(ia, !1, t, void 0, !0);
    }
    if (n) {
      let e = r;
      r = (t) => n({ className: t, parseClassName: e });
    }
    return r;
  },
  sa = (e) => {
    let t = new Map();
    return (
      e.orderSensitiveModifiers.forEach((e, n) => {
        t.set(e, 1e6 + n);
      }),
      (e) => {
        let n = [],
          r = [];
        for (let i = 0; i < e.length; i++) {
          let a = e[i],
            o = a[0] === `[`,
            s = t.has(a);
          o || s
            ? (r.length > 0 && (r.sort(), n.push(...r), (r = [])), n.push(a))
            : r.push(a);
        }
        return (r.length > 0 && (r.sort(), n.push(...r)), n);
      }
    );
  },
  ca = (e) => ({
    cache: ta(e.cacheSize),
    parseClassName: oa(e),
    sortModifiers: sa(e),
    postfixLookupClassGroupIds: la(e),
    ...Ui(e),
  }),
  la = (e) => {
    let t = Object.create(null),
      n = e.postfixLookupClassGroups;
    if (n) for (let e = 0; e < n.length; e++) t[n[e]] = !0;
    return t;
  },
  ua = /\s+/,
  da = (e, t) => {
    let {
        parseClassName: n,
        getClassGroupId: r,
        getConflictingClassGroupIds: i,
        sortModifiers: a,
        postfixLookupClassGroupIds: o,
      } = t,
      s = [],
      c = e.trim().split(ua),
      l = ``;
    for (let e = c.length - 1; e >= 0; --e) {
      let t = c[e],
        {
          isExternal: u,
          modifiers: d,
          hasImportantModifier: f,
          baseClassName: p,
          maybePostfixModifierPosition: m,
        } = n(t);
      if (u) {
        l = t + (l.length > 0 ? ` ` + l : l);
        continue;
      }
      let h = !!m,
        g;
      if (h) {
        g = r(p.substring(0, m));
        let e = g && o[g] ? r(p) : void 0;
        e && e !== g && ((g = e), (h = !1));
      } else g = r(p);
      if (!g) {
        if (!h) {
          l = t + (l.length > 0 ? ` ` + l : l);
          continue;
        }
        if (((g = r(p)), !g)) {
          l = t + (l.length > 0 ? ` ` + l : l);
          continue;
        }
        h = !1;
      }
      let _ = d.length === 0 ? `` : d.length === 1 ? d[0] : a(d).join(`:`),
        v = f ? _ + na : _,
        y = v + g;
      if (s.indexOf(y) > -1) continue;
      s.push(y);
      let b = i(g, h);
      for (let e = 0; e < b.length; ++e) {
        let t = b[e];
        s.push(v + t);
      }
      l = t + (l.length > 0 ? ` ` + l : l);
    }
    return l;
  },
  fa = (...e) => {
    let t = 0,
      n,
      r,
      i = ``;
    for (; t < e.length;)
      (n = e[t++]) && (r = pa(n)) && (i && (i += ` `), (i += r));
    return i;
  },
  pa = (e) => {
    if (typeof e == `string`) return e;
    let t,
      n = ``;
    for (let r = 0; r < e.length; r++)
      e[r] && (t = pa(e[r])) && (n && (n += ` `), (n += t));
    return n;
  },
  ma = (e, ...t) => {
    let n,
      r,
      i,
      a,
      o = (o) => (
        (n = ca(t.reduce((e, t) => t(e), e()))),
        (r = n.cache.get),
        (i = n.cache.set),
        (a = s),
        s(o)
      ),
      s = (e) => {
        let t = r(e);
        if (t) return t;
        let a = da(e, n);
        return (i(e, a), a);
      };
    return ((a = o), (...e) => a(fa(...e)));
  },
  ha = [],
  X = (e) => {
    let t = (t) => t[e] || ha;
    return ((t.isThemeGetter = !0), t);
  },
  ga = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  _a = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  va = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/,
  ya = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  ba =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  xa = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  Sa = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  Ca =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  wa = (e) => va.test(e),
  Z = (e) => !!e && !Number.isNaN(Number(e)),
  Ta = (e) => !!e && Number.isInteger(Number(e)),
  Ea = (e) => e.endsWith(`%`) && Z(e.slice(0, -1)),
  Da = (e) => ya.test(e),
  Oa = () => !0,
  ka = (e) => ba.test(e) && !xa.test(e),
  Aa = () => !1,
  ja = (e) => Sa.test(e),
  Ma = (e) => Ca.test(e),
  Na = (e) => !Q(e) && !$(e),
  Pa = (e) =>
    e.startsWith(`@container`) &&
    ((e[10] === `/` && e[11] !== void 0) ||
      (e[11] === `s` && e[16] !== void 0 && e.startsWith(`-size/`, 10)) ||
      (e[11] === `n` && e[18] !== void 0 && e.startsWith(`-normal/`, 10))),
  Fa = (e) => Xa(e, eo, Aa),
  Q = (e) => ga.test(e),
  Ia = (e) => Xa(e, to, ka),
  La = (e) => Xa(e, no, Z),
  Ra = (e) => Xa(e, io, Oa),
  za = (e) => Xa(e, ro, Aa),
  Ba = (e) => Xa(e, Qa, Aa),
  Va = (e) => Xa(e, $a, Ma),
  Ha = (e) => Xa(e, ao, ja),
  $ = (e) => _a.test(e),
  Ua = (e) => Za(e, to),
  Wa = (e) => Za(e, ro),
  Ga = (e) => Za(e, Qa),
  Ka = (e) => Za(e, eo),
  qa = (e) => Za(e, $a),
  Ja = (e) => Za(e, ao, !0),
  Ya = (e) => Za(e, io, !0),
  Xa = (e, t, n) => {
    let r = ga.exec(e);
    return r ? (r[1] ? t(r[1]) : n(r[2])) : !1;
  },
  Za = (e, t, n = !1) => {
    let r = _a.exec(e);
    return r ? (r[1] ? t(r[1]) : n) : !1;
  },
  Qa = (e) => e === `position` || e === `percentage`,
  $a = (e) => e === `image` || e === `url`,
  eo = (e) => e === `length` || e === `size` || e === `bg-size`,
  to = (e) => e === `length`,
  no = (e) => e === `number`,
  ro = (e) => e === `family-name`,
  io = (e) => e === `number` || e === `weight`,
  ao = (e) => e === `shadow`,
  oo = ma(() => {
    let e = X(`color`),
      t = X(`font`),
      n = X(`text`),
      r = X(`font-weight`),
      i = X(`tracking`),
      a = X(`leading`),
      o = X(`breakpoint`),
      s = X(`container`),
      c = X(`spacing`),
      l = X(`radius`),
      u = X(`shadow`),
      d = X(`inset-shadow`),
      f = X(`text-shadow`),
      p = X(`drop-shadow`),
      m = X(`blur`),
      h = X(`perspective`),
      g = X(`aspect`),
      _ = X(`ease`),
      v = X(`animate`),
      y = () => [
        `auto`,
        `avoid`,
        `all`,
        `avoid-page`,
        `page`,
        `left`,
        `right`,
        `column`,
      ],
      b = () => [
        `center`,
        `top`,
        `bottom`,
        `left`,
        `right`,
        `top-left`,
        `left-top`,
        `top-right`,
        `right-top`,
        `bottom-right`,
        `right-bottom`,
        `bottom-left`,
        `left-bottom`,
      ],
      x = () => [...b(), $, Q],
      S = () => [`auto`, `hidden`, `clip`, `visible`, `scroll`],
      C = () => [`auto`, `contain`, `none`],
      w = () => [$, Q, c],
      T = () => [wa, `full`, `auto`, ...w()],
      E = () => [Ta, `none`, `subgrid`, $, Q],
      D = () => [`auto`, { span: [`full`, Ta, $, Q] }, Ta, $, Q],
      O = () => [Ta, `auto`, $, Q],
      k = () => [`auto`, `min`, `max`, `fr`, $, Q],
      A = () => [
        `start`,
        `end`,
        `center`,
        `between`,
        `around`,
        `evenly`,
        `stretch`,
        `baseline`,
        `center-safe`,
        `end-safe`,
      ],
      j = () => [
        `start`,
        `end`,
        `center`,
        `stretch`,
        `center-safe`,
        `end-safe`,
      ],
      M = () => [`auto`, ...w()],
      N = () => [
        wa,
        `auto`,
        `full`,
        `dvw`,
        `dvh`,
        `lvw`,
        `lvh`,
        `svw`,
        `svh`,
        `min`,
        `max`,
        `fit`,
        ...w(),
      ],
      P = () => [
        wa,
        `screen`,
        `full`,
        `dvw`,
        `lvw`,
        `svw`,
        `min`,
        `max`,
        `fit`,
        ...w(),
      ],
      ee = () => [
        wa,
        `screen`,
        `full`,
        `lh`,
        `dvh`,
        `lvh`,
        `svh`,
        `min`,
        `max`,
        `fit`,
        ...w(),
      ],
      F = () => [e, $, Q],
      te = () => [...b(), Ga, Ba, { position: [$, Q] }],
      ne = () => [`no-repeat`, { repeat: [``, `x`, `y`, `space`, `round`] }],
      re = () => [`auto`, `cover`, `contain`, Ka, Fa, { size: [$, Q] }],
      ie = () => [Ea, Ua, Ia],
      I = () => [``, `none`, `full`, l, $, Q],
      L = () => [``, Z, Ua, Ia],
      R = () => [`solid`, `dashed`, `dotted`, `double`],
      z = () => [
        `normal`,
        `multiply`,
        `screen`,
        `overlay`,
        `darken`,
        `lighten`,
        `color-dodge`,
        `color-burn`,
        `hard-light`,
        `soft-light`,
        `difference`,
        `exclusion`,
        `hue`,
        `saturation`,
        `color`,
        `luminosity`,
      ],
      B = () => [Z, Ea, Ga, Ba],
      V = () => [``, `none`, m, $, Q],
      ae = () => [`none`, Z, $, Q],
      H = () => [`none`, Z, $, Q],
      oe = () => [Z, $, Q],
      se = () => [wa, `full`, ...w()];
    return {
      cacheSize: 500,
      theme: {
        animate: [`spin`, `ping`, `pulse`, `bounce`],
        aspect: [`video`],
        blur: [Da],
        breakpoint: [Da],
        color: [Oa],
        container: [Da],
        "drop-shadow": [Da],
        ease: [`in`, `out`, `in-out`],
        font: [Na],
        "font-weight": [
          `thin`,
          `extralight`,
          `light`,
          `normal`,
          `medium`,
          `semibold`,
          `bold`,
          `extrabold`,
          `black`,
        ],
        "inset-shadow": [Da],
        leading: [`none`, `tight`, `snug`, `normal`, `relaxed`, `loose`],
        perspective: [
          `dramatic`,
          `near`,
          `normal`,
          `midrange`,
          `distant`,
          `none`,
        ],
        radius: [Da],
        shadow: [Da],
        spacing: [`px`, Z],
        text: [Da],
        "text-shadow": [Da],
        tracking: [`tighter`, `tight`, `normal`, `wide`, `wider`, `widest`],
      },
      classGroups: {
        aspect: [{ aspect: [`auto`, `square`, wa, Q, $, g] }],
        container: [`container`],
        "container-type": [{ "@container": [``, `normal`, `size`, $, Q] }],
        "container-named": [Pa],
        columns: [{ columns: [Z, Q, $, s] }],
        "break-after": [{ "break-after": y() }],
        "break-before": [{ "break-before": y() }],
        "break-inside": [
          { "break-inside": [`auto`, `avoid`, `avoid-page`, `avoid-column`] },
        ],
        "box-decoration": [{ "box-decoration": [`slice`, `clone`] }],
        box: [{ box: [`border`, `content`] }],
        display: [
          `block`,
          `inline-block`,
          `inline`,
          `flex`,
          `inline-flex`,
          `table`,
          `inline-table`,
          `table-caption`,
          `table-cell`,
          `table-column`,
          `table-column-group`,
          `table-footer-group`,
          `table-header-group`,
          `table-row-group`,
          `table-row`,
          `flow-root`,
          `grid`,
          `inline-grid`,
          `contents`,
          `list-item`,
          `hidden`,
        ],
        sr: [`sr-only`, `not-sr-only`],
        float: [{ float: [`right`, `left`, `none`, `start`, `end`] }],
        clear: [{ clear: [`left`, `right`, `both`, `none`, `start`, `end`] }],
        isolation: [`isolate`, `isolation-auto`],
        "object-fit": [
          { object: [`contain`, `cover`, `fill`, `none`, `scale-down`] },
        ],
        "object-position": [{ object: x() }],
        overflow: [{ overflow: S() }],
        "overflow-x": [{ "overflow-x": S() }],
        "overflow-y": [{ "overflow-y": S() }],
        overscroll: [{ overscroll: C() }],
        "overscroll-x": [{ "overscroll-x": C() }],
        "overscroll-y": [{ "overscroll-y": C() }],
        position: [`static`, `fixed`, `absolute`, `relative`, `sticky`],
        inset: [{ inset: T() }],
        "inset-x": [{ "inset-x": T() }],
        "inset-y": [{ "inset-y": T() }],
        start: [{ "inset-s": T(), start: T() }],
        end: [{ "inset-e": T(), end: T() }],
        "inset-bs": [{ "inset-bs": T() }],
        "inset-be": [{ "inset-be": T() }],
        top: [{ top: T() }],
        right: [{ right: T() }],
        bottom: [{ bottom: T() }],
        left: [{ left: T() }],
        visibility: [`visible`, `invisible`, `collapse`],
        z: [{ z: [Ta, `auto`, $, Q] }],
        basis: [{ basis: [wa, `full`, `auto`, s, ...w()] }],
        "flex-direction": [
          { flex: [`row`, `row-reverse`, `col`, `col-reverse`] },
        ],
        "flex-wrap": [{ flex: [`nowrap`, `wrap`, `wrap-reverse`] }],
        flex: [{ flex: [Z, wa, `auto`, `initial`, `none`, Q] }],
        grow: [{ grow: [``, Z, $, Q] }],
        shrink: [{ shrink: [``, Z, $, Q] }],
        order: [{ order: [Ta, `first`, `last`, `none`, $, Q] }],
        "grid-cols": [{ "grid-cols": E() }],
        "col-start-end": [{ col: D() }],
        "col-start": [{ "col-start": O() }],
        "col-end": [{ "col-end": O() }],
        "grid-rows": [{ "grid-rows": E() }],
        "row-start-end": [{ row: D() }],
        "row-start": [{ "row-start": O() }],
        "row-end": [{ "row-end": O() }],
        "grid-flow": [
          { "grid-flow": [`row`, `col`, `dense`, `row-dense`, `col-dense`] },
        ],
        "auto-cols": [{ "auto-cols": k() }],
        "auto-rows": [{ "auto-rows": k() }],
        gap: [{ gap: w() }],
        "gap-x": [{ "gap-x": w() }],
        "gap-y": [{ "gap-y": w() }],
        "justify-content": [{ justify: [...A(), `normal`] }],
        "justify-items": [{ "justify-items": [...j(), `normal`] }],
        "justify-self": [{ "justify-self": [`auto`, ...j()] }],
        "align-content": [{ content: [`normal`, ...A()] }],
        "align-items": [{ items: [...j(), { baseline: [``, `last`] }] }],
        "align-self": [{ self: [`auto`, ...j(), { baseline: [``, `last`] }] }],
        "place-content": [{ "place-content": A() }],
        "place-items": [{ "place-items": [...j(), `baseline`] }],
        "place-self": [{ "place-self": [`auto`, ...j()] }],
        p: [{ p: w() }],
        px: [{ px: w() }],
        py: [{ py: w() }],
        ps: [{ ps: w() }],
        pe: [{ pe: w() }],
        pbs: [{ pbs: w() }],
        pbe: [{ pbe: w() }],
        pt: [{ pt: w() }],
        pr: [{ pr: w() }],
        pb: [{ pb: w() }],
        pl: [{ pl: w() }],
        m: [{ m: M() }],
        mx: [{ mx: M() }],
        my: [{ my: M() }],
        ms: [{ ms: M() }],
        me: [{ me: M() }],
        mbs: [{ mbs: M() }],
        mbe: [{ mbe: M() }],
        mt: [{ mt: M() }],
        mr: [{ mr: M() }],
        mb: [{ mb: M() }],
        ml: [{ ml: M() }],
        "space-x": [{ "space-x": w() }],
        "space-x-reverse": [`space-x-reverse`],
        "space-y": [{ "space-y": w() }],
        "space-y-reverse": [`space-y-reverse`],
        size: [{ size: N() }],
        "inline-size": [{ inline: [`auto`, ...P()] }],
        "min-inline-size": [{ "min-inline": [`auto`, ...P()] }],
        "max-inline-size": [{ "max-inline": [`none`, ...P()] }],
        "block-size": [{ block: [`auto`, ...ee()] }],
        "min-block-size": [{ "min-block": [`auto`, ...ee()] }],
        "max-block-size": [{ "max-block": [`none`, ...ee()] }],
        w: [{ w: [s, `screen`, ...N()] }],
        "min-w": [{ "min-w": [s, `screen`, `none`, ...N()] }],
        "max-w": [
          { "max-w": [s, `screen`, `none`, `prose`, { screen: [o] }, ...N()] },
        ],
        h: [{ h: [`screen`, `lh`, ...N()] }],
        "min-h": [{ "min-h": [`screen`, `lh`, `none`, ...N()] }],
        "max-h": [{ "max-h": [`screen`, `lh`, ...N()] }],
        "font-size": [{ text: [`base`, n, Ua, Ia] }],
        "font-smoothing": [`antialiased`, `subpixel-antialiased`],
        "font-style": [`italic`, `not-italic`],
        "font-weight": [{ font: [r, Ya, Ra] }],
        "font-stretch": [
          {
            "font-stretch": [
              `ultra-condensed`,
              `extra-condensed`,
              `condensed`,
              `semi-condensed`,
              `normal`,
              `semi-expanded`,
              `expanded`,
              `extra-expanded`,
              `ultra-expanded`,
              Ea,
              Q,
            ],
          },
        ],
        "font-family": [{ font: [Wa, za, t] }],
        "font-features": [{ "font-features": [Q] }],
        "fvn-normal": [`normal-nums`],
        "fvn-ordinal": [`ordinal`],
        "fvn-slashed-zero": [`slashed-zero`],
        "fvn-figure": [`lining-nums`, `oldstyle-nums`],
        "fvn-spacing": [`proportional-nums`, `tabular-nums`],
        "fvn-fraction": [`diagonal-fractions`, `stacked-fractions`],
        tracking: [{ tracking: [i, $, Q] }],
        "line-clamp": [{ "line-clamp": [Z, `none`, $, La] }],
        leading: [{ leading: [a, ...w()] }],
        "list-image": [{ "list-image": [`none`, $, Q] }],
        "list-style-position": [{ list: [`inside`, `outside`] }],
        "list-style-type": [{ list: [`disc`, `decimal`, `none`, $, Q] }],
        "text-alignment": [
          { text: [`left`, `center`, `right`, `justify`, `start`, `end`] },
        ],
        "placeholder-color": [{ placeholder: F() }],
        "text-color": [{ text: F() }],
        "text-decoration": [
          `underline`,
          `overline`,
          `line-through`,
          `no-underline`,
        ],
        "text-decoration-style": [{ decoration: [...R(), `wavy`] }],
        "text-decoration-thickness": [
          { decoration: [Z, `from-font`, `auto`, $, Ia] },
        ],
        "text-decoration-color": [{ decoration: F() }],
        "underline-offset": [{ "underline-offset": [Z, `auto`, $, Q] }],
        "text-transform": [
          `uppercase`,
          `lowercase`,
          `capitalize`,
          `normal-case`,
        ],
        "text-overflow": [`truncate`, `text-ellipsis`, `text-clip`],
        "text-wrap": [{ text: [`wrap`, `nowrap`, `balance`, `pretty`] }],
        indent: [{ indent: w() }],
        "tab-size": [{ tab: [Ta, $, Q] }],
        "vertical-align": [
          {
            align: [
              `baseline`,
              `top`,
              `middle`,
              `bottom`,
              `text-top`,
              `text-bottom`,
              `sub`,
              `super`,
              $,
              Q,
            ],
          },
        ],
        whitespace: [
          {
            whitespace: [
              `normal`,
              `nowrap`,
              `pre`,
              `pre-line`,
              `pre-wrap`,
              `break-spaces`,
            ],
          },
        ],
        break: [{ break: [`normal`, `words`, `all`, `keep`] }],
        wrap: [{ wrap: [`break-word`, `anywhere`, `normal`] }],
        hyphens: [{ hyphens: [`none`, `manual`, `auto`] }],
        content: [{ content: [`none`, $, Q] }],
        "bg-attachment": [{ bg: [`fixed`, `local`, `scroll`] }],
        "bg-clip": [{ "bg-clip": [`border`, `padding`, `content`, `text`] }],
        "bg-origin": [{ "bg-origin": [`border`, `padding`, `content`] }],
        "bg-position": [{ bg: te() }],
        "bg-repeat": [{ bg: ne() }],
        "bg-size": [{ bg: re() }],
        "bg-image": [
          {
            bg: [
              `none`,
              {
                linear: [
                  { to: [`t`, `tr`, `r`, `br`, `b`, `bl`, `l`, `tl`] },
                  Ta,
                  $,
                  Q,
                ],
                radial: [``, $, Q],
                conic: [Ta, $, Q],
              },
              qa,
              Va,
            ],
          },
        ],
        "bg-color": [{ bg: F() }],
        "gradient-from-pos": [{ from: ie() }],
        "gradient-via-pos": [{ via: ie() }],
        "gradient-to-pos": [{ to: ie() }],
        "gradient-from": [{ from: F() }],
        "gradient-via": [{ via: F() }],
        "gradient-to": [{ to: F() }],
        rounded: [{ rounded: I() }],
        "rounded-s": [{ "rounded-s": I() }],
        "rounded-e": [{ "rounded-e": I() }],
        "rounded-t": [{ "rounded-t": I() }],
        "rounded-r": [{ "rounded-r": I() }],
        "rounded-b": [{ "rounded-b": I() }],
        "rounded-l": [{ "rounded-l": I() }],
        "rounded-ss": [{ "rounded-ss": I() }],
        "rounded-se": [{ "rounded-se": I() }],
        "rounded-ee": [{ "rounded-ee": I() }],
        "rounded-es": [{ "rounded-es": I() }],
        "rounded-tl": [{ "rounded-tl": I() }],
        "rounded-tr": [{ "rounded-tr": I() }],
        "rounded-br": [{ "rounded-br": I() }],
        "rounded-bl": [{ "rounded-bl": I() }],
        "border-w": [{ border: L() }],
        "border-w-x": [{ "border-x": L() }],
        "border-w-y": [{ "border-y": L() }],
        "border-w-s": [{ "border-s": L() }],
        "border-w-e": [{ "border-e": L() }],
        "border-w-bs": [{ "border-bs": L() }],
        "border-w-be": [{ "border-be": L() }],
        "border-w-t": [{ "border-t": L() }],
        "border-w-r": [{ "border-r": L() }],
        "border-w-b": [{ "border-b": L() }],
        "border-w-l": [{ "border-l": L() }],
        "divide-x": [{ "divide-x": L() }],
        "divide-x-reverse": [`divide-x-reverse`],
        "divide-y": [{ "divide-y": L() }],
        "divide-y-reverse": [`divide-y-reverse`],
        "border-style": [{ border: [...R(), `hidden`, `none`] }],
        "divide-style": [{ divide: [...R(), `hidden`, `none`] }],
        "border-color": [{ border: F() }],
        "border-color-x": [{ "border-x": F() }],
        "border-color-y": [{ "border-y": F() }],
        "border-color-s": [{ "border-s": F() }],
        "border-color-e": [{ "border-e": F() }],
        "border-color-bs": [{ "border-bs": F() }],
        "border-color-be": [{ "border-be": F() }],
        "border-color-t": [{ "border-t": F() }],
        "border-color-r": [{ "border-r": F() }],
        "border-color-b": [{ "border-b": F() }],
        "border-color-l": [{ "border-l": F() }],
        "divide-color": [{ divide: F() }],
        "outline-style": [{ outline: [...R(), `none`, `hidden`] }],
        "outline-offset": [{ "outline-offset": [Z, $, Q] }],
        "outline-w": [{ outline: [``, Z, Ua, Ia] }],
        "outline-color": [{ outline: F() }],
        shadow: [{ shadow: [``, `none`, u, Ja, Ha] }],
        "shadow-color": [{ shadow: F() }],
        "inset-shadow": [{ "inset-shadow": [`none`, d, Ja, Ha] }],
        "inset-shadow-color": [{ "inset-shadow": F() }],
        "ring-w": [{ ring: L() }],
        "ring-w-inset": [`ring-inset`],
        "ring-color": [{ ring: F() }],
        "ring-offset-w": [{ "ring-offset": [Z, Ia] }],
        "ring-offset-color": [{ "ring-offset": F() }],
        "inset-ring-w": [{ "inset-ring": L() }],
        "inset-ring-color": [{ "inset-ring": F() }],
        "text-shadow": [{ "text-shadow": [`none`, f, Ja, Ha] }],
        "text-shadow-color": [{ "text-shadow": F() }],
        opacity: [{ opacity: [Z, $, Q] }],
        "mix-blend": [{ "mix-blend": [...z(), `plus-darker`, `plus-lighter`] }],
        "bg-blend": [{ "bg-blend": z() }],
        "mask-clip": [
          {
            "mask-clip": [
              `border`,
              `padding`,
              `content`,
              `fill`,
              `stroke`,
              `view`,
            ],
          },
          `mask-no-clip`,
        ],
        "mask-composite": [
          { mask: [`add`, `subtract`, `intersect`, `exclude`] },
        ],
        "mask-image-linear-pos": [{ "mask-linear": [Z] }],
        "mask-image-linear-from-pos": [{ "mask-linear-from": B() }],
        "mask-image-linear-to-pos": [{ "mask-linear-to": B() }],
        "mask-image-linear-from-color": [{ "mask-linear-from": F() }],
        "mask-image-linear-to-color": [{ "mask-linear-to": F() }],
        "mask-image-t-from-pos": [{ "mask-t-from": B() }],
        "mask-image-t-to-pos": [{ "mask-t-to": B() }],
        "mask-image-t-from-color": [{ "mask-t-from": F() }],
        "mask-image-t-to-color": [{ "mask-t-to": F() }],
        "mask-image-r-from-pos": [{ "mask-r-from": B() }],
        "mask-image-r-to-pos": [{ "mask-r-to": B() }],
        "mask-image-r-from-color": [{ "mask-r-from": F() }],
        "mask-image-r-to-color": [{ "mask-r-to": F() }],
        "mask-image-b-from-pos": [{ "mask-b-from": B() }],
        "mask-image-b-to-pos": [{ "mask-b-to": B() }],
        "mask-image-b-from-color": [{ "mask-b-from": F() }],
        "mask-image-b-to-color": [{ "mask-b-to": F() }],
        "mask-image-l-from-pos": [{ "mask-l-from": B() }],
        "mask-image-l-to-pos": [{ "mask-l-to": B() }],
        "mask-image-l-from-color": [{ "mask-l-from": F() }],
        "mask-image-l-to-color": [{ "mask-l-to": F() }],
        "mask-image-x-from-pos": [{ "mask-x-from": B() }],
        "mask-image-x-to-pos": [{ "mask-x-to": B() }],
        "mask-image-x-from-color": [{ "mask-x-from": F() }],
        "mask-image-x-to-color": [{ "mask-x-to": F() }],
        "mask-image-y-from-pos": [{ "mask-y-from": B() }],
        "mask-image-y-to-pos": [{ "mask-y-to": B() }],
        "mask-image-y-from-color": [{ "mask-y-from": F() }],
        "mask-image-y-to-color": [{ "mask-y-to": F() }],
        "mask-image-radial": [{ "mask-radial": [$, Q] }],
        "mask-image-radial-from-pos": [{ "mask-radial-from": B() }],
        "mask-image-radial-to-pos": [{ "mask-radial-to": B() }],
        "mask-image-radial-from-color": [{ "mask-radial-from": F() }],
        "mask-image-radial-to-color": [{ "mask-radial-to": F() }],
        "mask-image-radial-shape": [{ "mask-radial": [`circle`, `ellipse`] }],
        "mask-image-radial-size": [
          {
            "mask-radial": [
              { closest: [`side`, `corner`], farthest: [`side`, `corner`] },
            ],
          },
        ],
        "mask-image-radial-pos": [{ "mask-radial-at": b() }],
        "mask-image-conic-pos": [{ "mask-conic": [Z] }],
        "mask-image-conic-from-pos": [{ "mask-conic-from": B() }],
        "mask-image-conic-to-pos": [{ "mask-conic-to": B() }],
        "mask-image-conic-from-color": [{ "mask-conic-from": F() }],
        "mask-image-conic-to-color": [{ "mask-conic-to": F() }],
        "mask-mode": [{ mask: [`alpha`, `luminance`, `match`] }],
        "mask-origin": [
          {
            "mask-origin": [
              `border`,
              `padding`,
              `content`,
              `fill`,
              `stroke`,
              `view`,
            ],
          },
        ],
        "mask-position": [{ mask: te() }],
        "mask-repeat": [{ mask: ne() }],
        "mask-size": [{ mask: re() }],
        "mask-type": [{ "mask-type": [`alpha`, `luminance`] }],
        "mask-image": [{ mask: [`none`, $, Q] }],
        filter: [{ filter: [``, `none`, $, Q] }],
        blur: [{ blur: V() }],
        brightness: [{ brightness: [Z, $, Q] }],
        contrast: [{ contrast: [Z, $, Q] }],
        "drop-shadow": [{ "drop-shadow": [``, `none`, p, Ja, Ha] }],
        "drop-shadow-color": [{ "drop-shadow": F() }],
        grayscale: [{ grayscale: [``, Z, $, Q] }],
        "hue-rotate": [{ "hue-rotate": [Z, $, Q] }],
        invert: [{ invert: [``, Z, $, Q] }],
        saturate: [{ saturate: [Z, $, Q] }],
        sepia: [{ sepia: [``, Z, $, Q] }],
        "backdrop-filter": [{ "backdrop-filter": [``, `none`, $, Q] }],
        "backdrop-blur": [{ "backdrop-blur": V() }],
        "backdrop-brightness": [{ "backdrop-brightness": [Z, $, Q] }],
        "backdrop-contrast": [{ "backdrop-contrast": [Z, $, Q] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": [``, Z, $, Q] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [Z, $, Q] }],
        "backdrop-invert": [{ "backdrop-invert": [``, Z, $, Q] }],
        "backdrop-opacity": [{ "backdrop-opacity": [Z, $, Q] }],
        "backdrop-saturate": [{ "backdrop-saturate": [Z, $, Q] }],
        "backdrop-sepia": [{ "backdrop-sepia": [``, Z, $, Q] }],
        "border-collapse": [{ border: [`collapse`, `separate`] }],
        "border-spacing": [{ "border-spacing": w() }],
        "border-spacing-x": [{ "border-spacing-x": w() }],
        "border-spacing-y": [{ "border-spacing-y": w() }],
        "table-layout": [{ table: [`auto`, `fixed`] }],
        caption: [{ caption: [`top`, `bottom`] }],
        transition: [
          {
            transition: [
              ``,
              `all`,
              `colors`,
              `opacity`,
              `shadow`,
              `transform`,
              `none`,
              $,
              Q,
            ],
          },
        ],
        "transition-behavior": [{ transition: [`normal`, `discrete`] }],
        duration: [{ duration: [Z, `initial`, $, Q] }],
        ease: [{ ease: [`linear`, `initial`, _, $, Q] }],
        delay: [{ delay: [Z, $, Q] }],
        animate: [{ animate: [`none`, v, $, Q] }],
        backface: [{ backface: [`hidden`, `visible`] }],
        perspective: [{ perspective: [h, $, Q] }],
        "perspective-origin": [{ "perspective-origin": x() }],
        rotate: [{ rotate: ae() }],
        "rotate-x": [{ "rotate-x": ae() }],
        "rotate-y": [{ "rotate-y": ae() }],
        "rotate-z": [{ "rotate-z": ae() }],
        scale: [{ scale: H() }],
        "scale-x": [{ "scale-x": H() }],
        "scale-y": [{ "scale-y": H() }],
        "scale-z": [{ "scale-z": H() }],
        "scale-3d": [`scale-3d`],
        skew: [{ skew: oe() }],
        "skew-x": [{ "skew-x": oe() }],
        "skew-y": [{ "skew-y": oe() }],
        transform: [{ transform: [$, Q, ``, `none`, `gpu`, `cpu`] }],
        "transform-origin": [{ origin: x() }],
        "transform-style": [{ transform: [`3d`, `flat`] }],
        translate: [{ translate: se() }],
        "translate-x": [{ "translate-x": se() }],
        "translate-y": [{ "translate-y": se() }],
        "translate-z": [{ "translate-z": se() }],
        "translate-none": [`translate-none`],
        zoom: [{ zoom: [Ta, $, Q] }],
        accent: [{ accent: F() }],
        appearance: [{ appearance: [`none`, `auto`] }],
        "caret-color": [{ caret: F() }],
        "color-scheme": [
          {
            scheme: [
              `normal`,
              `dark`,
              `light`,
              `light-dark`,
              `only-dark`,
              `only-light`,
            ],
          },
        ],
        cursor: [
          {
            cursor: [
              `auto`,
              `default`,
              `pointer`,
              `wait`,
              `text`,
              `move`,
              `help`,
              `not-allowed`,
              `none`,
              `context-menu`,
              `progress`,
              `cell`,
              `crosshair`,
              `vertical-text`,
              `alias`,
              `copy`,
              `no-drop`,
              `grab`,
              `grabbing`,
              `all-scroll`,
              `col-resize`,
              `row-resize`,
              `n-resize`,
              `e-resize`,
              `s-resize`,
              `w-resize`,
              `ne-resize`,
              `nw-resize`,
              `se-resize`,
              `sw-resize`,
              `ew-resize`,
              `ns-resize`,
              `nesw-resize`,
              `nwse-resize`,
              `zoom-in`,
              `zoom-out`,
              $,
              Q,
            ],
          },
        ],
        "field-sizing": [{ "field-sizing": [`fixed`, `content`] }],
        "pointer-events": [{ "pointer-events": [`auto`, `none`] }],
        resize: [{ resize: [`none`, ``, `y`, `x`] }],
        "scroll-behavior": [{ scroll: [`auto`, `smooth`] }],
        "scrollbar-thumb-color": [{ "scrollbar-thumb": F() }],
        "scrollbar-track-color": [{ "scrollbar-track": F() }],
        "scrollbar-gutter": [
          { "scrollbar-gutter": [`auto`, `stable`, `both`] },
        ],
        "scrollbar-w": [{ scrollbar: [`auto`, `thin`, `none`] }],
        "scroll-m": [{ "scroll-m": w() }],
        "scroll-mx": [{ "scroll-mx": w() }],
        "scroll-my": [{ "scroll-my": w() }],
        "scroll-ms": [{ "scroll-ms": w() }],
        "scroll-me": [{ "scroll-me": w() }],
        "scroll-mbs": [{ "scroll-mbs": w() }],
        "scroll-mbe": [{ "scroll-mbe": w() }],
        "scroll-mt": [{ "scroll-mt": w() }],
        "scroll-mr": [{ "scroll-mr": w() }],
        "scroll-mb": [{ "scroll-mb": w() }],
        "scroll-ml": [{ "scroll-ml": w() }],
        "scroll-p": [{ "scroll-p": w() }],
        "scroll-px": [{ "scroll-px": w() }],
        "scroll-py": [{ "scroll-py": w() }],
        "scroll-ps": [{ "scroll-ps": w() }],
        "scroll-pe": [{ "scroll-pe": w() }],
        "scroll-pbs": [{ "scroll-pbs": w() }],
        "scroll-pbe": [{ "scroll-pbe": w() }],
        "scroll-pt": [{ "scroll-pt": w() }],
        "scroll-pr": [{ "scroll-pr": w() }],
        "scroll-pb": [{ "scroll-pb": w() }],
        "scroll-pl": [{ "scroll-pl": w() }],
        "snap-align": [{ snap: [`start`, `end`, `center`, `align-none`] }],
        "snap-stop": [{ snap: [`normal`, `always`] }],
        "snap-type": [{ snap: [`none`, `x`, `y`, `both`] }],
        "snap-strictness": [{ snap: [`mandatory`, `proximity`] }],
        touch: [{ touch: [`auto`, `none`, `manipulation`] }],
        "touch-x": [{ "touch-pan": [`x`, `left`, `right`] }],
        "touch-y": [{ "touch-pan": [`y`, `up`, `down`] }],
        "touch-pz": [`touch-pinch-zoom`],
        select: [{ select: [`none`, `text`, `all`, `auto`] }],
        "will-change": [
          { "will-change": [`auto`, `scroll`, `contents`, `transform`, $, Q] },
        ],
        fill: [{ fill: [`none`, ...F()] }],
        "stroke-w": [{ stroke: [Z, Ua, Ia, La] }],
        stroke: [{ stroke: [`none`, ...F()] }],
        "forced-color-adjust": [{ "forced-color-adjust": [`auto`, `none`] }],
      },
      conflictingClassGroups: {
        "container-named": [`container-type`],
        overflow: [`overflow-x`, `overflow-y`],
        overscroll: [`overscroll-x`, `overscroll-y`],
        inset: [
          `inset-x`,
          `inset-y`,
          `inset-bs`,
          `inset-be`,
          `start`,
          `end`,
          `top`,
          `right`,
          `bottom`,
          `left`,
        ],
        "inset-x": [`right`, `left`],
        "inset-y": [`top`, `bottom`],
        flex: [`basis`, `grow`, `shrink`],
        gap: [`gap-x`, `gap-y`],
        p: [`px`, `py`, `ps`, `pe`, `pbs`, `pbe`, `pt`, `pr`, `pb`, `pl`],
        px: [`pr`, `pl`],
        py: [`pt`, `pb`],
        m: [`mx`, `my`, `ms`, `me`, `mbs`, `mbe`, `mt`, `mr`, `mb`, `ml`],
        mx: [`mr`, `ml`],
        my: [`mt`, `mb`],
        size: [`w`, `h`],
        "font-size": [`leading`],
        "fvn-normal": [
          `fvn-ordinal`,
          `fvn-slashed-zero`,
          `fvn-figure`,
          `fvn-spacing`,
          `fvn-fraction`,
        ],
        "fvn-ordinal": [`fvn-normal`],
        "fvn-slashed-zero": [`fvn-normal`],
        "fvn-figure": [`fvn-normal`],
        "fvn-spacing": [`fvn-normal`],
        "fvn-fraction": [`fvn-normal`],
        "line-clamp": [`display`, `overflow`],
        rounded: [
          `rounded-s`,
          `rounded-e`,
          `rounded-t`,
          `rounded-r`,
          `rounded-b`,
          `rounded-l`,
          `rounded-ss`,
          `rounded-se`,
          `rounded-ee`,
          `rounded-es`,
          `rounded-tl`,
          `rounded-tr`,
          `rounded-br`,
          `rounded-bl`,
        ],
        "rounded-s": [`rounded-ss`, `rounded-es`],
        "rounded-e": [`rounded-se`, `rounded-ee`],
        "rounded-t": [`rounded-tl`, `rounded-tr`],
        "rounded-r": [`rounded-tr`, `rounded-br`],
        "rounded-b": [`rounded-br`, `rounded-bl`],
        "rounded-l": [`rounded-tl`, `rounded-bl`],
        "border-spacing": [`border-spacing-x`, `border-spacing-y`],
        "border-w": [
          `border-w-x`,
          `border-w-y`,
          `border-w-s`,
          `border-w-e`,
          `border-w-bs`,
          `border-w-be`,
          `border-w-t`,
          `border-w-r`,
          `border-w-b`,
          `border-w-l`,
        ],
        "border-w-x": [`border-w-r`, `border-w-l`],
        "border-w-y": [`border-w-t`, `border-w-b`],
        "border-color": [
          `border-color-x`,
          `border-color-y`,
          `border-color-s`,
          `border-color-e`,
          `border-color-bs`,
          `border-color-be`,
          `border-color-t`,
          `border-color-r`,
          `border-color-b`,
          `border-color-l`,
        ],
        "border-color-x": [`border-color-r`, `border-color-l`],
        "border-color-y": [`border-color-t`, `border-color-b`],
        translate: [`translate-x`, `translate-y`, `translate-none`],
        "translate-none": [
          `translate`,
          `translate-x`,
          `translate-y`,
          `translate-z`,
        ],
        "scroll-m": [
          `scroll-mx`,
          `scroll-my`,
          `scroll-ms`,
          `scroll-me`,
          `scroll-mbs`,
          `scroll-mbe`,
          `scroll-mt`,
          `scroll-mr`,
          `scroll-mb`,
          `scroll-ml`,
        ],
        "scroll-mx": [`scroll-mr`, `scroll-ml`],
        "scroll-my": [`scroll-mt`, `scroll-mb`],
        "scroll-p": [
          `scroll-px`,
          `scroll-py`,
          `scroll-ps`,
          `scroll-pe`,
          `scroll-pbs`,
          `scroll-pbe`,
          `scroll-pt`,
          `scroll-pr`,
          `scroll-pb`,
          `scroll-pl`,
        ],
        "scroll-px": [`scroll-pr`, `scroll-pl`],
        "scroll-py": [`scroll-pt`, `scroll-pb`],
        touch: [`touch-x`, `touch-y`, `touch-pz`],
        "touch-x": [`touch`],
        "touch-y": [`touch`],
        "touch-pz": [`touch`],
      },
      conflictingClassGroupModifiers: { "font-size": [`leading`] },
      postfixLookupClassGroups: [`container-type`],
      orderSensitiveModifiers: [
        `*`,
        `**`,
        `after`,
        `backdrop`,
        `before`,
        `details-content`,
        `file`,
        `first-letter`,
        `first-line`,
        `marker`,
        `placeholder`,
        `selection`,
      ],
    };
  });
function so(...e) {
  return oo(Ii(e));
}
var co = a.forwardRef(function (e, t) {
    let {
        render: n,
        className: r,
        disabled: i = !1,
        focusableWhenDisabled: a = !1,
        nativeButton: o = !0,
        style: s,
        ...c
      } = e,
      { getButtonProps: l, buttonRef: u } = nt({
        disabled: i,
        focusableWhenDisabled: a,
        native: o,
      });
    return be(`button`, e, {
      state: { disabled: i },
      ref: [t, u],
      props: [c, l],
    });
  }),
  lo = (e) => (typeof e == `boolean` ? `${e}` : e === 0 ? `0` : e),
  uo = Ii,
  fo = ((e, t) => (n) => {
    if (t?.variants == null) return uo(e, n?.class, n?.className);
    let { variants: r, defaultVariants: i } = t,
      a = Object.keys(r).map((e) => {
        let t = n?.[e],
          a = i?.[e];
        if (t === null) return null;
        let o = lo(t) || lo(a);
        return r[e][o];
      }),
      o =
        n &&
        Object.entries(n).reduce((e, t) => {
          let [n, r] = t;
          return (r === void 0 || (e[n] = r), e);
        }, {});
    return uo(
      e,
      a,
      t?.compoundVariants?.reduce((e, t) => {
        let { class: n, className: r, ...a } = t;
        return Object.entries(a).every((e) => {
          let [t, n] = e;
          return Array.isArray(n)
            ? n.includes({ ...i, ...o }[t])
            : { ...i, ...o }[t] === n;
        })
          ? [...e, n, r]
          : e;
      }, []),
      n?.class,
      n?.className,
    );
  })(
    `group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
    {
      variants: {
        variant: {
          default: `bg-primary text-primary-foreground hover:bg-primary/80`,
          outline: `border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`,
          secondary: `bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground`,
          ghost: `hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50`,
          destructive: `bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40`,
          link: `text-primary underline-offset-4 hover:underline`,
        },
        size: {
          default: `h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2`,
          xs: `h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3`,
          sm: `h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5`,
          lg: `h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2`,
          icon: `size-8`,
          "icon-xs": `size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3`,
          "icon-sm": `size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg`,
          "icon-lg": `size-9`,
        },
      },
      defaultVariants: { variant: `default`, size: `default` },
    },
  );
function po({
  className: e,
  variant: t = `default`,
  size: n = `default`,
  ...r
}) {
  return (0, Y.jsx)(co, {
    "data-slot": `button`,
    className: so(fo({ variant: t, size: n, className: e })),
    ...r,
  });
}
function mo({ ...e }) {
  return (0, Y.jsx)(Ni, { "data-slot": `dialog`, ...e });
}
function ho({ ...e }) {
  return (0, Y.jsx)(hi, { "data-slot": `dialog-portal`, ...e });
}
function go({ className: e, ...t }) {
  return (0, Y.jsx)(Fe, {
    "data-slot": `dialog-overlay`,
    className: so(
      `fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0`,
      e,
    ),
    ...t,
  });
}
function _o({ className: e, children: t, showCloseButton: n = !0, ...r }) {
  return (0, Y.jsxs)(ho, {
    children: [
      (0, Y.jsx)(go, {}),
      (0, Y.jsxs)(fi, {
        "data-slot": `dialog-content`,
        className: so(
          `fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
          e,
        ),
        ...r,
        children: [
          t,
          n &&
            (0, Y.jsxs)(pt, {
              "data-slot": `dialog-close`,
              render: (0, Y.jsx)(po, {
                variant: `ghost`,
                className: `absolute top-2 right-2`,
                size: `icon-sm`,
              }),
              children: [
                (0, Y.jsx)(T, {}),
                (0, Y.jsx)(`span`, { className: `sr-only`, children: `Close` }),
              ],
            }),
        ],
      }),
    ],
  });
}
function vo({ className: e, ...t }) {
  return (0, Y.jsx)(Pi, {
    "data-slot": `dialog-title`,
    className: so(`font-heading text-base leading-none font-medium`, e),
    ...t,
  });
}
function yo({ className: e, ...t }) {
  return (0, Y.jsx)(yt, {
    "data-slot": `dialog-description`,
    className: so(
      `text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground`,
      e,
    ),
    ...t,
  });
}
var bo = [
  {
    name: `Oya History Museum`,
    place: `Utsunomiya, Japan`,
    lat: 36.639,
    lon: 139.8207,
    image: `/spots/oya.jpg`,
    text: `A hand-carved quarry the size of a stadium, now an underground cathedral lit for concerts and film shoots.`,
  },
  {
    name: `Xwejni Salt Pans`,
    place: `Gozo, Malta`,
    lat: 36.079,
    lon: 14.258,
    image: `/spots/xwejni.jpg`,
    text: `A chequerboard of 350-year-old salt pans cut into the Gozo coast, still harvested by hand each summer.`,
  },
  {
    name: `Musée Mécanique`,
    place: `San Francisco, USA`,
    lat: 37.809,
    lon: -122.416,
    image: `/spots/musee.jpg`,
    text: `A pier-side arcade of antique coin machines: Laughing Sal, fortune tellers and opium-den dioramas.`,
  },
  {
    name: `Maishima Incineration Plant`,
    place: `Osaka, Japan`,
    lat: 34.665,
    lon: 135.397,
    image: `/spots/maishima.jpg`,
    text: `A working garbage incinerator dressed by Hundertwasser as a candy-coloured fantasy castle.`,
  },
  {
    name: `Tomb of Christ`,
    place: `Shingō, Aomori, Japan`,
    lat: 40.44,
    lon: 141.175,
    image: `/spots/tomb.jpg`,
    text: `Local legend says Jesus dodged the cross, fled to Aomori, farmed garlic and is buried on this hill.`,
  },
  {
    name: `Rummu Quarry`,
    place: `Rummu, Estonia`,
    lat: 59.223,
    lon: 24.216,
    image: `/spots/rummu.jpg`,
    text: `A flooded Soviet prison camp. Swim over the cell blocks and sunbathe on the spoil heap.`,
  },
  {
    name: `The Sand-Covered Church`,
    place: `Skagen, Denmark`,
    lat: 57.704,
    lon: 10.548,
    image: `/spots/sandchurch.jpg`,
    text: `A 1300s church the dunes swallowed. Only the tower still shows above the sand.`,
  },
  {
    name: `Chiatura Cable Cars`,
    place: `Chiatura, Georgia`,
    lat: 42.29,
    lon: 43.284,
    image: `/spots/chiatura.jpg`,
    text: `A mining town strung with Soviet-era cable cars. Rusty cabins still cross the gorge.`,
  },
  {
    name: `Teufelsberg`,
    place: `Berlin, Germany`,
    lat: 52.498,
    lon: 13.241,
    image: `/spots/teufelsberg.jpg`,
    text: `A hill of Nazi rubble topped by a Cold War listening station, now a sprawling graffiti canvas.`,
  },
  {
    name: `Singing Ringing Tree`,
    place: `Burnley, England`,
    lat: 53.769,
    lon: -2.266,
    image: `/spots/srt.jpg`,
    text: `A galvanised-steel sculpture on the moors that sings when the wind moves through its pipes.`,
  },
];
function xo({ active: e, running: t, onSelect: n, ready: r, onHover: i, selection }) {
  let o = (0, a.useRef)(null),
    c = (0, a.useRef)(null),
    l = (0, a.useRef)([]),
    u = (0, a.useRef)(null),
    [d, f] = (0, a.useState)(null),
    [p, m] = (0, a.useState)(!1),
    [shown, setShown] = (0, a.useState)(null),
    desiredCard = d === null ? shown : d,
    [cardIdx, setCardIdx] = (0, a.useState)(null),
    [cardVisible, setCardVisible] = (0, a.useState)(!1),
    [fadeMs, setFadeMs] = (0, a.useState)(700),
    displayedCard = (0, a.useRef)(null),
    dragging = (0, a.useRef)(false),
    h = (0, a.useRef)({ active: e, running: t, hover: d, card: cardIdx });
  (0, a.useEffect)(()=>{
    let cancelled=false,timer=0,frame=0,frame2=0;
    setCardVisible(false);
    const image=new Image();
    const show=()=>{
      if(cancelled)return;
      setCardIdx(desiredCard);displayedCard.current=desiredCard;
      if(desiredCard!==null){
        frame=requestAnimationFrame(()=>{frame2=requestAnimationFrame(()=>{if(!cancelled)setCardVisible(true)})});
      }
    };
    timer=setTimeout(()=>{
      if(desiredCard===null){show();return;}
      image.onload=show;image.onerror=show;
      image.src=bo[desiredCard].image;
    },displayedCard.current===null?0:fadeMs);
    return()=>{cancelled=true;clearTimeout(timer);cancelAnimationFrame(frame);cancelAnimationFrame(frame2);image.onload=null;image.onerror=null};
  },[desiredCard]);
  ((h.current = { active: e, running: t, hover: d, card: cardIdx }),
    (0, a.useEffect)(() => {
      let e = 0,
        t = !1,
        n = 0,
        i = 0,
        a = 0,
        d = 151,
        pitch = 0, pitchFrom = 0, manual = false,
        pointer = null, velocity = 0, coastUntil = 0, suppressClickUntil = 0,
        tStart = 0,
        yawFrom = 151,
        yawTo = 151,
        lastActive = -1,
        lastRequest = 0,
        rotationDuration = 3000,
        settled = !1,
        revealStarted = !1,
        p = !0,
        g = null,
        _ = -1,
        v,
        y = c.current,
        b = o.current,
        x = () => {
          ((n = b.clientWidth), (i = b.clientHeight));
          let e = Math.min(
            devicePixelRatio,
            1.5,
            Math.sqrt(22e5 / Math.max(1, n * i)),
          );
          ((y.width = Math.round(n * e)),
            (y.height = Math.round(i * e)),
            (p = !0),
            (a = 0));
        },
        S = new ResizeObserver(x);
      (S.observe(b), x());
      let stageVisible=true;
      const visibilityObserver=new IntersectionObserver(entries=>{stageVisible=entries[0].isIntersecting;if(stageVisible)p=true;},{rootMargin:"150px"});
      visibilityObserver.observe(b);
      const compact = () => matchMedia('(max-width: 1100px)').matches;
      const geometry = () => {
        const small=compact();
        const radius=small?n*.84:Math.max(i*1.02,n*.52);
        return {radius,cx:small?n*.73:n*.91,cy:small?radius+24:radius+40};
      };
      const startManual = () => {
        manual=true; settled=true; velocity=0; p=true;
        setFadeMs(180); f(null); setShown(null);
      };
      const down = event => {
        if(event.button!==0 || event.isPrimary===false || event.target.closest('.pin-preview'))return;
        const box=b.getBoundingClientRect(), geo=geometry();
        if(!event.target.closest('.map-pin') && Math.hypot(event.clientX-box.left-geo.cx,event.clientY-box.top-geo.cy)>geo.radius+20)return;
        pointer={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,time:performance.now(),touch:event.pointerType==='touch',moved:false};
      };
      const move = event => {
        if(!pointer || event.pointerId!==pointer.id)return;
        const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
        if(!pointer.moved){
          if(Math.hypot(dx,dy)<6)return;
          // A vertical swipe keeps scrolling the page; horizontal swipes turn the Earth.
          if(pointer.touch && Math.abs(dy)>Math.abs(dx)*1.15){pointer=null;return;}
          pointer.moved=true;dragging.current=true;selection.current.dragging=true;
          b.classList.add('is-dragging');b.setPointerCapture(event.pointerId);startManual();
        }
        if(event.cancelable)event.preventDefault();
        const now=performance.now(),dt=Math.max(8,now-pointer.time);
        const sensitivity=90/geometry().radius;
        const delta=-(event.clientX-pointer.lastX)*sensitivity;
        d+=delta;
        if(!pointer.touch)pitch=Math.max(-60,Math.min(60,pitch+(event.clientY-pointer.lastY)*sensitivity));
        velocity=velocity*.3+(delta/dt)*.7;
        pointer.lastX=event.clientX;pointer.lastY=event.clientY;pointer.time=now;
        selection.current.resumeAt=now+6000;p=true;
      };
      const up = event => {
        if(!pointer || event.pointerId!==pointer.id)return;
        if(pointer.moved){
          const now=performance.now();
          if(event.type==='pointercancel' || now-pointer.time>90 || matchMedia('(prefers-reduced-motion: reduce)').matches)velocity=0;
          velocity=Math.max(-.12,Math.min(.12,velocity));coastUntil=now+750;
          suppressClickUntil=now+350;selection.current.resumeAt=now+6000;
          if(b.hasPointerCapture(pointer.id))b.releasePointerCapture(pointer.id);
        }
        pointer=null;dragging.current=false;selection.current.dragging=false;
        b.classList.remove('is-dragging');
      };
      const cancelDrag=()=>{if(pointer)up({pointerId:pointer.id,type:'pointercancel'});};
      window.addEventListener('blur',cancelDrag);
      const click = event => {
        if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}
      };
      const key = event => {
        if(event.target!==y || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
        event.preventDefault();startManual();
        if(event.key==='ArrowLeft')d+=12;
        if(event.key==='ArrowRight')d-=12;
        if(event.key==='ArrowUp')pitch=Math.max(-60,pitch-8);
        if(event.key==='ArrowDown')pitch=Math.min(60,pitch+8);
        selection.current.resumeAt=performance.now()+6000;
      };
      b.addEventListener('pointerdown',down);
      window.addEventListener('pointermove',move,{passive:false});
      window.addEventListener('pointerup',up);
      window.addEventListener('pointercancel',up);
      b.addEventListener('lostpointercapture',up);
      b.addEventListener('click',click,true);
      y.addEventListener('keydown',key);
      const decor = Array.from({length:36}, (_,j)=>{
        const el=document.createElement('span');
        el.className='map-pin decorative-pin';
        el.setAttribute('aria-hidden','true');
        el.innerHTML='<svg class="pin-symbol" viewBox="0 0 40 52"><path d="M20 50C16 43 2 30 2 20a18 18 0 1136 0c0 10-14 23-18 30Z"></path><circle cx="20" cy="20" r="6"></circle></svg>';
        b.appendChild(el);
        return {el,lon:((j*137.508)%360)-180,lat:12+((j*23)%51)};
      });
      let C = new Image(),
        K = CLOUDS ? new Image() : null,
        cloudsReady = !1,
        pending = CLOUDS ? 2 : 1,
        boot = () => {
          if (t || --pending > 0) return;
          let D = document.createElement(`canvas`);
          ((D.width = 1024), (D.height = 512));
          let dc = D.getContext(`2d`);
          ((dc.imageSmoothingEnabled = !0),
            (dc.imageSmoothingQuality = `high`));
          dc.drawImage(C, 0, 0, 1024, 512);
          let E2 = null,
            Dbaked = D;
          if (CLOUDS && cloudsReady) {
            ((E2 = document.createElement(`canvas`)),
              (E2.width = 1024),
              (E2.height = 512));
            let ec = E2.getContext(`2d`);
            ((ec.imageSmoothingEnabled = !0),
              (ec.imageSmoothingQuality = `high`));
            ec.drawImage(K, 0, 0, 1024, 512);
            ((Dbaked = document.createElement(`canvas`)),
              (Dbaked.width = 1024),
              (Dbaked.height = 512));
            let bc = Dbaked.getContext(`2d`);
            ((bc.imageSmoothingEnabled = !0),
              (bc.imageSmoothingQuality = `high`));
            bc.drawImage(D, 0, 0);
            ((bc.globalCompositeOperation = `screen`),
              (bc.globalAlpha = COLOR ? (TEX === TEX_MAP.day ? 0.75 : 0.45) : 0.85));
            bc.drawImage(K, 0, 0, 1024, 512);
            ((bc.globalCompositeOperation = `source-over`),
              (bc.globalAlpha = 1));
          }
          try {
            v = s(D, E2, Dbaked, y);
          } catch {
            m(!0);
            return;
          }
          r(!0);
          let o = (r) => {
            if (
              t ||
              ((e = requestAnimationFrame(o)),
              document.hidden || !stageVisible || r - a < (v?.gpu ? 15 : 66)) ||
              (!h.current.running &&
                settled &&
                !p && !manual &&
                g === h.current.card &&
                _ === h.current.active &&
                selection.current.stamp === lastRequest &&
                CLOUD_AMT === 0)
            )
              return;
            ((p = !1), (g = h.current.card), (_ = h.current.active));
            const elapsed=Math.min(40,r-a);
            a = r;
            let act = h.current.active;
            if (!dragging.current && (act !== lastActive || selection.current.stamp !== lastRequest)) {
              manual=false;pitchFrom=pitch;velocity=0;
              rotationDuration=selection.current.stamp !== lastRequest ? 1600 : 3000;
              setFadeMs(rotationDuration===1600?280:700);
              lastRequest=selection.current.stamp;
              ((lastActive = act), (yawFrom = d));
              let e = bo[act].lon + 45;
              ((yawTo = d + ((((e - d) % 360 + 540) % 360) - 180)),
                (tStart = r),
                (revealStarted = !1),
                (settled = !1),
                setShown(null));
            }
            let prog = Math.max(0,Math.min(1, (r - tStart) / rotationDuration));
            __P.get(`snap`) === `1` && (prog = 1);
            let ease =
              prog < 0.5
                ? 4 * prog * prog * prog
                : 1 - Math.pow(-2 * prog + 2, 3) / 2;
            if(!manual){
              d=yawFrom+(yawTo-yawFrom)*ease;pitch=pitchFrom*(1-ease);
              if(prog>=1)settled=true;
              if(prog>=.52&&!revealStarted){revealStarted=true;setShown(act);}
            } else if(!dragging.current && r<coastUntil){
              d+=velocity*elapsed;velocity*=Math.exp(-elapsed/180);
            }
            const geo=geometry(),m=geo.radius,y=geo.cx,b=geo.cy;
            const cp=Math.cos(pitch*Math.PI/180),sp=Math.sin(pitch*Math.PI/180);
            v.render(n, i, y, b, m, d, pitch);
            let x = u.current?.offsetWidth || 0,
              S = u.current?.offsetHeight || 0;
            decor.forEach(({el,lon,lat})=>{
              const la=lat*Math.PI/180,lo=(lon-d)*Math.PI/180;
              const zz=Math.cos(la)*Math.cos(lo),yy=Math.sin(la);
              const z=zz*cp+yy*sp,nx=Math.cos(la)*Math.sin(lo),ny=yy*cp-zz*sp;
              const px=y+(m+16)*nx,py=b-(m+16)*ny;
              const lit=Math.max(0,-.92*nx+.36*ny+.15*z);
              const visible=z>.18&&lit>.3&&px>24&&px<n-24&&py>55&&py<i-50;
              el.style.visibility=visible?'visible':'hidden';
              el.style.transform='translate3d('+px+'px,'+py+'px,0) translate(-50%,-100%)';
            });
            bo.forEach((e, t) => {
              let r = l.current[t];
              if (!r) return;
              let a = (e.lat * Math.PI) / 180,
                o = ((e.lon - d) * Math.PI) / 180,
                zz = Math.cos(a) * Math.cos(o),
                yy = Math.sin(a),
                s = zz*cp+yy*sp,
                c = Math.cos(a) * Math.sin(o),
                f = yy*cp-zz*sp,
                p = y + (m + 22) * c,
                g = b - (m + 22) * f,
                lam = Math.max(0, -0.92 * c + 0.36 * f + 0.15 * s),
                q = Math.min(1, Math.max(0, (lam - 0.22) / 0.64)),
                lit = q * q * (3 - 2 * q),
                rimv = Math.pow(1 - s, 2.5),
                lightAmt = Math.max(lit, Math.min(1, rimv * 1.1)),
                _ =
                  s > 0.14 &&
                  lightAmt > 0.35 &&
                  p > 24 &&
                  p < n - 24 &&
                  g > 55 &&
                  g < i - 50;
              if (
                ((r.style.transform =
                  `translate3d(` +
                  p +
                  `px,` +
                  g +
                  `px,0) translate(-50%,-100%)`),
                (r.style.visibility = _ ? `visible` : `hidden`),
                (r.style.opacity = String(
                  Math.min(1, (s - 0.14) * 5) * Math.min(1, lightAmt * 2),
                )),
                (r.style.zIndex =
                  h.current.card === t
                    ? `15`
                    : t === h.current.active
                      ? `9`
                      : `5`),
                h.current.card === t && u.current && !compact())
              ) {
                let e = x,
                  t = S,
                  r = Math.max(16, Math.min(n - e - 16, p + 34)),
                  a = Math.max(12, Math.min(i - t - 65, g - t - 34));
                ((u.current.style.left = r + `px`),
                  (u.current.style.top = a + `px`));
              }
            });
          };
          e = requestAnimationFrame(o);
        };
      return (
        (C.src = TEX),
        (C.onload = boot),
        (C.onerror = () => {
          t || m(!0);
        }),
        CLOUDS &&
          ((K.onload = () => {
            ((cloudsReady = !0), boot());
          }),
          (K.onerror = boot),
          (K.src = `/earth-clouds.jpg`)),
        () => {
          window.removeEventListener('blur',cancelDrag);
          visibilityObserver.disconnect();
          b.removeEventListener('pointerdown',down);
          window.removeEventListener('pointermove',move);
          window.removeEventListener('pointerup',up);
          window.removeEventListener('pointercancel',up);
          b.removeEventListener('lostpointercapture',up);
          b.removeEventListener('click',click,true);
          y.removeEventListener('keydown',key);
          selection.current.dragging=false;
          ((t = !0),
            cancelAnimationFrame(e),
            S.disconnect(),
            decor.forEach(({el})=>el.remove()),
            v?.dispose(),
            (C.onload = null),
            (C.onerror = null),
            K && ((K.onload = null), (K.onerror = null)));
        }
      );
    }, [r]));
  let g = (e) => {
      if(dragging.current)return;
      (setFadeMs(180), f(e), i(!0));
    },
    _ = () => {
      (setFadeMs(180), f(null), i(!1));
    };
  return (0, Y.jsxs)(`div`, {
    ref: o,
    className: `globe-stage`,
    style: { "--preview-duration": fadeMs + "ms" },
    children: [
      (0, Y.jsx)(`canvas`, {
        ref: c,
        role: `img`,
        "aria-label": `Interactive Earth. Drag or use arrow keys to rotate. On touch screens, swipe sideways to rotate and vertically to scroll.`,
        tabIndex: 0,
      }),
      bo.map((t, r) =>
        (0, Y.jsx)(
          `button`,
          {
            ref: (e) => {
              l.current[r] = e;
            },
            className: `map-pin ` + (r === cardIdx && cardVisible ? `is-active` : ``),
            onMouseEnter: () => g(r),
            onMouseLeave: _,
            onFocus: () => g(r),
            onBlur: _,
            onClick: () => {
              (n(r), g(r));
            },
            "aria-label": `Preview ` + t.name + `, ` + t.place,
            "aria-pressed": r === e,
            children: (0, Y.jsxs)(`svg`, {
              className: `pin-symbol`,
              viewBox: `0 0 40 52`,
              "aria-hidden": `true`,
              children: [
                (0, Y.jsx)(`path`, {
                  d: `M20 50C16 43 2 30 2 20a18 18 0 1136 0c0 10-14 23-18 30Z`,
                }),
                (0, Y.jsx)(`circle`, { cx: `20`, cy: `20`, r: `6` }),
              ],
            }),
          },
          t.name,
        ),
      ),
      cardIdx !== null &&
        (0, Y.jsxs)(`div`, {
          ref: u,
          className: `pin-preview`+(cardVisible?` is-visible`:``),
          role: `status`,
          children: [
            (0, Y.jsx)(`img`, {
              src: bo[cardIdx].image,
              alt: bo[cardIdx].name,
            }),
            (0, Y.jsxs)(`div`, {
              children: [
                (0, Y.jsx)(`h2`, { children: bo[cardIdx].name }),
                (0, Y.jsx)(`p`, {
                  className: `preview-place`,
                  children: bo[cardIdx].place,
                }),
                (0, Y.jsx)(`p`, { children: bo[cardIdx].text }),
              ],
            }),
          ],
        }),
      p &&
        (0, Y.jsx)(`p`, {
          className: `map-error`,
          children: `The Earth couldn’t load. Refresh to try again.`,
        }),
    ],
  });
}

function HomepageBanners(){
 const [mounted,setMounted]=(0,a.useState)(false),[open,setOpen]=(0,a.useState)(null),[active,setActive]=(0,a.useState)(1),[entered,setEntered]=(0,a.useState)(false);
 const rail=(0,a.useRef)(null),settle=(0,a.useRef)(null);
 (0,a.useEffect)(()=>()=>clearTimeout(settle.current),[]);
 (0,a.useEffect)(()=>{if(mounted&&rail.current){const el=rail.current;el.scrollLeft=2*(el.children[0].getBoundingClientRect().width+32);}},[mounted]);
 (0,a.useEffect)(()=>{if(mounted)setEntered(true);},[mounted]);
 const go=index=>{const el=rail.current;if(el)el.scrollTo({left:(index+1)*(el.children[0].getBoundingClientRect().width+32),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 (0,a.useEffect)(()=>setMounted(true),[]);
 if(!mounted)return null;
 const items=[
  {id:'giveaway',label:'THE DEEPSPOT COMPETITION',title:'Compete for $300 cash.',description:'Big finds. Bigger rewards.',image:'/camera-giveaway.png',alt:'Illustrative silver compact camera giveaway prize',detail:'Compete for a $300 cash grand prize. Full competition rules, entry dates and how to enter are coming soon.'},
  {id:'weekly',label:'DEEPSPOT OF THE WEEK',title:'A cathedral. Carved underground.',description:'Inside Japan’s extraordinary Oya History Museum.',image:'/spots/oya.jpg',alt:'Illuminated stone chambers at Oya History Museum',detail:'Over 70 years of hand-carving created this vast underground quarry in Utsunomiya, Japan. Today, its monumental chambers host art, concerts and film shoots.'},
  {id:'development',label:'THE DEVELOPMENT MAP',title:'view our roadmap',description:'The ideas and improvements shaping DeepSpot.',image:'/roadmap-mountain.png',alt:'Mountain ridge with a bright green trail climbing toward the summit',detail:'A home for upcoming features, improvements and community ideas. Our development map is being prepared—check back here for the next update.'}
 ];
 const slides=[items[2],items[0],items[1]],loopSlides=[items[1],...slides,items[2]];
 const item=items.find(x=>x.id===open);
 const podium=(0,Y.jsx)('div',{className:'promo-podium','aria-label':'Animated leaderboard: first, second, third and fourth place',children:[3,1,2,4].map(rank=>(0,Y.jsx)('div',{className:'podium-bar podium-'+rank,children:(0,Y.jsx)('span',{className:'podium-avatar','aria-label':rank===1?'First place profile':rank===2?'Second place profile':rank===3?'Third place profile':'Fourth place profile',children:(0,Y.jsxs)('svg',{viewBox:'0 0 100 100','aria-hidden':true,children:[(0,Y.jsx)('circle',{cx:50,cy:50,r:49,fill:'currentColor'}),(0,Y.jsx)('circle',{cx:50,cy:37,r:17,fill:'var(--avatar-cutout)'}),(0,Y.jsx)('path',{d:'M19 77C23 62 36 58 40 59Q50 66 60 59C66 58 78 63 81 77A40 40 0 0 1 19 77Z',fill:'var(--avatar-cutout)'})]})})},rank))});
 return (0,Y.jsxs)('div',{className:'homepage-news',children:[
  (0,Y.jsx)('section',{className:'homepage-banners',ref:rail,tabIndex:0,'aria-roledescription':'carousel','aria-label':'The latest from DeepSpot',onScroll:()=>{const el=rail.current;if(!el)return;const step=el.children[0].getBoundingClientRect().width+32,index=Math.round(el.scrollLeft/step);setActive((index+2)%3);clearTimeout(settle.current);settle.current=setTimeout(()=>{if(index===0||index===4){el.style.scrollSnapType='none';el.scrollLeft=(index===0?3:1)*step;requestAnimationFrame(()=>{el.style.scrollSnapType='';});}},160)},children:loopSlides.map((x,slideIndex)=>(0,Y.jsxs)('article',{className:'promo-banner promo-'+x.id+(entered?' has-entered':''),children:[
   x.id==='giveaway'?podium:(0,Y.jsx)('div',{className:'promo-photo',children:(0,Y.jsx)('img',{src:x.image,alt:x.alt})}),
   (0,Y.jsxs)('div',{className:'promo-copy',children:[
    (0,Y.jsx)('p',{className:'promo-kicker',children:x.label}),
    (0,Y.jsx)('h2',{children:x.id==='giveaway'?[(0,Y.jsx)('span',{className:'competition-line',children:'Compete for'},'intro'),(0,Y.jsx)('span',{className:'competition-prize',children:'$300 cash.'},'prize')]:x.title}),
    (0,Y.jsx)('p',{className:'promo-description',children:x.description}),
    (0,Y.jsxs)('a',{href:'#'+x.id+'-details',onClick:event=>{event.preventDefault();setOpen(x.id)},children:['read more ',(0,Y.jsx)('span',{'aria-hidden':true,children:'↗'})]})
   ]}),
   x.id==='weekly'&&(0,Y.jsxs)('div',{className:'verified-seal','aria-label':'DeepSpot verified',children:[
    (0,Y.jsx)('svg',{viewBox:'0 0 100 100','aria-hidden':true,children:[
     (0,Y.jsx)('defs',{children:(0,Y.jsx)('path',{id:'verified-ring-'+slideIndex,d:'M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1 -72 0'})}),
     (0,Y.jsx)('text',{children:(0,Y.jsx)('textPath',{href:'#verified-ring-'+slideIndex,textLength:'224',children:'DEEPSPOT VERIFIED · DEEPSPOT VERIFIED · '})})
    ]}),
    (0,Y.jsx)('span',{children:'D'})
   ]})
  ]},x.id+'-'+slideIndex))}),
  (0,Y.jsxs)('div',{className:'promo-navigation',children:[(0,Y.jsx)('button',{'aria-label':'Previous banner',onClick:()=>go(active-1),children:'←'}),...slides.map((x,index)=>(0,Y.jsx)('button',{'aria-label':'Show '+x.label,'aria-pressed':active===index,className:'promo-dot',onClick:()=>go(index),children:(0,Y.jsx)('span',{})},x.id)),(0,Y.jsx)('button',{'aria-label':'Next banner',onClick:()=>go(active+1),children:'→'})]}),
  (0,Y.jsx)(mo,{open:open!==null,onOpenChange:value=>{if(!value)setOpen(null)},children:item&&(0,Y.jsxs)(_o,{className:'location-dialog promo-dialog',children:[
   item.id==='giveaway'?(0,Y.jsx)('div',{className:'promo-prize-art',children:podium}):(0,Y.jsx)('img',{src:item.image,alt:item.alt}),
   (0,Y.jsx)('p',{className:'detail-category',children:item.label}),
   (0,Y.jsx)(vo,{className:'detail-title',children:item.title}),
   (0,Y.jsx)(yo,{className:'detail-description',children:item.detail})
  ]})})
 ]});
}

function So() {
  let [e, t] = (0, a.useState)(0),
    [n, r] = (0, a.useState)(!0),
    [i, o] = (0, a.useState)(!1),
    [s, c] = (0, a.useState)(!1),
    [l, u] = (0, a.useState)(!1);
  const [mounted,setMounted]=(0,a.useState)(false);
  (0,a.useEffect)(()=>setMounted(true),[]);
  const selection=(0,a.useRef)({stamp:0,dragging:false,resumeAt:0});
  const selectSpot=(idx)=>{selection.current.stamp++;t(idx)};
  ((0, a.useEffect)(() => {
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches && r(!1);
  }, []),
    (0, a.useEffect)(() => {
      if (!n || s || !i) return;
      let e = setInterval(() => {
        if(!selection.current.dragging && performance.now()>=selection.current.resumeAt)t((e)=>(e+1)%bo.length);
      }, 8e3);
      return () => clearInterval(e);
    }, [n, s, l, i, e]));
  let d = bo[e];
  return (0, Y.jsxs)(`main`, {
    children: [
      (0, Y.jsxs)(`div`, {
        className: `ticker`,
        children: [
          (0, Y.jsx)(`span`, { children: `THIS WEEK’S WEIRDEST FINDS` }),
          (0, Y.jsx)(`span`, {
            children: `↗ A cathedral carved under Tochigi`,
          }),
          (0, Y.jsx)(`span`, { children: `↗ Swim through a Soviet prison` }),
          (0, Y.jsx)(`span`, { children: `↗ A church eaten by sand` }),
          (0, Y.jsx)(`span`, { children: `FOLLOW YOUR CURIOSITY ↗` }),
        ],
      }),
      (0, Y.jsxs)(`header`, {
        className: `header`,
        children: [
          (0, Y.jsxs)(`a`, {
            className: `wordmark`,
            href: `#`,
            "aria-label": `DeepSpot home`,
            children: [
              `DEEP`,
              (0, Y.jsx)(`br`, {}),
              `SPOT`,
              (0, Y.jsx)(`span`, { children: `✳` }),
            ],
          }),
          (0, Y.jsxs)(`div`, {
            className: `coordinates`,
            children: [`36.6390° N`, (0, Y.jsx)(`br`, {}), `139.8207° E`],
          }),
          (0, Y.jsx)(`nav`, {
            "aria-label": `Main navigation`,
            children: [
              `Browse`,
              `Map`,
              `Tours`,
              `Community`,
              `App`,
            ].map((e) => (0, Y.jsx)(`a`, {href: mounted ? `/${e.toLowerCase()}/?theme=${THEME}` : `/${e.toLowerCase()}/`, style:{color:`inherit`,textDecoration:`none`},children:e},e)),
          }),
          mounted && (0, Y.jsx)(`button`, {
            className: `theme-toggle`,
            type: `button`,
            "aria-label": THEME === `dark` ? `Switch to light mode` : `Switch to dark mode`,
            children: THEME === `dark` ? `☀ Light` : `☾ Dark`,
            onClick: () => {
              const next = new URL(window.location.href);
              next.searchParams.set(`theme`, THEME === `dark` ? `light` : `dark`);
              window.location.assign(next.href);
            },
          }),
          (0, Y.jsxs)(`span`, {
            className: `edition`,
            children: [
              `GLOBE CONCEPT `,
              (0, Y.jsx)(`span`, { children: `01` }),
            ],
          }),
        ],
      }),
      (0, Y.jsxs)(`section`, {
        className: `hero`,
        "aria-label": `Discover the extraordinary`,
        children: [
          (0, Y.jsx)(xo, {
            active: e,
            running: n && !s,
            onSelect: selectSpot,
            selection,
            ready: o,
            onHover: u,
          }),
          (0, Y.jsxs)(`div`, {
            className: `hero-copy`,
            children: [
              (0, Y.jsx)(`p`, {
                className: `eyebrow`,
                children: `your map to the`,
              }),
              (0, Y.jsxs)(`h1`, {
                children: [
                  `Extra `,
                  (0, Y.jsx)(`span`, {className:`headline-green`,children:`Un-`}),
                  (0, Y.jsx)(`br`, {}),
                  (0, Y.jsx)(`span`, {className:`headline-green`,children:`Ordinary`}),
                  (0, Y.jsx)(`span`, {
                    className: `title-star`,
                    children: `✳`,
                  }),
                ],
              }),
              (0, Y.jsxs)(`p`, {
                className: `intro`,
                children: [
                  `From forgotten ruins to unknown oddities.`,
                  (0, Y.jsx)(`br`, { className: `desktop-break` }),
                  ` Discover a world you never knew existed.`,
                ],
              }),
              (0, Y.jsxs)(`button`, {
                className: `explore-bar`,
                onClick: () => c(!0),
                children: [
                  (0, Y.jsxs)(`span`, {
                    children: [
                      (0, Y.jsx)(S, { size: 17 }),
                      d.name.toUpperCase(),
                    ],
                  }),
                  (0, Y.jsxs)(`strong`, {
                    children: [`explore `, (0, Y.jsx)(y, { size: 19 })],
                  }),
                ],
              }),
              (0, Y.jsxs)(`div`, {
                className: `discovery-note`,
                children: [
                  (0, Y.jsx)(`span`, { className: `live-dot` }),
                  ` A little further from the usual.`,
                ],
              }),
            ],
          }),
          (0, Y.jsxs)(`div`, {
            className: `globe-controls`,
            children: [
              (0, Y.jsxs)(`span`, {
                className: `ambient-label`,
                children: [
                  (0, Y.jsx)(x, { size: 16 }),
                  n ? `The world keeps turning` : `Taking a moment`,
                ],
              }),
              (0, Y.jsx)(`button`, {
                "aria-label": n
                  ? `Pause globe and location cycle`
                  : `Resume globe and location cycle`,
                onClick: () => r(!n),
                children: n
                  ? (0, Y.jsx)(C, { size: 16 })
                  : (0, Y.jsx)(w, { size: 16 }),
              }),
              (0, Y.jsx)(`button`, {
                "aria-label": `Highlight next location`,
                onClick: () => selectSpot((e + 1) % bo.length),
                children: (0, Y.jsx)(b, { size: 21 }),
              }),
            ],
          }),
          (0, Y.jsx)(`div`, {
            className: `map-credit`,
            children: `Earth imagery · Three.js / NASA`,
          }),
        ],
      }),
      mounted && (0,Y.jsx)('deepspot-editorial',{}),
      (0, Y.jsxs)(`footer`, {
        children: [
          (0, Y.jsx)(`span`, { children: `FOR THE CURIOUS. BY THE CURIOUS.` }),
          (0, Y.jsx)(`div`, {
            className: `spot-dots`,
            "aria-label": `Featured locations`,
            children: bo.map((n, r) =>
              (0, Y.jsx)(
                `button`,
                {
                  onClick: () => selectSpot(r),
                  className: r === e ? `selected` : ``,
                  "aria-label": `Show ${n.name}`,
                  "aria-pressed": r === e,
                },
                n.name,
              ),
            ),
          }),
          (0, Y.jsxs)(`span`, {
            children: [
              `THE WORLD IS WEIRDER THAN YOU THINK `,
              (0, Y.jsx)(v, { size: 16 }),
            ],
          }),
        ],
      }),
      (0, Y.jsx)(mo, {
        open: s,
        onOpenChange: c,
        children: (0, Y.jsxs)(_o, {
          className: `location-dialog`,
          children: [
            (0, Y.jsx)(`img`, { src: d.image, alt: d.name }),
            (0, Y.jsx)(`p`, {
              className: `detail-category`,
              children: `Off the beaten path`,
            }),
            (0, Y.jsx)(vo, { className: `detail-title`, children: d.name }),
            (0, Y.jsx)(yo, {
              className: `detail-description`,
              children: d.text,
            }),
            (0, Y.jsxs)(`p`, {
              className: `detail-place`,
              children: [(0, Y.jsx)(S, { size: 17 }), d.place],
            }),
            (0, Y.jsxs)(`span`, {
              className: `detail-coordinates`,
              children: [
                d.lat.toFixed(4),
                `° N \xA0 `,
                Math.abs(d.lon).toFixed(4),
                `° `,
                d.lon > 0 ? `E` : `W`,
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
export { So as default };


