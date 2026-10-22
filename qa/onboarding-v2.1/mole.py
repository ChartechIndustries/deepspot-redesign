import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2])
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,w,h,'dark')
    await to_b(pg)
    await pg.evaluate("document.querySelector('.ob-b [data-slot=photo]').click()")
    seen=set(); skipshot=False
    for _ in range(900):
      ph=await pg.evaluate("document.querySelector('.mr')?.dataset.phase||(document.querySelector('.mrl')&&!document.querySelector('.mrl').hidden?'loader':'')")
      if ph and ph not in seen:
        seen.add(ph); await pg.screenshot(path=f'{OUT}/mole-{w}-{len(seen)}-{ph}.png'); print(ph)
        if ph=='charge':
          await pg.wait_for_timeout(400); await pg.screenshot(path=f'{OUT}/mole-{w}-{len(seen)}b-charge.png')
          print('skip box',await pg.evaluate("(()=>{const r=document.querySelector('.mr-skip').getBoundingClientRect();return [Math.round(r.x+r.width/2),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})()"))
      if ph=='reveal': 
        await pg.wait_for_timeout(1800); await pg.screenshot(path=f'{OUT}/mole-{w}-9-reveal-late.png'); break
      await pg.wait_for_timeout(120)
    # second roll: skip test
    await js_click(pg,'.mr [data-act=again]'); 
    await pg.wait_for_function("()=>['intro','charge'].includes(document.querySelector('.mr')?.dataset.phase)",timeout=60000)
    await pg.wait_for_timeout(500)
    await js_click(pg,'.mr-skip'); await pg.wait_for_timeout(1500)
    print('after skip phase',await pg.evaluate("document.querySelector('.mr').dataset.phase"),'keep enabled',await pg.evaluate("!document.querySelector('[data-act=keep]').disabled"))
    await pg.screenshot(path=f'{OUT}/mole-{w}-skip-result.png')
    print(pg.errs)
    await b.close()
asyncio.run(main())
