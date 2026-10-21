import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    pg=await b.new_page(viewport={'width':320,'height':640})
    await pg.goto('http://localhost:8766/profile/?user=preview',wait_until='load'); await pg.wait_for_timeout(2500)
    print('before',await pg.evaluate("document.documentElement.scrollWidth"))
    await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(800)
    print('after',await pg.evaluate("document.documentElement.scrollWidth"))
    print(await pg.evaluate("""()=>{const d=document.querySelector('#pp-editdlg');const o=[];d.querySelectorAll('*').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>321&&r.width>0)o.push(e.tagName+'.'+e.className+' '+Math.round(r.right))});return o.slice(0,15)}"""))
    await b.close()
asyncio.run(main())
