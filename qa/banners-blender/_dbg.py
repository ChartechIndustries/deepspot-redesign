import sys,json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-angle=swiftshader"]);pg=b.new_page(viewport={"width":1024,"height":900})
    pg.goto("http://localhost:8766/?theme=dark",wait_until="networkidle")
    pg.query_selector("deepspot-news").scroll_into_view_if_needed();pg.wait_for_timeout(800)
    pg.hover("deepspot-news .wn-section");pg.evaluate("document.querySelector('deepspot-news').select(1,true)");pg.wait_for_timeout(2800)
    print(pg.evaluate("""()=>{const f=document.querySelector('.wn-panel.wn-active .wn-fan');const P=document.querySelector('.wn-panel.wn-active').getBoundingClientRect();return {fw:f.clientWidth,fh:f.clientHeight,style:f.getAttribute('style'),panel:[P.top,P.height],cards:[...f.querySelectorAll('.wn-pc')].map(c=>{const r=c.getBoundingClientRect();return [Math.round(r.left-P.left),Math.round(r.top-P.top),Math.round(r.right-P.left),Math.round(r.bottom-P.top)]}),src:document.querySelector('script[src*=whats-new]').src}}"""))
    b.close()
