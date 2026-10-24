import psutil; psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
import asyncio,sys,os
from playwright.async_api import async_playwright
OUT=os.path.dirname(os.path.abspath(__file__)); tag=sys.argv[1]
S=[(320,640,1),(390,844,1),(820,1180,1),(1180,820,1),(1440,900,0),(1920,1080,0)]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h,m in S:
      for th in ['dark','light']:
        ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=bool(m),has_touch=bool(m))
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto(f'http://localhost:8766/tours/?theme={th}',wait_until='domcontentloaded')
        await pg.wait_for_selector('.tr-stage'); await pg.wait_for_timeout(250)
        await pg.screenshot(path=f'{OUT}/tours_{tag}_{w}_{th}_first.png')
        if th=='dark':
          await pg.wait_for_timeout(2600); await pg.screenshot(path=f'{OUT}/tours_{tag}_{w}_{th}_end.png')
        print(w,th,errs,flush=True); await ctx.close()
    await b.close()
asyncio.run(main())
