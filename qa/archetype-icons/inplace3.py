"""Onboarding archetype cards in place. One headless Chromium, below-normal priority."""
import asyncio, pathlib, psutil
from playwright.async_api import async_playwright
OUT = pathlib.Path(__file__).parent / 'inplace'
me = psutil.Process(); me.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for c in me.children(recursive=True):
            try: c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
            except Exception: pass
        for theme in ('light', 'dark'):
            ctx = await b.new_context(viewport={'width': 1440, 'height': 1000}, color_scheme=theme)
            pg = await ctx.new_page()
            await pg.goto(f'http://localhost:8766/welcome/?step=passport&theme={theme}', wait_until='load'); await pg.wait_for_timeout(2500)
            n = await pg.locator('.ob-arch').count(); print(theme, 'ob-arch', n)
            if n:
                el = pg.locator('.ob-arch').first; await el.scroll_into_view_if_needed(); await el.screenshot(path=str(OUT / f'onboarding-cards-{theme}.png'))
                print(await pg.evaluate("""[...document.querySelectorAll('.ob-ac-i svg')].slice(0,2).map(s=>{const g=s.querySelector('g');return [Math.round(s.getBoundingClientRect().width),getComputedStyle(g).strokeWidth,getComputedStyle(g).stroke]})"""))
            else:
                await pg.screenshot(path=str(OUT / f'welcome-{theme}.png'))
            await ctx.close()
        await b.close()

asyncio.run(main())
