import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx,pg=await newpage(b,1440,900,'dark')
    await to_b(pg)
    print(await pg.evaluate("""()=>{const r=e=>{const x=document.querySelector(e).getBoundingClientRect();return [Math.round(x.width),Math.round(x.height)]};return {band:document.querySelector('.ob-band').offsetHeight,bio:document.querySelector('.ob-s-bio').offsetHeight,card:document.querySelector('.ob-front').offsetHeight,cardw:r('.ed-cardw'),sticker:getComputedStyle(document.querySelector('.ob-s-style')).boxShadow}}"""))
    await b.close()
asyncio.run(main())
