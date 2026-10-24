import sys,asyncio,io,os
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from PIL import Image,ImageChops,ImageStat
from playwright.async_api import async_playwright
OUTD=os.path.dirname(os.path.abspath(__file__))
SIZES=[(390,844),(820,1180),(1024,1366),(1180,820),(1440,900)]
OLD=open('C:/Users/CharD/Desktop/DeepSpot Globe/backups/before-notes-1023/source/profile/profile.css','rb').read()
async def run(eng,old):
  imgs={}
  async with async_playwright() as p:
    b=await getattr(p,eng).launch()
    for (w,h) in SIZES:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w!=1440,is_mobile=w<800,device_scale_factor=2)
      pg=await ctx.new_page()
      if old: await pg.route('**/profile/profile.css*',lambda r:r.fulfill(body=OLD,content_type='text/css'))
      await pg.goto(BASE+'/profile/?user=wayfarer&theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
      el=pg.locator('.pp-id9 .pp-mole').first
      await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
      im=Image.open(io.BytesIO(await el.screenshot())).convert('RGB').resize((128,128),Image.LANCZOS)
      imgs[w]=im; await ctx.close()
    await b.close()
  ref=imgs[1440]; res={}
  for w,im in imgs.items(): res[w]=round(sum(ImageStat.Stat(ImageChops.difference(im,ref)).mean)/3,2)
  tag=f"{eng}-{'old' if old else 'new'}"
  W=Image.new('RGB',(128*5+40,128),'white')
  for i,(w,im) in enumerate(imgs.items()): W.paste(im,(i*138,0))
  W.save(f'{OUTD}/crop-{tag}.png')
  print(tag,'mean abs diff vs 1440:',res)
async def main():
  for eng in ('webkit','chromium'):
    for old in (True,False): await run(eng,old)
asyncio.run(main())
