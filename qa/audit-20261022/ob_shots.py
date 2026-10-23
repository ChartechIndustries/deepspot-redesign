import sys,os,asyncio
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','onboarding-v2.2'))
from h import *
from playwright.async_api import async_playwright
O=os.path.join(os.path.dirname(os.path.abspath(__file__)),'shots')
async def run(b,w,hh,theme):
  ctx,pg=await newpage(b,w,hh,theme)
  t=f'{O}/ob_{theme[0]}{w}'
  await pg.screenshot(path=t+'_1-account.png')
  await open_email(pg); await pg.screenshot(path=t+'_2-email.png')
  await to_b(pg); await pg.screenshot(path=t+'_3-card-empty.png')
  await slot(pg,'name'); await pg.screenshot(path=t+'_4-sheet-name.png'); await pg.fill('#ob-name','Flow Tester'); await pg.fill('#ob-user','flow.tester'); await close_sheet(pg)
  await slot(pg,'arch'); await pg.screenshot(path=t+'_5-sheet-arch.png'); await close_sheet(pg)
  await do_arch(pg); await do_mole(pg); await do_bio(pg); await do_mark(pg)
  await slot(pg,'style'); await pg.screenshot(path=t+'_6-sheet-style.png'); await close_sheet(pg)
  await pg.screenshot(path=t+'_7-card-filled.png')
  await js_click(pg,'#ob-fin')
  await pg.wait_for_timeout(1400); await pg.screenshot(path=t+'_8-issued.png')
  await pg.wait_for_url('**/profile/**',timeout=15000); await pg.wait_for_timeout(2500); await pg.screenshot(path=t+'_9-profile.png')
  print(w,theme,'errs',pg.errs[:3]); await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for w,hh,th in [(390,844,'dark'),(1440,900,'dark'),(390,844,'light')]:
      try: await run(b,w,hh,th)
      except Exception as e: print('ERR',w,th,str(e)[:300])
    await b.close()
asyncio.run(main())
