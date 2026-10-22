import asyncio,sys
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h,theme=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx,pg=await newpage(b,w,h,theme)
    await to_b(pg); await do_mole(pg); await do_name(pg); await do_arch(pg); await do_mark(pg); await do_style(pg,'gold','dusk'); await do_bio(pg); await do_places(pg); await flip_to(pg,False)
    await pg.add_script_tag(path=AXE)
    for label,pre in [('B',None),('name','name'),('arch','arch'),('style','style'),('bio','bio'),('places','places'),('mark','mark')]:
      if pre: await slot(pg,pre)
      r=await pg.evaluate("async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' ').slice(0,70))}")
      print(theme,w,label,'axe',r)
      if pre: await close_sheet(pg,'x'); 
    await pg.evaluate("setTimeout(()=>document.querySelector('#ob-fin').click(),50)")
    await pg.wait_for_selector('.ob-stage.is-final'); await pg.wait_for_timeout(700)
    await pg.screenshot(path=f'{OUT}/{theme[0]}{w}-19-finish-stamp.png')
    await b.close()
asyncio.run(main())
