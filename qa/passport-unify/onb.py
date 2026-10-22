import sys,os
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
OUT2=os.path.dirname(os.path.abspath(__file__))
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); tag=sys.argv[3]
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx,pg=await newpage(b,w,h,'dark')
    await to_b(pg)
    await pg.screenshot(path=f'{OUT2}/{tag}-onb-{w}-1-empty.png')
    await do_mole(pg); await do_name(pg); await do_arch(pg,'urbex-rat')
    await pg.wait_for_timeout(600); await pg.screenshot(path=f'{OUT2}/{tag}-onb-{w}-2-some.png')
    await do_bio(pg); await do_mark(pg); await do_style(pg)
    await pg.wait_for_timeout(700); await pg.screenshot(path=f'{OUT2}/{tag}-onb-{w}-3-filled.png')
    await js_click(pg,'#ob-fin')
    await pg.wait_for_timeout(1400); await pg.screenshot(path=f'{OUT2}/{tag}-onb-{w}-4-issued.png')
    await pg.wait_for_timeout(4500); await pg.screenshot(path=f'{OUT2}/{tag}-onb-{w}-5-after.png')
    print(pg.url,pg.errs[:3])
    await b.close()
asyncio.run(main())
