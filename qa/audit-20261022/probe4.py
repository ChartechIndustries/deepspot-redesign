import sys; sys.path.insert(0,'../onboarding-v2.2'); import h
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
with sync_playwright() as p:
  br=p.chromium.launch(); ctx=br.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); pg=ctx.new_page()
  pg.goto(B+'/community/?theme=light'); pg.wait_for_timeout(3000)
  pg.evaluate("document.querySelector('#cv-spots,.cv-spots,[class*=cs-grid]')?.scrollIntoView()")
  el=pg.locator('text=aquarium where every').first; el.scroll_into_view_if_needed(); pg.wait_for_timeout(3000)
  print(pg.evaluate("""()=>{const c=[...document.querySelectorAll('img')].filter(i=>/aquarium|kesennuma/i.test(i.alt+i.src)).map(i=>[i.currentSrc.slice(-50),i.complete,i.naturalWidth,getComputedStyle(i).opacity,getComputedStyle(i).display,i.loading]);return c}"""))
  pg.screenshot(path='shots/probe4_comm_light_390.png')
  br.close()
