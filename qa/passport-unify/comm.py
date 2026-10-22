import sys; from lib import *
# usage: comm.py tag w h [deck|open] [theme]
async def main():
  tag,w,h=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]); mode=sys.argv[4] if len(sys.argv)>4 else 'open'; th=sys.argv[5] if len(sys.argv)>5 else 'dark'
  stub="window.IntersectionObserver=class{observe(){}disconnect(){}unobserve(){}};" if mode=='deck' else ''
  async with async_playwright() as p:
    b,pg=await page(p,w,h,th,stub)
    await pg.goto(f'{BASE}/community/?theme={th}',wait_until='load'); await pg.wait_for_timeout(2500)
    await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})")
    await pg.wait_for_timeout(2800)
    await pg.screenshot(path=f'{OUT}/{tag}-comm-{mode}-{w}.png')
    info=await pg.evaluate("()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,cls:document.querySelector('.pm').className,h:Math.round(document.querySelector('.pm').getBoundingClientRect().height)})")
    print(info,pg.errs[:4])
    await b.close()
asyncio.run(main())
