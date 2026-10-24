import psutil; psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h in [(820,1180),(1440,900),(390,844)]:
      pg=await b.new_page(viewport={'width':w,'height':h})
      await pg.goto('http://localhost:8766/',wait_until='load'); await pg.wait_for_timeout(3000)
      await pg.evaluate('window.scrollTo(0,document.body.scrollHeight)'); await pg.wait_for_timeout(1500)
      r=await pg.evaluate("""()=>[...document.querySelectorAll('.ds-cta-contribute')].map(e=>[e.getBoundingClientRect().top+scrollY|0,e.getBoundingClientRect().height|0,getComputedStyle(e).display,e.closest('[class]')?.parentElement?.className])""")
      print(w,r)
      await pg.close()
    await b.close()
asyncio.run(main())
