import asyncio
from playwright.async_api import async_playwright
B='https://chartechindustries.github.io/deepspot-redesign'
R=['/','/browse/','/community/','/profile/?user=wayfarer','/profile/?user=preview','/welcome/','/spot/?id=tochigi-underground-quarry']
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for r in R:
      pg=await b.new_page(viewport={"width":1440,"height":900}); errs=[]; bad=[]
      pg.on('pageerror',lambda e,errs=errs: errs.append(str(e)[:120]))
      pg.on('response',lambda q,bad=bad: q.status>=400 and bad.append(f"{q.status} {q.url[-90:]}"))
      await pg.goto(B+r,wait_until="load"); await pg.wait_for_timeout(3500)
      h=await pg.evaluate("document.querySelector('h1,h2')?.textContent?.trim().slice(0,40)")
      print(r,'|',h,'|',errs[:2],bad[:4]); await pg.close()
    await b.close()
asyncio.run(main())
