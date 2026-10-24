"""UX audit capture: viewport frames down each page at phone / iPad / desktop. Usage: cap.py [sizes] [route-filter]"""
import psutil; psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
import asyncio,os,sys,re
from playwright.async_api import async_playwright
BASE='http://localhost:8766'; OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'shots')
ROUTES=['/','/browse/','/spot/?id=tochigi-underground-quarry','/map/','/tours/','/stories/','/story/?id=shark',
 '/guides/','/community/','/profile/?user=wayfarer','/welcome/?reset=1','/competition/','/leaderboard/','/roadmap/',
 '/contribute/','/membership/','/faq/']
SIZES={'p':(390,844,True),'t':(820,1180,True),'d':(1440,900,False)}
sz=sys.argv[1] if len(sys.argv)>1 else 'ptd'; flt=sys.argv[2] if len(sys.argv)>2 else ''
MAXF=10
def slug(r): return re.sub(r'[^a-z0-9]+','_',r).strip('_') or 'home'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for k in sz:
      w,h,m=SIZES[k]
      ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=m,has_touch=m,device_scale_factor=1)
      for r in [x for x in ROUTES if flt in x]:
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        try: await pg.goto(BASE+r,wait_until='load',timeout=30000)
        except Exception as e: print('ERR',r,e); await pg.close(); continue
        await pg.wait_for_timeout(2500)
        H=await pg.evaluate('document.documentElement.scrollHeight')
        n=min(MAXF,max(1,-(-H//h)))
        for i in range(n):
          await pg.evaluate(f'window.scrollTo(0,{i*int(h*.9)})'); await pg.wait_for_timeout(900)
          await pg.screenshot(path=f'{OUT}/{k}_{slug(r)}_{i:02d}.jpg',quality=70,type='jpeg')
        print(k,r,'H',H,'frames',n,'errs',errs[:2],flush=True)
        await pg.close()
      await ctx.close()
    await b.close()
asyncio.run(main())
