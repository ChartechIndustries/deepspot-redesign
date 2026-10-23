import sys,os,io,psutil
from playwright.sync_api import sync_playwright
from PIL import Image
def lum(c):
    f=lambda v:(v/255/12.92) if v/255<=.03928 else (((v/255)+.055)/1.055)**2.4
    return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])
def cr(a,b):
    la,lb=lum(a),lum(b);hi,lo=max(la,lb),min(la,lb);return (hi+.05)/(lo+.05)
import re
def parse(s):
    m=re.findall(r'[\d.]+',s);return tuple(int(float(x)) for x in m[:3])
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass
    for th in ['dark','light']:
     for pm in ['on','off']:
      for w in [1440,820,390,320]:
        pg=b.new_page(viewport={"width":w,"height":900})
        for v in ['c1','c2','c3','w1','w2','w3','r1','r2','r3']:
            pg.goto(f'http://localhost:8766/?bb={v}&theme={th}',wait_until='networkidle')
            pg.evaluate(f"localStorage.setItem('deepspot-panel-colors','{pm}');document.documentElement.dataset.panelColor='{pm}'")
            pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
            card=pg.query_selector('.ed-'+{'c':'competition','w':'week','r':'road'}[v[0]]+'.ed-bb')
            card.scroll_into_view_if_needed(); pg.wait_for_function("[...document.querySelectorAll('.ed-art')].every(i=>i.complete&&i.naturalWidth>0)"); pg.wait_for_timeout(500)
            els=card.query_selector_all('.ed-prize,.ed-prize-line,h3 i,h3,button,.ed-place')
            info=[]
            for e in els:
                if not e.is_visible(): continue
                bb=e.bounding_box(); col=parse(e.evaluate("e=>getComputedStyle(e).color")); info.append((e.evaluate("e=>e.className||e.tagName"),bb,col))
            # hide text, shoot
            pg.add_style_tag(content=".ed-promo-copy,.ed-place,.ed-frame{visibility:hidden!important}")
            png=card.screenshot(); im=Image.open(io.BytesIO(png)).convert('RGB'); cb=card.bounding_box()
            worst=99;wn=''
            for n,bx,col in info:
                if n in('H3',): continue
                x0=int(bx['x']-cb['x']);y0=int(bx['y']-cb['y']);x1=int(x0+bx['width']);y1=int(y0+bx['height'])
                x0=max(0,x0);y0=max(0,y0);x1=min(im.width,x1);y1=min(im.height,y1)
                if x1<=x0 or y1<=y0: continue
                reg=im.crop((x0,y0,x1,y1)).resize((max(1,(x1-x0)//3),max(1,(y1-y0)//3)))
                px=list(reg.getdata())
                cs=sorted(cr(col,q) for q in px)
                r=cs[int(len(cs)*.05)]
                if r<worst: worst=r;wn=n
            print(th,pm,w,v,'worst %.1f'%worst,wn, 'FAIL' if worst<4.5 else '')
            pg.reload()
        pg.close()
    b.close()
