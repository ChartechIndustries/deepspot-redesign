import sys; from lib import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); tag=sys.argv[3]
  async with async_playwright() as p:
    b,pg=await page(p,w,h,'dark',seed_js())
    await pg.goto(f'{BASE}/profile/?user=preview&theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
    await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/{tag}-edit-{w}-1.png')
    await pg.evaluate("""()=>{const q=s=>document.querySelector(s);q('[name=pp-arch][value=pirate]').click();q('[name=cz-foil][value=gold]').click();}""")
    await pg.fill('#pp-edit [name=bio]','Chasing coastlines and wrecks. Always one more cove. Ask me about the lighthouse trick and the tide tables I never trust.')
    await pg.fill('#pp-edit [name=name]','Cove Hunter')
    await pg.wait_for_timeout(700)
    await pg.screenshot(path=f'{OUT}/{tag}-edit-{w}-2.png')
    st=await pg.evaluate("[document.querySelector('.ed-pobj .pp-id9').dataset.g,document.querySelector('.ed-pobj .pp-id9-stamp b').textContent,document.querySelector('.ed-pobj .pp-id9-bio-t p').textContent.slice(0,20),document.querySelector('.ed-pobj .pp-rows dd').textContent]")
    print('preview',st)
    await pg.click('.ed-save'); await pg.wait_for_timeout(1500)
    st=await pg.evaluate("[document.querySelector('.pp-id9').dataset.g,document.querySelector('.pp-id9-stamp b').textContent,document.querySelector('.pp-id9-bio-t p').textContent.slice(0,20),document.querySelector('.pp-bio-name').textContent,JSON.parse(localStorage.getItem('deepspot-profile-draft-v1')).style]")
    print('saved',st)
    await pg.screenshot(path=f'{OUT}/{tag}-edit-{w}-3-saved.png')
    print(pg.errs[:3]); await b.close()
asyncio.run(main())
