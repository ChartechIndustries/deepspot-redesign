import sys,os,psutil
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.sync_api import sync_playwright
OUT=os.path.dirname(os.path.abspath(__file__)); tag=sys.argv[1]
with sync_playwright() as p:
  br=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for w,h in ((1440,900),(390,844)):
    ctx=br.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page()
    pg.goto('http://localhost:8766/?theme=dark'); pg.wait_for_timeout(5000)
    e=pg.locator('deepspot-editorial'); e.scroll_into_view_if_needed(); pg.wait_for_timeout(1500)
    e.screenshot(path=f'{OUT}/{tag}_{w}_editorial.png'); print(w,e.bounding_box())
    ctx.close()
  br.close()
