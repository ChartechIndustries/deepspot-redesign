import asyncio,json,os,sys,psutil
BASE='http://localhost:8766'
OUT=os.path.dirname(os.path.abspath(__file__))
AXE='C:/Users/CharD/Desktop/DeepSpot Globe/qa/audit-20261019/axe.min.js'
def lower():
  try:
    for p in psutil.process_iter(['name']):
      if p.info['name'] and ('chrome' in p.info['name'].lower() or 'headless' in p.info['name'].lower()):
        try: p.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
        except Exception: pass
  except Exception: pass
async def launch(p,gl=False):
  b=await p.chromium.launch(args=["--use-angle=swiftshader"] if gl else [])
  lower(); return b
async def page(b,w,h,theme='dark',color='on',scale=1,touch=None):
  ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=scale,has_touch=bool(touch if touch is not None else w<800),is_mobile=bool(touch if touch is not None else w<800))
  await ctx.add_init_script(f"try{{localStorage.setItem('deepspot-panel-colors','{color}');localStorage.setItem('deepspot-theme','{theme}');localStorage.setItem('deepspot-session-preview',JSON.stringify({{state:'free',email:'jane@example.com'}}))}}catch(e){{}}")
  pg=await ctx.new_page(); pg.errs=[]
  pg.on('console',lambda m: pg.errs.append(m.text) if m.type=='error' else None)
  pg.on('pageerror',lambda e: pg.errs.append(str(e)))
  lower(); return ctx,pg
async def axe(pg,scope=None):
  await pg.add_script_tag(path=AXE)
  return await pg.evaluate("""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,160))}))}""")
