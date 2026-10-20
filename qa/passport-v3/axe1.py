import sys,json
sys.path.insert(0,'.')
from seed import SEEDED
from playwright.sync_api import sync_playwright
JS=open('checks.py').read().split('JS="""')[1].split('"""')[0]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for user,seed,th in (('wayfarer',None,'dark'),('preview',SEEDED,'dark'),('wayfarer',None,'light'),('preview',SEEDED,'light')):
        pg=b.new_page(viewport={'width':1440,'height':900})
        init="try{localStorage.setItem('deepspot-theme','%s');"%th+("localStorage.setItem('deepspot-profile-draft-v1',%s);"%json.dumps(seed) if seed else '')+"}catch(e){}"
        pg.add_init_script(init);pg.goto(f'http://localhost:8766/profile/?user={user}&theme={th}',wait_until='networkidle');pg.wait_for_timeout(500)
        pg.add_script_tag(path='axe.min.js')
        for v in pg.evaluate(JS):
            for e in v['ex']:print(user,th,v['id'],e[:230])
