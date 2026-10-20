// Promo banner variations. Text matches the live banners; only the layout changes.
// Each fn(uid) returns {cls, html}. uid keeps SVG ids unique per instance.
(function(){
const photo=n=>`/spots/${n}.jpg`;
const img=n=>`<img src="${photo(n)}" alt="" loading="lazy" decoding="async">`;
const compCopy='<div class="ed-promo-copy"><h3><span class="ed-prize">$300</span><span class="ed-prize-line">for your curiosity.</span></h3><button data-promo="competition">the competition ↗</button></div>';
const weekCopy='<div class="ed-promo-copy"><h3>go<br><i>underground.</i></h3><button data-promo="week">spot of the week ↗</button></div>';
const roadCopy='<div class="ed-promo-copy"><h3>the way<br><i>forward.</i></h3><button data-promo="roadmap">view our roadmap ↗</button></div>';
const weekImg='<img src="/spots/oya.jpg" alt="The immense underground halls of Oya History Museum" loading="lazy" decoding="async">';
const place='<span class="ed-place" aria-hidden="true">oya history museum · utsunomiya, japan</span>';
const star='<svg class="ed-seal-star" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/></svg>';
// Green verified seal, same ring and star as the live banner.
const seal=(uid,extra='')=>`<span class="ed-seal ${extra}" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="${uid}-ring" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0"/></defs><text><textPath href="#${uid}-ring" textLength="230">DEEPSPOT VERIFIED · DEEPSPOT VERIFIED · </textPath></text></svg>${star}</span>`;
// White-bordered photo print. vars: x left, b bottom, w width, h photo height (design px), r tilt (deg).
const print=(name,rank,vars,extra='')=>`<figure class="pv-print ${extra}" style="${vars}">${img(name)}${rank?`<b>${rank}</b>`:''}</figure>`;
const pat=(id,name)=>`<pattern id="${id}" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${photo(name)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>`;
// Wavy topographic rings, same recipe as the live roadmap.
const contours=(cx,cy,n,r0,step,cls)=>`<g class="${cls}">${Array.from({length:n},(_,k)=>{const r=r0+k*step,pts=[];for(let i=0;i<=48;i++){const t=i/48*Math.PI*2,w=r*(1+.13*Math.sin(3*t+k*.7)+.07*Math.cos(5*t-k));pts.push((cx+w*1.35*Math.cos(t)).toFixed(1)+' '+(cy+w*.8*Math.sin(t)).toFixed(1))}return `<path d="M${pts.join('L')}Z"/>`}).join('')}</g>`;
// Round photo pin: outer ring plus photo fill.
const pin=(x,y,r,id,ring='#fbfaf5',w=4)=>`<g class="pv-pin"><circle cx="${x}" cy="${y}" r="${r+w/2}" fill="${ring}"/><circle cx="${x}" cy="${y}" r="${r-w/2}" fill="url(#${id})"/></g>`;
// Dashed goal ring with a centre dot.
const goal=(x,y,r,fill,line='#07d653')=>`<g class="pv-goal"><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="3" stroke-dasharray="4 5"/><circle cx="${x}" cy="${y}" r="7" fill="${line}"/></g>`;
const stage=inner=>`<div class="pv-stage">${inner}</div>`;
const svg=inner=>`<svg class="pv-svg" viewBox="0 0 477 330" aria-hidden="true">${inner}</svg>`;
const pinNames=['oyunohara','xwejni','sandchurch'];
const pinDefs=uid=>pinNames.map((n,i)=>pat(`${uid}-${i}`,n)).join('');

const competition=[
// C1 podium prints
uid=>({cls:'ed-promo ed-competition pv-c1',html:`<span class="ed-dots" aria-hidden="true"></span>${stage(`<span class="pv-base" aria-hidden="true"></span>${print('teufelsberg','2','--x:24;--b:38;--w:90;--h:96;--r:-2')}${print('rummu','1','--x:122;--b:38;--w:106;--h:132;--r:0','pv-first')}${print('maishima','3','--x:236;--b:38;--w:90;--h:76;--r:2','pv-last')}${compCopy}`)}`}),
// C2 photo clipped into the numerals
uid=>({cls:'ed-promo ed-competition pv-c2',html:`<span class="ed-dots" aria-hidden="true"></span>${stage(`${compCopy}<b class="pv-badge" aria-hidden="true">1</b>`)}`}),
// C3 leaderboard bars
uid=>({cls:'ed-promo ed-competition pv-c3',html:`<span class="ed-dots" aria-hidden="true"></span>${stage(`<div class="pv-rows" aria-hidden="true">${[['1','rummu',100],['2','teufelsberg',72],['3','maishima',50]].map(([k,n,p])=>`<div class="pv-row"><b>${k}</b>${img(n)}<span class="pv-track"><i style="width:${p}%"></i></span></div>`).join('')}</div><span class="pv-rule" aria-hidden="true"></span>${compCopy}`)}`}),
// C4 prize ticket on cobalt, prints tucked behind the top edge
uid=>({cls:'ed-promo ed-competition pv-c4',html:stage(`<div class="ed-promo-copy"><h3 class="pv-ticket"><span class="pv-fan" aria-hidden="true">${print('teufelsberg','2','--x:0;--b:0;--w:84;--h:100;--r:-8')}${print('rummu','1','--x:96;--b:0;--w:90;--h:112;--r:2','pv-first')}${print('maishima','3','--x:196;--b:0;--w:84;--h:96;--r:8')}</span><span class="pv-stub" aria-hidden="true">${star}</span><span class="ed-prize">$300</span><span class="ed-prize-line">for your curiosity.</span></h3><button data-promo="competition">the competition ↗</button></div>`)}),
// C5 rosette on aqua
uid=>{const scallops=Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return `<circle cx="${(100+70*Math.cos(a)).toFixed(1)}" cy="${(96+70*Math.sin(a)).toFixed(1)}" r="14"/>`}).join('');
return {cls:'ed-promo ed-competition pv-c5',html:`<span class="ed-dots" aria-hidden="true"></span>${stage(`<svg class="pv-rosette" viewBox="0 0 200 260" aria-hidden="true"><defs>${pat(uid+'-ph','rummu')}</defs><path d="M62 140L98 150L88 252L68 236L46 250Z" fill="#0b1b27"/><path d="M138 140L102 150L112 252L132 236L154 250Z" fill="#fbfaf5"/><g fill="#3c60ff">${scallops}<circle cx="100" cy="96" r="72"/></g><circle cx="100" cy="96" r="64" fill="none" stroke="#fbfaf5" stroke-opacity=".6" stroke-width="2" stroke-dasharray="2 5"/><circle cx="100" cy="96" r="55" fill="#fbfaf5"/><circle cx="100" cy="96" r="51" fill="url(#${uid}-ph)"/><circle cx="148" cy="144" r="28" fill="#fbfaf5"/><circle cx="148" cy="144" r="25" fill="#0b1b27"/><text x="148" y="156" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="34" fill="#07d653">1</text></svg>${compCopy}`)}`}}
];

