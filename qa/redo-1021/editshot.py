import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    await pg.goto("http://localhost:8766/profile/?user=preview",wait_until="load"); await pg.wait_for_timeout(2500)
    await pg.click('[data-edit]'); await pg.wait_for_timeout(800)
    await pg.screenshot(path='after3/edit-state.png')
    print(await pg.evaluate("""(()=>{const o=document.querySelector('.pp-arch-o[data-arch=pirate]');const r=o.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      let sc=o.parentElement;while(sc&&getComputedStyle(sc).overflowY==='visible')sc=sc.parentElement;
      return {r:[r.x,r.y,r.width,r.height].map(Math.round),top:top&&top.className,scroller:sc&&sc.className,sh:sc&&sc.scrollHeight,ch:sc&&sc.clientHeight}})()"""))
    await b.close()
asyncio.run(main())
