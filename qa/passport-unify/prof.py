import sys; from lib import *
# usage: prof.py tag user w h [theme]
async def main():
  tag,user,w,h=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]); th=sys.argv[5] if len(sys.argv)>5 else 'dark'
  async with async_playwright() as p:
    b,pg=await page(p,w,h,th,seed_js() if user=='preview' else None)
    await pg.goto(f'{BASE}/profile/?user={user}&theme={th}',wait_until='load'); await pg.wait_for_timeout(2800)
    await pg.screenshot(path=f'{OUT}/{tag}-{user}-{w}.png')
    info=await pg.evaluate("()=>({sw:document.documentElement.scrollWidth,iw:innerWidth})")
    print(user,w,info,pg.errs[:3])
    # card crop
    el=await pg.query_selector('.pp-id9')
    if el:
      await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(300); await el.screenshot(path=f'{OUT}/{tag}-{user}-{w}-card.png')
    await b.close()
asyncio.run(main())
