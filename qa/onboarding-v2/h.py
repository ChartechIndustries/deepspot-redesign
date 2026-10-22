"""Shared helpers for the onboarding v2 QA scripts."""
import asyncio,json,os
BASE='http://localhost:8766'
OUT=os.path.dirname(os.path.abspath(__file__))
AXE='C:/Users/CharD/Desktop/DeepSpot Globe/qa/passport-v3/axe.min.js'
PW='Abcdefg123!'
async def js_click(pg,sel):
  await pg.evaluate("s=>document.querySelector(s).click()",sel)
async def newpage(b,w,h,theme='dark',color='on',touch=None):
  ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=bool(touch if touch is not None else w<800),is_mobile=bool(touch if touch is not None else w<800),device_scale_factor=1)
  pg=await ctx.new_page(); pg.errs=[]; pg.posts=[]
  pg.on('console',lambda m: pg.errs.append(m.text) if m.type=='error' else None)
  pg.on('pageerror',lambda e: pg.errs.append(str(e)))
  pg.on('request',lambda r: pg.posts.append((r.url,r.post_data)) if r.method!='GET' else None)
  await pg.goto(BASE+'/welcome/?reset=1&theme='+theme,wait_until='load')
  await pg.evaluate("c=>{localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'jane@example.com'}));document.documentElement.dataset.panelColor=c;try{localStorage.setItem('deepspot-panel-color',c)}catch(e){}}",color)
  await pg.goto(BASE+'/welcome/?theme='+theme,wait_until='load'); await pg.wait_for_selector('#ob-form,.ob-stage',timeout=20000); await pg.wait_for_timeout(500)
  if color=='off': await pg.evaluate("document.documentElement.dataset.panelColor='off'")
  return ctx,pg
async def fill_account(pg):
  await pg.fill('#ob-pw',PW); await js_click(pg,'#ob-terms')
async def to_b(pg,wait=2600):
  await fill_account(pg); await js_click(pg,'#ob-form .ob-go')
  await pg.wait_for_selector('.ob-stage',state='visible',timeout=5000)
  await pg.wait_for_function("()=>!document.querySelector('.ob-b').classList.contains('is-issuing')",timeout=8000)
  await pg.wait_for_timeout(300)
async def slot(pg,id,i=0):
  await pg.evaluate("([id,i])=>document.querySelectorAll('.ob-b [data-slot=\"'+id+'\"]')[i].click()",[id,i]); await pg.wait_for_selector('.ob-sheet.is-open',timeout=3000); await pg.wait_for_timeout(450)
async def close_sheet(pg,kind='done'):
  await js_click(pg,'.ob-sh-done' if kind=='done' else '.ob-sh-x'); await pg.wait_for_selector('.ob-layer',state='hidden',timeout=3000); await pg.wait_for_timeout(300)
async def noscroll(pg):
  return await pg.evaluate("({sh:document.documentElement.scrollHeight,ih:innerHeight,sw:document.documentElement.scrollWidth,iw:innerWidth,bh:document.body.scrollHeight})")

import math
FIX=os.path.join(OUT,'mole_fixture.json')
async def do_name(pg,name='Flow Tester',user='flow.tester'):
  await slot(pg,'name'); await pg.fill('#ob-name',name); await pg.fill('#ob-user',user); await pg.wait_for_timeout(300); await close_sheet(pg)
async def do_arch(pg,aid='urbex-rat'):
  await slot(pg,'arch')
  await pg.evaluate("id=>{const r=document.querySelector('input[name=pp-arch][value=\"'+id+'\"]');const i=[...document.querySelectorAll('.ob-ag')].indexOf(r.closest('.ob-ag'));document.querySelectorAll('.ob-tab')[i].click();r.click();}",aid)
  await pg.wait_for_timeout(250); await close_sheet(pg)
async def draw(pg):
  box=await pg.evaluate("""()=>{const e=document.querySelector('#pp-pad canvas');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}""")
  await pg.wait_for_timeout(200)
  x,y,w,h=await pg.evaluate("""()=>{const r=document.querySelector('#pp-pad canvas').getBoundingClientRect();return [r.left,r.top,r.width,r.height]}""")
  pts=[(x+w*(.08+.84*t/60),y+h*(.55+.28*math.sin(t/60*9)*(1-t/90))) for t in range(61)]
  await pg.mouse.move(*pts[0]); await pg.mouse.down()
  for p in pts[1:]: await pg.mouse.move(*p)
  await pg.mouse.up()
async def do_mark(pg):
  await slot(pg,'mark'); await draw(pg); await pg.wait_for_timeout(200); await close_sheet(pg)
async def do_style(pg,foil='holo',bg='aurora'):
  await slot(pg,'style')
  await pg.evaluate("([f,b])=>{document.querySelector('[name=cz-foil][value=\"'+f+'\"]').click();document.querySelector('[name=cz-bg][value=\"'+b+'\"]').click();}",[foil,bg])
  await pg.wait_for_timeout(300); await close_sheet(pg)
async def flip_to(pg,back):
  cur=await pg.evaluate("document.querySelector('.ob-flip').classList.contains('is-back')")
  if cur!=back: await js_click(pg,'#ob-flip'); await pg.wait_for_timeout(650)
async def do_bio(pg,text='I go looking for abandoned quarries and quiet tunnels.'):
  await flip_to(pg,True); await slot(pg,'bio'); await pg.fill('#ob-bio',text); await pg.wait_for_timeout(300); await close_sheet(pg)
async def do_places(pg,n=3):
  await flip_to(pg,True); await slot(pg,'places')
  for i in range(n):
    await pg.evaluate("document.querySelector('.ob-spot').click()"); await pg.wait_for_timeout(250)
  await pg.wait_for_timeout(500); await close_sheet(pg)
async def do_mole(pg,roll=False):
  await flip_to(pg,False)
  if os.path.exists(FIX) and not roll:
    m=json.load(open(FIX))
    await pg.evaluate("m=>{const k='deepspot-profile-draft-v1';const d=JSON.parse(localStorage.getItem(k)||'{}');d.mole=m;d.avatarMode='mole';localStorage.setItem(k,JSON.stringify(d));}",m)
    await pg.reload(wait_until='load'); await pg.wait_for_selector('.ob-stage',state='visible'); await pg.wait_for_timeout(700); return
  await pg.evaluate("document.querySelector('.ob-b [data-slot=photo]').click()")
  await pg.wait_for_function("()=>['reveal','done'].includes(document.querySelector('.mr')?.dataset.phase)",timeout=150000)
  await pg.wait_for_timeout(900); await js_click(pg,'.mr [data-act=keep]')
  await pg.wait_for_selector('.mr',state='detached',timeout=60000); await pg.wait_for_timeout(900)
  m=await pg.evaluate("JSON.parse(localStorage.getItem('deepspot-profile-draft-v1')).mole")
  json.dump(m,open(FIX,'w'))
