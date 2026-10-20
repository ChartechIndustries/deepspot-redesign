import json,sys
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
AX=open('qa/audit-20261019/axe.min.js',encoding='utf8').read()
res={}
def new(b,w,theme='dark',perms=None):
    ctx=b.new_context(viewport={'width':w,'height':900},permissions=perms or [])
    ctx.add_init_script("try{localStorage.setItem('deepspot-theme','%s')}catch(e){}"%theme)
    pg=ctx.new_page(); pg.errs=[]; pg.fails=[]; pg.bytes=0
    pg.on('console',lambda m: pg.errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: pg.errs.append(str(e)))
    pg.on('requestfailed',lambda r: pg.fails.append(r.url))
    pg.on('response',lambda r: (pg.fails.append(f'{r.status} {r.url}') if r.status>=400 else None))
    return ctx,pg
def scroll(pg):
    h=pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0,h,400): pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(50)
    pg.wait_for_timeout(500)
with sync_playwright() as p:
    b=p.chromium.launch()
    # 3 errors/overflow
    for url in ['/community/','/community/?v=hub1']:
        for w in (390,320):
            ctx,pg=new(b,w); pg.goto(B+url,wait_until='networkidle'); scroll(pg)
            ov=pg.evaluate('document.documentElement.scrollWidth-innerWidth')
            res[f'err {url} {w}']=dict(errs=pg.errs,fails=pg.fails,overflow=ov); ctx.close()
    # 6 weight
    ctx,pg=new(b,1440); tot=[0]
    def rs(r):
        try: tot[0]+=len(r.body())
        except Exception: pass
    pg.on('response',rs); pg.goto(B+'/community/',wait_until='networkidle'); scroll(pg); pg.wait_for_timeout(1000)
    res['weight_bytes_body']=tot[0]; ctx.close()
    # 4 axe
    for w,th,col in [(1440,'dark','on'),(1440,'light','on'),(390,'dark','on'),(1440,'dark','off')]:
        ctx,pg=new(b,w,th); pg.goto(B+'/community/?theme='+th,wait_until='networkidle'); scroll(pg)
        if col=='off': pg.evaluate("document.documentElement.dataset.panelColor='off'")
        pg.add_script_tag(content=AX)
        r=pg.evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}).then(r=>r.violations.map(v=>({id:v.id,n:v.nodes.length,t:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' :: '+(n.any[0]?.message||'').slice(0,140))})))")
        res[f'axe {w} {th} {col}']=r; ctx.close()
    b.close()
print(json.dumps(res,indent=1,ensure_ascii=False))
