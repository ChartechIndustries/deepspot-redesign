import json
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
NEVER=['/','/browse/','/map/','/stories/','/guides/','/guide/?id=tas-aizu-samurai-cultural-tour','/adventures/','/saved/','/plan-trip/','/contribute/',
'/account/','/inbox/','/invites/','/community/','/leaderboard/','/competition/','/forum/','/forum/?id=0','/mission/','/faq/','/membership/','/app/','/roadmap/',
'/sponsored/','/privacy/','/terms/','/cookies/','/profile/?user=wayfarer','/profile/?user=preview','/404.html','/nope-not-a-route/',
'/spot/?id=does-not-exist','/story/?id=does-not-exist']
GATED=['/spot/?id=tochigi-underground-quarry','/story/?id=shark']
PROBE="""()=>({sheet:document.querySelectorAll('.gt-sheet').length,fade:document.querySelectorAll('.gt-fade').length,inert:document.querySelectorAll('[inert]').length,walled:document.body.classList.contains('gt-walled'),gtcss:!!document.querySelector('link[href*="gate.css"]'),mh:document.getElementById('page-content')?.style.maxHeight||''})"""
OVER="()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})"
out={'never':[],'gated':[],'overflow':[]}
with sync_playwright() as p:
  br=p.chromium.launch()
  def visit(ctx,u,wait=2200):
    pg=ctx.new_page(); errs=[]
    pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:140]))
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)[:140]))
    pg.on('requestfailed',lambda q:errs.append('FAILED '+q.url[:110]))
    pg.on('response',lambda s:s.status>=400 and errs.append(str(s.status)+' '+s.url[:110]))
    sep='&' if '?' in u else '?'
    pg.goto(B+u+sep+'theme=dark&gate=out'); pg.wait_for_timeout(wait)
    return pg,errs
  for u in NEVER:
    ctx=br.new_context(viewport={'width':1440,'height':900}); pg,errs=visit(ctx,u)
    r=pg.evaluate(PROBE); r['route']=u; r['errs']=errs; out['never'].append(r)
    clean=r['sheet']==0 and r['fade']==0 and r['inert']==0 and not r['walled'] and r['mh']==''
    print(('CLEAN ' if clean else 'GATE?? ')+u,r['gtcss'],errs[:2],flush=True); ctx.close()
  for u in GATED:
    ctx=br.new_context(viewport={'width':1440,'height':900}); pg,errs=visit(ctx,u)
    r=pg.evaluate(PROBE); r['route']=u; r['errs']=errs; out['gated'].append(r); print('GATED',u,r,errs,flush=True); ctx.close()
  # overflow 1440/768/390/320 on gated pages in out state + member sheet + action sheet
  for w,h in [(1440,900),(768,1024),(390,844),(320,640)]:
    for u in GATED:
      ctx=br.new_context(viewport={'width':w,'height':h}); pg,e=visit(ctx,u); o=pg.evaluate(OVER); o.update(route=u,w=w,state='out'); out['overflow'].append(o); print('OVER',w,u,o,flush=True); ctx.close()
    ctx=br.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page(); pg.goto(B+'/spot/?id=tochigi-underground-quarry&theme=dark&gate=free'); pg.wait_for_timeout(1500)
    t=pg.locator('[data-gallery-open="1"]'); t.scroll_into_view_if_needed(); t.click(); pg.wait_for_timeout(600)
    o=pg.evaluate(OVER); o.update(route='member-sheet',w=w); sh=pg.evaluate("(()=>{const r=document.querySelector('.gt-sheet').getBoundingClientRect();return [Math.round(r.height),Math.round(r.right)]})()"); o['sheet']=sh; out['overflow'].append(o); print('OVER',w,'member sheet',o,flush=True)
    pg.screenshot(path=f'member-gallery-{w}.png'); ctx.close()
    ctx=br.new_context(viewport={'width':w,'height':h}); pg,e=visit(ctx,'/community/');
    b=pg.locator('[data-v-yes]').first; b.scroll_into_view_if_needed(); b.click(); pg.wait_for_timeout(600)
    o=pg.evaluate(OVER); o.update(route='action-sheet',w=w); out['overflow'].append(o); print('OVER',w,'action sheet',o,flush=True); ctx.close()
  br.close()
json.dump(out,open('crawl.json','w'),indent=1)
bad=[r for r in out['never'] if r['sheet'] or r['fade'] or r['inert'] or r['walled'] or r['mh']]
print('never-gated routes checked',len(out['never']),'with a gate',len(bad))
ov=[o for o in out['overflow'] if o['sw']>o['cw']]
print('overflow cases',len(out['overflow']),'overflowing',len(ov),ov)
errs=[(r['route'],r['errs']) for r in out['never']+out['gated'] if r['errs']]
print('routes with console/network problems',len(errs),errs)
