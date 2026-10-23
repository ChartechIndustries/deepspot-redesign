import sys, os, psutil
from playwright.sync_api import sync_playwright
from PIL import Image
sets=sys.argv[1].split(';'); widths=[int(w) for w in sys.argv[2].split(',')]; tag=sys.argv[3]
rows=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass
    for s in sets:
        for w in widths:
            pg=b.new_page(viewport={"width":w,"height":800},device_scale_factor=2)
            pg.goto(f"http://localhost:8766/?bb={s}&nocache={tag}", wait_until="networkidle")
            pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(1200)
            ims=[]
            for sel in [".ed-promos .ed-promo",".ds-cta > div"]:
                for i,e in enumerate(pg.query_selector_all(sel)):
                    e.scroll_into_view_if_needed(); pg.wait_for_timeout(500)
                    f=f"phone/{tag}_{s.replace(',','')}_{w}_{sel[1:3]}{i}.png"; e.screenshot(path=f); ims.append(f)
                    bb=e.bounding_box(); print(s,w,sel,i,int(bb['width']),int(bb['height']))
            pg.close()
            row=[Image.open(f) for f in ims]
            H=max(i.height for i in row); W=sum(i.width for i in row)+10*len(row)
            sheet=Image.new('RGB',(W,H),'white'); x=0
            for i in row: sheet.paste(i,(x,0)); x+=i.width+10
            sheet.save(f"phone/{tag}_{s.replace(',','')}_{w}_sheet.png")
    b.close()
