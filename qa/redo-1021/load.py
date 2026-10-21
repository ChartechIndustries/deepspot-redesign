import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    await pg.goto("http://localhost:8766/community/",wait_until="load")
    for t in range(8):
      r=await pg.evaluate("(()=>{const s=document.querySelector('.pm');if(!s)return 'none';const b=s.getBoundingClientRect();return s.className+' top='+Math.round(b.top)+' sy='+scrollY+' act='+(document.activeElement&&document.activeElement.className)})()")
      print(t*500,r); await pg.wait_for_timeout(500)
    await b.close()
asyncio.run(main())
