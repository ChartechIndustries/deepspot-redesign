"""Screens of every state for one viewport. usage: python states.py 390 844 dark on"""
import asyncio,sys,json
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); theme=sys.argv[3] if len(sys.argv)>3 else 'dark'; color=sys.argv[4] if len(sys.argv)>4 else 'on'
  tag=f'{theme[0]}{w}'+('' if color=='on' else 'off')
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,w,h,theme,color)
    async def shot(n):
      await pg.wait_for_timeout(350); await pg.screenshot(path=f'{OUT}/{tag}-{n}.png')
    await shot('01-A')
    await pg.evaluate("document.querySelector('#ob-form .ob-go').click()")   # empty submit -> inline errors
    await pg.wait_for_timeout(300); await shot('01b-A-errors')
    await pg.fill('#ob-pw',PW); await js_click(pg,'#ob-terms'); await shot('01c-A-filled')
    await js_click(pg,'#ob-form .ob-go')
    await pg.wait_for_selector('.ob-stage',state='visible',timeout=5000)
    # issue frames
    for i,t in enumerate([250,500,450,300]):
      await pg.wait_for_timeout(t); await pg.screenshot(path=f'{OUT}/{tag}-02-issue{i}.png')
    await pg.wait_for_function("()=>!document.querySelector('.ob-b').classList.contains('is-issuing')",timeout=8000)
    await shot('03-B-empty')
    print('B',await noscroll(pg))
    for sid,name in [('name','04-sheet-name'),('arch','05-sheet-arch'),('mark','06-sheet-mark'),('style','07-sheet-style')]:
      await slot(pg,sid); await shot(name); await close_sheet(pg,'x')
    await js_click(pg,'#ob-flip'); await pg.wait_for_timeout(700); await shot('08-B-back-empty')
    for sid,name in [('bio','09-sheet-bio'),('places','10-sheet-places')]:
      await slot(pg,sid); await shot(name); await close_sheet(pg,'x')
    print(pg.errs)
    await b.close()
asyncio.run(main())
