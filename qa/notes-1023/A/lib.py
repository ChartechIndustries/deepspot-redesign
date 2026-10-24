import psutil; psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
import asyncio,os,sys
from playwright.async_api import async_playwright
BASE='http://localhost:8766'; OUT=os.path.dirname(os.path.abspath(__file__))
SHIM="Object.defineProperty(document,'hidden',{get:()=>false});Object.defineProperty(document,'visibilityState',{get:()=>'visible'});"
DEV={'p390':(390,844,True),'p360':(360,780,True),'t820':(820,1180,True),'t1180':(1180,820,True),'t1024':(1024,1366,True),'d1440':(1440,900,False),'d1024':(1024,768,False)}
async def newpage(b,dev,theme='dark',shim=True,reduced=False):
  w,h,m=DEV[dev]
  ctx=await b.new_context(viewport={'width':w,'height':h},is_mobile=m,has_touch=m,device_scale_factor=1,reduced_motion='reduce' if reduced else 'no-preference')
  if shim: await ctx.add_init_script(SHIM)
  pg=await ctx.new_page(); pg.errs=[]
  pg.on('pageerror',lambda e: pg.errs.append(str(e)))
  pg.on('console',lambda m: pg.errs.append(m.text) if m.type=='error' else None)
  return ctx,pg
def launch(p): return p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
