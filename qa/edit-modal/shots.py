import asyncio,sys
from playwright.async_api import async_playwright
OUT='C:/Users/CharD/Desktop/DeepSpot Globe/qa/edit-modal/'
URL='http://localhost:8766/profile/?user=preview'
async def shot(b,w,h,theme,color,name,scrolls=(0,)):
  ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
  pg=await ctx.new_page(); errs=[]
  pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
  await pg.add_init_script(f"localStorage.setItem('deepspot-panel-color','{color}')")
  await pg.goto(URL+('&theme=light' if theme=='light' else ''),wait_until='load'); await pg.wait_for_timeout(2500)
  await pg.evaluate(f"document.documentElement.dataset.panelColor='{color}'")
  await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(900)
  for i,s in enumerate(scrolls):
    await pg.evaluate("""(s)=>{const r=document.querySelector('.ed-right'),m=document.querySelector('.ed-main');const sc=getComputedStyle(r).display==='contents'?m:r;sc.scrollTop=s;}""",s)
    await pg.wait_for_timeout(400)
    await pg.screenshot(path=f'{OUT}{name}-s{i}.png')
  sw=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
  print(name,'scrollW',sw,'errs',errs[:3])
  await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    cfgs=[(1440,900,'dark','on','d1440'),(1440,900,'light','on','l1440'),(1920,1080,'dark','on','d1920'),(1440,900,'dark','off','d1440off'),(390,844,'dark','on','d390'),(390,844,'light','off','l390off'),(320,640,'dark','on','d320'),(1920,1080,'light','off','l1920off'),(320,640,'light','off','l320off')]
    sel=sys.argv[1:] 
    for c in cfgs:
      if sel and c[4] not in sel: continue
      await shot(b,*c[:4],c[4],scrolls=(0,700,1500,2600))
    await b.close()
asyncio.run(main())
