from lib import *
# usage: shot_home.py tag dev[,dev..] [theme] [wait]
tag=sys.argv[1]; devs=sys.argv[2].split(','); themes=(sys.argv[3] if len(sys.argv)>3 else 'dark').split(',')
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for dev in devs:
      for th in themes:
        ctx,pg=await newpage(b,dev)
        await pg.goto(BASE+f'/?raf=timer&snap=1&theme={th}',wait_until='load'); await pg.wait_for_timeout(3200)
        st=await pg.query_selector('.globe-stage'); await st.scroll_into_view_if_needed(); await pg.wait_for_timeout(1300)
        bb=await st.bounding_box()
        sc=await pg.evaluate('scrollY')
        await pg.screenshot(path=f'{OUT}/{tag}_{dev}_{th}_globe.png',full_page=False)
        ov=await pg.evaluate('document.documentElement.scrollWidth>innerWidth')
        card=await pg.evaluate("""()=>{const c=document.querySelector('.pin-preview');if(!c)return null;const r=c.getBoundingClientRect();return [r.left|0,r.right|0,innerWidth,r.top|0,r.bottom|0,getComputedStyle(c).opacity]}""")
        pin=await pg.evaluate("""()=>{const p=[...document.querySelectorAll('.map-pin:not(.decorative-pin)')].filter(e=>getComputedStyle(e).visibility=='visible'&&e.classList.contains('is-active'))[0];if(!p)return null;const r=p.getBoundingClientRect();return [(r.left+r.width/2)|0,r.bottom|0]}""")
        print(dev,th,'overflow',ov,'card',card,'activepin',pin,'errs',pg.errs[:3])
        await ctx.close()
    await b.close()
asyncio.run(main())
