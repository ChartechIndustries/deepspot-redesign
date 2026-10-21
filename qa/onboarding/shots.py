"""Walks the whole onboarding and screenshots every step. Usage: python shots.py [only-config-name]"""
import asyncio,sys,os
from playwright.async_api import async_playwright
BASE='http://localhost:8766'
OUT=os.path.dirname(os.path.abspath(__file__))
AXE='C:/Users/CharD/Desktop/DeepSpot Globe/qa/passport-v3/axe.min.js'
CONFIGS=[  # name, w, h, theme, color
 ('d1440',1440,900,'dark','on'),
 ('l1440',1440,900,'light','on'),
 ('d1440off',1440,900,'dark','off'),
 ('l1440off',1440,900,'light','off'),
 ('d390',390,844,'dark','on'),
 ('l390',390,844,'light','on'),
 ('d390off',390,844,'dark','off'),
 ('d320',320,640,'dark','on'),
 ('d1920',1920,1080,'dark','on'),
 ('d768',768,1024,'dark','on'),
 ('d1024',1024,720,'dark','on'),
]
async def js_click(pg,sel):
  await pg.evaluate("s=>document.querySelector(s).click()",sel)
async def mouse_click(pg,sel):
  box=await pg.evaluate("""s=>{const e=document.querySelector(s);e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}""",sel)
  await pg.wait_for_timeout(120)
  box=await pg.evaluate("""s=>{const e=document.querySelector(s);const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}""",sel)
  await pg.mouse.click(box[0],box[1])
async def draw(pg):
  box=await pg.evaluate("""()=>{const e=document.querySelector('#pp-pad canvas');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}""")
  await pg.wait_for_timeout(150)
  box=await pg.evaluate("""()=>{const r=document.querySelector('#pp-pad canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]}""")
  x,y,w,h=box
  import math
  pts=[(x+w*(.08+.84*t/60),y+h*(.55+.28*math.sin(t/60*9)*(1-t/90))) for t in range(61)]
  await pg.mouse.move(*pts[0]); await pg.mouse.down()
  for p in pts[1:]: await pg.mouse.move(*p)
  await pg.mouse.up()
  await pg.mouse.move(x+w*.2,y+h*.2); await pg.mouse.down()
  for t in range(20): await pg.mouse.move(x+w*(.2+.5*t/20),y+h*(.2+.1*math.sin(t)))
  await pg.mouse.up()
async def next_(pg):
  await js_click(pg,'.ob-go')
  await pg.wait_for_timeout(900)
async def run(b,name,w,h,theme,color,full_axe=True):
  res={}
  try:
    return await run2(b,name,w,h,theme,color,full_axe,res)
  except Exception as e:
    res['CRASH']=str(e)[:300]; return res
