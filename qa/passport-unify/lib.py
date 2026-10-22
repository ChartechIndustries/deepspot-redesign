import psutil,sys,asyncio,json,os,io,base64,math
psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
from playwright.async_api import async_playwright
BASE='http://localhost:8766'; OUT=os.path.dirname(os.path.abspath(__file__))
AXE='C:/Users/CharD/Desktop/DeepSpot Globe/qa/passport-v3/axe.min.js'
FIX='C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2/mole_fixture.json'
def sig_png():
  from PIL import Image,ImageDraw
  im=Image.new('RGBA',(512,256),(0,0,0,0)); d=ImageDraw.Draw(im)
  pts=[(20+470*t/80,128+70*math.sin(t/80*9)*(1-t/120)) for t in range(81)]
  d.line(pts,fill=(11,27,39,255),width=7,joint='curve')
  b=io.BytesIO(); im.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def seed_js(bio='I go looking for abandoned quarries and quiet tunnels, then write down how to find them.',style='urbex-rat',foil='holo',bg='aurora'):
  m=json.load(open(FIX))
  acct={'name':'Jamie Rivera','username':'jamie.r','bio':bio,'style':style,'avatarMode':'mole','mole':m,'signatureArt':sig_png()}
  return "(()=>{try{localStorage.setItem('deepspot-profile-draft-v1',%s);localStorage.setItem('deepspot-onboarded-v1',String(Date.now()));localStorage.setItem('deepspot-passport-style-v1',%s)}catch(e){}})()"%(json.dumps(json.dumps(acct)),json.dumps(json.dumps({'bg':bg,'foil':foil})))
async def page(p,w,h,theme='dark',seed=None,color='on'):
  b=await p.chromium.launch()
  ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800)
  await ctx.add_init_script("try{localStorage.setItem('deepspot-theme','%s');localStorage.setItem('deepspot-panel-colors','%s')}catch(e){}"%(theme,color)+(seed or ''))
  pg=await ctx.new_page(); pg.errs=[]
  pg.on('console',lambda m: pg.errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: pg.errs.append(str(e)))
  return b,pg
async def axe(pg):
  await pg.add_script_tag(path=AXE)
  return await pg.evaluate("async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' ').slice(0,70))}")
