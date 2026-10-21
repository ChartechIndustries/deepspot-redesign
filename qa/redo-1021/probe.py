import asyncio, json, sys
from playwright.async_api import async_playwright
JS="""() => {
 const out={};
 const nav=[...document.querySelectorAll('header a, nav a')].filter(a=>/^(browse|map|tours|community)$/i.test(a.textContent.trim()));
 if(nav[0]){const s=getComputedStyle(nav[0]);out.nav={tag:nav[0].className,cls:nav[0].parentElement.className,fs:s.fontSize,fw:s.fontWeight,ff:s.fontFamily.slice(0,40)};}
 const hist={};
 for(const el of document.querySelectorAll('body *')){ if(!el.childNodes.length) continue;
   const t=[...el.childNodes].filter(n=>n.nodeType==3&&n.textContent.trim().length>2).map(n=>n.textContent.trim()).join(' ');
   if(!t) continue; const r=el.getBoundingClientRect(); if(!r.width) continue;
   const fs=Math.round(parseFloat(getComputedStyle(el).fontSize)); hist[fs]=(hist[fs]||0)+t.length;}
 out.hist=hist; out.root=getComputedStyle(document.documentElement).fontSize; out.sw=document.documentElement.scrollWidth;
 return out;}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"]); pg=await b.new_page(viewport={"width":1440,"height":900})
    for path in sys.argv[1:]:
      await pg.goto("http://localhost:8766"+path,wait_until="load"); await pg.wait_for_timeout(2500)
      print(path, json.dumps(await pg.evaluate(JS)))
    await b.close()
asyncio.run(main())
