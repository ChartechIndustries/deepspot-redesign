import sys,os
sys.path.insert(0,'../onboarding-v2.2'); import h
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
with sync_playwright() as p:
  br=p.chromium.launch(); ctx=br.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page()
  pg.goto(B+'/faq/'); pg.evaluate("localStorage.setItem('deepspot-theme','light')")
  for r in ['/','/browse/','/profile/?user=wayfarer','/welcome/','/community/','/map/','/account/']:
    seen=[]
    pg.goto(B+r,wait_until='commit')
    for i in range(12):
      try: seen.append(pg.evaluate("document.documentElement.dataset.theme||'-'"))
      except Exception: seen.append('x')
      pg.wait_for_timeout(150)
    pg.wait_for_timeout(1500)
    print(r,'first frames:',''.join(s[0] for s in seen),'final:',pg.evaluate("document.documentElement.dataset.theme"),pg.url.replace(B,''))
  br.close()
