import {esc,$,$$,icon,localURL} from './core.mjs?v=149e30e7';
import {people,fmt} from './community-v2.mjs?v=263a7d93';
import {halftoneField} from './halftone-field.mjs?v=a8e8e93e';

/* Community giveaway hero (2026-10-19): 10 race-graph versions. Real data only (content.json leaderboard, this month). Bar length = sqrt(points). */
const PC=['#07d653','#3c60ff','#83cdce','#f2c14e'];
const CROP={x:.2,y:.02,w:.6};
const PRIZES=['$300','$100','$100'];
const TICKS=[500,2000,5000];
const NARROW=700;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>1-(1-x)**2.6+(x>.7?.045*Math.sin(Math.PI*(x-.7)/.3):0);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const mon=d=>d.toLocaleString('en-US',{month:'short'}).toLowerCase();
const ico={replay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/></svg>',prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>'};

/* ---------- data ---------- */
export function giveawayData(data){
 const P=people(data).monthly.slice().sort((a,b)=>b.points-a.points),max=P[0].points,total=P.reduce((a,r)=>a+r.points,0);
 return P.map((r,i)=>({...r,rank:i+1,p:Math.sqrt(r.points/max),share:r.points/total*100,max,total,min:P[P.length-1].points}));
}

/* ---------- shared pieces ---------- */
const mole=r=>`<span class="gv-mole">${r.mole?`<img src="${esc(r.mole)}" alt="" width="512" height="512" decoding="async">`:`<b aria-hidden="true">${esc(String(r.name||'?')[0].toUpperCase())}</b>`}</span>`;
const rc=(r,st='')=>`class="gv-rc${r.rank===1?' is-lead':''}${r.rank<4?` is-top is-r${r.rank}`:''}${r.p>.7?' is-hi':''}" data-rc data-i="${r.rank-1}" data-p="${r.p.toFixed(4)}" style="--p:${r.p.toFixed(4)};--pc:${PC[(r.rank-1)%4]};${st}"`;
const pin=(r,extra='')=>`<span class="gv-pin"><span class="gv-bob"><span class="gv-name">${esc(r.name)}</span>${mole(r)}${extra}</span></span>`;
const pts=r=>`<b class="gv-pts" data-count="${r.points}">${fmt(r.points)}</b>`;
const rk=r=>`<span class="gv-rk" aria-label="rank ${r.rank}">${r.rank}</span>`;
const ticks=(D,dir)=>`<span class="gv-tks gv-tks-${dir}" aria-hidden="true">${TICKS.filter(v=>v<D[0].max).map(v=>`<i style="--p:${Math.sqrt(v/D[0].max).toFixed(4)}"><b>${fmt(v)}</b></i>`).join('')}</span>`;
const note=(D,what,more='')=>`<p class="gv-note">${what} = √ points, so ${fmt(D[0].min)} and ${fmt(D[0].max)} both stay readable.${more?' '+more:''}</p>`;
const flaps=(s)=>[...s].map(c=>`<i class="gv-fl${/[,.%]/.test(c)?' pu':''}">${esc(c)}</i>`).join('');
const ROS='<span class="gv-ros" aria-hidden="true"><svg viewBox="0 0 64 80"><path class="r" d="M20 44 12 78l12-7 8 8 6-30Z"/><path class="r" d="M44 44l8 34-12-7-8 8-6-30Z"/><path class="c" d="m32 2 6 5 8-1 3 7 7 3-1 8 5 6-5 6 1 8-7 3-3 7-8-1-6 5-6-5-8 1-3-7-7-3 1-8-5-6 5-6-1-8 7-3 3-7 8 1Z"/><text x="32" y="38" text-anchor="middle">1st</text></svg></span>';

