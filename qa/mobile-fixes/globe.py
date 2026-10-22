import sys,asyncio
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
tag=sys.argv[1] if len(sys.argv)>1 else 'r1'
USERS=sys.argv[2].split(',') if len(sys.argv)>2 else ['preview']
WH=[tuple(map(int,x.split('x'))) for x in (sys.argv[3].split(',') if len(sys.argv)>3 else ['390x844','360x740','320x568','1440x900'])]
RM=bool(os.environ.get('RM'))
SEED=json.dumps([{'type':'spot','id':'/blog/tottori-fertility-shrines'},{'type':'spot','id':'/blog/cryptid-shrine-in-gifu'},{'type':'spot','id':'/blog/gunma-plum-country-farm-cave'},{'type':'place','name':'Lisbon, old town at dawn'}])
PROBE="""()=>{const q=s=>document.querySelector(s),r=e=>{if(!e)return null;const x=e.getBoundingClientRect();return [Math.round(x.left),Math.round(x.top),Math.round(x.width),Math.round(x.height)]};
const cv=q('.wg-canvas');let px=null;if(cv){const g=document.createElement('canvas');}
return {wg:r(q('#wg')),cv:r(cv),cvwh:cv?[cv.width,cv.height]:null,wrap:r(q('.wg-wrap')),side:r(q('.wg-side')),pins:document.querySelectorAll('.wg-pin').length,vis:q('#pp-vp-wtg')&&!q('#pp-vp-wtg').hidden,sw:document.documentElement.scrollWidth,iw:innerWidth,nogl:!!q('.wg-nogl')}}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    for user in USERS:
     for w,h in WH:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800,device_scale_factor=1,reduced_motion=('reduce' if RM else 'no-preference'))
      pg=await ctx.new_page(); errs=[]
      pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
      await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
      await pg.evaluate("s=>{localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'jane@example.com'}));localStorage.setItem('deepspot-want-to-go-v1',s)}",SEED)
      await pg.goto(BASE+f'/profile/?user={user}&theme=dark',wait_until='load'); await pg.wait_for_timeout(1500)
      if user=='preview':
        try: await pg.wait_for_function("document.querySelectorAll('.wg-pin').length>0",timeout=30000)
        except Exception as e: print('no pins')
      info=await pg.evaluate(PROBE)
      print(user,w,info,errs[:3])
      if user=='preview':
        import hashlib
        box=await pg.evaluate("(()=>{const r=document.querySelector('.wg-canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
        await pg.evaluate("document.querySelector('.wg').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
        box=await pg.evaluate("(()=>{const r=document.querySelector('.wg-canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
        clip={'x':box[0],'y':box[1],'width':box[2],'height':box[3]}
        async def sig(): return hashlib.md5(await pg.screenshot(clip=clip,timeout=180000)).hexdigest()
        a=await sig(); await pg.wait_for_timeout(300)
        cx,cy=box[0]+box[2]/2,box[1]+box[3]/2
        await pg.mouse.move(cx,cy); await pg.mouse.down(); await pg.mouse.move(cx+90,cy,steps=6); await pg.mouse.up(); await pg.wait_for_timeout(500)
        b2=await sig()
        await pg.evaluate("document.querySelector('.wg-zoom [data-z=\"1\"]').click()"); await pg.wait_for_timeout(900)
        c2=await sig()
        pop=await pg.evaluate("(()=>{const p=document.querySelector('#wg-pop');return p&&!p.hidden?p.textContent.trim().slice(0,40):null})()")
        print(w,'drag changed',a!=b2,'zoom changed',b2!=c2,'popup',pop)
      await pg.evaluate("document.querySelector('.pp-tabsec').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(600)
      await pg.screenshot(path=f'{O}/{tag}-globe-{user}-{w}.png',timeout=180000)
      await ctx.close()
    await b.close()
asyncio.run(main())
