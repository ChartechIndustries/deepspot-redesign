import asyncio, json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    for w in (768,1024,2560):
      pg=await b.new_page(viewport={"width":w,"height":900})
      await pg.goto("http://localhost:8766/community/?theme=dark",wait_until="load"); await pg.wait_for_timeout(2500)
      print(w,"sw",await pg.evaluate("document.documentElement.scrollWidth"))
      await pg.close()
    ctx=await b.new_context(viewport={"width":1440,"height":900}); pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto("http://localhost:8766/community/?theme=dark",wait_until="load"); await pg.wait_for_timeout(2000)
    await pg.locator('.pm').scroll_into_view_if_needed(); await pg.wait_for_timeout(500)
    await pg.click('[data-pm-next]'); await pg.wait_for_timeout(900)
    print("after next:",await pg.inner_text('[data-pm-open]'),await pg.inner_text('[data-pm-n]'))
    await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(300)
    print("after key:",await pg.inner_text('[data-pm-n]'))
    # click side card
    await pg.click('.pm-item[data-pm-i="5"] .pm-card',force=True) if False else None
    box=await pg.locator('.pm-item.is-front .pm-card').bounding_box()
    await pg.mouse.move(box['x']+box['width']*.8,box['y']+box['height']*.3); await pg.wait_for_timeout(500)
    await pg.screenshot(path="C:/Users/CharD/Desktop/DeepSpot Globe/qa/community-v3/tilt.png",clip={"x":0,"y":box['y']-80,"width":1440,"height":560})
    print("tilt:",await pg.evaluate("document.querySelector('.pm-item.is-front .pm-tilt').style.transform"))
    # poll
    await pg.locator('.dc-poll').scroll_into_view_if_needed(); await pg.wait_for_timeout(400)
    await pg.click('.dc-opt[data-opt="1"]'); await pg.wait_for_timeout(1200)
    print("poll pressed:",await pg.evaluate("[...document.querySelectorAll('.dc-opt')].map(b=>b.getAttribute('aria-pressed'))"))
    el=pg.locator('.dc-poll'); await el.screenshot(path="C:/Users/CharD/Desktop/DeepSpot Globe/qa/community-v3/poll-voted.png")
    # feed rotation
    first=await pg.evaluate("document.querySelector('.dc-msg b, .dc-m b').textContent+'|'+document.querySelector('.dc-msg a').textContent.slice(0,20)")
    await pg.locator('.dc-wall').scroll_into_view_if_needed(); await pg.mouse.move(5,5); await pg.wait_for_timeout(4500)
    second=await pg.evaluate("document.querySelector('.dc-msg b, .dc-m b').textContent+'|'+document.querySelector('.dc-msg a').textContent.slice(0,20)")
    print("feed first:",first,"->",second)
    print("errors",errs)
    await b.close()
asyncio.run(main())
