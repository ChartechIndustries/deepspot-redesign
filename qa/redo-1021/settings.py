import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto("http://localhost:8766/profile/?user=preview",wait_until="load"); await pg.wait_for_timeout(2500)
    await pg.click('.pp-cog'); await pg.wait_for_timeout(800)
    sec=pg.locator('.pp-set-sec', has_text='traveler type'); await sec.scroll_into_view_if_needed()
    await sec.screenshot(path='after3/settings-types.png'); print('errors',errs)
    await b.close()
asyncio.run(main())
