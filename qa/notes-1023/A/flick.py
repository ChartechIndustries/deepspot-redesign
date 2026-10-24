from lib import *
from swipe import swipe
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    ctx,pg=await newpage(b,'p390',shim=False)
    pg.on('console',lambda m: print('LOG',m.text))
    await pg.goto(BASE+'/?theme=dark',wait_until='load'); await pg.wait_for_timeout(3500)
    n=await pg.query_selector('deepspot-news'); await n.scroll_into_view_if_needed(); await pg.wait_for_timeout(800)
    await pg.evaluate("document.querySelector('deepspot-news').paused=true;clearTimeout(document.querySelector('deepspot-news').timer)")
    await pg.evaluate("""const w=document.querySelector('.wn-window');['pointerdown','pointermove','pointerup','pointercancel'].forEach(t=>w.addEventListener(t,e=>console.log(t,e.pointerType,Math.round(e.timeStamp),Math.round(e.clientX)),true))""")
    bb=await (await pg.query_selector('.wn-window')).bounding_box()
    y=bb['y']+bb['height']*.4; cx=bb['x']+bb['width']/2
    await swipe(pg,cx+20,y,cx-30,y,steps=2,delay=5); await pg.wait_for_timeout(900)
    print(await pg.evaluate("document.querySelector('deepspot-news').active"))
    await b.close()
asyncio.run(main())
