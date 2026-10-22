import sys; from lib import *
from PIL import Image,ImageChops,ImageStat
IDS=['lampbane','wayfarer','kisekikana','numberone','joelle','annebelle','lanavelkov','s4zr4ty','korrgan','sixbacteria']
async def main():
  tag=sys.argv[1]
  os.makedirs(f'{OUT}/{tag}-pairs',exist_ok=True)
  async with async_playwright() as p:
    b,pg=await page(p,1440,900,'dark')
    await pg.goto(f'{BASE}/community/?theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
    await pg.add_style_tag(content=".pm-item{position:relative!important;left:auto!important;top:auto!important;transform:none!important;opacity:1!important;transition:none!important;width:440px!important;height:668px!important}.pm-deck{position:static!important;width:auto!important;height:auto!important;display:flex!important;flex-wrap:wrap;gap:20px;transform:none!important}.pm-stage{height:auto!important;perspective:none!important}.pm-tilt{filter:none!important}.pm-hero{display:none}")
    await pg.wait_for_timeout(800)
    n=await pg.evaluate("document.querySelectorAll('.pm-item').length")
    hrefs=await pg.evaluate("[...document.querySelectorAll('.pm-link')].map(a=>new URL(a.href).searchParams.get('user'))")
    print(n,hrefs)
    for i,uid in enumerate(hrefs):
      el=(await pg.query_selector_all('.pm-item .pp-id9'))[i]
      await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(250)
      await el.screenshot(path=f'{OUT}/{tag}-pairs/c-{uid}.png')
    errs=list(pg.errs)
    for uid in hrefs:
      await pg.goto(f'{BASE}/profile/?user={uid}&theme=dark',wait_until='load'); await pg.wait_for_timeout(2200)
      await pg.evaluate("document.querySelectorAll('.pp-passobj,#pp-pane-pass').forEach(e=>e.style.zoom=1)"); await pg.wait_for_timeout(300)
      el=await pg.query_selector('.pp-id9'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
      await el.screenshot(path=f'{OUT}/{tag}-pairs/p-{uid}.png')
    await b.close()
  # compose
  W,H=220,334; cols=5
  sheet=Image.new('RGB',(cols*(2*W+30),2*(H+30)),(11,27,39))
  for k,uid in enumerate(hrefs):
    a=Image.open(f'{OUT}/{tag}-pairs/c-{uid}.png').convert('RGB'); c=Image.open(f'{OUT}/{tag}-pairs/p-{uid}.png').convert('RGB')
    if a.size!=c.size: print(uid,'SIZE',a.size,c.size); c=c.resize(a.size)
    diff=ImageChops.difference(a,c); m=sum(ImageStat.Stat(diff).mean)/3; mx=max(ImageStat.Stat(diff).extrema,key=lambda e:e[1])[1]
    print(uid,a.size,'mean diff %.2f max %d'%(m,mx))
    x=(k%cols)*(2*W+30)+8; y=(k//cols)*(H+30)+8
    sheet.paste(a.resize((W,H)),(x,y)); sheet.paste(c.resize((W,H)),(x+W+4,y))
  sheet.save(f'{OUT}/{tag}-contact-sheet.png'); print(errs[:3])
asyncio.run(main())
