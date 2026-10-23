import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for tag,port in [('old',8770),('now',8766)]:
     for w,h in [(1440,900),(390,844)]:
      ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page()
      await pg.goto(f'http://localhost:{port}/?theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
      for i,y in enumerate([800,1500,2200,2900]):
        await pg.evaluate(f"scrollTo(0,{y})"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'{O}/{tag}-{w}-{i}.png')
      await ctx.close()
    await b.close()
asyncio.run(main())