const week=[
// W1 split: photo left, ink panel right, seal on the seam
uid=>({cls:'ed-promo ed-week pv-w1',html:`<span class="pv-photo">${weekImg}</span><span class="pv-seam" aria-hidden="true"></span>${place}${seal(uid)}${weekCopy}`}),
// W2 porthole: round photo bleeding off the corner, seal on the rim
uid=>({cls:'ed-promo ed-week pv-w2',html:`<span class="pv-ring">${weekImg}</span>${place}${seal(uid)}${weekCopy}`}),
// W3 giant type over a full-bleed photo with a depth gauge
uid=>({cls:'ed-promo ed-week pv-w3',html:`<span class="pv-photo">${weekImg}</span><span class="pv-shade" aria-hidden="true"></span><span class="pv-gauge" aria-hidden="true"></span>${place}${seal(uid)}${weekCopy}`}),
// W4 white-bordered print on cream
uid=>({cls:'ed-promo ed-week pv-w4',html:`<span class="pv-w4print">${weekImg}</span>${place}${seal(uid)}${weekCopy}`}),
// W5 cobalt/ink duotone with green type
uid=>({cls:'ed-promo ed-week pv-w5',html:`<span class="pv-photo">${weekImg}</span><span class="pv-duo-a" aria-hidden="true"></span><span class="pv-duo-b" aria-hidden="true"></span><span class="pv-shade" aria-hidden="true"></span>${place}${seal(uid)}${weekCopy}`})
];

