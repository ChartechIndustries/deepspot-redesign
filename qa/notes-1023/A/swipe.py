from lib import *
# touch swipe test via CDP touch events
async def swipe(pg,x0,y0,x1,y1,steps=8,delay=16):
  cdp=await pg.context.new_cdp_session(pg)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y0}]})
  for i in range(1,steps+1):
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0+(x1-x0)*i/steps,'y':y0+(y1-y0)*i/steps}]})
    await pg.wait_for_timeout(delay)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for dev in sys.argv[1:]:
      ctx,pg=await newpage(b,dev,shim=False)
      await pg.goto(BASE+'/?theme=dark',wait_until='load'); await pg.wait_for_timeout(3500)
      n=await pg.query_selector('deepspot-news'); await n.scroll_into_view_if_needed(); await pg.wait_for_timeout(800)
      await pg.evaluate("document.querySelector('deepspot-news').paused=true;clearTimeout(document.querySelector('deepspot-news').timer)")
      bb=await (await pg.query_selector('.wn-window')).bounding_box()
      print(dev,'window',bb)
      act=lambda: pg.evaluate("document.querySelector('deepspot-news').active")
      y=bb['y']+bb['height']*.4; cx=bb['x']+bb['width']/2
      print('start',await act(), 'sy',await pg.evaluate('scrollY'))
      # drag left in two phases to see 1:1 follow
      cdp=await ctx.new_cdp_session(pg)
      await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':cx+80,'y':y}]})
      for i in range(1,8):
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':cx+80-i*20,'y':y}]}); await pg.wait_for_timeout(20)
      t=await pg.evaluate("[...document.querySelectorAll('.wn-panel')].map(p=>p.style.transform)")
      print('mid-drag',t)
      await pg.screenshot(path=f'{OUT}/swipe_{dev}_middrag.png')
      await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
      await pg.wait_for_timeout(900)
      print('after left (small, 140px)',await act())
      await swipe(pg,cx+100,y,cx-100,y); await pg.wait_for_timeout(900)
      print('after left big',await act())
      await pg.screenshot(path=f'{OUT}/swipe_{dev}_after_next.png')
      await swipe(pg,cx-100,y,cx+100,y); await pg.wait_for_timeout(900)
      print('after right big',await act())
      await pg.screenshot(path=f'{OUT}/swipe_{dev}_after_prev.png')
      await swipe(pg,cx+20,y,cx-30,y,steps=2,delay=5); await pg.wait_for_timeout(900)
      print('flick (50px fast)',await act())
      # vertical scroll over banner
      s0=await pg.evaluate('scrollY'); await swipe(pg,cx,y+60,cx,y-160); await pg.wait_for_timeout(500)
      print('vertical: scrollY',s0,'->',await pg.evaluate('scrollY'),'active',await act())
      print('errs',pg.errs[:3])
      await ctx.close()
    await b.close()
if __name__=='__main__': asyncio.run(main())
