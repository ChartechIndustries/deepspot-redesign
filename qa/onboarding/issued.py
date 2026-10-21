import asyncio
from playwright.async_api import async_playwright
BASE='http://localhost:8766'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    ctx=await b.new_context(viewport={'width':1440,'height':900}); pg=await ctx.new_page(); errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
    await pg.evaluate("""()=>{localStorage.setItem('deepspot-profile-draft-v1',JSON.stringify({name:'Jane Doe',username:'jane.doe',bio:'quarries and tunnels.',style:'urbex-rat'}));localStorage.setItem('deepspot-onboarded-v1',String(Date.now()));}""")
    await pg.goto(BASE+'/profile/?user=preview&welcome=1',wait_until='load')
    for t in (900,1500,2600):
      await pg.wait_for_timeout(t if t==900 else 600 if t==1500 else 1100)
      await pg.screenshot(path=f'issued-{t}.png')
      print(t,await pg.evaluate("!!document.querySelector('.pp-issued')"),pg.url)
    await pg.wait_for_timeout(2500); print('after',await pg.evaluate("!!document.querySelector('.pp-issued')"))
    await pg.goto(BASE+'/profile/?user=preview&welcome=1&share=1',wait_until='load'); await pg.wait_for_timeout(2500)
    print('share dialog open',await pg.evaluate("document.querySelector('.pp-share-dialog')?.open"),pg.url)
    # reduced motion: no stamp
    ctx2=await b.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce'); p2=await ctx2.new_page()
    await p2.goto(BASE+'/profile/?user=preview&welcome=1',wait_until='load'); await p2.wait_for_timeout(1500)
    print('reduced motion stamp',await p2.evaluate("!!document.querySelector('.pp-issued')"))
    # onboarding in reduced motion: no animations running
    await p2.goto(BASE+'/welcome/?reset=1',wait_until='load')
    await p2.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'a@b.co'}))")
    await p2.goto(BASE+'/welcome/?step=finish&force=1',wait_until='load'); await p2.wait_for_timeout(1200)
    print('reduced finish anims',await p2.evaluate("document.getAnimations().length"),'conf',await p2.evaluate("getComputedStyle(document.querySelector('.ob-conf')).display"))
    print('errs',errs)
    await b.close()
asyncio.run(main())
