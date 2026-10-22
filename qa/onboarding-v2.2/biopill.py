import asyncio, psutil
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":390,"height":844})
    await pg.goto("http://localhost:8766/welcome/?reset=1"); await pg.wait_for_timeout(1500)
    # jump straight to the card screen with a prepared session
    await pg.evaluate("""()=>{localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'a@b.co'}));
      const k='deepspot-onboarding-v1';const v={};v.step=1;localStorage.setItem(k,JSON.stringify(v));}""")
    await pg.goto("http://localhost:8766/welcome/"); await pg.wait_for_timeout(2500)
    el=pg.locator('.ob-s-bio').first
    if await el.count(): await el.screenshot(path='_biopill.png'); print('ok')
    else: await pg.screenshot(path='_biopill.png'); print('no bio slot; full shot')
    await b.close()
asyncio.run(main())
