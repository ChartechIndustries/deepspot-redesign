import asyncio, psutil
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":390,"height":844},has_touch=True,is_mobile=True)
    for url,sel in [('/profile/?user=preview','.pp-vtabs'),('/','.fs-tabs'),('/browse/','.br-tabs'),('/community/','.cv-tabs')]:
      await pg.goto('http://localhost:8766'+url,wait_until='load'); await pg.wait_for_timeout(1800)
      r=await pg.evaluate(f"""(()=>{{const t=document.querySelector('{sel}');if(!t)return 'none';const c=getComputedStyle(t);t.scrollTop=50;return [c.overflowX,c.overflowY,t.scrollTop,t.scrollHeight-t.clientHeight]}})()""")
      print(url,sel,r)
    await b.close()
asyncio.run(main())
