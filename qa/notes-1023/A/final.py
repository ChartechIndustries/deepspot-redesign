from lib import *
import functools; print=functools.partial(print,flush=True)
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    # 2.1/2.2 globe card + pin at every size, dark+light
    for dev in ['p390','p360','t820','t1180','t1024','d1440','d1024']:
      for th in ['dark','light']:
        ctx,pg=await newpage(b,dev)
        await pg.goto(BASE+f'/?raf=timer&snap=1&theme={th}',wait_until='load'); await pg.wait_for_timeout(2800)
        st=await pg.query_selector('.globe-stage'); await st.scroll_into_view_if_needed(); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'{OUT}/f_{dev}_{th}.png')
        info=await pg.evaluate("""()=>{const c=document.querySelector('.pin-preview'),s=document.querySelector('.globe-stage').getBoundingClientRect();const r=c.getBoundingClientRect();const pins=[...document.querySelectorAll('.map-pin.is-active')].map(e=>e.getBoundingClientRect());const p=pins[0];const ov=p&&!(p.right<r.left||p.left>r.right||p.bottom<r.top||p.top>r.bottom);const eb=document.querySelector('.explore-bar').getBoundingClientRect();return {card:[r.left|0,r.right|0,r.top|0,r.bottom|0],stage:[s.left|0,s.right|0,s.top|0,s.bottom|0],vw:innerWidth,hscroll:document.documentElement.scrollWidth>innerWidth,cardOnScreen:r.left>=0&&r.right<=innerWidth,pinUnderCard:!!ov,exploreOverlap:!(eb.bottom<r.top||eb.top>r.bottom||eb.right<r.left||eb.left>r.right),dots:[...document.querySelectorAll('.map-pin:not(.decorative-pin)')].filter(e=>getComputedStyle(e).visibility=='visible').map(e=>{const q=getComputedStyle(e,'::before');return q.width+'x'+q.height+' '+q.backgroundColor})}}""")
        print(dev,th,info,'errs',pg.errs[:2])
        await ctx.close()
    # reduced motion: explore link navigates at once, no drop class
    ctx,pg=await newpage(b,'d1440',reduced=True)
    await pg.goto(BASE+'/?raf=timer&snap=1',wait_until='load'); await pg.wait_for_timeout(2800)
    await pg.click('a.explore-bar'); await pg.wait_for_url('**/map/**',timeout=10000); print('reduced-motion explore ok',pg.url)
    await ctx.close()
    # explore at 1440 on another spot: click pin 8 (Teufelsberg) via the spot dots then explore
    ctx,pg=await newpage(b,'d1440')
    await pg.goto(BASE+'/?raf=timer&snap=1',wait_until='load'); await pg.wait_for_timeout(2800)
    await pg.evaluate("document.querySelectorAll('.spot-dots button')[8].click()"); await pg.wait_for_timeout(2500)
    print('href after dot 8',await pg.get_attribute('a.explore-bar','href'))
    await pg.click('a.explore-bar'); await pg.wait_for_url('**/map/**',timeout=10000); await pg.wait_for_timeout(4500)
    print('map popup',await pg.evaluate("document.querySelector('.leaflet-popup h3')?.textContent"))
    await pg.screenshot(path=f'{OUT}/f_map_d1440_teufelsberg.png')
    await ctx.close()
    # color-off browse button
    ctx,pg=await newpage(b,'d1440',shim=False)
    await pg.add_init_script("try{localStorage.setItem('deepspot-panel-colors','off')}catch(e){}")
    await pg.goto(BASE+'/?theme=dark',wait_until='load'); await pg.wait_for_selector('.fs-browse-link a',timeout=30000)
    a=await pg.query_selector('.fs-browse-link a'); await a.scroll_into_view_if_needed(); await pg.wait_for_timeout(600)
    print('color off btn',await pg.evaluate("(()=>{const r=document.querySelector('.fs-browse-link a').getBoundingClientRect();return [r.width|0,r.height|0]})()"))
    await pg.screenshot(path=f'{OUT}/f_browse_coloroff_d1440.png')
    await ctx.close()
    await b.close()
asyncio.run(main())
