import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    await pg.goto("http://localhost:8766/community/?theme=dark&gate=member",wait_until="load"); await pg.wait_for_timeout(2000)
    await pg.locator('.dc-poll').scroll_into_view_if_needed(); await pg.wait_for_timeout(400)
    await pg.click('.dc-opt[data-opt="1"]'); await pg.wait_for_timeout(1500)
    print(await pg.evaluate("[...document.querySelectorAll('.dc-opt')].map(b=>b.getAttribute('aria-pressed'))"))
    await pg.locator('.dc-poll').screenshot(path="qa/community-v3/poll-voted.png"); await b.close()
asyncio.run(main())
