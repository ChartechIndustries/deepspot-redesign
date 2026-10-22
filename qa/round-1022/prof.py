import sys,asyncio,json,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from rh import *
from playwright.async_api import async_playwright
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
FIX=json.load(open(os.path.join(OUT,'..','onboarding-v2.2','mole_fixture.json')))
SEED="""m=>{try{const k='deepspot-profile-draft-v1';const d=JSON.parse(localStorage.getItem(k)||'{}');d.mole=m;d.avatarMode='mole';d.name=d.name||'Wayfarer Test';d.handle=d.handle||'way.test';d.bio='I go looking for abandoned quarries and quiet tunnels.';localStorage.setItem(k,JSON.stringify(d));localStorage.setItem('deepspot-onboarded-v1','1')}catch(e){}}"""
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for w,h,th in ((1440,900,'dark'),(1440,900,'light'),(390,844,'dark'),(390,844,'light')):
      for user in ('preview','wayfarer'):
        ctx,pg=await page(b,w,h,th)
        await ctx.add_init_script('('+SEED+')('+json.dumps(FIX)+')')
        await pg.goto(f'{BASE}/profile/?user={user}&theme={th}',wait_until='load'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=f'{OUT}/prof-{tag}-{user}-{w}-{th}.png',full_page=(w<800))
        sw=await pg.evaluate("document.documentElement.scrollWidth")
        card=pg.locator('.pp-id9').first
        if await card.count():
          await card.scroll_into_view_if_needed(); await pg.wait_for_timeout(500); await card.screenshot(path=f'{OUT}/card-{tag}-{user}-{w}-{th}.png')
        ax=await axe(pg)
        print(user,w,th,'sw',sw,pg.errs[:3],'axe',ax,flush=True)
        await ctx.close()
    await b.close()
asyncio.run(main())
