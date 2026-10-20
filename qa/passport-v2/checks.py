import sys,json
sys.path.insert(0,'.')
from seed import SEEDED,EMPTY
from shoot import VIEWS
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
JS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,200))}))}"""
res={'overflow':[],'axe':[],'errs':[]}
with sync_playwright() as p:
    b=p.chromium.launch()
    for n,(user,seed) in VIEWS.items():
        for w in (1440,1024,768,390,320):
            for th in ('dark','light') if w in (1440,390) else ('dark',):
                for panel in ('on','off') if (w==390 and th=='dark') else ('on',):
                    ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page()
                    pg.on('console',lambda m,n=n:res['errs'].append((n,m.text)) if m.type=='error' else None)
                    pg.on('pageerror',lambda e,n=n:res['errs'].append((n,str(e))))
                    pg.on('requestfailed',lambda r,n=n:res['errs'].append((n,'FAILED '+r.url)))
                    pg.on('response',lambda r,n=n:res['errs'].append((n,str(r.status)+' '+r.url)) if r.status>=400 else None)
                    init="try{localStorage.setItem('deepspot-theme','%s');localStorage.setItem('deepspot-panel-colors','%s');"%(th,panel)
                    if seed: init+="localStorage.setItem('deepspot-profile-draft-v1',%s);"%json.dumps(seed)
                    pg.add_init_script(init+"}catch(e){}")
                    pg.goto(f'{B}/profile/?user={user}&theme={th}',wait_until='networkidle');pg.wait_for_timeout(600)
                    ov=pg.evaluate("()=>{const d=document.documentElement;const bad=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&!e.closest('.br-ticker')&&getComputedStyle(e).position!=='fixed'}).slice(0,3).map(e=>e.className||e.tagName);return [d.scrollWidth,innerWidth,bad]}")
                    if ov[0]>ov[1]: res['overflow'].append((n,w,th,ov))
                    if w in (1440,390) and panel=='on' and n!='preview-empty' or (n=='preview-empty' and w==1440):
                        pg.add_script_tag(path='axe.min.js');v=pg.evaluate(JS);res['axe'].append((n,w,th,len(v),v))
                    ctx.close()
    b.close()
print('overflow',res['overflow']);print('errs',len(res['errs']),res['errs'][:6])
tot=0
for n,w,th,c,v in res['axe']:
    tot+=c;print('axe',n,w,th,c,json.dumps(v)[:600] if c else '')
print('axe total',tot)
