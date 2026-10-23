() => {
 const de=document.documentElement, vw=de.clientWidth;
 const vis=e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity!==0&&!e.closest('[aria-hidden=true],[hidden],.sr-only,.visually-hidden,[inert]')};
 const sel=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'');
 const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);
   return r.width>0 && r.right>vw+1 && cs.position!=='fixed' && !e.closest('[aria-hidden=true],.sr-only,[hidden]') && getComputedStyle(e.parentElement).overflowX==='visible'}).slice(0,6).map(e=>sel(e)+' r='+Math.round(e.getBoundingClientRect().right));
 const small={}, smallBody={};
 const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let n; while(n=tw.nextNode()){
   const t=n.textContent.trim(); if(t.length<2) continue; const e=n.parentElement; if(!e||!vis(e)) continue;
   if(e.closest('svg,canvas,.leaflet-control-attribution,script,style,noscript')) continue;
   const cs=getComputedStyle(e); const fs=parseFloat(cs.fontSize);
   const k=sel(e);
   if(fs<14){ if(!small[k]) small[k]={fs,t:t.slice(0,40),c:0}; small[k].c++; }
   else if(fs<17 && t.length>70 && /^(p|li|dd|blockquote|span|div)$/i.test(e.tagName)){ if(!smallBody[k]) smallBody[k]={fs,t:t.slice(0,50),c:0}; smallBody[k].c++; }
 }
 const imgs=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.currentSrc).map(i=>i.currentSrc.replace(location.origin,'').slice(0,100));
 const stretched=[...document.images].filter(i=>{if(!vis(i)||!i.naturalWidth)return false;const r=i.getBoundingClientRect();const of=getComputedStyle(i).objectFit;if(of==='cover'||of==='contain'||of==='scale-down')return false;const a=i.naturalWidth/i.naturalHeight,b=r.width/r.height;return Math.abs(a/b-1)>.08&&r.width>40}).slice(0,5).map(i=>i.currentSrc.replace(location.origin,'').slice(-60)+' '+Math.round(i.getBoundingClientRect().width)+'x'+Math.round(i.getBoundingClientRect().height)+' nat '+i.naturalWidth+'x'+i.naturalHeight);
 const blurry=[...document.images].filter(i=>{if(!vis(i)||!i.naturalWidth)return false;const r=i.getBoundingClientRect();return r.width>120&&i.naturalWidth<r.width*0.75}).slice(0,5).map(i=>i.currentSrc.replace(location.origin,'').slice(-60)+' shown '+Math.round(i.getBoundingClientRect().width)+' nat '+i.naturalWidth);
 const ids={}; document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
 const hrefs=[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href.split('#')[0]).filter(h=>h.startsWith(location.origin)))];
 const devlinks=[...document.querySelectorAll('a[href]')].filter(a=>/variations|preview\.html|studies|[?&](v|dc)=/.test(a.getAttribute('href'))).map(a=>a.getAttribute('href')+' "'+(a.innerText||'').trim().slice(0,30)+'"');
 const hdr=document.querySelector('body > header') || document.querySelector('header') || document.querySelector('nav');
 const navs=[...document.querySelectorAll('header a, header button, nav a')].filter(vis).map(a=>(a.innerText||a.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,16);
 const hdrInfo=hdr?(()=>{const r=hdr.getBoundingClientRect();const cs=getComputedStyle(hdr);return {sel:sel(hdr),h:Math.round(r.height),bg:cs.backgroundColor,pos:cs.position}})():null;
 const foot=document.querySelector('footer'); const footInfo=foot?{sel:sel(foot),links:[...foot.querySelectorAll('a')].length,h:Math.round(foot.getBoundingClientRect().height),txt:(foot.innerText||'').trim().replace(/\s+/g,' ').slice(0,120)}:null;
 const toggles=[...document.querySelectorAll('button,[role=switch]')].filter(vis).map(b=>((b.getAttribute('aria-label')||'')+' '+(b.title||'')+' '+(b.innerText||'')).toLowerCase().replace(/\s+/g,' ')).filter(t=>/theme|light|dark|colou?r/.test(t)).map(t=>t.trim().slice(0,40));
 const btns={}; [...document.querySelectorAll('button, a[class*=btn], a[class*=cta], a[class*=button], .btn')].filter(vis).forEach(b=>{const cs=getComputedStyle(b);const r=b.getBoundingClientRect();if(r.height<28)return;const k=cs.borderRadius+'|'+Math.round(r.height)+'|'+cs.fontSize+'|'+cs.fontWeight+'|'+cs.fontFamily.split(',')[0].replace(/"/g,'');(btns[k]=btns[k]||[]).push(sel(b))});
 const h2=[...document.querySelectorAll('h2')].filter(vis).slice(0,6).map(e=>{const cs=getComputedStyle(e);return cs.fontFamily.split(',')[0].replace(/"/g,'')+'|'+cs.fontSize+'|'+cs.fontWeight+'|'+cs.textTransform+' "'+e.innerText.trim().slice(0,25)+'"'});
 const h1=[...document.querySelectorAll('h1')].map(e=>{const cs=getComputedStyle(e);return cs.fontFamily.split(',')[0].replace(/"/g,'')+'|'+cs.fontSize+' "'+(e.innerText||'').trim().slice(0,30)+'"'});
 const tap=[...document.querySelectorAll('a[href],button,input,select,[role=button],[role=tab]')].filter(e=>{if(!vis(e))return false;const r=e.getBoundingClientRect();return r.width<24||r.height<24}).slice(0,8).map(e=>sel(e)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height));
 const text=document.body.innerText;
 const ph=(text.match(/lorem ipsum|\bTODO\b|\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b|placeholder|coming soon/gi)||[]).slice(0,6);
 const bodyfs=getComputedStyle(document.body).fontSize, bodyff=getComputedStyle(document.body).fontFamily.split(',')[0];
 return {sw:de.scrollWidth,vw,title:document.title,theme:de.dataset.theme||null,panel:de.dataset.panelColor||null,bodyfs,bodyff,over,small:Object.entries(small).sort((a,b)=>b[1].c-a[1].c).slice(0,12),smallBody:Object.entries(smallBody).slice(0,8),imgs,stretched,blurry,dup:Object.keys(ids).filter(k=>ids[k]>1),hrefs,devlinks,navs,hdr:hdrInfo,foot:footInfo,toggles,btns,h1,h2,tap,ph,len:de.scrollHeight}
}
