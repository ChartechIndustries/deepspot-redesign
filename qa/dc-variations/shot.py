from playwright.async_api import async_playwright
import sys,asyncio,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','round-1022'))
from rh import *
OUT=os.path.dirname(os.path.abspath(__file__))
# usage: shot.py tag variants(csv) cfgs(csv like 1440-dark,1440-light,390-dark) [color=on|off]
tag=sys.argv[1]; vs=sys.argv[2].split(','); cfgs=sys.argv[3].split(','); color=sys.argv[4] if len(sys.argv)>4 else 'on'
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for c in cfgs:
      w,th=c.split('-'); w=int(w); h=900 if w>800 else 844
      ctx,pg=await page(b,w,h,th,color)
      for v in vs:
        await pg.goto(f'{BASE}/community/?dc={v}&theme={th}',wait_until='load')
        await pg.wait_for_selector('.dc',timeout=25000); await pg.wait_for_timeout(600)
        el=pg.locator('.dc'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(2200)
        suffix='' if color=='on' else '-off'
        await el.screenshot(path=f'{OUT}/{tag}-dc{v}-{c}{suffix}.png')
        sw=await pg.evaluate("document.documentElement.scrollWidth")
        print(v,c,color,'sw',sw,'iw',w,'errs',pg.errs[:3],flush=True)
      await ctx.close()
    await b.close()

asyncio.run(main())
