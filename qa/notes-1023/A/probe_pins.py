from lib import *
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for dev in sys.argv[1:]:
      ctx,pg=await newpage(b,dev)
      await pg.goto(BASE+'/?raf=timer&snap=1&theme=dark',wait_until='load'); await pg.wait_for_timeout(6000)
      r=await pg.evaluate("""()=>{const o=[];document.querySelectorAll('.map-pin:not(.decorative-pin)').forEach(e=>{if(getComputedStyle(e).visibility!='visible')return;const b=getComputedStyle(e,'::before');o.push([e.getBoundingClientRect().x|0,b.top,b.left,b.width,b.height,b.backgroundColor])});return o}""")
      print(dev,r)
      st=await pg.query_selector('.globe-stage'); 
      await pg.screenshot(path=f'{OUT}/pins_{dev}_before.png',clip=await st.bounding_box())
      await ctx.close()
    await b.close()
asyncio.run(main())
