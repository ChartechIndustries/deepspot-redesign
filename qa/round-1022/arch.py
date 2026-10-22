import sys,asyncio,json,os
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','onboarding-v2.2'))
import h as H
from playwright.async_api import async_playwright
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
OUT=os.path.dirname(os.path.abspath(__file__))
cfg=[(390,844,'dark'),(360,740,'dark'),(1440,900,'dark'),(390,844,'light'),(1440,900,'light')]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); 
    for w,h,th in cfg:
      ctx,pg=await H.newpage(b,w,h,th)
      await H.to_b(pg)
      await H.slot(pg,'arch')
      await pg.screenshot(path=f'{OUT}/arch-{tag}-{w}-{th}-0open.png')
      # scroll mid-list
      await pg.evaluate("document.querySelector('.ob-sh-b').scrollTop=1500"); await pg.wait_for_timeout(600)
      await pg.screenshot(path=f'{OUT}/arch-{tag}-{w}-{th}-1mid.png')
      cur=await pg.evaluate("[...document.querySelectorAll('.ob-tab')].findIndex(t=>t.getAttribute('aria-current')==='true')")
      # click a tab (5th)
      await pg.evaluate("document.querySelectorAll('.ob-tab')[6].click()"); await pg.wait_for_timeout(1100)
      st=await pg.evaluate("""()=>{const h=document.querySelector('.ob-sh-b'),s=document.querySelectorAll('.ob-ag')[6],bar=document.querySelector('.ob-tabbar');return {top:Math.round(s.getBoundingClientRect().top-bar.getBoundingClientRect().bottom),cur:[...document.querySelectorAll('.ob-tab')].findIndex(t=>t.getAttribute('aria-current')==='true'),sh:Math.round(document.querySelector('.ob-sheet').getBoundingClientRect().height),sw:Math.round(document.querySelector('.ob-sheet').getBoundingClientRect().width),vh:innerHeight,doneVisible:(()=>{const r=document.querySelector('.ob-sh-done').getBoundingClientRect();return r.bottom<=innerHeight&&r.top>0})(),barTop:Math.round(bar.getBoundingClientRect().top-document.querySelector('.ob-sh-b').getBoundingClientRect().top)}}""")
      await pg.screenshot(path=f'{OUT}/arch-{tag}-{w}-{th}-2tab.png')
      # scroll to end
      await pg.evaluate("document.querySelector('.ob-sh-b').scrollTop=99999"); await pg.wait_for_timeout(600)
      cur2=await pg.evaluate("[...document.querySelectorAll('.ob-tab')].findIndex(t=>t.getAttribute('aria-current')==='true')")
      print(w,th,'spy at 1500:',cur,'after tab6:',st,'at end:',cur2,'errs',pg.errs[:3],flush=True)
      await ctx.close()
    await b.close()
asyncio.run(main())