function head(v,now,{title=true}={}){
 return `<header class="gv-head"><div class="gv-ttl"><span class="gv-kick">this month’s giveaway · ${mon(now)} ${now.getFullYear()}</span><h2 id="gv-t-${v}"${title?'':' class="cv-sr"'}>deepspot initial giveaway.</h2></div>${tools()}</header>`;
}
const tools=()=>`<div class="gv-tools"><span class="gv-ends"><i>ends in</i><b data-cd>—</b></span><button type="button" class="gv-ghost" data-more>read more</button><button type="button" class="gv-ghost gv-rep" data-replay>${ico.replay}<span>run it again</span></button></div>`;
const ctaHTML=()=>`<div class="gv-cta"><div class="gv-cta-t"><h3>your spot could be next.</h3><p>Every approved spot earns 50 points, every story 100, every upvote 10. Start now and you are on the board today.</p></div><div class="gv-cta-b"><a class="ds-button gv-join" href="${esc(localURL('/contribute/'))}">join now ${icon('arrow')}</a><button type="button" class="gv-ghost" data-more>read more</button></div></div>`;
/* vertical plot (G1, G2, G5, G6) */
const vplot=(D,{order,col,extra='',cls=''})=>`<p class="gv-hint" aria-hidden="true">swipe sideways to see all ten →</p><div class="gv-scroll"><div class="gv-plot ${cls}">${extra}${ticks(D,'v')}<ol class="gv-cols" aria-label="Giveaway standings, this month">${D.map((r,i)=>col(r,order?order.indexOf(i):i)).join('')}</ol></div></div>`;

/* ---------- details dialog ---------- */
function openDetails(opener){
 const d=document.createElement('dialog');d.className='gv-dialog';d.setAttribute('aria-labelledby','gv-dlg-t');
 d.innerHTML=`<button type="button" class="gv-x" aria-label="Close giveaway details">×</button><span class="gv-kick">deepspot initial giveaway</span><h2 id="gv-dlg-t">how it works.</h2>
 <p>Share spots and stories on DeepSpot. Approved ones earn points. The people with the most points this month lead the board.</p>
 <h3>how to join</h3><ol><li>Open the contribute page.</li><li>Post a new spot or tell a story.</li><li>Points count once your spot is approved and added to the map.</li></ol>
 <h3>points</h3><table><caption class="cv-sr">Points per action</caption><thead><tr><th scope="col">action</th><th scope="col">points</th></tr></thead><tbody><tr><th scope="row">share a new spot</th><td>+50</td></tr><tr><th scope="row">tell a story</th><td>+100</td></tr><tr><th scope="row">get an upvote</th><td>+10</td></tr></tbody></table>
 <h3>prizes</h3><ul><li><b>1st place:</b> $300 and a one-of-one custom character item.</li><li><b>2nd and 3rd place:</b> $100 and a character item each.</li><li><b>Every participant:</b> a character item and 3 months free (approved map spots only).</li></ul>
 <h3>dates and rules</h3><ul><li>The board runs by calendar month and resets on the 1st.</li><li>This round ends at the end of the month, in your local time: <b data-cd>—</b> left.</li><li>Prizes and point values come from the original DeepSpot giveaway page. Check its current status, eligibility, and rules before you enter.</li></ul>
 <div class="gv-dlg-links"><a class="ds-button" href="${esc(localURL('/competition/'))}">official rules ${icon('arrow')}</a><a class="gv-link" href="https://www.deepspot.io/community" data-original target="_blank" rel="noopener">original giveaway page ↗</a></div>`;
 document.body.append(d);startCountdown(d);
 const close=()=>d.close();
 $('.gv-x',d).onclick=close;
 d.addEventListener('click',e=>{if(e.target===d)close();});
 d.addEventListener('close',()=>{d.remove();try{opener?.focus();}catch{}});
 d.showModal();
}

