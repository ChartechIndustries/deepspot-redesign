"""Mole roll loading screen: time to first paint, bar progress, shots."""
import asyncio,sys,time
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]) if len(sys.argv)>2 else 844
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,w,h)
    await to_b(pg)
    cdp=await ctx.new_cdp_session(pg)
    await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':80,'downloadThroughput':700*1024/8*8,'uploadThroughput':500*1024})
    await cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
    await pg.evaluate("""()=>{window.__t0=performance.now();window.__first=null;window.__vals=[];
      const tick=()=>{const l=document.querySelector('.mrl');if(l&&window.__first===null){const r=l.getBoundingClientRect();if(r.width>0&&getComputedStyle(l).display!=='none')window.__first=performance.now()-window.__t0;}
        const bar=document.querySelector('.mrl-bar');if(bar)window.__vals.push([Math.round(performance.now()-window.__t0),+bar.getAttribute('aria-valuenow')]);requestAnimationFrame(tick)};requestAnimationFrame(tick);
      document.querySelector('.ob-b [data-slot=photo]').click();}""")
    shots=0
    t0=time.time()
    for ms in [60,250,900,1800,3000]:
      await pg.wait_for_timeout(ms if shots==0 else ms-prev); prev=ms
      await pg.screenshot(path=f'{OUT}/d{w}-11-mole-loading-{shots}.png'); shots+=1
    first=await pg.evaluate("window.__first"); print('first paint ms',first)
    await pg.wait_for_function("()=>['intro','charge','flash','reveal','done'].includes(document.querySelector('.mr')?.dataset.phase)",timeout=150000)
    vals=await pg.evaluate("window.__vals"); 
    mono=all(vals[i][1]<=vals[i+1][1] for i in range(len(vals)-1)); print('monotonic',mono,'last',vals[-1] if vals else None,'n',len(vals))
    print('samples',[v for i,v in enumerate(vals) if i%max(1,len(vals)//12)==0])
    await pg.screenshot(path=f'{OUT}/d{w}-11-mole-after.png')
    print(pg.errs)
    await b.close()
asyncio.run(main())
