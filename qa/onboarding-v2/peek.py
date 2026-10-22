import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2])
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,w,h)
    await pg.screenshot(path=f'peekA-{w}.png'); print('A',await noscroll(pg),pg.errs)
    await to_b(pg); await pg.screenshot(path=f'peekB-{w}.png'); print('B',await noscroll(pg),pg.errs)
    await b.close()
asyncio.run(main())
