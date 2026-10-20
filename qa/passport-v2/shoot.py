import sys,json
sys.path.insert(0,'.')
from seed import SEEDED,EMPTY
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
VIEWS={'lampbane':('lampbane',None),'wayfarer':('wayfarer',None),'sixbacteria':('sixbacteria',None),'preview-seeded':('preview',SEEDED),'preview-empty':('preview',EMPTY)}
def shoot(names,widths,themes,panel='on',out='shots',full=True):
    errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch()
        for n in names:
            user,seed=VIEWS[n]
            for th in themes:
                for w in widths:
                    ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page()
                    pg.on('console',lambda m,n=n:errs.append((n,m.text)) if m.type=='error' else None)
                    pg.on('pageerror',lambda e,n=n:errs.append((n,str(e))))
                    pg.on('requestfailed',lambda r,n=n:errs.append((n,'FAILED '+r.url)))
                    pg.on('response',lambda r,n=n:errs.append((n,str(r.status)+' '+r.url)) if r.status>=400 else None)
                    init="try{localStorage.setItem('deepspot-theme','%s');localStorage.setItem('deepspot-panel-colors','%s');"%(th,panel)
                    if seed: init+="localStorage.setItem('deepspot-profile-draft-v1',%s);"%json.dumps(seed)
                    pg.add_init_script(init+"}catch(e){}")
                    pg.goto(f'{B}/profile/?user={user}&theme={th}',wait_until='networkidle');pg.wait_for_timeout(700)
                    h=pg.evaluate('document.documentElement.scrollHeight')
                    for y in range(0,h,500): pg.evaluate(f'scrollTo(0,{y})');pg.wait_for_timeout(40)
                    pg.evaluate('scrollTo(0,0)');pg.wait_for_timeout(300)
                    tag=f'{n}-{w}-{th}'+('' if panel=='on' else '-off')
                    pg.screenshot(path=f'{out}/{tag}.png',full_page=full)
                    ctx.close()
        b.close()
    for e in errs:print('ERR',e)
    print('done',len(errs))
if __name__=='__main__':
    names=sys.argv[1].split(',');widths=[int(x) for x in sys.argv[2].split(',')];themes=sys.argv[3].split(',');panel=sys.argv[4] if len(sys.argv)>4 else 'on';out=sys.argv[5] if len(sys.argv)>5 else 'shots'
    shoot(names,widths,themes,panel,out)
