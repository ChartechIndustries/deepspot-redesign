import psutil; psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
import asyncio,os
from playwright.async_api import async_playwright
OUT=os.path.dirname(os.path.abspath(__file__))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h in [(390,844),(820,1180)]:
      for r in ['/','/browse/','/guides/','/stories/','/tours/','/map/']:
        ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True); pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://localhost:8766'+r+('&' if '?' in r else '?')+'theme=dark',wait_until='load'); await pg.wait_for_timeout(2000)
        btn=pg.locator('.br-menu,.ds-home-menu').first
        if await btn.count()==0: print(w,r,'NO BURGER'); await ctx.close(); continue
        await btn.click(); await pg.wait_for_timeout(300)
        items=await pg.evaluate("[...document.querySelectorAll('.br-mobile-nav:not([hidden]) a,.ds-home-navigation:not([hidden]) a')].map(a=>a.textContent)")
        tabs=await pg.evaluate("document.querySelectorAll('.br-content-tabs').length")
        ov=await pg.evaluate('document.documentElement.scrollWidth>innerWidth')
        print(w,r,items,'tabrows',tabs,'ovx',ov,errs,flush=True)
        if r in('/guides/','/') or (r=='/browse/'): await pg.screenshot(path=f'{OUT}/menu_{w}_{r.strip("/") or "home"}.png')
        await ctx.close()
    await b.close()
asyncio.run(main())
