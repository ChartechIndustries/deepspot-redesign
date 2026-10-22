"""In-place check part 2: community passport cards, crest with accent icons, onboarding cards.
One headless Chromium, below-normal priority. Run: python qa/archetype-icons/inplace2.py
"""
import asyncio, pathlib, psutil
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

# Put accent icons into the first crests / type marks and report stroke vs accent colour.
PROBE = """async (ids)=>{const m=await import('/site/account-state.mjs?v=icons2');const out=[];
 const hosts=[...document.querySelectorAll('.pp-id9-crest.is-arch,.pp-type-mark,.ob-ac-i,.pp-set-av,.pp-arch-dm')].filter(h=>h.querySelector('svg'));
 hosts.slice(0,6).forEach((h,k)=>{h.innerHTML=m.travelerMark(ids[k%ids.length]);const s=h.querySelector('svg'),g=s.querySelector('g'),a=s.querySelector('[fill=currentColor]');
  out.push({host:h.className,size:Math.round(s.getBoundingClientRect().width),sw:getComputedStyle(g).strokeWidth,stroke:getComputedStyle(g).stroke,accent:a&&getComputedStyle(a).fill});});
 return out;}"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); lower()
        for theme in ('light', 'dark'):
            ctx = await b.new_context(viewport={'width': 1440, 'height': 1000}, color_scheme=theme)
            pg = await ctx.new_page(); lower()
            await pg.goto(B + '/community/', wait_until='load'); await pg.wait_for_timeout(2500)
            await pg.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            for y in range(0, 9000, 900):
                await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(250)
            crest = pg.locator('.pp-id9-crest.is-arch')
            print(theme, 'community arch crests:', await crest.count())
            if await crest.count():
                card = crest.first.locator('xpath=ancestor::*[contains(@class,"pp-idcard")][1]')
                await card.scroll_into_view_if_needed(); await pg.wait_for_timeout(400)
                await card.screenshot(path=str(OUT / f'community-card-{theme}.png'))
                print(await pg.evaluate(PROBE, ['ghost-hunter', 'trailblazer', 'night-goblin', 'pub-crawler']))
                await card.screenshot(path=str(OUT / f'community-card-accent-{theme}.png'))
            await pg.goto(B + '/profile/?user=wayfarer', wait_until='load'); await pg.wait_for_timeout(2500)
            await pg.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            print(await pg.evaluate(PROBE, ['ghost-hunter', 'futurist', 'nomad']))
            card = pg.locator('.pp-idcard').first
            if await card.count():
                await card.screenshot(path=str(OUT / f'profile-card-accent-{theme}.png'))
            await shot_el(pg, '.pp-type', f'typecard-accent-{theme}')
            await pg.goto(B + '/welcome/', wait_until='load'); await pg.wait_for_timeout(2500)
            await pg.evaluate(f"document.documentElement.dataset.theme='{theme}'")
            n = await pg.locator('.ob-ac').count()
            print(theme, 'onboarding cards on load:', n)
            await pg.screenshot(path=str(OUT / f'welcome-{theme}.png'))
            await ctx.close()
        await b.close()


async def shot_el(pg, sel, name):
    el = pg.locator(sel).first
    if await el.count():
        await el.scroll_into_view_if_needed(); await el.screenshot(path=str(OUT / f'{name}.png'))

asyncio.run(main())
