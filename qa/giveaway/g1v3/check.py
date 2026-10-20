from playwright.sync_api import sync_playwright
B='http://localhost:8766'; JS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>v.id+':'+v.nodes.length+' '+v.nodes[0].target.join(' '))}"""
with sync_playwright() as p:
  br=p.chromium.launch(); E=[]
  for w,th in [(1440,'dark'),(1440,'light'),(390,'dark'),(320,'dark')]:
    pg=br.new_page(viewport={'width':w,'height':900}); pg.on('pageerror',lambda e:E.append(str(e)[:120])); pg.on('console',lambda m:m.type=='error' and E.append(m.text[:120])); pg.on('requestfailed',lambda r:E.append('RF '+r.url))
    pg.goto(f'{B}/community/?theme={th}&race=final'); pg.wait_for_timeout(2500)
    ov=pg.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth')
    pg.add_script_tag(path='qa/audit-20261019/axe.min.js'); ax=pg.evaluate(JS)
    rm=pg.locator('.gv [data-more]').count(); txt=pg.inner_text('.gv-hero1') if pg.locator('.gv-hero1').count() else ''
    print(w,th,'overflow' if ov else 'no-overflow','axe',ax,'read-more buttons',rm,'flag',pg.locator('.gv-flag1:visible').count(),'tape',pg.locator('.gv-tape:visible').count())
    pg.close()
  pg=br.new_page(viewport={'width':1440,'height':900}); pg.goto(B+'/community/'); pg.wait_for_timeout(2000)
  pg.click('[data-jump=cv-sp]'); pg.wait_for_timeout(800); print('jump: url',pg.url,'y=',pg.evaluate("Math.round(document.getElementById('cv-sp').getBoundingClientRect().top)"))
  b=pg.locator('.cv-spots .cv-vote button').first; b.click(); pg.wait_for_timeout(300); pg.reload(); pg.wait_for_timeout(1500)
  print('spot vote persists:',pg.locator('.cv-spots .cv-vote[data-v]:not([data-v=""])').count()>0)
  pg.locator('[data-more]').first.click(); pg.wait_for_timeout(400); print('dialog open:',pg.evaluate("!!document.querySelector('dialog[open]')"))
  print('hero text:',pg.inner_text('.gv-hero1').replace('\n',' | ')[:200])
  print('errors',E); br.close()
