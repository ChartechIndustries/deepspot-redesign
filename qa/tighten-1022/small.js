() => {
 const vis=e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity!==0&&!e.closest('[aria-hidden=true],[hidden],.sr-only,.visually-hidden,[inert]')};
 const sel=e=>e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'');
 const small={},sb={};const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=tw.nextNode()){const t=n.textContent.trim();if(t.length<2)continue;const e=n.parentElement;if(!e||!vis(e))continue;if(e.closest('svg,canvas,.leaflet-control-attribution,script,style,noscript'))continue;
  const fs=parseFloat(getComputedStyle(e).fontSize),k=sel(e);
  if(fs<14){(small[k]=small[k]||{fs,t:t.slice(0,30),c:0}).c++}
  else if(fs<17&&t.length>70&&/^(p|li|dd|blockquote|span|div)$/i.test(e.tagName)){(sb[k]=sb[k]||{fs,t:t.slice(0,40),c:0}).c++}}
 return {small:Object.entries(small).map(([k,v])=>k+' '+v.fs+' "'+v.t+'" x'+v.c),sb:Object.entries(sb).map(([k,v])=>k+' '+v.fs+' "'+v.t+'" x'+v.c)};}
