import sys,asyncio,json
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
OUTD=OUT.replace('onboarding-v2.2','notes-1023/D')
SIZES=[(390,844),(360,780),(820,1180),(1180,820),(1024,1366)]
INFO="""()=>{const r=document.querySelector('.pp-vtabs'),b=r.getBoundingClientRect();return {sl:r.scrollLeft,sw:r.scrollWidth,cw:r.clientWidth,cls:r.className,gap:r.style.getPropertyValue('--pp-tab-gap'),tabs:[...r.querySelectorAll('.pp-vtab')].map(t=>{const q=t.getBoundingClientRect();return [t.dataset.vt,Math.round(q.left-b.left),Math.round(q.right-b.left)]}),mask:getComputedStyle(r).webkitMaskImage.slice(0,40)}}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    for theme in ('dark','light'):
     for (w,h) in SIZES:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=w<800,device_scale_factor=1)
      pg=await ctx.new_page(); errs=[]
      pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
      await pg.goto(BASE+'/profile/?user=wayfarer&theme='+theme,wait_until='load'); await pg.wait_for_timeout(2500)
      await pg.evaluate("document.querySelector('.pp-vtabs').scrollIntoView({block:'center'})")
      await pg.wait_for_timeout(300)
      i0=await pg.evaluate(INFO)
      await pg.screenshot(path=f'{OUTD}/tabs-{theme}-{w}x{h}-0load.png')
      await pg.wait_for_timeout(1200)
      mid=[]
      # nudge sampling
      await pg.wait_for_timeout(100)
      i1=await pg.evaluate(INFO)
      nudged=await pg.evaluate("localStorage.getItem('deepspot-profile-tabs-nudged-v1')")
      # tap last visible tab
      vis=await pg.evaluate("()=>{const r=document.querySelector('.pp-vtabs'),b=r.getBoundingClientRect();const t=[...r.querySelectorAll('.pp-vtab')].filter(t=>t.getBoundingClientRect().right>b.right-2).map(t=>t.dataset.vt);return t}")
      if vis and i0['sw']>i0['cw']+2:
        tab=vis[0]; box=await pg.evaluate("id=>{const t=document.querySelector('.pp-vtab[data-vt='+id+']').getBoundingClientRect();return [t.left+Math.min(t.width/2,(innerWidth-t.left)/2),t.top+t.height/2]}",tab)
        await pg.touchscreen.tap(*box); await pg.wait_for_timeout(900)
        i2=await pg.evaluate(INFO); await pg.screenshot(path=f'{OUTD}/tabs-{theme}-{w}x{h}-1tap.png')
      else: i2=None
      print(theme,w,h,'overflow' if i0['sw']>i0['cw']+2 else 'fits','nudged=',nudged,'gap',i0['gap'],'cls',i0['cls'].replace('pp-vtabs',''),'| tabs',i0['tabs'],'cw',i0['cw'])
      if i2: print('   after tap: sl',i2['sl'],'cls',i2['cls'])
      print('   errs',errs,'hscroll',await pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
      await ctx.close()
    await b.close()
asyncio.run(main())
