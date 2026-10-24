from lib import *
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    ctx,pg=await newpage(b,'p390',shim=False)
    await pg.goto(BASE+'/?theme=dark',wait_until='load'); await pg.wait_for_timeout(3500)
    n=await pg.query_selector('deepspot-news'); await n.scroll_into_view_if_needed(); await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('deepspot-news').paused=true;clearTimeout(document.querySelector('deepspot-news').timer)")
    bb=await (await pg.query_selector('.wn-window')).bounding_box()
    y=bb['y']+bb['height']*.4; cx=bb['x']+bb['width']/2
    cdp=await ctx.new_cdp_session(pg)
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':cx-80,'y':y}]})
    for i in range(1,7):
      await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':cx-80+i*15,'y':y}]})
    await pg.screenshot(path=f'{OUT}/swipe_p390_dragright.png')
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})  # 90px of 358 = 25% -> commits
    await pg.wait_for_timeout(900)
    print('active',await pg.evaluate("document.querySelector('deepspot-news').active"))
    # small drag (< 20%) -> springs back
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':cx,'y':y}]})
    for i in range(1,5):
      await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':cx-i*10,'y':y}]})
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    await pg.wait_for_timeout(900)
    print('after small drag active',await pg.evaluate("document.querySelector('deepspot-news').active"),await pg.evaluate("[...document.querySelectorAll('.wn-panel')].map(p=>p.style.transform+'|'+p.style.zIndex)"))
    print(pg.errs)
    await b.close()
asyncio.run(main())
