from playwright.async_api import async_playwright
import sys,asyncio,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','round-1022'))
from rh import *
async def main():
  async with async_playwright() as p:
    b=await launch(p); ctx,pg=await page(b,1440,900)
    await pg.goto(f'{BASE}/community/?dc=3#dc',wait_until='load'); await pg.wait_for_timeout(4000)
    print(await pg.evaluate("Math.round(document.getElementById('dc').getBoundingClientRect().top)"),pg.errs)
    await pg.goto(f'{BASE}/discord-variations.html',wait_until='load'); await pg.wait_for_timeout(1500)
    print(await pg.evaluate("[document.documentElement.scrollWidth,[...document.images].every(i=>i.complete&&i.naturalWidth>0)]"),pg.errs)
    await b.close()
asyncio.run(main())
