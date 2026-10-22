import sys,asyncio,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from rh import *
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await launch(p); ctx,pg=await page(b,1440,900,'dark')
    await pg.goto(BASE+'/community/',wait_until='load'); await pg.wait_for_selector('.dc-feed'); 
    await pg.wait_for_timeout(2500); await pg.evaluate("document.querySelector('.dc').scrollIntoView()"); await pg.wait_for_timeout(500)
    first=lambda: pg.evaluate("document.querySelector('.dc-msg b').textContent+document.querySelector('.dc-msg a').textContent.slice(0,20)")
    a=await first(); await pg.mouse.move(10,10); r=[]
    for i in range(5):
      await pg.wait_for_timeout(2500); r.append(await first())
    print('feed rotates',r)
    await pg.hover('.dc-feed'); a=await first(); await pg.wait_for_timeout(4800); print('pauses on hover',a==await first())
    await pg.mouse.move(10,10)
    await pg.evaluate("document.querySelector('[data-opt=\"1\"]').click()"); await pg.wait_for_timeout(400)
    print('vote',await pg.evaluate("[...document.querySelectorAll('[data-opt]')].map(x=>x.getAttribute('aria-pressed'))"),await pg.evaluate("localStorage.getItem('deepspot-community-poll-v1')"))
    print('count-up final',await pg.evaluate("[...document.querySelectorAll('[data-count]')].map(e=>e.textContent)"))
    print(pg.errs)
    await b.close()
asyncio.run(main())