/* ---------- countdown ---------- */
function startCountdown(scope){
 const end=new Date(new Date().getFullYear(),new Date().getMonth()+1,1),p=n=>String(n).padStart(2,'0');
 const tick=()=>{const s=Math.max(0,Math.floor((end-Date.now())/1000)),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),c=s%60;
  $$('[data-cd]',scope).forEach(el=>{if(el.children.length){$('[data-u=d]',el).textContent=p(d);$('[data-u=h]',el).textContent=p(h);$('[data-u=m]',el).textContent=p(m);$('[data-u=s]',el).textContent=p(c);}else el.textContent=`${d}d ${p(h)}h ${p(m)}m ${p(c)}s`;});};
 tick();const id=setInterval(()=>{if(!scope.isConnected)return clearInterval(id);tick();},1000);
}
const cdBoxes=()=>`<div class="gv-cdb" data-cd role="timer" aria-label="Time left this month">${[['d','days'],['h','hrs'],['m','min'],['s','sec']].map(([u,l])=>`<div><b data-u="${u}">00</b><span>${l}</span></div>`).join('')}</div>`;

/* ---------- the race ---------- */
/* o.snap (G1): no wobble, quick ease-out with one small settle, heads lift while moving and land with a tight shadow; leader lands last */
const snapEase=x=>{const c=1.1,y=x-1;return 1+(c+1)*y*y*y+c*y*y;};
function racer(stage,move,o={}){
 const rcs=$$('[data-rc]',stage).map(el=>({el,i:+el.dataset.i,p:+el.dataset.p,cn:$$('[data-count]',el)}));
 const N=rcs.length,del=o.snap?r=>.07*(N-1-r.i):r=>.04*r.i+(r.i%3)*.05,dur=o.snap?r=>.55+.5*r.p:r=>1.7+1.6*r.p,total=Math.max(...rcs.map(r=>del(r)+dur(r)))*1000+200;
 let raf=0;
 const apply=ms=>{
  for(const r of rcs){
   const x=clamp((ms/1000-del(r))/dur(r)),t=o.snap?snapEase(x):ease(x),n=6+r.i%3,g=o.snap?0:Math.sin(x*Math.PI*n),k=1-x,s=r.el.style;
   s.setProperty('--t',t.toFixed(4));s.setProperty('--b',(x<1?-Math.abs(g)*7*k:0).toFixed(2));s.setProperty('--r',(x<1?g*4*k:0).toFixed(2));
   if(o.snap)s.setProperty('--lf',(x<=0||x>=1?0:x<.1?x/.1:x<.78?1:(1-x)/.22).toFixed(3));
   if(r.i===0)stage.style.setProperty('--lt',t.toFixed(4));
   for(const c of r.cn){const v=+c.dataset.count*clamp(t),str=c.dataset.dec?v.toFixed(1)+'%':fmt(Math.round(v));
    if(c.dataset.flap){const len=+c.dataset.flap,pad=str.padStart(len,' '),is=c.children;for(let q=0;q<is.length;q++)is[q].textContent=pad[q]===' '?'':pad[q];}else c.textContent=str;}
   move?.(r.el,r.i,t);
  }
 };
 const stop=()=>{cancelAnimationFrame(raf);raf=0;};
 const finish=()=>{apply(1e7);stage.classList.remove('gv-idle','gv-cele');stage.classList.add('gv-done','gv-idle');};
 const play=()=>{
  stop();stage.classList.remove('gv-idle','gv-done','gv-cele');const t0=performance.now();
  const lead=rcs.find(r=>r.i===0),hit=o.snap&&lead?(del(lead)+.82*dur(lead))*1000:Infinity;let cel=false;
  const loop=now=>{const ms=now-t0;if(!cel&&ms>=hit){cel=true;stage.classList.add('gv-cele');}if(ms>=total){apply(1e7);stage.classList.add('gv-done','gv-cele');setTimeout(()=>stage.classList.add('gv-idle'),1600);raf=0;return;}apply(ms);raf=requestAnimationFrame(loop);};
  apply(-1);raf=requestAnimationFrame(loop);
 };
 return {apply,play,finish,stop};
}

