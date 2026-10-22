import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,390,844)
    await to_b(pg)
    print(await pg.evaluate("""()=>{const e=document.querySelector('.pp-molebox');return [e.innerHTML.slice(0,600), getComputedStyle(e.querySelector('.pp-mole')).color, getComputedStyle(e.querySelector('.pp-mole')).opacity]}"""))
    await b.close()
asyncio.run(main())
