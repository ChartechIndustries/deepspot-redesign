"""axe + console + overflow: onboarding rows/style sheet (390,360,320,1440) and profile my map (preview + other user)."""
import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
async def axe(pg):
  await pg.add_script_tag(path=AXE)
  return await pg.evaluate("async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' ').slice(0,70))}")
async def ovf(pg): return await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    for w,h in ([] if 'prof' in sys.argv else [(390,844),(360,740),(320,568),(1440,900)]):
      ctx,pg=await newpage(b,w,h); await to_b(pg)
      await slot(pg,'name'); await pg.fill('#ob-name','Bartholomew Featherstonehaugh'); await pg.fill('#ob-user','bart.featherstonehaugh'); await pg.wait_for_timeout(300); await close_sheet(pg)
      print(w,'onb rows axe',await axe(pg),'ovf',await ovf(pg))
      await slot(pg,'style'); await pg.wait_for_timeout(300)
      print(w,'onb style axe',await axe(pg),'ovf',await ovf(pg))
      await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(900)
      print(w,'arrow key moved tab',await pg.evaluate("[...document.querySelectorAll('.ob-tab')].map(t=>t.getAttribute('aria-current')).join(',')"))
      await close_sheet(pg); print(w,'errs',pg.errs); await ctx.close()
    for user in ([] if 'onb' in sys.argv else ['preview','kisekikana']):
     for w,h in [(390,844),(360,740),(320,568),(1440,900)]:
      await b.close(); b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800,reduced_motion='reduce')
      pg=await ctx.new_page(); errs=[]
      pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
      await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
      await pg.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'j@e.com'}))")
      await pg.goto(BASE+f'/profile/?user={user}&theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
      print(user,w,'profile axe',await axe(pg),'ovf',await ovf(pg),'errs',errs,'canvas',await pg.evaluate("!!document.querySelector('.wg-canvas')&&document.querySelector('.wg-canvas').width>50"))
      await ctx.close()
    await b.close()
asyncio.run(main())
