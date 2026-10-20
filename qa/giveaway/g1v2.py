import sys
from playwright.sync_api import sync_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
def ctx(b,w,theme='dark',panel='on'):
    c=b.new_context(viewport={'width':w,'height':900})
    pj="localStorage.setItem('deepspot-panel-colors','off')" if panel=='off' else "localStorage.removeItem('deepspot-panel-colors')"
    c.add_init_script("try{localStorage.setItem('deepspot-theme','"+theme+"');"+pj+"}catch(e){}");return c
def shot(pg,name,full=False):
    pg.query_selector('.gv').screenshot(path=f'qa/giveaway/g1v2/{name}.png')
which=sys.argv[1:] or ['main']
with sync_playwright() as p:
    b=p.chromium.launch(args=A)
    if 'main' in which:
        c=ctx(b,1440);pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=final');pg.wait_for_timeout(2500);shot(pg,'1440-dark-final');pg.close()
        pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=mid');pg.wait_for_timeout(2500);shot(pg,'1440-dark-mid');pg.close()
        pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1');pg.wait_for_selector('.gv-stage.gv-cele',timeout=15000);pg.evaluate("document.getAnimations().forEach(a=>{try{a.pause();a.currentTime=360}catch(e){}})");pg.wait_for_timeout(100);shot(pg,'1440-dark-celebration');pg.close();c.close()
        c=ctx(b,1440,'light');pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=final');pg.wait_for_timeout(2500);shot(pg,'1440-light-final');c.close()
        c=ctx(b,1440,'dark','off');pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=final');pg.wait_for_timeout(2500);shot(pg,'1440-dark-paneloff');c.close()
        c=ctx(b,1440,'light','off');pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=final');pg.wait_for_timeout(2500);shot(pg,'1440-light-paneloff');c.close()
    if 'sizes' in which:
        for w in (1024,768,390,320):
            c=ctx(b,w);pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=final');pg.wait_for_timeout(2500);shot(pg,f'{w}-dark-final');c.close()
        c=ctx(b,390,'light');pg=c.new_page();pg.goto('http://localhost:8766/community/?giveaway=g1&race=final');pg.wait_for_timeout(2500);shot(pg,'390-light-final');c.close()
    b.close()
