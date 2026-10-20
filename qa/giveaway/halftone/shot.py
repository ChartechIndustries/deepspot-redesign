from playwright.sync_api import sync_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
  br=p.chromium.launch(args=A); E=[]
  for th in ['dark','light']:
    pg=br.new_page(viewport={'width':1440,'height':900}); pg.on('pageerror',lambda e:E.append(str(e)[:150])); pg.on('console',lambda m:m.type in('error','warning') and 'GL Driver' not in m.text and E.append(m.text[:150]))
    pg.goto(f'http://localhost:8766/community/?theme={th}&race=final'); pg.wait_for_selector('.gv-stage .hf-canvas',timeout=30000)
    pg.evaluate("document.querySelector('.gv-stage').scrollIntoView({block:'start'})"); pg.wait_for_timeout(1500)
    pg.locator('.gv-stage').screenshot(path=f'halftone/{th}-a.png'); pg.wait_for_timeout(2000); pg.locator('.gv-stage').screenshot(path=f'halftone/{th}-b.png')
    # boosted view to judge the pattern itself
    pg.evaluate("document.querySelector('.hf-canvas').style.opacity='1'"); pg.wait_for_timeout(200); pg.locator('.gv-stage').screenshot(path=f'halftone/{th}-full.png')
    print(th, pg.evaluate("[document.querySelector('.hf-canvas').width,document.querySelector('.hf-canvas').height]"))
    pg.close()
  print('errors',E); br.close()
