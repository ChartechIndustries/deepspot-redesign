import sys, asyncio, json
from playwright.async_api import async_playwright
JS="""()=>{const W=document.documentElement.clientWidth;const o=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.right>W+1&&r.width>0){o.push(e.tagName+'.'+(e.className&&e.className.baseVal===undefined?e.className:'')+' '+Math.round(r.left)+'-'+Math.round(r.right));}}return {sw:document.documentElement.scrollWidth,W,o:o.slice(0,25)}}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    for w in [int(x) for x in sys.argv[2:]]:
      pg=await b.new_page(viewport={"width":w,"height":900})
      await pg.goto("http://localhost:8766"+sys.argv[1],wait_until="load"); await pg.wait_for_timeout(2500)
      print(w, json.dumps(await pg.evaluate(JS))[:1500])
    await b.close()
asyncio.run(main())
