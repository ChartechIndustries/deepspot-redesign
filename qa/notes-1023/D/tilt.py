import sys,asyncio,json,re
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
OUTD=OUT.replace('onboarding-v2.2','notes-1023/D')
IOS="""(()=>{window.__req=0;DeviceOrientationEvent.requestPermission=async()=>{window.__req++;return window.__grant||'granted'}})()"""
FIRE="""([b,g])=>{window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{beta:b,gamma:g,alpha:0}))}"""
READ="""()=>{const o=document.querySelector('.pp-passobj-in');const t=o.style.transform;const m=t.match(/rotateX\(([-\d.]+)deg\) rotateY\(([-\d.]+)deg\)/);return {t,rx:m?+m[1]:null,ry:m?+m[2]:null,gx:o.style.getPropertyValue('--gx'),gy:o.style.getPropertyValue('--gy'),cls:o.className,chip:!!document.querySelector('.pp-tiltchip'),lx:document.querySelector('[data-pml]')?.getAttribute('x')}}"""
async def case(b,name,w,h,ios,reduced=False,theme='dark'):
  ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=w<800,device_scale_factor=1,reduced_motion='reduce' if reduced else 'no-preference')
  if ios: await ctx.add_init_script(IOS)
  pg=await ctx.new_page(); errs=[]
  pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
  await pg.goto(BASE+'/profile/?user=wayfarer&theme='+theme,wait_until='load'); await pg.wait_for_timeout(2500)
  r0=await pg.evaluate(READ)
  print(name,w,h,'start chip=',r0['chip'])
  if ios and r0['chip']:
    await pg.screenshot(path=f'{OUTD}/tilt-{name}-{theme}-{w}-chip.png')
    await pg.locator('.pp-tiltchip').click(); await pg.wait_for_timeout(300)
    print('  after tap: requests',await pg.evaluate("window.__req"),'chip',(await pg.evaluate(READ))['chip'])
  res=[]
  for (bb,gg) in [(40,0),(40,30),(40,-30),(70,30),(10,-30),(40,0)]:
    for _ in range(40):
      await asyncio.wait_for(pg.evaluate(FIRE,[bb,gg]),8); await pg.wait_for_timeout(16)
    await pg.wait_for_timeout(250)
    print('  step',bb,gg,flush=True); res.append((bb,gg,await asyncio.wait_for(pg.evaluate(READ),8)))
  for bb,gg,r in res: print('  ',bb,gg,'rx',r['rx'],'ry',r['ry'],'gx',r['gx'],'gy',r['gy'],'lx',r['lx'],'tilt' if 'is-tilt' in r['cls'] else '')
  await pg.screenshot(path=f'{OUTD}/tilt-{name}-{theme}-{w}-lean.png')
  mx=max([abs(r['rx'] or 0) for _,_,r in res]+[abs(r['ry'] or 0) for _,_,r in res])
  print('  max angle',mx,'errs',errs)
  await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    import os
    which=os.environ.get('CASE','all')
    if which in('all','a'): await case(b,'android',390,844,False)
    if which in('all','i'): await case(b,'ios',390,844,True)
    if which in('all','t'): await case(b,'ios',820,1180,True,theme='light')
    if which in('all','l'): await case(b,'ios',1180,820,True)
    if which in('all','r'): await case(b,'reduced',390,844,True,reduced=True)
    await b.close()
asyncio.run(main())
