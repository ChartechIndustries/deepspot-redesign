import sys, os, json, psutil
from playwright.sync_api import sync_playwright
out='qa/banners-blender/after/'
jobs=[]
widths=[int(x) for x in sys.argv[1].split(',')]
themes=sys.argv[2].split(',')
qs=sys.argv[3].split('|')   # e.g. "|?bb=old"
tag=sys.argv[4] if len(sys.argv)>4 else ''
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass
    for q in qs:
      for th in themes:
        for w in widths:
            pg=b.new_page(viewport={"width":w,"height":900})
            errs=[]
            pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
            pg.on('pageerror',lambda e: errs.append(str(e)))
            sep='&' if q else '?'
            url='http://localhost:8766/'+(q+'&' if q else '?')+'theme='+th
            pg.goto(url,wait_until='networkidle')
            pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(1200)
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(500)
            pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')"); pg.wait_for_function("[...document.querySelectorAll('.ed-art,.ds-cta-art')].every(i=>i.complete&&i.naturalWidth>0)"); pg.wait_for_timeout(500)
            name=(q.replace('?bb=','bb_').replace(',','') or 'def')+f'_{th}_{w}'
            for sel,n in [('.ed-promos','promos'),('.ds-cta','cta')]:
                e=pg.query_selector(sel)
                e.scroll_into_view_if_needed(); pg.wait_for_timeout(700)
                e.screenshot(path=f'{out}{tag}{name}_{n}.png')
            sw=pg.evaluate("document.documentElement.scrollWidth")
            print(name,'scrollW',sw,'errs',errs[:3])
            pg.close()
    b.close()
