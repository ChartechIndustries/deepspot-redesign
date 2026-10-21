import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader']); pg=await b.new_page(viewport={'width':1440,'height':900})
    await pg.goto('http://localhost:8766/profile/?user=preview',wait_until='load'); await pg.wait_for_timeout(2200)
    await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(600)
    print(await pg.evaluate("""()=>{const o={};document.querySelectorAll('#pp-editdlg *').forEach(e=>{if(e.closest('.ed-pobj'))return;const t=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!t)return;const cs=getComputedStyle(e),f=parseFloat(cs.fontSize);if(f<14){const k=f+' '+cs.fontFamily.slice(0,20)+' '+e.className;o[k]=(o[k]||0)+1}});return o}"""))
    await b.close()
asyncio.run(main())
