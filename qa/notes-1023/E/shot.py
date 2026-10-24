import sys,re,psutil
import os
OUT=os.path.dirname(os.path.abspath(__file__))
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
tag=sys.argv[1]
ROUTES=sys.argv[2].split(',') if len(sys.argv)>2 else ['/','/browse/','/community/','/profile/?user=wayfarer','/leaderboard/','/competition/','/saved/','/story/?id=shark','/stories/']
def nm(r): return re.sub(r'[^a-z0-9]+','_',r.strip('/').lower()) or 'home'
with sync_playwright() as p:
  br=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for w,h in ((1440,900),(390,844)):
    for r in ROUTES:
      ctx=br.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800)
      pg=ctx.new_page(); errs=[]
      pg.on('console',lambda m: m.type=='error' and errs.append(m.text[:200]))
      pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)[:200]))
      pg.goto(B+r+('&' if '?' in r else '?')+'theme=dark',wait_until='load')
      pg.wait_for_timeout(4500)
      print(w,r,'->',pg.url.replace(B,''),'errs',errs)
      pg.screenshot(path=f'{OUT}/{tag}_{w}_{nm(r)}.png',full_page=(w==390 or r!='/'))
      ctx.close()
  br.close()
