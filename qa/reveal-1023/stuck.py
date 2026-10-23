import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for u,w in [('/community/',390),('/community/',1440),('/tours/',390),('/spot/?id=akabane-haunted-bar',390),('/guides/',390),('/',390),('/',1440),('/browse/',1440)]:
      ctx=await b.new_context(viewport={'width':w,'height':844}); pg=await ctx.new_page()
      await pg.goto(BASE+u,wait_until='load'); await pg.wait_for_timeout(1500)
      y=0
      while y < await pg.evaluate("document.documentElement.scrollHeight"):
        await pg.evaluate(f"scrollTo(0,{y})"); await pg.wait_for_timeout(300); y+=300
      await pg.wait_for_timeout(3500)
      print(u,await pg.evaluate("""()=>[...document.querySelectorAll('.rv')].map(e=>{const r=e.getBoundingClientRect();return e.tagName+'.'+String(e.className).slice(0,50)+' parent='+String(e.parentElement.className).slice(0,30)+' h='+Math.round(r.height)+' top='+Math.round(r.top+scrollY)+' pos='+getComputedStyle(e).position})"""))
      await ctx.close()
    await b.close()
asyncio.run(main())
