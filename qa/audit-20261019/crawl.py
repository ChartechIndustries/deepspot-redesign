import json, sys, time, re
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
ROUTES=['/','/browse/','/spot/?id=tochigi-underground-quarry','/map/','/stories/','/story/?id=shark','/guides/',
'/guide/?id=tas-aizu-samurai-cultural-tour','/adventures/','/saved/','/plan-trip/','/contribute/','/account/','/inbox/',
'/invites/','/community/','/leaderboard/','/competition/','/forum/','/mission/','/faq/','/membership/','/app/','/roadmap/',
'/sponsored/','/privacy/','/terms/','/cookies/','/profile/?user=wayfarer','/profile/?user=preview','/at-risk/',
'/promo-variations.html','/404.html']
AXE='https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
ALLV=[('d1440',1440,900,'dark'),('l1440',1440,900,'light'),('d390',390,844,'dark'),('l390',390,844,'light'),('d768',768,1024,'dark')]
VIEWS=[v for v in ALLV if v[0]==sys.argv[1]]
OUT='C:/Users/CharD/Desktop/DeepSpot Globe/qa/audit-20261019/'
res=[]; links=set()
CHECK=r'''() => {
 const de=document.documentElement, vw=de.clientWidth;
 const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
   return r.width>0 && r.right>vw+1 && cs.position!=='fixed' && !e.closest('[aria-hidden=true],.sr-only,[hidden]') && getComputedStyle(e.parentElement).overflowX==='visible'}).slice(0,6)
   .map(e=>(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):''))+' r='+Math.round(e.getBoundingClientRect().right));
 const imgs=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src).map(i=>i.src.replace(location.origin,''));
 const noalt=[...document.images].filter(i=>!i.hasAttribute('alt')).length;
 const ids={}; document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);
 const dup=Object.keys(ids).filter(k=>ids[k]>1);
 const btn=[...document.querySelectorAll('button,a[href],[role=button]')].filter(e=>e.offsetParent&&!(e.innerText||'').trim()&&!e.getAttribute('aria-label')&&!e.getAttribute('title')&&!e.querySelector('img[alt]:not([alt=""]),svg title')).length;
 const h1=document.querySelectorAll('h1').length;
 const hrefs=[...document.querySelectorAll('a[href]')].map(a=>a.href);
 const small=[...document.querySelectorAll('a[href],button,input,select,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();return e.offsetParent&&r.width>0&&(r.width<24||r.height<24)}).length;
 const text=document.body.innerText;
 const ph=(text.match(/lorem ipsum|TODO|undefined|NaN|\[object Object\]|null\b/gi)||[]).slice(0,5);
 return {sw:de.scrollWidth,vw,title:document.title,over,imgs,noalt,dup,btn,h1,hrefs,small,ph,len:document.body.scrollHeight}
}'''
with sync_playwright() as p:
  br=p.chromium.launch(headless=True)
  for vid,w,h,theme in VIEWS:
    ctx=br.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
    for r in ROUTES:
      pg=ctx.new_page(); errs=[]; fails=[]
      pg.on('console',lambda m,errs=errs: m.type in('error','warning') and errs.append(m.type[0]+': '+m.text[:200]))
      pg.on('pageerror',lambda e,errs=errs: errs.append('PAGEERROR: '+str(e)[:200]))
      pg.on('requestfailed',lambda q,fails=fails: fails.append('FAILED '+q.url[:150]+' '+(q.failure or '')))
      pg.on('response',lambda s,fails=fails: s.status>=400 and fails.append(str(s.status)+' '+s.url[:150]))
      sep='&' if '?' in r else '?'
      url=B+r+sep+'theme='+theme
      t0=time.time()
      try: st=pg.goto(url,wait_until='load',timeout=30000).status
      except Exception as e: st=str(e)[:80]
      pg.wait_for_timeout(1500)
      # scroll to trigger lazy content
      try:
        pg.evaluate('async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)}')
        pg.wait_for_timeout(800)
      except Exception: pass
      ms=int((time.time()-t0)*1000)
      try: c=pg.evaluate(CHECK)
      except Exception as e: c={'err':str(e)[:100],'hrefs':[]}
      for hh in c.get('hrefs',[]):
        if hh.startswith(B): links.add(hh.split('#')[0])
      c.pop('hrefs',None)
      ax=None
      if vid in('d1440','l1440','d390'):
        try:
          pg.add_script_tag(url=AXE)
          ax=pg.evaluate('''async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' | '+(n.failureSummary||'').split('\n').slice(1,2).join('')) }))}''')
        except Exception as e: ax=[{'id':'axe-fail','ex':[str(e)[:80]]}]
      name=re.sub(r'[^a-z0-9]+','_',r.strip('/') or 'home')
      try: pg.screenshot(path=f'{OUT}shots/{vid}_{name}.png',full_page=True)
      except Exception: pass
      rec={'view':vid,'route':r,'status':st,'ms':ms,'errs':errs[:12],'fails':fails[:12],**c,'axe':ax}
      open(OUT+'res_'+vid+'.jsonl','a').write(json.dumps(rec)+chr(10))
      print(vid,r,st,ms,len(errs),len(fails),'sw',c.get('sw'),c.get('vw'),flush=True)
      pg.close()
    ctx.close()
  # link check
  bad=[]
  for l in sorted(links):
    try:
      import urllib.request
      code=urllib.request.urlopen(l,timeout=10).status
    except Exception as e: code=str(e)[:60]
    if code!=200: bad.append((l,code))
  br.close()
json.dump({'links':len(links),'badlinks':bad},open(OUT+'links_'+sys.argv[1]+'.json','w'),indent=1)
print('links',len(links),'bad',bad)
