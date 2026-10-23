import sys, asyncio, psutil, os
from playwright.sync_api import sync_playwright
url=sys.argv[1]; out=sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 1440
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass
    pg=b.new_page(viewport={"width":w,"height":900})
    pg.goto(url, wait_until="networkidle")
    pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(1500)
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(800)
    sel = sys.argv[4] if len(sys.argv)>4 else None
    if sel:
        els=pg.query_selector_all(sel)
        for i,e in enumerate(els):
            e.scroll_into_view_if_needed(); pg.wait_for_timeout(600)
            e.screenshot(path=out.replace('.png',f'_{i}.png'))
        print(len(els),'elements')
    else:
        pg.screenshot(path=out, full_page=True)
    b.close()
