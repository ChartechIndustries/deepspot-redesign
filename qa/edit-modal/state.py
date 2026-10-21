import asyncio,sys
from playwright.async_api import async_playwright
OUT='C:/Users/CharD/Desktop/DeepSpot Globe/qa/edit-modal/'
async def main():
  w,h,theme,name=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3],sys.argv[4]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    pg=await b.new_page(viewport={'width':w,'height':h})
    await pg.goto('http://localhost:8766/profile/?user=preview'+('&theme=light' if theme=='light' else ''),wait_until='load'); await pg.wait_for_timeout(2500)
    await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(700)
    await pg.fill('#pp-edit [name=name]','Marguerite Okonkwo'); await pg.fill('#pp-edit [name=username]','margo_wanders'); await pg.fill('#pp-edit [name=bio]','Abandoned hotels, drained pools and strange little museums. I go where the map goes quiet.')
    await pg.evaluate("""()=>{const q=s=>document.querySelector(s);q('[name=pp-arch][value=pirate]').click();q('[name=pp-look-bg][value=cobalt]').click();q('[name=pp-look-font][value=serif]').click();q('[name=cz-bg][value=aurora]').click();q('[name=cz-foil][value=gold]').click();}""")
    await pg.wait_for_timeout(500)
    for i,sec in enumerate(['who','arch','look','style','mark']):
      await pg.evaluate("""(id)=>{const t=document.getElementById('ed-s-'+id),r=document.querySelector('.ed-right'),m=document.querySelector('.ed-main');const sc=getComputedStyle(r).display==='contents'?m:r;sc.scrollTop+=t.getBoundingClientRect().top-sc.getBoundingClientRect().top-90;}""",sec)
      await pg.wait_for_timeout(300); await pg.screenshot(path=f'{OUT}{name}-{sec}.png')
    await b.close()
asyncio.run(main())
