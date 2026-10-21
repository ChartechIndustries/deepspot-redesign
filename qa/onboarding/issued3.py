import asyncio
from playwright.async_api import async_playwright
BASE='http://localhost:8766'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    ctx=await b.new_context(viewport={'width':1440,'height':900}); pg=await ctx.new_page()
    await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
    await pg.evaluate("""()=>{localStorage.setItem('deepspot-profile-draft-v1',JSON.stringify({name:'Jane Doe',username:'jane.doe',style:'urbex-rat'}));localStorage.setItem('deepspot-onboarded-v1',String(Date.now()));localStorage.setItem('deepspot-passport-style-v1',JSON.stringify({bg:'aurora',foil:'holo'}))}""")
    await pg.goto(BASE+'/profile/?user=preview&welcome=1',wait_until='load')
    await pg.wait_for_selector('.pp-issued',timeout=15000)
    await pg.wait_for_timeout(250); await pg.screenshot(path='issued-a-tilt.png')
    await pg.wait_for_timeout(1350); await pg.screenshot(path='issued-b-stamp.png')
    await b.close()
asyncio.run(main())
