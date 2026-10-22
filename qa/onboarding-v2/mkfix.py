import asyncio
from playwright.async_api import async_playwright
from h import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,390,844)
    await to_b(pg); await do_mole(pg,roll=True)
    print(os.path.getsize(FIX),pg.errs)
    await pg.screenshot(path=f'{OUT}/d390-12-B-mole.png')
    await b.close()
asyncio.run(main())
