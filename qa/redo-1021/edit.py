import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
    await pg.goto("http://localhost:8766/profile/?user=preview",wait_until="load"); await pg.wait_for_timeout(2500)
    await pg.click('[data-edit]'); await pg.wait_for_timeout(600)
    async def at(sel):
      return await pg.evaluate("(s)=>{const o=document.querySelector(s);o.scrollIntoView({block:'center'});const r=o.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}",sel)
    x,y=await at('.pp-arch-o[data-arch=ghost-hunter]'); await pg.mouse.move(x,y); await pg.wait_for_timeout(300)
    print('hover desc:', await pg.locator('#pp-arch-d strong').text_content())
    await pg.screenshot(path='after3/arch-hover.png')
    x,y=await at('.pp-arch-o[data-arch=pirate]'); await pg.mouse.click(x,y); await pg.mouse.move(5,890); await pg.wait_for_timeout(300)
    print('desc after pick:', (await pg.locator('#pp-arch-d strong').text_content()))
    await pg.evaluate("document.querySelector('.pp-savebtn').click()"); await pg.wait_for_timeout(1500)
    print('type box:', await pg.evaluate("document.querySelector('.pp-type h3, .pp-show-type strong')?.textContent"))
    print('stamp:', await pg.evaluate("document.querySelector('.pp-id9-stamp b')?.textContent"))
    # follow on another profile
    await pg.goto("http://localhost:8766/profile/?user=wayfarer",wait_until="load"); await pg.wait_for_timeout(2500)
    await pg.evaluate("localStorage.removeItem('deepspot-follows-v1')"); await pg.reload(); await pg.wait_for_timeout(2500)
    btn=pg.locator('[data-ps-follow]'); bb=await btn.bounding_box(); print('follow btn', round(bb['width']), round(bb['height']))
    await pg.evaluate("document.querySelector('[data-ps-follow]').click()"); await pg.wait_for_timeout(200)
    print('shake class:', await pg.evaluate("document.body.className"), 'hearts:', await pg.evaluate("document.querySelectorAll('.ps-heart').length"))
    await pg.screenshot(path='after3/follow-mid.png',clip={'x':700,'y':150,'width':740,'height':300})
    await pg.wait_for_timeout(900); print('after:', await pg.evaluate("document.body.className"), await btn.text_content())
    print('errors',errs); await b.close()
asyncio.run(main())
