import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
port=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page()
    await pg.goto(f'http://localhost:{port}/',wait_until='load'); await pg.wait_for_timeout(2500)
    await pg.evaluate("scrollTo(0,2900)"); await pg.wait_for_timeout(1200)
    print(port,await pg.evaluate("""()=>{const c=document.querySelector("deepspot-community");return c?Math.round(c.getBoundingClientRect().width):-1}"""))
    await b.close()
asyncio.run(main())
