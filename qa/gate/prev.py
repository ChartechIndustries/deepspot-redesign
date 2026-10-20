from playwright.sync_api import sync_playwright
with sync_playwright() as p:
  br=p.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':900}); errs=[]
  pg.on('console',lambda m:m.type=='error' and errs.append(m.text)); pg.goto('http://localhost:8766/gate-preview.html'); pg.wait_for_timeout(800)
  pg.screenshot(path='gate-preview-1440d.png',full_page=True)
  pg.add_script_tag(path='C:/Users/CharD/Desktop/DeepSpot Globe/qa/audit-20261019/axe.min.js')
  print(pg.evaluate("async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v=>v.id)"),errs)
