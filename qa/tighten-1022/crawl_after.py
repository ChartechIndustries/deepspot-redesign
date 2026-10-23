"""Audit 2026-10-22 crawl. usage: python crawl.py <view> [route-filter]
views: d390 d360 d1440 l1440 l390 d320 (d320 = overflow only, no shots)"""
import sys,os,json,re,time
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','onboarding-v2.2'))
import h  # sets below-normal priority
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
OUT=os.path.dirname(os.path.abspath(__file__))
ROUTES=['/','/browse/','/spot/?id=tochigi-underground-quarry','/map/','/tours/','/stories/','/story/?id=shark','/guides/',
'/guide/?id=tas-aizu-samurai-cultural-tour','/adventures/','/saved/','/plan-trip/','/contribute/','/account/','/inbox/',
'/invites/','/community/','/leaderboard/','/competition/','/forum/','/mission/','/faq/','/membership/','/app/','/roadmap/',
'/sponsored/','/privacy/','/terms/','/cookies/','/profile/?user=wayfarer','/profile/?user=preview','/welcome/','/nope-404/']
MAIN={'/','/community/','/profile/?user=preview','/profile/?user=wayfarer','/browse/','/map/','/tours/','/welcome/'}
GL={'/','/profile/?user=preview','/profile/?user=wayfarer'}
V={'d390':(390,844,'dark'),'d360':(360,740,'dark'),'d1440':(1440,900,'dark'),'l1440':(1440,900,'light'),'l390':(390,844,'light'),'d320':(320,640,'dark')}
vid=sys.argv[1]; flt=sys.argv[2] if len(sys.argv)>2 else ''
w,hh,theme=V[vid]
routes=[r for r in ROUTES if flt in r]
if vid in('l1440','l390'): routes=[r for r in routes if r in MAIN]
AXEP=os.path.join(OUT,'..','audit-20261019','axe.min.js')
CHECK=open(os.path.join(OUT,'check.js'),encoding='utf-8').read()
def name(r): return re.sub(r'[^a-z0-9]+','_',r.strip('/').lower()) or 'home'
res=[]
with sync_playwright() as p:
  for gl in (False,True):
    rs=[r for r in routes if (r in GL)==gl]
    if not rs: continue
    args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] if gl else []
    br=p.chromium.launch(headless=True,args=args)
    for r in rs:
      ctx=br.new_context(viewport={'width':w,'height':hh},device_scale_factor=1,has_touch=w<800,is_mobile=w<800)
      pg=ctx.new_page(); errs=[]; fails=[]; sizes=[]
      pg.on('console',lambda m: m.type in('error','warning') and errs.append(m.type[0]+': '+m.text[:220]))
      pg.on('pageerror',lambda e: errs.append('PAGEERROR: '+str(e)[:220]))
      pg.on('requestfailed',lambda q: fails.append('FAILED '+q.url.replace(B,'')[:150]+' '+(q.failure or '')))
      def onresp(s):
        if s.status>=400: fails.append(str(s.status)+' '+s.url.replace(B,'')[:150])
        try: sizes.append((int(s.headers.get('content-length') or 0),s.url.replace(B,'')[:90]))
        except Exception: pass
      pg.on('response',onresp)
      sep='&' if '?' in r else '?'
      u=B+r+sep+'theme='+theme+('&reset=1' if r=='/welcome/' else '')
      t0=time.time()
      try: st=pg.goto(u,wait_until='load',timeout=45000).status
      except Exception as e: st=str(e)[:80]
      pg.wait_for_timeout(2500 if r in GL else 1500)
      nm=f'{vid}_{name(r)}'
      if vid!='d320':
        try: pg.screenshot(path=f'{OUT}/after_shots/{nm}_top.png')
        except Exception: pass
      try:
        pg.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.7)){scrollTo(0,y);await new Promise(r=>setTimeout(r,150))}scrollTo(0,0)}')
        pg.wait_for_timeout(1500)
      except Exception: pass
      try: c=pg.evaluate(CHECK)
      except Exception as e: c={'err':str(e)[:150]}
      ax=None
      if vid in('d1440','d390','l1440'):
        try:
          pg.add_script_tag(path=AXEP)
          ax=pg.evaluate("""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,200))}))}""")
        except Exception as e: ax=[{'id':'axe-fail','ex':[str(e)[:100]]}]
      if vid!='d320':
        try: pg.screenshot(path=f'{OUT}/after_shots/{nm}_full.png',full_page=True)
        except Exception as e: errs.append('SHOTFAIL '+str(e)[:80])
      tot=sum(s for s,_ in sizes)
      rec={'view':vid,'route':r,'status':st,'ms':int((time.time()-t0)*1000),'errs':errs[:15],'fails':fails[:15],'mb':round(tot/1e6,2),'nreq':len(sizes),'top':sorted(sizes,reverse=True)[:4],**c,'axe':ax}
      res.append(rec)
      print(vid,r,st,'errs',len(errs),'fails',len(fails),'sw',c.get('sw'),c.get('vw'),'mb',rec['mb'],flush=True)
      ctx.close()
    br.close()
json.dump(res,open(f'{OUT}/res_{vid}{("_"+name(flt)) if flt else ""}.json','w'),indent=1)
