import sys,asyncio,json
import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from rh import *
from playwright.async_api import async_playwright
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
cfg=[(1440,900,'dark'),(1440,900,'light'),(1920,1000,'dark'),(1920,1000,'light'),(390,844,'dark'),(390,844,'light')]
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for w,h,th in cfg:
      ctx,pg=await page(b,w,h,th)
      await pg.goto(f'{BASE}/community/?theme={th}',wait_until='load'); await pg.wait_for_selector('.dc',timeout=20000); await pg.wait_for_timeout(800)
      el=pg.locator('.dc'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(1800)
      await el.screenshot(path=f'{OUT}/dc-{tag}-{w}-{th}.png')
      sw=await pg.evaluate("document.documentElement.scrollWidth")
      ax=await axe(pg) if '--axe' in sys.argv else None
      print(w,th,'sw',sw,'iw',w,'errs',pg.errs[:3],'axe',ax,flush=True)
      await ctx.close()
    await b.close()
asyncio.run(main())