const road=[
// R1 metro line
uid=>{const xs=[64,176,288];
return {cls:'ed-promo ed-road pv-r1',html:stage(`${svg(`<defs>${pinDefs(uid)}</defs>${contours(410,84,5,26,17,'pv-contours')}<path class="pv-line" d="M24 272H288"/><path class="pv-next" d="M306 272H384"/>${xs.map((x,i)=>`<path class="pv-stem" d="M${x} 226V258"/><circle class="pv-stn" cx="${x}" cy="272" r="13"/>${pin(x,198,26,`${uid}-${i}`)}`).join('')}${goal(414,272,26,'#3c60ff')}`)}${roadCopy}`)}},
// R2 rising steps on green
uid=>{const tops=[278,238,198];
return {cls:'ed-promo ed-road pv-r2',html:stage(`${svg(`<defs>${pinDefs(uid)}</defs>${tops.map((t,i)=>`<rect class="pv-step" x="${24+i*104}" y="${t}" width="104" height="${330-t}"/><rect x="${24+i*104}" y="${t}" width="104" height="5" fill="#3c60ff"/>`).join('')}<rect class="pv-step-next" x="337" y="159" width="102" height="171"/>${tops.map((t,i)=>pin(76+i*104,t-29,24,`${uid}-${i}`)).join('')}${goal(388,126,24,'#07d653','#0b1b27')}`)}${roadCopy}`)}},
// R3 big arrow
uid=>{const pts=[[110,281],[192,220],[274,159]];
return {cls:'ed-promo ed-road pv-r3',html:stage(`${svg(`<defs>${pinDefs(uid)}</defs><path class="pv-arrow" d="M39 290L333 72L299 26L450 28L409 173L375 128L81 346Z"/><path class="pv-route" d="M60 318L274 159"/><path class="pv-next" d="M274 159L394 70"/>${pts.map((p,i)=>pin(p[0],p[1],21,`${uid}-${i}`)).join('')}${goal(406,61,22,'#3c60ff')}`)}${roadCopy}`)}},
// R4 summit map on ink
uid=>({cls:'ed-promo ed-road pv-r4',html:stage(`${svg(`<defs>${pinDefs(uid)}</defs>${contours(392,98,9,22,30,'pv-contours')}<path class="pv-route" d="M236 345C252 312 258 296 268 274S306 236 330 216S346 180 356 158"/><path class="pv-next" d="M356 158C368 144 384 140 392 124"/>${[[268,274],[330,216],[356,158]].map((p,i)=>pin(p[0],p[1],22,`${uid}-${i}`)).join('')}<g class="pv-goal"><circle cx="392" cy="98" r="26" fill="#0b1b27" stroke="#07d653" stroke-width="3" stroke-dasharray="4 5"/><path d="M392 110V84" stroke="#fbfaf5" stroke-width="2.5" stroke-linecap="round"/><path d="M392 84L411 91L392 98Z" fill="#07d653"/></g>`)}${roadCopy}`)}),
// R5 route cards: three tilted prints joined by a dashed line to the goal
uid=>{const check='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#07d653"/><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#0b1b27" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const dot='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fbfaf5"/><circle cx="12" cy="12" r="5" fill="#07d653"/></svg>';
const cards=[['oyunohara','--x:28;--b:24;--w:96;--h:96;--r:-5',check],['xwejni','--x:140;--b:24;--w:96;--h:96;--r:4',check],['sandchurch','--x:252;--b:24;--w:96;--h:96;--r:-4',dot]];
return {cls:'ed-promo ed-road pv-r5',html:stage(`${svg(`${contours(410,84,5,26,17,'pv-contours')}<path class="pv-next" d="M22 249H388"/>${goal(416,249,26,'#3c60ff')}`)}${cards.map(([n,v,ic])=>`<figure class="pv-print" style="${v}">${img(n)}<span class="pv-state" aria-hidden="true">${ic}</span></figure>`).join('')}${roadCopy}`)}}
];

