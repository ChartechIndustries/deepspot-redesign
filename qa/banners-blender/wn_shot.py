"""What's new panels QA. usage: python wn_shot.py <tag> <w,w,..> [dark,light] [colors=on|off]
Shoots every panel of <deepspot-news> at each width, saves wn/<tag>_<w>_<theme>_<i>.png,
prints console errors, horizontal scroll, text that spills out of its panel, and contrast of text."""
import sys, os, json, psutil
from playwright.sync_api import sync_playwright
tag = sys.argv[1]; widths = [int(w) for w in sys.argv[2].split(',')]
themes = (sys.argv[3] if len(sys.argv) > 3 else 'dark,light').split(',')
colors = sys.argv[4] if len(sys.argv) > 4 else 'on'
os.makedirs('r4', exist_ok=True)
CHECK = """() => {
  const out = [];
  const host = document.querySelector('deepspot-news');
  const win = host.querySelector('.wn-window').getBoundingClientRect();
  const panel = host.querySelector('.wn-panel.wn-active');
  const pr = panel.getBoundingClientRect();
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928 ? v/12.92 : ((v+.055)/1.055)**2.4; }); return .2126*r+.7152*g+.0722*b; };
  const parse = s => { const m = s.match(/[\\d.]+/g).map(Number); return m; };
  const bgOf = el => { let e = el; while (e) { const m = parse(getComputedStyle(e).backgroundColor); if (m.length < 4 || m[3] > .5) return m.slice(0,3); e = e.parentElement; } return [255,255,255]; };
  panel.querySelectorAll('h3,p,a,b,i,small,span,figcaption,li').forEach(el => {
    if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    if (el.closest('.wn-dup') || el.closest('.wn-fan')) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    const feed = el.closest('.wn-feed');
    if (!feed && (r.right > pr.right + 1 || r.left < pr.left - 1 || r.bottom > pr.bottom + 1 || r.top < pr.top - 1)) out.push('SPILL ' + el.tagName + ' ' + el.textContent.trim().slice(0,30) + ' ' + [r.left-pr.left, r.right-pr.right, r.top-pr.top, r.bottom-pr.bottom].map(Math.round));
    if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline' && getComputedStyle(el).overflow === 'visible' && !feed) out.push('OVERFLOW-X ' + el.tagName + ' ' + el.textContent.trim().slice(0,30));
    const cs = getComputedStyle(el);
    const fg = parse(cs.color); const op = parseFloat(cs.opacity);
    let bg = bgOf(el);
    const a = fg.length > 3 ? fg[3] : 1;
    const eff = fg.slice(0,3).map((v,i) => v*a*op + bg[i]*(1-a*op));
    const L1 = lum(eff), L2 = lum(bg); const cr = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    if (cr < 4.5 && !el.closest('.wn-photo,.wn-img')) out.push('CONTRAST ' + cr.toFixed(2) + ' ' + el.tagName + '.' + el.className + ' "' + el.textContent.trim().slice(0,25) + '"');
  });
  panel.querySelectorAll('.wn-pc').forEach(c => { const r = c.getBoundingClientRect(); if (r.left < pr.left - 1 || r.right > pr.right + 1 || r.top < pr.top - 1 || r.bottom > pr.bottom + 1) out.push('FAN-OUT ' + c.getAttribute('aria-label') + ' ' + [r.left-pr.left, r.right-pr.right, r.top-pr.top, r.bottom-pr.bottom].map(Math.round)); });
  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth) out.push('HSCROLL ' + doc.scrollWidth + ' > ' + doc.clientWidth);
  return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass
    for theme in themes:
        for w in widths:
            ctx = b.new_context(viewport={"width": w, "height": 900})
            ctx.add_init_script(f"try{{localStorage.setItem('deepspot-panel-colors','{colors}')}}catch(e){{}}")
            pg = ctx.new_page()
            msgs = []
            pg.on("console", lambda m: msgs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
            pg.on("pageerror", lambda e: msgs.append('pageerror: ' + str(e)))
            pg.goto(f"http://localhost:8766/?theme={theme}", wait_until="networkidle")
            el = pg.query_selector("deepspot-news"); el.scroll_into_view_if_needed(); pg.wait_for_timeout(800)
            if w > 650: pg.hover("deepspot-news .wn-section")
            pg.wait_for_timeout(600)
            n = pg.evaluate("document.querySelectorAll('deepspot-news .wn-panel').length")
            problems = []
            for i in range(n):
                pg.evaluate(f"document.querySelector('deepspot-news').select({i},true)"); pg.wait_for_timeout(2600)
                el.screenshot(path=f"r4/{tag}_{w}_{theme}_{i}.png")
                problems += [f"[{i}] {x}" for x in pg.evaluate(CHECK)]
            print(w, theme, 'panels', n, 'console', msgs[:5], 'problems', problems)
            ctx.close()
    b.close()
