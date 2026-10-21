import sys, asyncio
from playwright.async_api import async_playwright
# usage: shot.py outdir path1 path2 ...   (1440 dark full page + 390)
out=sys.argv[1]; paths=sys.argv[2:]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-angle=swiftshader"])
        for w,h in ((1440,900),(390,844)):
            for theme in ("dark",):
                pg=await b.new_page(viewport={"width":w,"height":h})
                for path in paths:
                    sep='&' if '?' in path else '?'
                    await pg.goto(f"http://localhost:8766{path}{sep}theme={theme}",wait_until="load")
                    await pg.wait_for_timeout(3000)
                    name=path.strip('/').replace('/','_').replace('?','_').replace('=','-') or 'home'
                    await pg.screenshot(path=f"{out}/{name}-{w}-{theme}.png",full_page=True)
                await pg.close()
        await b.close()
asyncio.run(main())
