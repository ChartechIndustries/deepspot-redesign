import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for css in ['','/profile/profile.css','/site/passport-mini.css']:
      pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page()
      await pg.goto('http://localhost:8770/',wait_until='load'); await pg.wait_for_timeout(2000)
      if css: await pg.add_style_tag(url='http://localhost:8770'+css); await pg.wait_for_timeout(800)
      print(css or 'none',await pg.evaluate("""()=>{const c=document.querySelector('deepspot-community');const cs=getComputedStyle(c);return [Math.round(c.getBoundingClientRect().width),cs.display,cs.gridColumn,cs.width]}"""))
    await b.close()
asyncio.run(main())