/* ---------- versions ---------- */
const V={};
/* G1a: first bell-bars version, kept for comparison */
V.g1a=D=>({body:vplot(D,{order:[9,7,5,3,1,0,2,4,6,8],col:(r,o)=>`<li ${rc(r,`--o:${o}`)}><span class="gv-clip"><span class="gv-bar"></span>${pin(r)}</span><span class="gv-base">${pts(r)}${rk(r)}</span></li>`}),note:note(D,'bar height')});
/* G1 bell bars v3 (picked): one left lockup (the race for $300), wide bars, prize tags, arrival sparks */
V.g1=(D,n,now)=>{
 const order=[9,7,5,3,1,0,2,4,6,8],tag=r=>r.rank<4?`<span class="gv-tag">${r.rank===1?'$300':'$100'}</span>`:'';
 const lead=`<span class="gv-spark" aria-hidden="true">${[...Array(14)].map((_,i)=>`<i style="--a:${i*360/14}deg;--c:${['#07d653','#83cdce','#3c60ff','#f5f4ee'][i%4]}"></i>`).join('')}</span>`;
 const col=(r,o)=>`<li ${rc(r,`--o:${o}`)}><span class="gv-clip"><span class="gv-bar"></span>${pin(r,`<span class="gv-puff" aria-hidden="true"></span><b class="gv-pts gv-bpts" data-count="${r.points}">${fmt(r.points)}</b>${tag(r)}${r.rank===1?lead:''}`)}</span><span class="gv-gate1">${r.rank}</span></li>`;
 const hero=`<div class="gv-hero1"><div class="gv-h1l"><span class="gv-kick">deepspot initial giveaway · ${mon(now)} ${now.getFullYear()}</span><h2 id="gv-t-g1">the race<br>for <em>$300.</em></h2><p class="gv-h1p">Post spots, tell stories, collect upvotes. Most points by ${now.toLocaleString('en-US',{month:'short'})} ${new Date(now.getFullYear(),now.getMonth()+1,0).getDate()} wins $300 and a one-of-one character item. 2nd and 3rd win $100 + an item.</p><span class="gv-ends gv-h1cd" role="timer" aria-label="Time left this month"><i>ends in</i><b data-cd>—</b></span></div></div>`;
 const legend=`<ol class="gv-legend" aria-label="Standings, ranked">${D.map(r=>`<li><span class="gv-lrk">${r.rank}</span><span class="gv-thumb" style="--pc:${PC[(r.rank-1)%4]}">${r.mole?`<img src="${esc(r.mole)}" alt="" width="512" height="512" loading="lazy" decoding="async">`:''}</span><span class="gv-lname">${esc(r.name)}</span>${r.rank<4?`<em class="gv-lprize">${PRIZES[r.rank-1]}</em>`:''}<b>${fmt(r.points)}</b></li>`).join('')}</ol>`;
 return {noHead:true,race:{snap:true},body:`<div class="gv-wrap">${hero}<div class="gv-plot gv-p1"><ol class="gv-cols" aria-label="Giveaway standings, this month">${D.map((r,i)=>col(r,order.indexOf(i))).join('')}</ol></div></div>${legend}`};
};
/* G2 finish line */
V.g2=D=>({body:vplot(D,{extra:'<span class="gv-fin" aria-hidden="true"><i>finish</i></span>',col:r=>`<li ${rc(r)}><span class="gv-clip"><span class="gv-bar"></span>${pin(r,r.rank===1?ROS:'')}</span><span class="gv-base">${rk(r)}${pts(r)}${r.rank<4?`<em class="gv-prize">${PRIZES[r.rank-1]}</em>`:''}</span></li>`}),note:note(D,'bar height')});
/* G5 starting gates */
V.g5=D=>({body:vplot(D,{order:D.map((r,i)=>D.length-1-i),col:(r,o)=>`<li ${rc(r,`--o:${o}`)}><span class="gv-dust${r.rank<4?' big':''}" aria-hidden="true"></span><span class="gv-clip"><span class="gv-bar"></span>${pin(r)}</span><span class="gv-stall">${rk(r)}${pts(r)}</span></li>`}),note:note(D,'bar height','Stall number = rank.')});
/* G6 halftone lollipops */
V.g6=D=>({body:vplot(D,{cls:'gv-big',extra:`<span class="gv-wm" aria-hidden="true">${fmt(D[0].points)}</span>`,col:r=>`<li ${rc(r)}><span class="gv-clip"><span class="gv-bar"></span>${pin(r)}</span><span class="gv-base">${pts(r)}${rk(r)}</span></li>`}),note:note(D,'stem height')});
/* G3 racetrack lanes */
V.g3=D=>({body:`<div class="gv-lanes"><ol class="gv-ol" aria-label="Giveaway standings, this month">${D.map(r=>`<li ${rc(r)}><span class="gv-gate">${rk(r)}</span><span class="gv-track"><span class="gv-tin"><span class="gv-bar"></span>${pin(r)}</span></span><span class="gv-end">${pts(r)}<small>pts</small></span></li>`).join('')}</ol>${ticks(D,'h')}<span class="gv-post" aria-hidden="true"><i>finish</i></span></div>`,note:note(D,'distance run')});
/* G10 split hero */
V.g10=(D,n,now)=>({noHead:true,noCta:true,body:`<div class="gv-split"><div class="gv-left"><span class="gv-kick">this month’s giveaway · ${mon(now)} ${now.getFullYear()}</span><h2 id="gv-t-g10">deepspot initial giveaway.</h2><div class="gv-prizebig"><strong>$300</strong><span>+ a one-of-one custom character item for first place.</span></div>${cdBoxes()}<p class="gv-left-p">left in ${mon(now)}. Resets on the 1st.</p><div class="gv-left-b"><a class="ds-button gv-join" href="${esc(localURL('/contribute/'))}">join now ${icon('arrow')}</a><button type="button" class="gv-ghost" data-more>read more</button></div></div><div class="gv-right"><div class="gv-rh"><span>standings · ${mon(now)} ${now.getFullYear()}</span><div><button type="button" class="gv-ghost gv-rep" data-replay>${ico.replay}<span>run it again</span></button></div></div><div class="gv-lanes"><ol class="gv-ol" aria-label="Giveaway standings, this month">${D.map(r=>`<li ${rc(r)}><span class="gv-gate">${rk(r)}</span><span class="gv-track"><span class="gv-tin"><span class="gv-bar"></span>${pin(r)}</span></span><span class="gv-end">${pts(r)}</span></li>`).join('')}</ol>${ticks(D,'h')}</div>${note(D,'bar length')}</div></div>`});
/* G7 tote board */
V.g7=D=>{
 const row=r=>{const a=fmt(r.points),b=r.share.toFixed(1)+'%';
  return `<li ${rc(r)}>${rk(r)}<span class="gv-tp"><span class="gv-flaps" data-flap="${a.length}" data-count="${r.points}">${flaps(a)}</span></span><span class="gv-ts"><span class="gv-flaps" data-flap="${b.length}" data-count="${r.share.toFixed(3)}" data-dec="1">${flaps(b)}</span></span><span class="gv-track"><span class="gv-tin"><span class="gv-bar"></span>${pin(r)}</span></span><span class="gv-sm"><b>${fmt(r.points)}</b> · ${b}</span></li>`;};
 return {body:`<div class="gv-tote"><div class="gv-th" aria-hidden="true"><span>pos</span><span>points</span><span>share</span><span>race</span></div><ol class="gv-ol" aria-label="Giveaway tote board, this month">${D.map(row).join('')}</ol></div>`,note:note(D,'race distance',`Share = points ÷ ${fmt(D[0].total)} total points.`)};};