// ---- Y set: roadmap on cobalt with a yellow arrow moving forward ----
const Y='#ffd400';
const arrow=[
// Y1 hero arrow: huge solid arrow across the lower card, tail bleeding off the left, nudges right and back
uid=>{const d='M-420 216H296V168L436 244L296 320V272H-420Z';
return {cls:'ed-promo ed-road pv-y1',html:stage(svg(`<g class="pv-move"><path d="${d}" fill="#0b1b27" fill-opacity=".28" transform="translate(7 9)"/><path d="${d}" fill="${Y}" stroke="${Y}" stroke-width="6" stroke-linejoin="round"/><path d="M-420 244H300" stroke="#3c60ff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="14 12"/></g>`)+roadCopy)}},
// Y2 chevron march: repeated chevrons scroll right, one period per loop so it wraps cleanly
uid=>{const one=x=>`M${x} 176H${x+40}L${x+84} 236L${x+40} 296H${x}L${x+44} 236Z`;
const d=Array.from({length:14},(_,i)=>one(-288+i*96)).join('');
return {cls:'ed-promo ed-road pv-y2',html:stage(svg(`<defs><linearGradient id="${uid}-g" gradientUnits="userSpaceOnUse" x1="-70" y1="0" x2="170" y2="0"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="${uid}-m" maskUnits="userSpaceOnUse" x="-500" y="0" width="1500" height="330"><rect x="-500" y="0" width="1500" height="330" fill="url(#${uid}-g)"/></mask></defs><g mask="url(#${uid}-m)"><g class="pv-march"><path d="${d}" fill="#0b1b27" fill-opacity=".25" transform="translate(6 8)"/><path d="${d}" fill="${Y}" stroke="${Y}" stroke-width="3" stroke-linejoin="miter"/></g></g>`)+roadCopy)}},
// Y3 road in perspective, scrolling centre dashes, painted arrow in the right lane
uid=>{const VX=400,VY=90,BX=295,BY=330,vx=BX-VX,vy=BY-VY,cx=f=>VX+f*vx,py=f=>VY+f*vy;
const road=`M${(cx(.03)-5).toFixed(1)} ${py(.03).toFixed(1)}L${(cx(.03)+5).toFixed(1)} ${py(.03).toFixed(1)}L${(cx(1.06)+185).toFixed(1)} ${py(1.06).toFixed(1)}L${(cx(1.06)-185).toFixed(1)} ${py(1.06).toFixed(1)}Z`;
const dashes=Array.from({length:10},(_,k)=>{const f1=Math.pow(.72,k)*1.02,f2=f1*.86,w1=14*f1/2,w2=14*f2/2;return `<path d="M${(cx(f1)-w1).toFixed(1)} ${py(f1).toFixed(1)}L${(cx(f1)+w1).toFixed(1)} ${py(f1).toFixed(1)}L${(cx(f2)+w2).toFixed(1)} ${py(f2).toFixed(1)}L${(cx(f2)-w2).toFixed(1)} ${py(f2).toFixed(1)}Z"/>`}).join('');
const P=(f,lat)=>`${(cx(f)+lat*f).toFixed(1)} ${py(f).toFixed(1)}`;
const ar=`M${P(.92,88-24)}L${P(.92,88+24)}L${P(.5,88+24)}L${P(.5,88+58)}L${P(.14,88)}L${P(.5,88-58)}L${P(.5,88-24)}Z`;
return {cls:'ed-promo ed-road pv-y3',html:stage(svg(`<path d="${road}" fill="#0b1b27"/><path d="M${P(.03,-175)}L${P(1.06,-175)}M${P(.03,175)}L${P(1.06,175)}" stroke="#fbfaf5" stroke-width="3" stroke-linecap="round"/><g class="pv-roadmove" fill="#fbfaf5">${dashes}</g><path d="${ar}" fill="${Y}" stroke="${Y}" stroke-width="3" stroke-linejoin="round"/>`)+roadCopy)}},
// Y4 route arrow: thick curve with pins, ink dashes flowing along it, big head at the end
uid=>{const d='M-160 326L-30 324C70 318 120 262 200 250S340 244 420 184';
return {cls:'ed-promo ed-road pv-y4',html:stage(svg(`<defs>${pinDefs(uid)}</defs><g transform="translate(-20 10)"><path d="${d}" fill="none" stroke="#0b1b27" stroke-opacity=".28" stroke-width="26" stroke-linecap="butt" transform="translate(5 8)"/><path d="${d}" fill="none" stroke="${Y}" stroke-width="26" stroke-linecap="butt"/><path class="pv-flow" d="${d}" fill="none" stroke="#0b1b27" stroke-opacity=".55" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="2 20"/>${[[92,289],[200,250],[310,235]].map((p,i)=>pin(p[0],p[1],26,`${uid}-${i}`)).join('')}<path d="M444 216L396 152L471 146Z" fill="${Y}" stroke="${Y}" stroke-width="8" stroke-linejoin="round"/></g>`)+roadCopy)}},
// Y5 road sign: yellow diamond with ink border and arrow, tilted, gliding right; speed lines behind
uid=>({cls:'ed-promo ed-road pv-y5',html:stage(svg(`<g stroke="${Y}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M176 172H262" stroke-opacity=".9"/><path d="M96 204H244" stroke-opacity=".7"/><path d="M148 236H258" stroke-opacity=".5"/></g><g class="pv-glide"><g transform="rotate(-6 340 204)"><rect x="255" y="119" width="170" height="170" rx="20" fill="#0b1b27" fill-opacity=".28" transform="translate(6 9) rotate(45 340 204)"/><rect x="255" y="119" width="170" height="170" rx="20" fill="${Y}" transform="rotate(45 340 204)"/><rect x="269" y="133" width="142" height="142" rx="11" fill="none" stroke="#0b1b27" stroke-width="5" transform="rotate(45 340 204)"/><path d="M291 193H343V172L389 204L343 236V215H291Z" fill="#0b1b27" stroke="#0b1b27" stroke-width="6" stroke-linejoin="round"/></g></g>`)+roadCopy)})
];

