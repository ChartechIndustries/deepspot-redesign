import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
R=['/','/browse/','/map/','/community/','/profile/?user=wayfarer','/stories/','/leaderboard/','/roadmap/','/faq/','/tours/','/welcome/','/nope-404/']
HID="""()=>document.querySelectorAll('.rv').length"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    for w,h in [(390,844),(1440,900)]:
     for u in R:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800); pg=await ctx.new_page(); errs=[]
      pg.on('console',lambda m: errs.append(m.text[:90]) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)[:90]))
      try: await pg.goto(BASE+u,wait_until='load',timeout=45000)
      except Exception as e: print(w,u,'GOTO FAIL');await ctx.close();continue
      await pg.wait_for_timeout(1200)
      H=await pg.evaluate("document.documentElement.scrollHeight")
      for y in range(0,H,600): await pg.evaluate(f"scrollTo(0,{y})"); await pg.wait_for_timeout(250)
      await pg.wait_for_timeout(1200)
      n=await pg.evaluate("window.__rvSeen||document.querySelectorAll('.rv,.rv-done,.rv-run').length"); hid=await pg.evaluate(HID)
      sw=await pg.evaluate("document.documentElement.scrollWidth-innerWidth")
      print(w,u,'rv',n,'hidden',hid,'ovf',sw,'errs',errs)
      if u in('/','/community/') : await pg.evaluate("scrollTo(0,0)"); await pg.wait_for_timeout(400); await pg.screenshot(path=f'{O}/lead_{w}_{u.strip("/") or "home"}.png')
      await ctx.close()
    await b.close()
asyncio.run(main())
