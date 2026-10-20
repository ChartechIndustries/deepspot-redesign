from playwright.sync_api import sync_playwright
import glob,os
with sync_playwright() as p:
  br=p.chromium.launch(); ctx=br.new_context(viewport={'width':1440,'height':900},record_video_dir='.',record_video_size={'width':1440,'height':900})
  pg=ctx.new_page(); E=[]; pg.on('pageerror',lambda e:E.append(str(e)))
  pg.goto('http://localhost:8766/community/?theme=dark'); pg.wait_for_selector('.gv-stage',timeout=30000)
  pg.evaluate("document.querySelector('.gv-stage').scrollIntoView({block:'start'})"); pg.wait_for_timeout(3500)
  pg.click('.gv [data-replay]'); pg.wait_for_timeout(3200)
  ctx.close(); br.close(); print('errors',E)
