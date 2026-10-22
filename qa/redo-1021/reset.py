import asyncio
from playwright.async_api import async_playwright
B='https://chartechindustries.github.io/deepspot-redesign'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":390,"height":844})
    await pg.goto(B+'/welcome/'); await pg.evaluate("localStorage.setItem('deepspot-onboarded-v1',String(Date.now()))")
    await pg.goto(B+'/welcome/'); await pg.wait_for_timeout(2500); print('finished user ->',pg.url)
    await pg.goto(B+'/welcome/?reset=1'); await pg.wait_for_timeout(2500)
    print('reset ->',pg.url,'|',await pg.evaluate("document.querySelector('h1,h2')?.textContent"))
    await b.close()
asyncio.run(main())
