import asyncio
from playwright.async_api import async_playwright
BASE='http://localhost:8766'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    for (w,h,th) in [(1440,900,'dark'),(1440,900,'light'),(1920,1080,'dark'),(1100,800,'dark'),(901,800,'dark'),(768,900,'dark'),(390,844,'dark'),(320,640,'dark')]:
      ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page()
      await pg.goto(f'{BASE}/profile/?user=preview&theme={th}',wait_until='load'); await pg.wait_for_timeout(1800)
      await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(700)
      r=await pg.evaluate("""()=>{const idx=document.querySelector('.ed-index'),a=[...idx.querySelectorAll('a')],x=document.querySelector('.ed-x').getBoundingClientRect();
        const vis=a.filter(e=>getComputedStyle(e.querySelector('span')).display!=='none').length;
        return {n:a.length,scrollW:idx.scrollWidth,clientW:idx.clientWidth,lastRight:Math.round(a[a.length-1].getBoundingClientRect().right),closeLeft:Math.round(x.left),labelsShown:vis,doc:[document.documentElement.scrollWidth,innerWidth]}}""")
      ok=r['scrollW']<=r['clientW']+1 and r['lastRight']<=r['closeLeft']
      print(w,th,'OK' if ok else 'OVERFLOW',r)
      # scroll to the 4th section so the active label is a later one
      await pg.evaluate("document.querySelector('[data-ed-go=style]').click()"); await pg.wait_for_timeout(900)
      await pg.screenshot(path=f'C:/Users/CharD/Desktop/DeepSpot Globe/qa/edit-modal/index-{th[0]}{w}.png')
      await ctx.close()
    await b.close()
asyncio.run(main())
