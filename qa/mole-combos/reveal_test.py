from playwright.sync_api import sync_playwright
B='http://localhost:8766'
with sync_playwright() as p:
  br=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  pg=br.new_page(viewport={'width':1280,'height':800}); errs=[]
  pg.on('pageerror',lambda e: errs.append(str(e)[:200])); pg.on('console',lambda m: m.type=='error' and errs.append(m.text[:200]))
  pg.goto(B+'/account/'); pg.wait_for_timeout(1500)
  # module-level check with the real scene + rules
  r=pg.evaluate("""async()=>{const m=await import('/site/mole/mole-reveal.mjs');const R=await import('/site/mole/mole-rules.mjs?v=1');const s=await fetch('/site/mole/assets/scene.json').then(r=>r.json());let bad=0;for(let i=0;i<5000;i++){if(R.violations(s.rules,m.rollTraits(s)).length)bad++}return {bad,hasRules:!!s.rules}}""")
  print('rollTraits x5000:',r)
  pg.locator('button:has-text("mole")').first.click(); pg.wait_for_timeout(9000)
  for i in range(3):
    t=pg.locator('.mr-traits').inner_text(); print('roll',i,':',t)
    pg.locator('button:has-text("roll again")').click(); pg.wait_for_timeout(8000)
  pg.screenshot(path='reveal_after.jpg',quality=75)
  print('errors:',errs)
  br.close()