/* G9 photo finish */
V.g9=(D,n)=>{const rows=n?10:6;
 return {body:`<div class="gv-cam"><span class="gv-cr a"></span><span class="gv-cr b"></span><span class="gv-cr c"></span><span class="gv-cr d"></span><span class="gv-spr t" aria-hidden="true"></span><span class="gv-spr b" aria-hidden="true"></span><span class="gv-rec" aria-hidden="true"><i></i>photo finish</span><div class="gv-field" style="--rows:${rows}"><span class="gv-ruler" aria-hidden="true"></span><span class="gv-line" aria-hidden="true"></span><span class="gv-fl-line" aria-hidden="true"><i>finish</i></span><ol class="gv-ol" aria-label="Giveaway standings, this month">${D.map((r,i)=>`<li ${rc(r,`--row:${n?i:i%6}`)}><span class="gv-tin">${pin(r,`<span class="gv-chip"><b class="gv-pts" data-count="${r.points}">${fmt(r.points)}</b> pts</span>`)}</span></li>`).join('')}</ol></div></div>`,note:note(D,'distance')};};

/* overlay helpers (G4, G8) */
const ovRC=(r,st='')=>`<li ${rc(r,st)}>${pin(r,'')}<span class="gv-ovp"><b class="gv-pts" data-count="${r.points}">${fmt(r.points)}</b></span></li>`;

