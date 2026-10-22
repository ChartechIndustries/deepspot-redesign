"""In-place check of archetype icons: one headless Chromium, below-normal priority.
Run: python qa/archetype-icons/inplace.py
"""
import asyncio, os, pathlib, psutil
from playwright.async_api import async_playwright

OUT = pathlib.Path(__file__).parent / 'inplace'; OUT.mkdir(exist_ok=True)
B = 'http://localhost:8766'
me = psutil.Process()
try: me.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
except Exception: pass


def lower():
    for c in me.children(recursive=True):
        try: c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
        except Exception: pass


INFO = """(sel)=>[...document.querySelectorAll(sel)].slice(0,3).map(el=>{const s=el.querySelector('svg');if(!s)return null;
 const g=s.querySelector('g'),acc=s.querySelector('[fill=currentColor]');const cs=getComputedStyle(g||s);
 return {sel,box:Math.round(s.getBoundingClientRect().width),sw:cs.strokeWidth,stroke:cs.stroke,color:cs.color,accFill:acc?getComputedStyle(acc).fill:null}})"""


async def shot(pg, sel, name, pad=12):
    el = pg.locator(sel).first
    if not await el.count():
        print('MISSING', sel); return
    await el.scroll_into_view_if_needed()
    bb = await el.bounding_box()
    await pg.screenshot(path=str(OUT / f'{name}.png'), clip={'x': max(bb['x'] - pad, 0), 'y': max(bb['y'] - pad, 0), 'width': bb['width'] + pad * 2, 'height': bb['height'] + pad * 2})
    print('shot', name, await pg.evaluate(INFO, sel))


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); lower()
        for theme in ('light', 'dark'):
            ctx = await b.new_context(viewport={'width': 1440, 'height': 1000}, color_scheme=theme)
            await ctx.add_init_script(f"try{{localStorage.setItem('deepspot-theme','{theme}')}}catch{{}}")
            pg = await ctx.new_page(); lower()
            await pg.goto(B + '/profile/?user=wayfarer', wait_until='load'); await pg.wait_for_timeout(2500)
            await pg.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            await pg.screenshot(path=str(OUT / f'profile-{theme}.png'))
            for sel, n in (('.pp-type-mark', 'typebox'), ('.pp-type', 'typecard'), ('.pp-id9-crest', 'crest'), ('.pp-show-type', 'showtype')):
                await shot(pg, sel, f'{n}-{theme}')
            await pg.goto(B + '/profile/?user=preview', wait_until='load'); await pg.wait_for_timeout(2500)
            await pg.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            if await pg.locator('[data-edit]').count():
                await pg.click('[data-edit]'); await pg.wait_for_timeout(900)
                await shot(pg, '.pp-arch-o', f'pick-chip-{theme}', 4)
                for sel in ('.pp-editdlg [role=radiogroup]', '.pp-arch-g', '.pp-arch'):
                    if await pg.locator(sel).count():
                        await shot(pg, sel, f'picker-{theme}'); break
                await shot(pg, '.pp-arch-dm', f'picker-desc-{theme}')
                await pg.screenshot(path=str(OUT / f'edit-{theme}.png'))
            await pg.goto(B + '/community/', wait_until='load'); await pg.wait_for_timeout(3000)
            await pg.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            await shot(pg, '.pm-card', f'community-card-{theme}', 6)
            await pg.screenshot(path=str(OUT / f'community-{theme}.png'))
            await ctx.close()
        await b.close()

asyncio.run(main())
