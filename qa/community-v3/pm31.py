import sys, asyncio, json
from playwright.async_api import async_playwright
# usage: pm31.py outdir w theme color [deck]
out=sys.argv[1]; w=int(sys.argv[2]); th=sys.argv[3]; col=sys.argv[4]; deck=len(sys.argv)>5 and sys.argv[5]=='deck'
STUB="window.IntersectionObserver=class{observe(){}disconnect(){}unobserve(){}};" if deck else ""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx=await b.new_context(viewport={"width":w,"height":900})
    await ctx.add_init_script(STUB+f"try{{localStorage.setItem('deepspot-panel-colors','{col}');localStorage.setItem('deepspot-theme','{th}')}}catch(e){{}}")
    pg=await ctx.new_page(); errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:8766/community/?theme={th}",wait_until="load"); await pg.wait_for_timeout(2500)
    await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})")
    await pg.wait_for_timeout(2600)
    sec=pg.locator('.pm')
    name=f"{out}/pm-{w}-{th}-{col}-{'deck' if deck else 'open'}"
    await pg.screenshot(path=name+"-view.png")
    await sec.screenshot(path=name+".png")
    info=await pg.evaluate("()=>{const r=document.querySelector('.pm').getBoundingClientRect();return {h:Math.round(r.height),sw:document.documentElement.scrollWidth,cls:document.querySelector('.pm').className}}")
    print(json.dumps({**info,"errors":errs[:5]}))
    await b.close()
asyncio.run(main())
