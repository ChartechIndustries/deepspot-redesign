import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h in [(1440,900),(390,844)]:
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=w<800,has_touch=w<800); pg=await ctx.new_page(); errs=[]
      pg.on('pageerror',lambda e: errs.append(str(e)))
      await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
      await pg.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'j@e.com'}))")
      await pg.goto(BASE+'/profile/?user=preview',wait_until='load'); await pg.wait_for_timeout(2000)
      await pg.evaluate("[...document.querySelectorAll('button')].find(b=>/edit profile/i.test(b.textContent)).click()"); await pg.wait_for_timeout(1200)
      await pg.screenshot(path=f'{O}/dlg-{w}.png'); print(w,'errs',errs)
      await ctx.close()
    await b.close()
asyncio.run(main())
