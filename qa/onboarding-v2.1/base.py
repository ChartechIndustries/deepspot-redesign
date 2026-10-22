import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); tag=sys.argv[3]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx,pg=await newpage(b,w,h,'dark')
    await to_b(pg); await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{OUT}/{tag}.png')
    await b.close()
asyncio.run(main())
