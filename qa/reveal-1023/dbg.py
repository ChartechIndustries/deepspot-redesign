import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':390,'height':844})).new_page()
    await pg.goto(BASE+'/spot/?id=akabane-haunted-bar',wait_until='load'); await pg.wait_for_timeout(1500)
    for i in range(40): await pg.mouse.wheel(0,400); await pg.wait_for_timeout(150)
    await pg.wait_for_timeout(3000)
    print(await pg.evaluate("""()=>{const g=document.querySelector(".ds-grid");let p=g,o=[];while(p){const c=getComputedStyle(p);o.push(p.tagName+"."+String(p.className).slice(0,25)+":"+c.overflow+":"+Math.round(p.getBoundingClientRect().height));p=p.parentElement;}return o}"""));print(await pg.evaluate("""()=>({sy:scrollY,ih:innerHeight,sh:document.documentElement.scrollHeight,bh:document.body.scrollHeight,
      ov:getComputedStyle(document.documentElement).overflow+'/'+getComputedStyle(document.body).overflow,
      st:[...document.querySelectorAll('.rv')].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom),e.isConnected]})})"""))
    await b.close()
asyncio.run(main())
