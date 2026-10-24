from lib import *
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    ctx,pg=await newpage(b,'d1440')
    await pg.goto(BASE+'/?raf=timer&snap=1&theme=dark',wait_until='load'); await pg.wait_for_timeout(3500)
    print(await pg.evaluate("""()=>{const s=document.querySelector('.globe-stage').getBoundingClientRect();const c=document.querySelector('.pin-preview');return [s.top,s.height,c.style.left,c.style.top,c.offsetHeight,getComputedStyle(c).top]}"""))
    await b.close()
asyncio.run(main())