// ---- R4 rebuild: summit maps on ink, milestone markers instead of photos ----
const GREEN='#07d653',CREAM='#fbfaf5',INK='#0b1b27';
const f1=n=>n.toFixed(1);
// Catmull-Rom through pts: smooth cubic path from pts[i0] to pts[i1]. Knots lie exactly on the path.
const crPath=(p,i0,i1)=>{let d=`M${f1(p[i0][0])} ${f1(p[i0][1])}`;for(let i=i0;i<i1;i++){const a=p[Math.max(i-1,0)],b=p[i],c=p[i+1],e=p[Math.min(i+2,p.length-1)];d+=`C${f1(b[0]+(c[0]-a[0])/6)} ${f1(b[1]+(c[1]-a[1])/6)} ${f1(c[0]-(e[0]-b[0])/6)} ${f1(c[1]-(e[1]-b[1])/6)} ${f1(c[0])} ${f1(c[1])}`}return d};
const mkDone=(x,y)=>`<g class="pv-mk"><circle cx="${x}" cy="${y}" r="11" fill="${GREEN}"/><path d="M${x-5} ${y+.5}l3.6 3.6 6.4-7.4" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const mkNow=(x,y)=>`<g class="pv-mk"><circle class="pv-halo" cx="${x}" cy="${y}" r="21" fill="none" stroke="${GREEN}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="15" fill="${INK}" stroke="${GREEN}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="9" fill="${CREAM}"/></g>`;
const mkNext=(x,y)=>`<circle class="pv-mk" cx="${x}" cy="${y}" r="10" fill="${INK}" stroke="${GREEN}" stroke-width="2.5" stroke-dasharray="3.5 3.5"/>`;
const mkSummit=(x,y)=>`<g class="pv-mk"><path d="M${x} ${y-10}V${y-36}" stroke="${CREAM}" stroke-width="2.5" stroke-linecap="round"/><path d="M${x} ${y-36}L${x+17} ${y-28.5}L${x} ${y-21}Z" fill="${GREEN}"/><circle cx="${x}" cy="${y}" r="10" fill="${INK}" stroke="${GREEN}" stroke-width="3"/></g>`;
// Concentric rings, same centre and phase, so they never cross.
const rings=(cx,cy,radii,sx,sy,mask)=>`<g class="pv-rings" mask="url(#${mask})">${radii.map(r=>{const pts=[];for(let i=0;i<96;i++){const t=i/96*Math.PI*2,w=r*(1+.05*Math.sin(3*t+.6));pts.push(f1(cx+w*sx*Math.cos(t))+' '+f1(cy+w*sy*Math.sin(t)))}return `<path d="M${pts.join('L')}Z"/>`}).join('')}</g>`;
const maskDef=(id,grad)=>`<defs>${grad}<mask id="${id}" maskUnits="userSpaceOnUse" x="-600" y="-400" width="1700" height="1000"><rect x="-600" y="-400" width="1700" height="1000" fill="url(#${id}-g)"/></mask></defs>`;
const svgA=(inner,align)=>`<svg class="pv-svg" viewBox="0 0 477 330" preserveAspectRatio="${align}YMax meet" aria-hidden="true">${inner}</svg>`;
const route=(done,future)=>`<path class="pv-done" d="${done}"/><path class="pv-future" d="${future}"/>`;

const road4=[
// R4a summit map: rings around the summit, route with two switchbacks, text bottom-left
uid=>{const p=[[244,346],[256,300],[312,270],[318,222],[346,176],[372,92]];
const g=`<radialGradient id="${uid}-m-g" gradientUnits="userSpaceOnUse" cx="60" cy="262" r="250"><stop offset="0" stop-color="#000"/><stop offset=".78" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>`;
return {cls:'ed-promo ed-road pv-r4a',html:stage(svgA(`${maskDef(uid+'-m',g)}${rings(372,92,[26,58,90,122,154,186,218,250],1.25,1,uid+'-m')}${route(crPath(p,0,3),crPath(p,3,5))}${mkDone(...p[1])}${mkDone(...p[2])}${mkNow(...p[3])}${mkNext(...p[4])}${mkSummit(...p[5])}`,'xMax')+roadCopy)}},
// R4b elevation profile: the route is the ridge line, flag on the peak, text top-left
uid=>{const p=[[-160,324],[50,300],[150,262],[240,214],[318,164],[392,118],[452,176],[540,236],[680,284],[820,318]];
const grid=[170,210,250,290].map(y=>`<path d="M0 ${y}H900"/>`).join('');
const ticks=[170,210,250,290].map(y=>`<path d="M0 ${y}H12"/>`).join('')+[190,230,270,310].map(y=>`<path d="M0 ${y}H6" opacity=".6"/>`).join('');
return {cls:'ed-promo ed-road pv-r4b',html:stage(svgA(`<defs><linearGradient id="${uid}-fill" gradientUnits="userSpaceOnUse" x1="0" y1="110" x2="0" y2="330"><stop offset="0" stop-color="${GREEN}" stop-opacity=".18"/><stop offset="1" stop-color="${GREEN}" stop-opacity="0"/></linearGradient></defs><g class="pv-grid">${grid}</g><g class="pv-ticks">${ticks}</g><path d="${crPath(p,0,9)}L820 345L-160 345Z" fill="url(#${uid}-fill)"/><path class="pv-ridge" d="${crPath(p,5,9)}"/>${route(crPath(p,0,3),crPath(p,3,5))}${mkDone(...p[1])}${mkDone(...p[2])}${mkNow(...p[3])}${mkNext(...p[4])}${mkSummit(...p[5])}`,'xMin')+roadCopy)}},
// R4c switchback trail: zigzag legs with rounded turns climbing to the summit, text top-left
uid=>{const P=[[300,352],[425,296],[308,244],[428,192],[310,140],[420,72]],d=34;
const nb=(i)=>{const V=P[i],a=P[i-1],b=P[i+1],u=(q)=>{const l=Math.hypot(q[0]-V[0],q[1]-V[1]);return [(q[0]-V[0])/l*d,(q[1]-V[1])/l*d]},ua=u(a),ub=u(b);const bf=[V[0]+ua[0],V[1]+ua[1]],af=[V[0]+ub[0],V[1]+ub[1]];return {V,bf,af,mid:[.25*bf[0]+.5*V[0]+.25*af[0],.25*bf[1]+.5*V[1]+.25*af[1]]}};
const T=[1,2,3,4].map(nb),q=(a)=>f1(a[0])+' '+f1(a[1]),h=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const done=`M${q(P[0])}L${q(T[0].bf)}Q${q(T[0].V)} ${q(T[0].af)}L${q(T[1].bf)}Q${q(T[1].V)} ${q(T[1].af)}L${q(T[2].bf)}Q${q(h(T[2].bf,T[2].V))} ${q(T[2].mid)}`;
const future=`M${q(T[2].mid)}Q${q(h(T[2].V,T[2].af))} ${q(T[2].af)}L${q(T[3].bf)}Q${q(T[3].V)} ${q(T[3].af)}L${q(P[5])}`;
const g=`<linearGradient id="${uid}-m-g" gradientUnits="userSpaceOnUse" x1="190" y1="0" x2="262" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>`;
return {cls:'ed-promo ed-road pv-r4c',html:stage(svgA(`${maskDef(uid+'-m',g)}${rings(420,70,[40,78,116,154,192,230],1.15,.95,uid+'-m')}${route(done,future)}${mkDone(...T[0].mid)}${mkDone(...T[1].mid)}${mkNow(...T[2].mid)}${mkNext(...T[3].mid)}${mkSummit(...P[5])}`,'xMax')+roadCopy)}}
];

// C4 ticket: first click tears the stub off, then the normal banner click runs.
document.addEventListener('click',e=>{const card=e.target.closest&&e.target.closest('.pv-c4');if(!card||card.classList.contains('pv-ripped'))return;
const btn=card.querySelector('[data-promo]');e.preventDefault();e.stopPropagation();card.classList.add('pv-ripped');
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(()=>{if(btn)btn.click()},still?0:650);
setTimeout(()=>card.classList.remove('pv-ripped'),1800)},true);

window.DSPromoVariants={competition,week,road,arrow,road4};
})();
