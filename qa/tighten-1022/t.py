"""Tighten-1022 helper. usage: python t.py <cmd> ...  (one headless browser, below-normal priority)
 shot <route> <w> <theme> <out> [scrollY] [fullpage]   ; ev <route> <w> <theme> <js-file-or-expr>"""
import sys,os
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
import h
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
GLARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
def run(fn,routes_w_theme,gl=False,wait=1800,h_=None):
  out=[]
  with sync_playwright() as p:
    br=p.chromium.launch(headless=True,args=GLARGS if gl else [])
    for (route,w,theme) in routes_w_theme:
      ctx=br.new_context(viewport={'width':w,'height':h_ or (844 if w<800 else 900)},device_scale_factor=1,has_touch=w<800,is_mobile=w<800)
      pg=ctx.new_page(); pg.errs=[]
      pg.on('console',lambda m: pg.errs.append(m.text[:200]) if m.type=='error' else None)
      pg.on('pageerror',lambda e: pg.errs.append('PE '+str(e)[:200]))
      sep='&' if '?' in route else '?'
      pg.goto(B+route+(sep+'theme='+theme if theme else ''),wait_until='load'); pg.wait_for_timeout(wait)
      if os.environ.get('NOSCROLL')!='1': pg.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.7)){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0)}'); pg.wait_for_timeout(900)
      out.append(fn(pg,route,w,theme)); ctx.close()
    br.close()
  return out
if __name__=='__main__':
  c=sys.argv[1]
  if c=='shot':
    route,w,theme,outp=sys.argv[2],int(sys.argv[3]),sys.argv[4],sys.argv[5]
    sy=int(sys.argv[6]) if len(sys.argv)>6 else 0; full=len(sys.argv)>7
    def f(pg,*a):
      if sy: pg.evaluate(f'scrollTo(0,{sy})'); pg.wait_for_timeout(700)
      pg.screenshot(path=outp,full_page=full); return pg.errs
    print(run(f,[(route,w,theme)],gl=('/'==route.split('?')[0] or 'profile' in route)))
  if c=='ev':
    route,w,theme,js=sys.argv[2],int(sys.argv[3]),sys.argv[4],sys.argv[5]
    if os.path.exists(js): js=open(js,encoding='utf-8').read()
    def f(pg,*a): return pg.evaluate(js)
    import json
    print(json.dumps(run(f,[(route,w,theme)],gl=('/'==route.split('?')[0] or 'profile' in route))[0],indent=1,ensure_ascii=False)[:6000])
