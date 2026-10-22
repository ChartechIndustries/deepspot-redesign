import sys,asyncio,json,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from rh import *
from playwright.async_api import async_playwright
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
cfg=[(390,844,'dark'),(390,844,'light'),(320,568,'dark'),(1440,900,'dark'),(1440,900,'light')]
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for w,h,th in cfg:
      ctx,pg=await page(b,w,h,th)
      await pg.goto(BASE+'/welcome/?reset=1&theme='+th,wait_until='load')
      await pg.goto(BASE+'/welcome/?theme='+th,wait_until='load'); await pg.wait_for_selector('#ob-form',timeout=20000); await pg.wait_for_timeout(700)
      await pg.screenshot(path=f'{OUT}/acct-{tag}-{w}-{th}-0choose.png')
      n0=await pg.evaluate("({sh:document.documentElement.scrollHeight,ih:innerHeight,sw:document.documentElement.scrollWidth,bh:document.getElementById('ob-a').scrollHeight,ah:document.getElementById('ob-a').clientHeight})")
      await pg.evaluate("document.querySelector('.ob-email-btn').click()"); await pg.wait_for_timeout(900)
      await pg.screenshot(path=f'{OUT}/acct-{tag}-{w}-{th}-1email.png')
      n1=await pg.evaluate("({sh:document.documentElement.scrollHeight,ih:innerHeight,sw:document.documentElement.scrollWidth,bh:document.getElementById('ob-a').scrollHeight,ah:document.getElementById('ob-a').clientHeight,focus:document.activeElement.id})")
      print(w,th,n0,n1,pg.errs[:3],flush=True)
      await ctx.close()
    await b.close()
asyncio.run(main())
