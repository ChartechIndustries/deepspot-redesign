import sys,asyncio,json,os,math
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
OUTD=OUT.replace('onboarding-v2.2','notes-1023/D')
INK="""()=>{const c=document.querySelector('#pp-pad canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,x0=1e9,x1=-1,y0=1e9,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>8){n++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}return {n,x0,x1,y0,y1,cw:c.width,ch:c.height}}"""
GEOM="""()=>{const r=e=>{const q=document.querySelector(e)?.getBoundingClientRect();return q?[Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)]:null};const sh=document.querySelector('.ob-sheet');return {paper:r('#pp-pad .sp-paper'),sheet:r('.ob-sheet.is-open'),mode:document.querySelector('.ob-layer').dataset.mode,pop:sh.classList.contains('is-pop'),vv:visualViewport.scale,sel:String(getSelection()),selRanges:getSelection().rangeCount&&!getSelection().isCollapsed,hs:document.documentElement.scrollWidth>innerWidth,sheetBottom:Math.round(document.querySelector('.ob-sheet.is-open').getBoundingClientRect().bottom),vh:innerHeight}}"""
THICK="""()=>{const c=document.querySelector('#pp-pad canvas'),W=c.width,H=c.height,d=c.getContext('2d').getImageData(0,0,W,H).data;const run=(y0,y1,x)=>{let n=0;for(let y=y0;y<y1;y++)if(d[(y*W+x)*4+3]>128)n++;return n};const x=Math.round(W*.25);return {thin:run(0,Math.round(H*.4),x),thick:run(Math.round(H*.4),H,x)}}"""
CSS="""()=>{const p=document.querySelector('#pp-pad .sp-paper'),b=document.querySelector('[data-tool=undo]'),s=document.querySelector('.ob-sheet');const q=e=>getComputedStyle(e);return {paper:[q(p).touchAction,q(p).userSelect],undo:q(b).touchAction,sheet:[q(s).touchAction,q(s).userSelect],undoH:Math.round(b.getBoundingClientRect().height)}}"""
async def box(pg,sel):
  return await pg.evaluate("s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.left,r.top,r.width,r.height]}",sel)
def wave(x,y,w,h,n=40,amp=.35,x0=.05,x1=.95):
  return [(x+w*(x0+(x1-x0)*t/n),y+h*(.55+amp*math.sin(t/n*8))) for t in range(n+1)]
async def touch_stroke(cdp,pts,radius=None,idn=0):
  tp=lambda p:[{'x':p[0],'y':p[1],'id':idn,**({'radiusX':radius,'radiusY':radius} if radius else {})}]
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':tp(pts[0])})
  for p in pts[1:]: await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':tp(p)})
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
async def pen_stroke(cdp,pts,force):
  await cdp.send('Input.dispatchMouseEvent',{'type':'mousePressed','x':pts[0][0],'y':pts[0][1],'button':'left','buttons':1,'clickCount':1,'pointerType':'pen','force':force})
  for p in pts[1:]: await cdp.send('Input.dispatchMouseEvent',{'type':'mouseMoved','x':p[0],'y':p[1],'button':'left','buttons':1,'pointerType':'pen','force':force})
  await cdp.send('Input.dispatchMouseEvent',{'type':'mouseReleased','x':pts[-1][0],'y':pts[-1][1],'button':'left','buttons':0,'clickCount':1,'pointerType':'pen','force':0})
async def tap(cdp,x,y):
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
async def run(b,w,h,theme='dark',full=True):
  ctx,pg=await newpage(b,w,h,theme,'on',touch=True)
  cdp=await ctx.new_cdp_session(pg)
  await to_b(pg); await slot(pg,'mark'); await pg.wait_for_timeout(500)
  g=await pg.evaluate(GEOM); tag=f'{w}x{h}-{theme}'
  print(f'== {tag}: paper {g["paper"]} sheet {g["sheet"]} mode {g["mode"]} pop {g["pop"]} bottom {g["sheetBottom"]}/{g["vh"]}',flush=True)
  await pg.screenshot(path=f'{OUTD}/pad-{tag}-0open.png')
  px,py,pw,ph=g['paper']
  await touch_stroke(cdp,wave(px,py,pw,ph)); await pg.wait_for_timeout(200)
  i=await pg.evaluate(INK); print('  touch stroke ink px',i['n'],'bounds x',i['x0'],i['x1'],'canvas',i['cw'],i['ch'])
  await pg.screenshot(path=f'{OUTD}/pad-{tag}-1stroke.png')
  if full:
    ub=await box(pg,'[data-tool=undo]'); ux,uy=ub[0]+ub[2]/2,ub[1]+ub[3]/2
    for _ in range(6): await tap(cdp,ux,uy); await pg.wait_for_timeout(60)
    await pg.wait_for_timeout(300)
    gg=await pg.evaluate(GEOM); i2=await pg.evaluate(INK)
    print('  after 6 undo taps: visualViewport.scale',gg['vv'],'selection',repr(gg['sel']),'ranges',gg['selRanges'],'hscroll',gg['hs'],'ink',i2['n'])
    cb=await box(pg,'[data-tool=clear]')
    for _ in range(4): await tap(cdp,cb[0]+cb[2]/2,cb[1]+cb[3]/2); await pg.wait_for_timeout(50)
    gg=await pg.evaluate(GEOM); print('  after 4 clear taps: scale',gg['vv'],'sel',repr(gg['sel']))
    await touch_stroke(cdp,wave(px,py,pw,ph,amp=.2),radius=60); i=await pg.evaluate(INK); print('  palm touch (r=60) ink',i['n'],'(want 0)')
    await pen_stroke(cdp,wave(px,py+ph*.05,pw,ph*.2,amp=.01,x0=.1,x1=.4),.15)
    await pen_stroke(cdp,wave(px,py+ph*.45,pw,ph*.2,amp=.01,x0=.1,x1=.4),.95)
    print('  pen thickness (canvas px) light vs hard force:',await pg.evaluate(THICK))
    before=(await pg.evaluate(INK))['n']
    await touch_stroke(cdp,wave(px,py+ph*.7,pw,ph*.1,amp=.01,x0=.6,x1=.9)); after=(await pg.evaluate(INK))['n']
    print('  touch right after pen: ink changed',after-before,'(want 0)')
    await pg.screenshot(path=f'{OUTD}/pad-{tag}-2pen.png')
    await pg.wait_for_timeout(2800)
    await touch_stroke(cdp,wave(px,py+ph*.7,pw,ph*.1,amp=.01,x0=.6,x1=.9)); after2=(await pg.evaluate(INK))['n']
    print('  touch 2.8 s after pen: ink changed',after2-after,'(want >0)')
    n0=(await pg.evaluate(INK))['n']
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':px+pw*.5,'y':py+ph*.9,'id':0}]})
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':px+pw*.6,'y':py+ph*.9,'id':0}]})
    await pen_stroke(cdp,[(px+pw*.2,py+ph*.85),(px+pw*.3,py+ph*.88)],.5)
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    n1=(await pg.evaluate(INK)); print('  touch then pen: ink added',n1['n']-n0,'(small = pen only)')
  print('  css',await pg.evaluate(CSS))
  print('  errs',pg.errs,flush=True)
  await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    cfg=os.environ.get('CFG','all')
    for (w,h,th,full) in [(820,1180,'dark',True),(1180,820,'dark',False),(1024,1366,'light',False),(390,844,'dark',True),(360,780,'light',False)]:
      if cfg=='all' or cfg==str(w): await run(b,w,h,th,full)
    await b.close()
asyncio.run(main())
