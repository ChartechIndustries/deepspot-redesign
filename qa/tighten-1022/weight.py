"""page weight: python weight.py <route> <w> [dark] -> total MB, top 15 requests (scrolls the page to trigger lazy loads)"""
import sys
from t import *
def f(pg,route,w,theme):
  pass
def go(route,w,theme='dark',n=15):
  sizes=[]
  with sync_playwright() as p:
    br=p.chromium.launch(headless=True,args=GLARGS)
    ctx=br.new_context(viewport={'width':w,'height':844 if w<800 else 900},device_scale_factor=1,has_touch=w<800,is_mobile=w<800)
    pg=ctx.new_page()
    def onresp(r):
      try:
        b=r.body(); sizes.append((len(b),r.url.replace(B,'')[:100]))
      except Exception: sizes.append((int(r.headers.get('content-length') or 0),r.url.replace(B,'')[:100]))
    pg.on('response',onresp)
    sep='&' if '?' in route else '?'
    pg.goto(B+route+sep+'theme='+theme,wait_until='load'); pg.wait_for_timeout(2500)
    pg.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.7)){scrollTo(0,y);await new Promise(r=>setTimeout(r,150))}scrollTo(0,0)}')
    pg.wait_for_timeout(1800)
    br.close()
  tot=sum(s for s,_ in sizes)
  return tot,sorted(sizes,reverse=True)[:n],len(sizes)
if __name__=='__main__':
  tot,top,nreq=go(sys.argv[1],int(sys.argv[2]))
  print(round(tot/1e6,2),'MB',nreq,'req')
  for s,u in top: print(' ',s,u)