async def run2(b,name,w,h,theme,color,full_axe,res):
  ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page(); errs=[]; bad=[]
  pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
  pg.on('requestfailed',lambda r: bad.append(r.url) if ('googleapis' not in r.url and 'gstatic' not in r.url and 'ERR_ABORTED' not in (r.failure or '')) else None)
  await pg.goto(BASE+'/welcome/?reset=1&theme='+theme,wait_until='load')
  await pg.evaluate("c=>{localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'jane@example.com'}));document.documentElement.dataset.panelColor=c;}",color)
  await pg.goto(BASE+'/welcome/?theme='+theme+('&x=1' if color=='on' else ''),wait_until='load'); await pg.wait_for_timeout(1400)
  if color=='off': await pg.evaluate("document.documentElement.dataset.panelColor='off'")
  async def shot(tag,axe=False,scroll=0):
    if scroll and w<1000: await pg.evaluate('y=>window.scrollTo(0,y)',scroll)
    await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{OUT}/{name}-{tag}.png')
    ov=await pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
    if ov[0]!=ov[1]: res.setdefault('overflow',[]).append((tag,ov))
    if axe:
      await pg.add_script_tag(path=AXE)
      r=await pg.evaluate("axe.run(document.querySelector('main'),{resultTypes:['violations']}).then(r=>r.violations.map(v=>[v.id,v.nodes.length,v.nodes[0].target.join(' '),v.nodes[0].failureSummary.slice(0,160)]))")
      res.setdefault('axe',{})[tag]=r
  # 1 account
  await shot('1-account',axe=full_axe)
  await pg.fill('#ob-pw','Abcdefg123!'); await js_click(pg,'#ob-terms'); await pg.wait_for_timeout(200)
  await shot('1b-account-filled'); await shot('1c-account-scrolled',scroll=420)
  await next_(pg)
  # 2 name
  await pg.fill('#ob-name','Jane Doe'); await pg.wait_for_timeout(300)
  await js_click(pg,'#ob-sug .ob-chip'); await pg.wait_for_timeout(500)
  await shot('2-name',axe=full_axe); await shot('2c-name-scrolled',scroll=330)
  await next_(pg)
  # 3 mole
  await shot('3-mole-empty',axe=full_axe)
  await js_click(pg,'[data-roll]')
  try:
    await pg.wait_for_selector('.mr-primary',state='visible',timeout=60000)
    await pg.wait_for_function("()=>['reveal','done'].includes(document.querySelector('.mr')?.dataset.phase)",timeout=90000)
    await pg.wait_for_timeout(1500)
    await pg.screenshot(path=f'{OUT}/{name}-3b-reveal.png')
    await js_click(pg,'.mr [data-act=keep]')
    await pg.wait_for_selector('.mr',state='detached',timeout=20000)
  except Exception as e: res['mole_err']=str(e)[:200]
  await pg.wait_for_timeout(900)
  await shot('3c-mole-kept')
  await next_(pg)
  # 4 archetype
  await pg.wait_for_timeout(300)
  await shot('4-archetype-empty',axe=full_axe)
  await js_click(pg,'#ob-at-3'); await pg.wait_for_timeout(300)
  await js_click(pg,'.ob-ag:not([hidden]) .ob-ac input'); await pg.wait_for_timeout(700)
  await shot('4b-archetype-picked'); await shot('4c-archetype-scrolled',scroll=380)
  await next_(pg)
  # 5 bio
  await js_click(pg,'.ob-chip[data-p]'); await pg.keyboard.type('quarries, tunnels and anything half-underground.'); await pg.wait_for_timeout(500)
  await shot('5-bio',axe=full_axe)
  await next_(pg)
  # 6 mark
  await pg.wait_for_timeout(300)
  await shot('6-mark-empty',axe=full_axe)
  await draw(pg); await pg.wait_for_timeout(300)
  await shot('6b-mark-drawn')
  await next_(pg)
  # 7 style
  await js_click(pg,'[name=cz-bg][value=aurora]'); await js_click(pg,'[name=cz-foil][value=holo]'); await js_click(pg,'[name=pp-look-bg][value=cobalt]'); await pg.wait_for_timeout(900)
  await shot('7-style',axe=full_axe); await shot('7c-style-scrolled',scroll=420)
  await next_(pg)
  # 8 places
  await shot('8-places-empty',axe=full_axe)
  await pg.fill('#ob-pl-in','quarry'); await pg.wait_for_timeout(300)
  await shot('8b-places-search')
  await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(200)
  await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
  await pg.fill('#ob-pl-in','Lisbon'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
  await js_click(pg,'.ob-spot'); await pg.wait_for_timeout(300)
  await shot('8c-places-added'); await shot('8d-places-scrolled',scroll=520)
  await next_(pg)
  await pg.wait_for_timeout(1800)
  await shot('9-finish',axe=full_axe)
  res['errs']=errs; res['failed']=bad
  await ctx.close()
  return res
async def main():
  only=sys.argv[1:]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    for (name,w,h,theme,color) in CONFIGS:
      if only and name not in only: continue
      r=await run(b,name,w,h,theme,color,full_axe=(name in ('d1440','l1440','d390')))
      print(name,r)
    await b.close()
if __name__=='__main__': asyncio.run(main())