/* G4 oval track */
const stadium=(f,R,g)=>{const a=g.a,L=4*a+2*Math.PI*R,d=((f%1)+1)%1*L;let x,y;
 if(d<a){x=d;y=-R;}else if(d<a+Math.PI*R){const q=(d-a)/R;x=a+R*Math.sin(q);y=-R*Math.cos(q);}
 else if(d<3*a+Math.PI*R){x=a-(d-a-Math.PI*R);y=R;}
 else if(d<3*a+2*Math.PI*R){const q=(d-3*a-Math.PI*R)/R;x=-a-R*Math.sin(q);y=R*Math.cos(q);}
 else{x=-a+(d-3*a-2*Math.PI*R);y=-R;}
 return g.v?[g.cx+y,g.cy+x]:[g.cx+x,g.cy+y];};
const stPath=(R,g)=>g.v?`M${g.cx-R} ${g.cy-g.a}V${g.cy+g.a}A${R} ${R} 0 0 0 ${g.cx+R} ${g.cy+g.a}V${g.cy-g.a}A${R} ${R} 0 0 0 ${g.cx-R} ${g.cy-g.a}Z`:`M${g.cx-g.a} ${g.cy-R}H${g.cx+g.a}A${R} ${R} 0 0 1 ${g.cx+g.a} ${g.cy+R}H${g.cx-g.a}A${R} ${R} 0 0 1 ${g.cx-g.a} ${g.cy-R}Z`;
V.g4=(D,n,now)=>{
 const g=n?{v:1,w:360,h:610,cx:180,cy:305,a:128,R:96,lanes:[-40,0,40],half:58,gap:.08,mu:38}:{w:1000,h:560,cx:500,cy:280,a:270,R:190,lanes:[-54,-18,18,54],half:72,gap:.06,mu:46};
 const LN=n?[2,0,2,2,2,2,0,2,1,1]:[3,1,2,0,3,1,2,0,3,1],f=n?[.985,.912,.849,.743,.673,.58,.443,.408,.315,.211]:D.map((r,i)=>i?.1+.82*r.p:.92);
 if(!n)for(let i=D.length-2;i>=1;i--)f[i]=Math.max(f[i],f[i+1]+g.gap);
 const mv=(el,i,t)=>{const [x,y]=stadium(f[i]*t,g.R+g.lanes[LN[i]],g);el.style.setProperty('--x',x.toFixed(1));el.style.setProperty('--y',y.toFixed(1));};
 const Ro=g.R+g.half,Ri=g.R-g.half;
 const divs=g.lanes.slice(1).map((o,i)=>`<path d="${stPath(g.R+(o+g.lanes[i])/2,g)}"/>`).join('');
 const p0=stadium(0,Ro,g),p1=stadium(0,Ri,g);
 const svg=`<svg class="gv-svg" viewBox="0 0 ${g.w} ${g.h}" aria-hidden="true"><path class="gv-tr" d="${stPath(Ro,g)}"/><path class="gv-in" d="${stPath(Ri,g)}"/><g class="gv-dv">${divs}</g><path class="gv-pst a" d="M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}"/><path class="gv-pst b" d="M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}"/></svg>`;
 const inner=n?'':`<div class="gv-inner"><div><span class="gv-kick">this month’s giveaway · ${mon(now)} ${now.getFullYear()}</span><p class="gv-it" aria-hidden="true">deepspot initial giveaway.</p></div><div class="gv-prizebig"><strong>$300</strong><span>+ a one-of-one custom character item.</span><small>2nd and 3rd: $100 + an item each</small></div></div>`;
 return {noHeadTitle:!n,move:mv,body:`<div class="gv-oval"><div class="gv-cv" style="--vb:${g.w};--mu:${g.mu};aspect-ratio:${g.w}/${g.h}">${svg}${inner}<ol class="gv-ol" aria-label="Giveaway standings, this month">${D.map(r=>ovRC(r)).join('')}</ol></div></div>`,note:`<p class="gv-note">Order by points, one lap. Distance follows √ points, spaced so everyone stays visible. The leader is nearest the finish post.</p>`};
};

