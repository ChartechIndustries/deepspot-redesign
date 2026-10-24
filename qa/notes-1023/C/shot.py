import sys,asyncio,os
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
tag=sys.argv[1]; sizes=[tuple(map(int,s.split('x'))) for s in sys.argv[2].split(',')]; themes=sys.argv[3].split(',') if len(sys.argv)>3 else ['dark']
SEL={'hero':'.gv','part':'.pm','dc':'#dc','vm':'.vm'}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for (w,h) in sizes:
      for th in themes:
        ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<1200,is_mobile=w<800)
        pg=await ctx.new_page();errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto(f'{BASE}/community/?theme={th}',wait_until='load');await pg.wait_for_timeout(2500)
        for k,s in SEL.items():
          el=await pg.query_selector(s)
          if not el: print('missing',k);continue
          await el.scroll_into_view_if_needed();await pg.wait_for_timeout(4500 if k=='part' else 1500)
          await (el.screenshot(path=f'{O}/{tag}-{k}-{w}-{th}.png') if k in ('dc','vm') else pg.screenshot(path=f'{O}/{tag}-{k}-{w}-{th}.png'))
        ov=await pg.evaluate('document.documentElement.scrollWidth-innerWidth')
        print(w,th,'overflow',ov,'errs',errs[:3])
        await ctx.close()
    await b.close()
asyncio.run(main())
