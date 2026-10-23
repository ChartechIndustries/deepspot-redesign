"""python flows.py <tag> : profile shots (390 + 1440): wayfarer top/bottom, preview top/bottom, edit dialog open (390), 1024 footer"""
import sys
from t import *
tag=sys.argv[1] if len(sys.argv)>1 else 'a'
what=sys.argv[2] if len(sys.argv)>2 else 'all'
def ctxpg(br,w,h,theme):
  ctx=br.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800)
  pg=ctx.new_page(); pg.errs=[]
  pg.on('console',lambda m: pg.errs.append(m.text[:160]) if m.type=='error' else None)
  pg.on('pageerror',lambda e: pg.errs.append('PE '+str(e)[:160]))
  pg.goto(B+'/welcome/?reset=1&theme='+theme,wait_until='load')
  pg.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'j@e.com'}))")
  return ctx,pg
with sync_playwright() as p:
  br=p.chromium.launch(headless=True,args=GLARGS)
  for theme in ([] if what=='edit' else ['dark','light'] if what=='all' else ['dark']):
   for w,h in [(390,844),(1440,900)]:
    for user in ['wayfarer','preview']:
      ctx,pg=ctxpg(br,w,h,theme)
      pg.goto(B+f'/profile/?user={user}&theme={theme}',wait_until='load'); pg.wait_for_timeout(2500)
      pg.screenshot(path=f'shots/{tag}_prof_{user}_{theme[0]}{w}_top.png')
      if w<800:
        pg.screenshot(path=f'shots/{tag}_prof_{user}_{theme[0]}{w}_full.png',full_page=True)
      print(user,w,theme,pg.errs); ctx.close()
  if what in('all','edit'):
    ctx,pg=ctxpg(br,390,844,'dark')
    pg.goto(B+'/profile/?user=preview&theme=dark',wait_until='load'); pg.wait_for_timeout(2500)
    pg.evaluate("document.querySelector('[data-edit]').click()"); pg.wait_for_timeout(1200)
    pg.screenshot(path=f'shots/{tag}_edit390_open.png')
    pg.fill('#pp-edit input[name=name]','Jane Wanderer'); pg.wait_for_timeout(500); pg.screenshot(path=f'shots/{tag}_edit390_typed.png')
    pg.click('.ed-ptoggle'); pg.wait_for_timeout(800); pg.screenshot(path=f'shots/{tag}_edit390_full.png')
    print('edit',pg.errs); ctx.close()
    ctx,pg=ctxpg(br,1024,768,'dark')
    pg.goto(B+'/profile/?user=wayfarer&theme=dark',wait_until='load'); pg.wait_for_timeout(2500)
    pg.evaluate('scrollTo(0,1e5)'); pg.wait_for_timeout(600); pg.screenshot(path=f'shots/{tag}_prof1024_bottom.png'); print('1024',pg.errs); ctx.close()
  br.close()
