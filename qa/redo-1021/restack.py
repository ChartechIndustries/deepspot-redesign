import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto("http://localhost:8766/community/",wait_until="load"); await pg.wait_for_timeout(2000)
    st=lambda: pg.evaluate("document.querySelector('.pm').className")
    print('top    ',await st())
    await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1800)
    print('in view',await st()); await pg.screenshot(path='after3/restack-open.png')
    await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(2000)
    print('away   ',await st())
    await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1800)
    await pg.evaluate("window.scrollBy(0,520)"); await pg.wait_for_timeout(400)
    box=await pg.locator('.pm').bounding_box(); await pg.mouse.move(box['x']+300,box['y']+box['height']-40); await pg.wait_for_timeout(1500)
    print('hover, partly off',await st())
    await pg.mouse.move(700,880); await pg.evaluate("window.scrollBy(0,900)"); await pg.wait_for_timeout(1800)
    print('leave+away',await st())
    await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await pg.evaluate("window.scrollBy(0,1200)"); await pg.wait_for_timeout(300); await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1800)
    print('quick out/in',await st()); await pg.screenshot(path='after3/restack-again.png')
    print('errors',errs); await b.close()
asyncio.run(main())
