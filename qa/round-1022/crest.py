import sys,asyncio,json,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','onboarding-v2.2'))
import h as OH
from rh import launch,page,BASE,OUT
from playwright.async_api import async_playwright
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
FIX=json.load(open(os.path.join(OUT,'..','onboarding-v2.2','mole_fixture.json')))
SEED="""m=>{try{const k='deepspot-profile-draft-v1';const d=JSON.parse(localStorage.getItem(k)||'{}');d.mole=m;d.avatarMode='mole';d.name='Wayfarer Test';d.username='way.test';d.style='urbex-rat';d.bio='I go looking for abandoned quarries and quiet tunnels.';localStorage.setItem(k,JSON.stringify(d));localStorage.setItem('deepspot-onboarded-v1','1')}catch(e){}}"""
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    for th in ('dark','light'):
      # profile
      for user in ('preview','wayfarer'):
        ctx,pg=await page(b,1440,900,th,scale=4)
        await ctx.add_init_script('('+SEED+')('+json.dumps(FIX)+')')
        await pg.goto(f'{BASE}/profile/?user={user}&theme={th}',wait_until='load'); await pg.wait_for_timeout(2500)
        el=pg.locator('.pp-id9 .pp-id9-crest').first; await el.screenshot(path=f'{OUT}/crest-{tag}-profile-{user}-{th}.png')
        await ctx.close()
      # community
      ctx,pg=await page(b,1440,900,th,scale=4)
      await pg.goto(f'{BASE}/community/?theme={th}',wait_until='load'); await pg.wait_for_selector('.pm',timeout=20000)
      await pg.evaluate("document.querySelector('.pm').scrollIntoView()"); await pg.wait_for_timeout(500)
      await pg.mouse.move(700,450); await pg.wait_for_timeout(300)
      await pg.evaluate("document.querySelector('.pm').click()"); await pg.wait_for_timeout(3500)
      n=await pg.locator('.pm .pp-id9 .pp-id9-crest').count()
      # the centre card
      idx=await pg.evaluate("""()=>{const cs=[...document.querySelectorAll('.pm .pp-id9')];let best=0,bd=1e9;cs.forEach((c,i)=>{const r=c.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-innerWidth/2);if(d<bd){bd=d;best=i}});return best}""")
      await pg.locator('.pm .pp-id9 .pp-id9-crest').nth(idx).screenshot(path=f'{OUT}/crest-{tag}-community-{th}.png')
      await pg.locator('.pm').screenshot(path=f'{OUT}/pm-{tag}-{th}.png')
      print('community cards',n,'centre',idx,pg.errs[:2],flush=True)
      await ctx.close()
    await b.close()
asyncio.run(main())
