import sys,asyncio
from playwright.sync_api import sync_playwright
# usage: shot.py url out width theme [color] [height]
url,out,w,theme=sys.argv[1:5]; color=sys.argv[5] if len(sys.argv)>5 else 'on'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':int(w),'height':900})
    errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.add_init_script("try{localStorage.setItem('deepspot-theme','%s')}catch(e){}"%theme)
    u=url+('&' if '?' in url else '?')+'theme='+theme
    pg.goto(u,wait_until='networkidle')
    if color=='off': pg.evaluate("document.documentElement.dataset.panelColor='off';try{localStorage.setItem('deepspot-panel-colors','off')}catch(e){}")
    pg.wait_for_timeout(800)
    # scroll to trigger lazy
    h=pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0,h,500): pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(60)
    pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(500)
    pg.screenshot(path=out,full_page=True); print(out,errs)
    b.close()
