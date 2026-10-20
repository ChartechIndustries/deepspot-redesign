import json,sys
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
AXE='C:/Users/CharD/Desktop/DeepSpot Globe/qa/audit-20261019/axe.min.js'
JS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,200))}))}"""
cases=[]
with sync_playwright() as p:
  br=p.chromium.launch()
  for theme,w,h in [('dark',1440,900),('light',1440,900),('dark',390,844)]:
    ctx=br.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page()
    def run(name,setup):
      setup(); pg.wait_for_timeout(900); pg.add_script_tag(path=AXE)
      v=pg.evaluate(JS); cases.append((f'{name} {theme} {w}',v)); print(f'{name} {theme} {w}: {len(v)} violations',flush=True)
      for x in v: print('   ',x['id'],x['impact'],x['n'],x['ex'][:2],flush=True)
    run('spot out',lambda:(pg.goto(f'{B}/spot/?id=tochigi-underground-quarry&theme={theme}&gate=out'),pg.wait_for_timeout(1800)))
    run('story out',lambda:(pg.goto(f'{B}/story/?id=shark&theme={theme}&gate=out'),pg.wait_for_timeout(1800)))
    def member():
      pg.goto(f'{B}/spot/?id=tochigi-underground-quarry&theme={theme}&gate=free'); pg.wait_for_timeout(1800)
      t=pg.locator('[data-gallery-open="1"]'); t.scroll_into_view_if_needed(); t.click()
    run('member sheet',member)
    def action():
      pg.goto(f'{B}/community/?theme={theme}&gate=out'); pg.wait_for_timeout(2000)
      b=pg.locator('[data-v-yes]').first; b.scroll_into_view_if_needed(); b.click()
    run('action sheet',action)
    ctx.close()
  br.close()
print('TOTAL violations',sum(len(v) for _,v in cases))
