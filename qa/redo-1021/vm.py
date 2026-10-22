import asyncio, psutil
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for theme,w in [('dark',1440),('light',1440),('dark',390)]:
      pg=await b.new_page(viewport={"width":w,"height":900})
      await pg.goto(f"http://localhost:8766/community/?theme={theme}#dc",wait_until='load'); await pg.wait_for_timeout(2000)
      r=await pg.evaluate("(()=>{const d=document.getElementById('dc').getBoundingClientRect(),v=document.querySelector('.vm').getBoundingClientRect();return [Math.round(d.bottom+scrollY-500),Math.round(v.top+scrollY+700)]})()")
      await pg.screenshot(path=f'vm-{theme}-{w}.png',full_page=True,clip={'x':0,'y':r[0],'width':w,'height':r[1]-r[0]})
      print(theme,w,'ok'); await pg.close()
    await b.close()
asyncio.run(main())
