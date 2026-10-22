import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
async def spy(pg): return await pg.evaluate("[...document.querySelectorAll('.ob-tab')].map(t=>t.getAttribute('aria-current')).join(',')")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h in [(390,844),(360,740),(320,568),(1440,900)]:
      ctx,pg=await newpage(b,w,h); await to_b(pg)
      await slot(pg,'style'); await pg.wait_for_timeout(500)
      await pg.screenshot(path=f'{O}/{tag}-style-{w}-0top.png')
      info=await pg.evaluate("""()=>{const sh=document.querySelector('.ob-sheet'),b=document.querySelector('.ob-sh-b'),bar=document.querySelector('.ob-tabbar'),f=document.querySelector('.ob-sh-f');const r=e=>{const x=e.getBoundingClientRect();return [Math.round(x.top),Math.round(x.bottom)]};return {sheet:r(sh),bar:r(bar),foot:r(f),vh:innerHeight,sh:b.scrollHeight,ch:b.clientHeight,sw:document.documentElement.scrollWidth,iw:innerWidth}}""")
      print(w,info)
      # tap foils tab
      await pg.evaluate("document.querySelectorAll('.ob-tab')[1].click()"); await pg.wait_for_timeout(1100)
      print(w,'after tap foils',await spy(pg), await pg.evaluate("document.querySelector('.ob-sh-b').scrollTop"))
      await pg.screenshot(path=f'{O}/{tag}-style-{w}-1foils.png')
      await pg.evaluate("document.querySelectorAll('.ob-tab')[0].click()"); await pg.wait_for_timeout(1100)
      print(w,'after tap bg',await spy(pg))
      # scroll spy by scrolling
      await pg.evaluate("(()=>{const b=document.querySelector('.ob-sh-b');b.scrollTop=b.scrollHeight})()"); await pg.wait_for_timeout(400)
      print(w,'after scroll end',await spy(pg))
      await pg.evaluate("document.querySelector('.ob-sh-b').scrollTop=0"); await pg.wait_for_timeout(400)
      print(w,'after scroll top',await spy(pg))
      await pg.evaluate("document.querySelector('[name=cz-foil][value=holo]').click();document.querySelector('[name=cz-bg][value=aurora]').click()"); await pg.wait_for_timeout(500)
      await pg.screenshot(path=f'{O}/{tag}-style-{w}-2picked.png')
      await close_sheet(pg)
      print(w,'errs',pg.errs)
      await ctx.close()
    await b.close()
asyncio.run(main())