/* G8 summit climb */
V.g8=(D,n,now)=>{
 const g=n?{w:360,h:700,cx:180,cy:350,rx:152,ry:300,mu:36}:{w:1000,h:560,cx:500,cy:285,rx:470,ry:236,mu:42};
 const ang=(n?[0,61.9,311.8,254,120.9,192.8,165.2,224.5,13.6,74.4]:D.map((r,i)=>i*97.5)).map(a=>a*Math.PI/180),dd=D.map(r=>1-r.p);
 const at=(i,t)=>{const rr=1-(1-dd[i])*t,th=ang[i]+(1-t)*.35;return [g.cx+g.rx*rr*Math.cos(th),g.cy+g.ry*rr*Math.sin(th)];};
 const mv=(el,i,t)=>{const [x,y]=at(i,t);el.style.setProperty('--x',x.toFixed(1));el.style.setProperty('--y',y.toFixed(1));};
 const ring=(k,s)=>{const pts=[];for(let q=0;q<=64;q++){const a=q/64*Math.PI*2,w=s*(1+.035*Math.sin(3*a+k*.7)+.02*Math.cos(5*a-k));pts.push((g.cx+g.rx*w*Math.cos(a)).toFixed(1)+' '+(g.cy+g.ry*w*Math.sin(a)).toFixed(1));}return `M${pts.join('L')}Z`;};
 const minor=[...Array(10)].map((_,k)=>`<path d="${ring(k,(k+1)/10*1.03)}"/>`).join('');
 const major=TICKS.filter(v=>v<D[0].max).map((v,k)=>{const s=1-Math.sqrt(v/D[0].max),a=0;return `<path d="${ring(k+3,s)}"/>${n?'':`<text x="${(g.cx+g.rx*s*Math.cos(a)).toFixed(1)}" y="${(g.cy+g.ry*s*Math.sin(a)).toFixed(1)}">${fmt(v)} pts</text>`}`;}).join('');
 const routes=D.map((r,i)=>{const s=[];for(let q=0;q<=24;q++){const [x,y]=at(i,q/24);s.push(x.toFixed(1)+' '+y.toFixed(1));}return `<path d="M${s.join('L')}"/>`;}).join('');
 const svg=`<svg class="gv-svg" viewBox="0 0 ${g.w} ${g.h}" aria-hidden="true"><g class="gv-cn">${minor}</g><g class="gv-cm">${major}</g><g class="gv-rt">${routes}</g></svg>`;
 const flag=`<span class="gv-flag" aria-hidden="true" style="--x:${g.cx};--y:${g.cy}"><i></i><b>$300</b></span>`;
 return {move:mv,body:`<div class="gv-oval"><div class="gv-cv" style="--vb:${g.w};--mu:${g.mu};aspect-ratio:${g.w}/${g.h}">${svg}${flag}<ol class="gv-ol" aria-label="Giveaway standings, this month">${D.map(r=>ovRC(r)).join('')}</ol></div></div>`,note:`<p class="gv-note">Height = √ points: the summit is ${fmt(D[0].max)}. Rings mark ${TICKS.filter(v=>v<D[0].max).map(fmt).join(', ')} points. Each route climbs from base camp at the edge.</p>`};
};

