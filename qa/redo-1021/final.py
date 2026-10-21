import asyncio
from playwright.async_api import async_playwright
R=['/','/browse/','/community/','/profile/?user=wayfarer','/profile/?user=preview','/spot/?id=tochigi-underground-quarry','/map/']
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    for w in (1440,390):
      for r in R:
        pg=await b.new_page(viewport={"width":w,"height":900}); errs=[]
        pg.on('pageerror',lambda e,errs=errs: errs.append(str(e)[:120]))
        pg.on('console',lambda m,errs=errs: m.type=='error' and errs.append(m.text[:120]))
        await pg.goto("http://localhost:8766"+r,wait_until="load"); await pg.wait_for_timeout(2500)
        sw=await pg.evaluate("document.documentElement.scrollWidth")
        print(w,r,'sw',sw,'ok' if sw<=w else 'OVERFLOW',errs[:2]); await pg.close()
    await b.close()
asyncio.run(main())
