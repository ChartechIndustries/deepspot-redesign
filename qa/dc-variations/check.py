from playwright.async_api import async_playwright
import sys,asyncio,os,json
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','round-1022'))
from rh import *
async def main():
  vs=sys.argv[1].split(',') if len(sys.argv)>1 else [str(i) for i in range(1,11)]
  async with async_playwright() as p:
    b=await launch(p)
    for w in (1440,390):
      for v in vs:
        ctx,pg=await page(b,w,900 if w>800 else 844,'dark')
        await pg.goto(f'{BASE}/community/?dc={v}',wait_until='load'); await pg.wait_for_selector('.dc',timeout=25000)
        await pg.locator('.dc').scroll_into_view_if_needed(); await pg.wait_for_timeout(1500)
        res={'v':v,'w':w}
        # poll
        await pg.locator('.dc [data-opt="2"]').first.click(); await pg.wait_for_timeout(300)
        res['poll']=await pg.evaluate("document.querySelector('.dc [data-opt=\"2\"]').getAttribute('aria-pressed')")
        await pg.locator('.dc [data-opt="2"]').first.click()
        # rotation
        snap="""()=>{const d=document.querySelector('.dc [data-deckn]');if(d)return 'deck:'+d.textContent;const m=document.querySelector('.dc [data-mq]');if(m){const t=m.querySelector('.dv-mq-track');return 'mq:'+getComputedStyle(t).transform}const f=document.querySelector('.dc [data-feed]');return 'feed:'+f.firstElementChild.textContent.slice(0,20)}"""
        await pg.evaluate("()=>{const e=document.querySelector('.dc [data-deck],.dc [data-mq],.dc [data-feed]');e.scrollIntoView({block:'center'})}")
        await pg.wait_for_timeout(600)
        bb=await pg.evaluate("()=>{const e=document.querySelector('.dc [data-deck],.dc [data-mq],.dc [data-feed]').getBoundingClientRect();return [e.top,e.bottom]}")
        await pg.mouse.move(2,(pg.viewport_size['height']-3) if bb[0]<450 and bb[1]<pg.viewport_size['height']-10 else 3)
        a=await pg.evaluate(snap)
        await pg.wait_for_timeout(5200)
        c=await pg.evaluate(snap)
        res['rot']= a!=c
        res['sw']=await pg.evaluate("document.documentElement.scrollWidth")
        res['errs']=pg.errs[:3]
        res['axe']=await axe(pg)
        print(json.dumps(res),flush=True)
        await ctx.close()
    await b.close()
asyncio.run(main())
