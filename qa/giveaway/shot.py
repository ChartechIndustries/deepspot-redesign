import sys
from playwright.sync_api import sync_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
# usage: shot.py name url width [theme] [panel] [full]
def run(items):
    with sync_playwright() as p:
        b=p.chromium.launch(args=A)
        for it in items:
            name,url,w=it[:3];theme=it[3] if len(it)>3 else 'dark';panel=it[4] if len(it)>4 else 'on';full=it[5] if len(it)>5 else False
            ctx=b.new_context(viewport={'width':w,'height':900},reduced_motion='no-preference')
            pj="localStorage.setItem('deepspot-panel-colors','off')" if panel=='off' else "localStorage.removeItem('deepspot-panel-colors')"
            ctx.add_init_script("try{localStorage.setItem('deepspot-theme','"+theme+"');"+pj+"}catch(e){}")
            pg=ctx.new_page();errs=[]
            pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
            pg.goto('http://localhost:8766'+url);pg.wait_for_timeout(2500)
            el=pg.query_selector('.gv')
            if el: el.screenshot(path=f'qa/giveaway/{name}.png')
            else: pg.screenshot(path=f'qa/giveaway/{name}.png',full_page=True)
            print(name,errs[:3])
            ctx.close()
        b.close()
if __name__=='__main__':
    a=sys.argv[1:];run([(a[0],a[1],int(a[2]))+tuple(a[3:])])
