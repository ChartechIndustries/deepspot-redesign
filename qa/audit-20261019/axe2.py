from playwright.sync_api import sync_playwright
JS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>v.id+':'+v.nodes.length)}"""
with sync_playwright() as p:
  br=p.chromium.launch()
  for vw,th in [(390,'dark'),(390,'light'),(1440,'dark')]:
    pg=br.new_page(viewport={'width':vw,'height':844})
    for r in ['/leaderboard/','/profile/?user=preview']:
      pg.goto('http://localhost:8766'+r+('&' if '?' in r else '?')+'theme='+th); pg.wait_for_timeout(1500); pg.add_script_tag(path='axe.min.js'); print(vw,th,r,pg.evaluate(JS))
    pg.close()
  br.close()
