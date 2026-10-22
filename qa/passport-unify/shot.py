import psutil,sys,asyncio,json,os
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
BASE='http://localhost:8766'; OUT=os.path.dirname(os.path.abspath(__file__))
# usage: shot.py name url w h [theme]
async def main():
  name,url,w,h=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]); th=sys.argv[5] if len(sys.argv)>5 else 'dark'
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800)
    pg=await ctx.new_page(); errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto(BASE+url+('&' if '?' in url else '?')+'theme='+th,wait_until='load'); await pg.wait_for_timeout(2500)
    await pg.screenshot(path=f'{OUT}/{name}.png')
    print(json.dumps({'errs':errs[:5],'sw':await pg.evaluate("document.documentElement.scrollWidth")}))
    await b.close()
asyncio.run(main())
