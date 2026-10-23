"""Home promo cards QA (round 4). usage: python r4_promos.py <tag> <w,w,..> [dark,light] [query]
Shoots each .ed-promo (after_<tag>_<w>_<theme>_<i>.png) + the whole row, prints console errors, hscroll, text spill/overlap."""
import sys, os, psutil
from playwright.sync_api import sync_playwright
tag=sys.argv[1]; widths=[int(w) for w in sys.argv[2].split(',')]
themes=(sys.argv[3] if len(sys.argv)>3 else 'dark,light').split(','); q=sys.argv[4] if len(sys.argv)>4 else ''
os.makedirs('r4',exist_ok=True)
CHECK="""()=>{const out=[];const cards=[...document.querySelectorAll('.ed-promos .ed-promo')];
 cards.forEach((c,ci)=>{const cr=c.getBoundingClientRect();
  const items=[...c.querySelectorAll('h3,button,.ed-place,.gv-name,.ed-r-pts,.ed-r-tag,.ed-r-rk')].filter(e=>e.getBoundingClientRect().width>0);
  items.forEach(e=>{const r=e.getBoundingClientRect();if(r.left<cr.left-1||r.right>cr.right+1||r.top<cr.top-1||r.bottom>cr.bottom+1)out.push('SPILL card'+ci+' '+e.className+' '+e.textContent.trim().slice(0,20)+' '+[r.left-cr.left,cr.right-r.right,r.top-cr.top,cr.bottom-r.bottom].map(Math.round));});
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i].getBoundingClientRect(),b=items[j].getBoundingClientRect();if(items[i].contains(items[j])||items[j].contains(items[i]))continue;
   const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left),oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(ox>2&&oy>2)out.push('OVERLAP card'+ci+' ['+items[i].textContent.trim().slice(0,14)+'] x ['+items[j].textContent.trim().slice(0,14)+'] '+Math.round(ox)+'x'+Math.round(oy));}
 });
 const d=document.documentElement;if(d.scrollWidth>d.clientWidth)out.push('HSCROLL '+d.scrollWidth+'>'+d.clientWidth);return out}"""
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass
    for theme in themes:
        for w in widths:
            pg=b.new_page(viewport={"width":w,"height":900},device_scale_factor=2 if w<=500 else 1)
            msgs=[]
            pg.on("console",lambda m: msgs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
            pg.on("pageerror",lambda e: msgs.append('pageerror: '+str(e)))
            pg.goto(f"http://localhost:8766/?theme={theme}{q}",wait_until="networkidle")
            row=pg.query_selector('.ed-promos'); row.scroll_into_view_if_needed(); pg.wait_for_timeout(3800)
            cards=pg.query_selector_all('.ed-promos .ed-promo')
            for i,c in enumerate(cards):
                c.scroll_into_view_if_needed(); pg.wait_for_timeout(600); c.screenshot(path=f"r4/after_{tag}_{w}_{theme}_{i}.png")
            print(w,theme,'cards',len(cards),'console',msgs[:4],'problems',pg.evaluate(CHECK))
            pg.close()
    b.close()
