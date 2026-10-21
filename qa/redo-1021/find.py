import asyncio, sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    await pg.goto("http://localhost:8766"+sys.argv[1],wait_until="load"); await pg.wait_for_timeout(2500)
    el=pg.locator(sys.argv[2]).first; await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(1200)
    await el.screenshot(path=sys.argv[3]); await b.close()
asyncio.run(main())
