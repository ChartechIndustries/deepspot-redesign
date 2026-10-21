import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":390,"height":844})
    await pg.goto("http://localhost:8766/profile/?user=wayfarer",wait_until="load"); await pg.wait_for_timeout(2500)
    print(await pg.evaluate("""()=>[...document.querySelectorAll('span')].filter(e=>e.getBoundingClientRect().right>391).slice(0,5).map(e=>({cls:e.className,par:e.parentElement.className,t:e.textContent.slice(0,60),r:e.getBoundingClientRect().right,ov:getComputedStyle(e.parentElement).overflow}))"""))
    await b.close()
asyncio.run(main())
