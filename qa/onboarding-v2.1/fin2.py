import asyncio
from playwright.async_api import async_playwright
from h import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx,pg=await newpage(b,390,844,'light','off')
    await to_b(pg); await pg.evaluate("document.activeElement.blur()"); await pg.wait_for_timeout(400)
    await pg.screenshot(path=f'{OUT}/off-l390-B-empty.png')
    await do_mole(pg); await do_name(pg); await do_arch(pg); await do_bio(pg); await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{OUT}/off-l390-B-part.png')
    await ctx.close()
    ctx=await b.new_context(viewport={'width':1440,'height':900},device_scale_factor=2); pg=await ctx.new_page()
    await pg.goto(BASE+'/welcome/?reset=1&theme=light',wait_until='load')
    await pg.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'a@b.co'}))")
    await pg.goto(BASE+'/welcome/?theme=light',wait_until='load'); await pg.wait_for_selector('#ob-form'); await to_b(pg)
    await do_mole(pg); await do_name(pg); await do_arch(pg); await do_bio(pg); await pg.evaluate("document.activeElement.blur()"); await pg.wait_for_timeout(600)
    el=await pg.query_selector('.ob-front'); await el.screenshot(path=f'{OUT}/emb-after-onboarding.png')
    await b.close()
asyncio.run(main())
