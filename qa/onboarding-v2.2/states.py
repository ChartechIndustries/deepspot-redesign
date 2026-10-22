"""Screens of every state for one viewport. usage: python states.py 390 844 dark on [tag-prefix]"""
import asyncio,sys,json
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); theme=sys.argv[3] if len(sys.argv)>3 else 'dark'; color=sys.argv[4] if len(sys.argv)>4 else 'on'
  pre=sys.argv[5] if len(sys.argv)>5 else 'r'
  tag=f'{pre}-{theme[0]}{w}'+('' if color=='on' else 'off')
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx,pg=await newpage(b,w,h,theme,color)
    async def shot(n):
      await pg.evaluate("document.activeElement&&document.activeElement.blur&&document.activeElement.blur()")
      await pg.wait_for_timeout(350); await pg.screenshot(path=f'{OUT}/{tag}-{n}.png')
    await shot('01-A')
    await pg.evaluate("document.querySelector('#ob-form .ob-go').click()")
    await pg.wait_for_timeout(300); await shot('01b-A-errors')
    await open_email(pg); await pg.fill('#ob-pw',PW); await js_click(pg,'#ob-terms'); await shot('01c-A-filled')
    await js_click(pg,'#ob-form .ob-go')
    await pg.wait_for_selector('.ob-stage',state='visible',timeout=5000)
    for i,t in enumerate([250,500,450,300]):
      await pg.wait_for_timeout(t); await pg.screenshot(path=f'{OUT}/{tag}-02-issue{i}.png')
    await pg.wait_for_function("()=>!document.querySelector('.ob-b').classList.contains('is-issuing')",timeout=8000)
    await shot('03-B-empty')
    print('B',await noscroll(pg))
    for sid,name in [('name','04-sheet-name'),('arch','05-sheet-arch'),('mark','06-sheet-mark'),('style','07-sheet-style'),('bio','08-sheet-bio')]:
      await slot(pg,sid); await shot(name); await close_sheet(pg,'x')
    # nudge
    await js_click(pg,'#ob-fin'); await pg.wait_for_timeout(250); await shot('09-nudge')
    await do_mole(pg); await shot('10-B-mole')
    await do_name(pg); await shot('11-B-name')
    await do_arch(pg); await shot('12-B-arch')
    await do_mark(pg); await do_style(pg); await shot('13-B-mark-style')
    await do_bio(pg); await pg.wait_for_timeout(600); await shot('14-B-filled')
    print('ready',await pg.evaluate("document.querySelector('#ob-fin').getAttribute('aria-disabled')"),await pg.inner_text('#ob-chip'))
    print('noscroll filled',await noscroll(pg))
    await js_click(pg,'#ob-fin')
    for i,t in enumerate([500,500,500,400]):
      await pg.wait_for_timeout(t); await pg.screenshot(path=f'{OUT}/{tag}-15-finish{i}.png')
    print(pg.errs)
    await b.close()
asyncio.run(main())
