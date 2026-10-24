import psutil; psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
import asyncio,sys,os
from playwright.async_api import async_playwright
OUT=os.path.dirname(os.path.abspath(__file__)); tag=sys.argv[1]
S=[(320,640,1),(360,780,1),(390,844,1),(820,1180,1),(1180,820,1),(1440,900,0),(1920,1080,0)]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,m in S:
      for th in ['dark','light']:
        ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=bool(m),has_touch=bool(m))
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda c:errs.append(c.text) if c.type=='error' else None)
        await pg.goto(f'http://localhost:8766/browse/?theme={th}',wait_until='load'); await pg.wait_for_selector('.br-card'); await pg.wait_for_timeout(500)
        ov=await pg.evaluate('document.documentElement.scrollWidth>innerWidth')
        await pg.screenshot(path=f'{OUT}/browse_{tag}_{w}_{th}.png')
        if th=='dark':
          tabs=pg.locator('.br-tabs button'); n=await tabs.count()
          await tabs.nth(n-1).click(); await pg.wait_for_timeout(900)
          sl=await pg.evaluate("document.querySelector('.br-tabs').scrollLeft")
          await pg.screenshot(path=f'{OUT}/browse_{tag}_{w}_{th}_lasttab.png',clip={'x':0,'y':0,'width':w,'height':min(h,900)})
          cls=await pg.evaluate("document.querySelector('.br-tabs').className+'|'+document.querySelector('#pill-count').textContent+' '+document.querySelector('#pill-label').textContent")
          print(w,th,'overflowX',ov,'scrollLeft',sl,cls,errs,flush=True)
        else: print(w,th,'overflowX',ov,errs,flush=True)
        await ctx.close()
    await b.close()
asyncio.run(main())
