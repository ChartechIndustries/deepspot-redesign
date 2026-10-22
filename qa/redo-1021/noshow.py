import asyncio, psutil
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for u,w in [('wayfarer',1440),('preview',1440),('wayfarer',390)]:
      pg=await b.new_page(viewport={"width":w,"height":900}); errs=[]
      pg.on('pageerror',lambda e,errs=errs: errs.append(str(e)[:100]))
      await pg.goto(f"http://localhost:8766/profile/?user={u}",wait_until="load"); await pg.wait_for_timeout(2500)
      tabs=await pg.evaluate("[...document.querySelectorAll('.pp-vtab')].map(t=>t.textContent.trim()+(t.getAttribute('aria-selected')==='true'?'*':''))")
      vis=await pg.evaluate("[...document.querySelectorAll('.pp-vpanel')].filter(p=>!p.hidden).map(p=>p.id)")
      print(u,w,tabs,vis,errs)
      await pg.screenshot(path=f'noshow-{u}-{w}.png'); await pg.close()
    await b.close()
asyncio.run(main())
