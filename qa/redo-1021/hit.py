import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    await pg.goto("http://localhost:8766/profile/?user=preview",wait_until="load"); await pg.wait_for_timeout(2500)
    await pg.click('[data-edit]'); await pg.wait_for_timeout(800)
    for i in range(3):
      print(await pg.evaluate("""(()=>{const o=document.querySelector('.pp-arch-o[data-arch=ghost-hunter]');o.scrollIntoView({block:'center'});const r=o.getBoundingClientRect();const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      const i=o.querySelector('input'),cs=getComputedStyle(i),ls=getComputedStyle(o);return {r:[r.x,r.y,r.width,r.height].map(Math.round),hit:t.tagName+'.'+t.className,inp:[cs.position,cs.pointerEvents,cs.width,cs.height,cs.display].join(),lab:[ls.display,ls.pointerEvents].join(),sb:getComputedStyle(document.querySelector('.pp-edit')).scrollBehavior}})()"""))
      await pg.wait_for_timeout(500)
    await pg.locator('.pp-arch').screenshot(path='after3/arch.png')
    await b.close()
asyncio.run(main())
