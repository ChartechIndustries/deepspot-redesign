from lib import *
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for dev in sys.argv[1:]:
      ctx,pg=await newpage(b,dev)
      await pg.goto(BASE+'/?raf=timer&snap=1',wait_until='load'); await pg.wait_for_timeout(3200)
      txt=await pg.evaluate("document.querySelector('.explore-bar').outerHTML.slice(0,90)+' | '+document.querySelector('.explore-bar').tagName")
      print(dev,txt)
      eb=await pg.query_selector('a.explore-bar'); await eb.scroll_into_view_if_needed()
      href=await eb.get_attribute('href'); print('href',href)
      import time; t=time.time()
      await eb.click()
      await pg.wait_for_url('**/map/**',timeout=8000); print('nav ms',int((time.time()-t)*1000), pg.url)
      await pg.wait_for_timeout(4500)
      print('popup', await pg.evaluate("!!document.querySelector('.leaflet-popup')"), 'title', await pg.evaluate("document.querySelector('.leaflet-popup h3')?.textContent"))
      await pg.screenshot(path=f'{OUT}/map_{dev}.png')
      print('errs',[e for e in pg.errs if 'tile' not in e.lower()][:3])
      await ctx.close()
    await b.close()
asyncio.run(main())
