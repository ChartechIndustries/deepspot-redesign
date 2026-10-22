import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); ids=sys.argv[3:]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx,pg=await newpage(b,w,h,'dark')
    await to_b(pg)
    for i in ids:
      await slot(pg,i); await pg.screenshot(path=f'{OUT}/_o-{w}-{i}.png'); await close_sheet(pg,'x')
    await b.close()
asyncio.run(main())
