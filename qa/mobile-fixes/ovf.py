import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
user=sys.argv[1]; w=int(sys.argv[2]); h=int(sys.argv[3])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True,reduced_motion='reduce')
    pg=await ctx.new_page()
    await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
    await pg.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'j@e.com'}))")
    await pg.goto(BASE+f'/profile/?user={user}&theme=dark',wait_until='load'); await pg.wait_for_timeout(2500)
    r=await pg.evaluate("""()=>{const iw=document.documentElement.clientWidth,out=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>iw+1){let p=e,clip=false;while(p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o!=='visible'&&p!==document.documentElement&&p!==document.body){clip=true;break}}if(!clip)out.push(e.tagName+'.'+String(e.className).slice(0,40)+' '+Math.round(r.right))}});return [iw,document.documentElement.scrollWidth,out.slice(0,12)]}""")
    print(r)
    await b.close()
asyncio.run(main())
