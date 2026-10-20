import sys,json
sys.path.insert(0,'.')
from seed import SEEDED,EMPTY
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS)
    for th in ('dark','light'):
        for w in (1440,1024,768,390):
            for name,seed,user in (('mark-seeded',SEEDED,'preview'),('mark-lampbane',None,'lampbane')):
                ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page()
                init="try{localStorage.setItem('deepspot-theme','%s');"%th
                if seed: init+="localStorage.setItem('deepspot-profile-draft-v1',%s);"%json.dumps(seed)
                pg.add_init_script(init+"}catch(e){}")
                pg.goto(f'{B}/profile/?user={user}&theme={th}',wait_until='networkidle');pg.wait_for_timeout(600)
                pg.click('#pp-tab-mark');pg.wait_for_timeout(200)
                pg.locator('.pp-field').scroll_into_view_if_needed()
                pg.screenshot(path=f'shots/{name}-{w}-{th}.png');ctx.close()
    b.close()
