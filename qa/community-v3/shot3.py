import sys, asyncio, json
from playwright.async_api import async_playwright
# usage: shot3.py outdir "w1,w2" "dark,light" "on,off" [path] [--axe] [--sections]
out=sys.argv[1]; widths=[int(x) for x in sys.argv[2].split(',')]; themes=sys.argv[3].split(','); colors=sys.argv[4].split(',')
path=sys.argv[5] if len(sys.argv)>5 and not sys.argv[5].startswith('--') else '/community/'
AXE='--axe' in sys.argv; SEC='--sections' in sys.argv
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    for w in widths:
      for th in themes:
        for col in colors:
          ctx=await b.new_context(viewport={"width":w,"height":900})
          await ctx.add_init_script(f"try{{localStorage.setItem('deepspot-panel-colors','{col}');localStorage.setItem('deepspot-theme','{th}')}}catch(e){{}}")
          pg=await ctx.new_page(); errs=[]
          pg.on('console',lambda m,errs=errs: errs.append(m.text) if m.type=='error' else None)
          pg.on('pageerror',lambda e,errs=errs: errs.append(str(e)))
          await pg.goto(f"http://localhost:8766{path}?theme={th}",wait_until="load"); await pg.wait_for_timeout(1500)
          H=await pg.evaluate("document.documentElement.scrollHeight")
          y=0
          while y<H:
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(450); y+=500
          await pg.wait_for_timeout(1500); await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(500)
          sw=await pg.evaluate("document.documentElement.scrollWidth")
          name=f"c-{w}-{th}-{col}"
          await pg.screenshot(path=f"{out}/{name}.png",full_page=True)
          if SEC:
            for sel,nm in (('.gv','hero'),('.pm','pm'),('.dc','dc'),('.vm','vm')):
              el=pg.locator(sel).first
              if await el.count():
                await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(700)
                await el.screenshot(path=f"{out}/{name}-{nm}.png")
          res={"w":w,"theme":th,"color":col,"scrollWidth":sw,"errors":errs[:5]}
          if AXE:
            await pg.add_script_tag(path="C:/Users/CharD/Desktop/DeepSpot Globe/qa/audit-20261019/axe.min.js")
            v=await pg.evaluate("""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,200))}))}""")
            res["axe"]=v
          print(json.dumps(res),flush=True)
          await ctx.close()
    await b.close()
asyncio.run(main())
