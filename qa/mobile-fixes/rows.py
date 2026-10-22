import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
CASES=[('empty',None,None),('short','Jo Park','jo.park'),('long','Bartholomew Featherstonehaugh','bart.featherstonehaugh')]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w,h in [(390,844),(360,740),(320,568)]:
      ctx,pg=await newpage(b,w,h)
      await to_b(pg)
      for nm,name,user in CASES:
        if name: 
          await slot(pg,'name'); await pg.fill('#ob-name',name); await pg.fill('#ob-user',user); await pg.wait_for_timeout(300)
          if nm=='short': await pg.screenshot(path=f'{O}/{tag}-sheet-name-{w}.png')
          await close_sheet(pg)
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=f'{O}/{tag}-rows-{nm}-{w}.png')
        info=await pg.evaluate("""()=>{const q=s=>document.querySelector(s);const c=q('.ob-front');const rs=[...c.querySelectorAll('.pp-rows>div')].slice(0,2).map(r=>{const d=r.querySelector('dd'),b=d.getBoundingClientRect();return {t:d.textContent,w:Math.round(b.width),sw:d.scrollWidth,cw:d.clientWidth}});return rs}""")
        print(w,nm,info)
      print(w,'errs',pg.errs)
      await ctx.close()
    await b.close()
asyncio.run(main())
