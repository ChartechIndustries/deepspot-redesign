import sys, asyncio, json
from playwright.async_api import async_playwright
# usage: axe3.py "1440,390" "dark,light" "on,off"
widths=[int(x) for x in sys.argv[1].split(',')]; themes=sys.argv[2].split(','); colors=sys.argv[3].split(',')
JS="""async()=>{document.querySelectorAll('canvas').forEach(c=>c.remove());const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,220))}))}"""
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
          await pg.goto(f"http://localhost:8766/community/?theme={th}",wait_until="load"); await pg.wait_for_timeout(2500)
          await pg.add_script_tag(path="C:/Users/CharD/Desktop/DeepSpot Globe/qa/audit-20261019/axe.min.js")
          v=await asyncio.wait_for(pg.evaluate(JS),180)
          sw=await pg.evaluate("document.documentElement.scrollWidth")
          print(json.dumps({"w":w,"theme":th,"color":col,"sw":sw,"errors":errs[:5],"axe":v}),flush=True)
          await ctx.close()
    await b.close()
asyncio.run(main())
