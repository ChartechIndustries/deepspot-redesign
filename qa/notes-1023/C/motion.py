"""motion.py <tag> : deck deal, swipe, arrow flight. Numeric per-frame trace (jumps) + 10-frame strip. 390 + 1440."""
import sys,asyncio,os
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
from PIL import Image
O=os.path.dirname(os.path.abspath(__file__))
tag=sys.argv[1]
REC="""()=>{window.__tr=[];const cards=[...document.querySelectorAll('.pm-item')];const t0=performance.now();
 const f=()=>{const fr=cards.map(c=>{const r=c.getBoundingClientRect();return [Math.round(r.left*10)/10,Math.round(r.top*10)/10,Math.round(r.width*10)/10,+getComputedStyle(c).opacity]});window.__tr.push([performance.now()-t0,fr]);if(performance.now()-t0<window.__dur)requestAnimationFrame(f)};window.__dur=1400;requestAnimationFrame(f)}"""
def jumps(tr):
    worst=0;wi=None
    for a,b in zip(tr,tr[1:]):
        for i,(ca,cb) in enumerate(zip(a[1],b[1])):
            if ca[3]<.5 or cb[3]<.5: continue
            d=max(abs(ca[0]-cb[0]),abs(ca[1]-cb[1]),abs(ca[2]-cb[2]))
            if d>worst: worst=d;wi=(i,round(b[0]))
    return worst,wi
async def strip(pg,name,n=10):
    shots=[]
    for k in range(n):
        p=f'{O}/_f{k}.png';await pg.screenshot(path=p,clip=CL);shots.append(p);await pg.wait_for_timeout(35)
    ims=[Image.open(p) for p in shots];w,h=ims[0].size;sc=0.5 if w>700 else 0.7
    ims=[i.resize((int(w*sc),int(h*sc))) for i in ims];w,h=ims[0].size
    cols=5;rows=(n+cols-1)//cols;sheet=Image.new('RGB',(w*cols,h*rows))
    for k,i in enumerate(ims):sheet.paste(i,((k%cols)*w,(k//cols)*h))
    sheet.save(f'{O}/{tag}-{name}.png')
    for p in shots:os.remove(p)
async def main():
  global CL
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for (w,h) in [tuple(map(int,x.split('x'))) for x in sys.argv[2].split(',')]:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800)
      pg=await ctx.new_page();errs=[]
      pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e: errs.append(str(e)))
      await pg.goto(f'{BASE}/community/?theme=dark',wait_until='load');await pg.wait_for_selector('.pm',timeout=30000);await pg.wait_for_timeout(2500)
      await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})");await pg.wait_for_timeout(1200)
      bx=await pg.evaluate("(()=>{const r=document.querySelector('.pm-stage').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
      CL={'x':max(0,bx[0]),'y':max(0,bx[1]),'width':min(w,bx[2]),'height':min(h-bx[1],bx[3]) if bx[1]>=0 else bx[3]}
      CL['height']=min(CL['height'],h-CL['y'])
      # peek (mouse only, desktop)
      if w>800:
        await pg.mouse.move(bx[0]+bx[2]/2,bx[1]+bx[3]/2);await pg.wait_for_timeout(700);await pg.screenshot(path=f'{O}/{tag}-peek-{w}.png',clip=CL);
      # deal
      await pg.evaluate(REC);await pg.evaluate("window.__dur=1900")
      await pg.click('.pm-item:first-child .pm-link',force=True) if w>800 else await pg.tap('[data-pm-deal]')
      await pg.wait_for_timeout(2300)
      tr=await pg.evaluate("window.__tr");print(w,'deal max jump px',jumps(tr))
      await pg.screenshot(path=f'{O}/{tag}-open-{w}.png',clip=CL)
      # arrow
      await pg.evaluate(REC);await pg.evaluate("window.__dur=1300")
      await pg.click('[data-pm-next]');await strip(pg,f'arrow-{w}');await pg.wait_for_timeout(1000)
      tr=await pg.evaluate("window.__tr");print(w,'arrow max jump px',jumps(tr),'frames',len(tr))
      # swipe: drag left slowly then release
      await pg.evaluate(REC)
      cx=bx[0]+bx[2]/2;cy=bx[1]+bx[3]/2
      await pg.mouse.move(cx,cy);await pg.mouse.down()
      for k in range(1,9):await pg.mouse.move(cx-k*28,cy);await pg.wait_for_timeout(16)
      await pg.screenshot(path=f'{O}/{tag}-dragmid-{w}.png',clip=CL)
      await pg.mouse.up();await strip(pg,f'swipe-{w}');await pg.wait_for_timeout(900)
      tr=await pg.evaluate("window.__tr");print(w,'swipe max jump px',jumps(tr))
      print(w,'counter',await pg.evaluate("document.querySelector('[data-pm-n]').textContent"),'errs',errs[:3])
      # again
      await pg.click('[data-pm-again]');await pg.wait_for_timeout(500);await pg.screenshot(path=f'{O}/{tag}-again1-{w}.png',clip=CL);await pg.wait_for_timeout(3000);await pg.screenshot(path=f'{O}/{tag}-again2-{w}.png',clip=CL)
      await ctx.close()
    await b.close()
asyncio.run(main())
