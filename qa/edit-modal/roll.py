import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader']); pg=await b.new_page(viewport={'width':1440,'height':900})
    await pg.goto('http://localhost:8766/profile/?user=preview',wait_until='load'); await pg.wait_for_timeout(2200)
    await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(500)
    await pg.mouse.click(*[int(v) for v in (await pg.evaluate("(()=>{const r=document.querySelector('#pp-edit [data-set-roll]');r.scrollIntoView();const b=r.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2].join(',')})()")).split(',')] if False else (700,500))
    await pg.evaluate("document.querySelector('#pp-edit [data-set-roll]').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    bb=await pg.evaluate("(()=>{const b=document.querySelector('#pp-edit [data-set-roll]').getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]})()")
    await pg.mouse.click(bb[0],bb[1]); await pg.wait_for_timeout(2500)
    print(await pg.evaluate("[document.querySelector('#pp-editdlg').open,[...document.querySelectorAll('[class*=mole]')].filter(e=>e.getBoundingClientRect().width>300).map(e=>e.className).slice(0,4)]"))
    await pg.screenshot(path='roll.png'); await b.close()
asyncio.run(main())
