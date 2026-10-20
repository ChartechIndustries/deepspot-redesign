import json,sys
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
exec(open('crawl.py',encoding='utf-8').read().split('AXE=')[0].split('ROUTES=',1)[1].join(['ROUTES=','']) if False else '')
src=open('crawl.py',encoding='utf-8').read()
ROUTES=eval(src.split('ROUTES=')[1].split('\nAXE')[0])
ROUTES=[r for r in ROUTES if r!='/at-risk/']
vid,w,h,theme=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
JS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,220))}))}"""
out=[]
with sync_playwright() as p:
  br=p.chromium.launch(); ctx=br.new_context(viewport={'width':w,'height':h})
  for r in ROUTES:
    pg=ctx.new_page(); sep='&' if '?' in r else '?'
    pg.goto(B+r+sep+'theme='+theme); pg.wait_for_timeout(1800)
    pg.add_script_tag(path='axe.min.js')
    try: v=pg.evaluate(JS)
    except Exception as e: v=[{'id':'fail','ex':[str(e)[:100]]}]
    out.append({'route':r,'v':v}); print(vid,r,len(v),flush=True); pg.close()
json.dump(out,open(f'axe_{vid}.json','w'),indent=1)
