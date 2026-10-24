import sys,asyncio,json
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
import os
ENG=os.environ.get("ENG","chromium")
SIZES=[(390,844),(820,1180),(1024,1366),(1180,820),(1440,900)]
JS="""()=>{const out={};
const q=(n,sel)=>{const m=document.querySelector(sel);if(!m)return;const b=m.getBoundingClientRect(),i=m.querySelector('img');if(!i)return;const r=i.getBoundingClientRect();out[n]={box:[Math.round(b.width),Math.round(b.height)],ix:+((r.left-b.left)/b.width).toFixed(3),iy:+((r.top-b.top)/b.height).toFixed(3),iw:+(r.width/b.width).toFixed(3)}};
q('card','.pp-id9 .pp-mole');q('mini','.pp-mole-mini');q('av','.pp-set-av');q('ds-av','.ds-av');return out}"""
async def main(user):
  async with async_playwright() as p:
    b=await getattr(p,ENG).launch()
    for (w,h) in SIZES:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w!=1440,is_mobile=w<800,device_scale_factor=1)
      pg=await ctx.new_page()
      await pg.goto(BASE+'/profile/?user='+user+'&theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
      print(w,h,json.dumps(await pg.evaluate(JS)))
      await ctx.close()
    await b.close()
asyncio.run(main(sys.argv[1] if len(sys.argv)>1 else 'wayfarer'))
