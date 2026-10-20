import sys,json
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
AXE=open('qa/audit-20261019/axe.min.js',encoding='utf8').read()
AXJS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,200))}))}"""
which=sys.argv[1]
with sync_playwright() as p:
    br=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    if which=='errors':
        urls=[f'/community/?giveaway=g{i}' for i in range(1,11)]+['/giveaway-variations.html','/community/','/community/?v=hub1','/community/?v=old']
        for w in (390,320,1440):
            for u in urls:
                ctx=br.new_context(viewport={'width':w,'height':900});pg=ctx.new_page();errs=[];bad=[]
                pg.on('console',lambda m:errs.append(m.text[:120]) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append('PAGE '+str(e)[:120]))
                pg.on('requestfailed',lambda r:bad.append('FAIL '+r.url[-60:]));pg.on('response',lambda r:bad.append(f'{r.status} '+r.url[-60:]) if r.status>=400 else None)
                pg.goto(B+u);pg.wait_for_timeout(2500)
                ov=pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
                print(w,u,'overflow',ov,'errs',errs,'bad',bad,flush=True);ctx.close()
    if which=='axe':
        for u in sys.argv[2].split(','):
            for w in (1440,390):
                ctx=br.new_context(viewport={'width':w,'height':900});pg=ctx.new_page()
                pg.goto(B+u+('&' if '?' in u else '?')+'theme=dark');pg.wait_for_timeout(2500);pg.add_script_tag(content=AXE)
                v=pg.evaluate(AXJS);print(u,w,len(v),json.dumps(v)[:900],flush=True);ctx.close()