/* ---------- render ---------- */
export function renderGiveaway(root,data,variant='g1',opt={}){
 const v=V[variant]?variant:'g1',D=giveawayData(data),now=new Date(),lim=variant==='g9'?1280:(variant==='g4'||variant==='g8')?900:NARROW,narrow=root.clientWidth>0&&root.clientWidth<lim;
 const mode=opt.mode||new URLSearchParams(location.search).get('race')||'';
 const T=V[v](D,narrow,now);
 root.innerHTML=`<section class="gv gv-${v}${narrow?' is-narrow':''}" data-gv="${v}" aria-labelledby="gv-t-${v}" style="--mx:${CROP.x};--my:${CROP.y};--mw:${CROP.w}"><div class="gv-stage">${T.noHead?'':head(v,now,{title:!T.noHeadTitle})}${T.body}${T.note||''}</div>${T.noCta?'':ctaHTML()}</section>`;
 const sec=$('.gv',root),stage=$('.gv-stage',sec),race=racer(stage,T.move,T.race),rm=reduced();
 startCountdown(sec);
 /* G1: ambient turbulent noise in the Earth's halftone glyphs, barely visible behind the race */
 if(v==='g1'){root._hf?.stop();const dark=()=>document.documentElement.dataset.theme!=='light';root._hf=halftoneField(stage,{cell:10,ink:()=>dark()?[146/255,193/255,228/255]:[24/255,48/255,86/255]});}
 sec.addEventListener('click',e=>{const m=e.target.closest('[data-more]');if(m)return openDetails(m);if(e.target.closest('[data-replay]'))race.play();});
 /* scrollable plot: keyboard reachable only when it scrolls */
 const sc=$('.gv-scroll',sec);if(sc){const chk=()=>{const s=sc.scrollWidth>sc.clientWidth+2;if(s){sc.tabIndex=0;sc.setAttribute('role','region');sc.setAttribute('aria-label','Giveaway chart, scrolls sideways');}else{sc.removeAttribute('tabindex');sc.removeAttribute('role');sc.removeAttribute('aria-label');}};chk();if(sc.scrollWidth>sc.clientWidth+2){if(v==='g5')sc.scrollLeft=sc.scrollWidth;else if(v==='g1'){const lead=$('.is-lead',sc);if(lead)sc.scrollLeft=lead.offsetLeft+lead.offsetWidth/2-sc.clientWidth/2;}}}
 /* race */
 if(rm||mode==='final'){race.finish();if(rm)$$('[data-replay]',sec).forEach(b=>b.hidden=true);}
 else if(mode==='mid'){race.apply(1100);}
 else{race.apply(-1);if('IntersectionObserver'in window){const io=new IntersectionObserver(([en])=>{if(en.isIntersecting){io.disconnect();race.play();}},{threshold:.3});io.observe(stage);}else race.play();}
 /* re-render when the container crosses the narrow breakpoint */
 if(!opt.nested&&'ResizeObserver'in window&&(v==='g4'||v==='g8'||v==='g9')){let was=narrow;const ro=new ResizeObserver(()=>{const w=root.clientWidth,nw=w>0&&w<lim;if(nw!==was){was=nw;ro.disconnect();race.stop();renderGiveaway(root,data,variant,{mode:'final',nested:false});}});ro.observe(root);}
 return {race};
}
export const VARIANTS=[['g1','bell bars (picked, v2)'],['g1a','bell bars (first version)'],['g2','finish line'],['g3','racetrack lanes'],['g4','oval track'],['g5','starting gates'],['g6','halftone lollipops'],['g7','tote board'],['g8','summit climb'],['g9','photo finish'],['g10','split hero']];
