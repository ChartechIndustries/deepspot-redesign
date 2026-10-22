import sys; sys.path.insert(0,'.'); from lib import *
async def main():
  async with async_playwright() as p:
    for name,url,w,h,seed,th in [('profile wayfarer 1440','/profile/?user=wayfarer',1440,900,None,'dark'),('profile preview 390','/profile/?user=preview',390,844,seed_js(),'dark'),('profile lampbane light 1440','/profile/?user=lampbane',1440,900,None,'light'),('community 1440','/community/',1440,900,None,'dark'),('community 390 light','/community/',390,844,None,'light')]:
      b,pg=await page(p,w,h,th,seed)
      await pg.goto(BASE+url+('&' if '?' in url else '?')+'theme='+th,wait_until='load'); await pg.wait_for_timeout(2500)
      if 'community' in url:
        await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(2500)
      v=await axe(pg); sw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
      print(name,'axe',v,'sw',sw,'errs',pg.errs[:3])
      if name.startswith('profile lampbane') or name.startswith('community 390'): await pg.screenshot(path=f'{OUT}/r4-{name.replace(" ","-")}.png')
      await b.close()
asyncio.run(main())
