import sys, asyncio, json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    for w in [int(x) for x in sys.argv[1].split(',')]:
      pg=await b.new_page(viewport={"width":w,"height":844})
      await pg.goto("http://localhost:8766/community/?theme=dark",wait_until="load"); await pg.wait_for_timeout(2500)
      print(w, await pg.evaluate("({gv:document.querySelectorAll('.gv').length,pm:document.querySelectorAll('.pm').length,dc:document.querySelectorAll('.dc').length,h:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth})"))
    await b.close()
asyncio.run(main())
