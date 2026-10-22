"""Filled states: front filled, back filled, nudge, finish frames. usage: python filled.py 390 844 dark on"""
import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); theme=sys.argv[3] if len(sys.argv)>3 else 'dark'; color=sys.argv[4] if len(sys.argv)>4 else 'on'
  tag=f'{theme[0]}{w}'+('' if color=='on' else 'off')
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,w,h,theme,color)
    async def shot(n):
      await pg.wait_for_timeout(400); await pg.screenshot(path=f'{OUT}/{tag}-{n}.png')
    await to_b(pg)
    # nudge: finish tapped while empty
    await js_click(pg,'#ob-fin'); await pg.wait_for_timeout(250); await shot('13-nudge')
    await do_mole(pg); await shot('14-B-mole')
    await do_name(pg); await shot('15-B-name')
    await do_arch(pg); await shot('16-B-arch')
    await do_mark(pg); await do_style(pg)
    await shot('17-B-front-filled')
    await do_bio(pg); await do_places(pg); await flip_to(pg,True); await shot('18-B-back-filled')
    print('ready',await pg.evaluate("document.querySelector('#ob-fin').getAttribute('aria-disabled')"),await pg.inner_text('#ob-chip'))
    await js_click(pg,'#ob-fin')
    for i,t in enumerate([500,500,500,400]):
      await pg.wait_for_timeout(t); await pg.screenshot(path=f'{OUT}/{tag}-19-finish{i}.png')
    print(pg.errs,await noscroll(pg))
    await b.close()
asyncio.run(main())
