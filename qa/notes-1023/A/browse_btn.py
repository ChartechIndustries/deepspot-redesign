from lib import *
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for dev in sys.argv[1].split(','):
      for th in sys.argv[2].split(','):
        ctx,pg=await newpage(b,dev,shim=False)
        await pg.goto(BASE+f'/?theme={th}',wait_until='load'); await pg.wait_for_timeout(3500)
        await pg.wait_for_selector('.fs-browse-link a',timeout=20000); a=await pg.query_selector('.fs-browse-link a'); await a.scroll_into_view_if_needed(); await pg.wait_for_timeout(900)
        r=await pg.evaluate("""()=>{const a=document.querySelector('.fs-browse-link a'),r=a.getBoundingClientRect(),cs=getComputedStyle(a);return [r.width|0,r.height|0,cs.fontSize,cs.paddingLeft,cs.backgroundColor,innerWidth,document.documentElement.scrollWidth>innerWidth,document.querySelector('.fs-heading').getAttribute('aria-label')]}""")
        print(dev,th,r,pg.errs[:2])
        await pg.screenshot(path=f'{OUT}/browse_{dev}_{th}.png')
        await ctx.close()
    await b.close()
asyncio.run(main())
