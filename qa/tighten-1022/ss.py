"""python ss.py <tag> name=route@w@theme[@sel|@y=NNN] ... ; saves shots/<tag>_<name>.png. selector -> element screenshot (scrolled into view, padded)"""
import sys
from t import *
tag=sys.argv[1]; specs=sys.argv[2:]
with sync_playwright() as p:
  for gl in (False,True):
    br=None
    for s in specs:
      name,rest=s.split('=',1); parts=rest.split('@'); route,w,theme=parts[0],int(parts[1]),parts[2]; extra=parts[3] if len(parts)>3 else ''
      needgl=('/'==route.split('?')[0] or 'profile' in route or 'community' in route)
      if needgl!=gl: continue
      if br is None: br=p.chromium.launch(headless=True,args=GLARGS if gl else [])
      ctx=br.new_context(viewport={'width':w,'height':844 if w<800 else 900},device_scale_factor=1,has_touch=w<800,is_mobile=w<800)
      pg=ctx.new_page(); errs=[]
      pg.on('console',lambda m: errs.append(m.text[:150]) if m.type=='error' else None)
      pg.on('pageerror',lambda e: errs.append('PE '+str(e)[:150]))
      sep='&' if '?' in route else '?'
      pg.goto(B+route+sep+'theme='+theme,wait_until='load'); pg.wait_for_timeout(2200)
      out=f'shots/{tag}_{name}.png'
      if extra.startswith('y='):
        pg.evaluate(f'scrollTo(0,{extra[2:]})'); pg.wait_for_timeout(900); pg.screenshot(path=out)
      elif extra:
        el=pg.locator(extra).first; el.scroll_into_view_if_needed(); pg.wait_for_timeout(900)
        bb=el.bounding_box(); y=max(0,bb['y']-40) if bb else 0
        pg.screenshot(path=out,clip={'x':0,'y':y,'width':w,'height':min(pg.viewport_size['height'],bb['height']+80) if bb else 800}) if False else pg.screenshot(path=out)
      else: pg.screenshot(path=out)
      print(name,errs); ctx.close()
    if br: br.close()
