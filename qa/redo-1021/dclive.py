import asyncio, psutil
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
B='https://chartechindustries.github.io/deepspot-redesign/community/?dc='
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1440,"height":900}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:100]))
    for v in ['now']+[str(i) for i in range(1,11)]:
      errs.clear(); await pg.goto(B+v+'#dc',wait_until='load'); await pg.wait_for_timeout(1800)
      ok=await pg.evaluate("!!document.querySelector('#dc') && document.querySelector('#dc').getBoundingClientRect().height>200")
      print(v,'section ok' if ok else 'MISSING',errs[:1])
    await b.close()
asyncio.run(main())
