"""Round 4 extras: ?bb= switches, network (no promo-variations by default), race grow frames, fan deal frames, hover, reduced motion."""
import os, sys, psutil
from playwright.sync_api import sync_playwright
from PIL import Image
os.makedirs('r4', exist_ok=True)
BASE = 'http://localhost:8766/'

def sheet(name, files):
    ims = [Image.open(f) for f in files]
    W = sum(i.width for i in ims) + 10 * (len(ims) - 1); H = max(i.height for i in ims)
    s = Image.new('RGB', (W, H), 'white'); x = 0
    for i in ims: s.paste(i, (x, 0)); x += i.width + 10
    s.save(name); print('saved', name, s.size)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader"])
    try:
        for c in psutil.Process(os.getpid()).children(recursive=True): c.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
    except Exception: pass

    # 1. switches
    for q in ['bb=c0,w0', 'bb=c1,w1', 'bb=c3,w3', 'bb=old']:
        pg = b.new_page(viewport={"width": 1440, "height": 900}); msgs = []; reqs = []
        pg.on('console', lambda m: msgs.append(m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: msgs.append('pageerror ' + str(e)))
        pg.on('request', lambda r: reqs.append(r.url))
        pg.goto(BASE + '?' + q, wait_until='networkidle')
        row = pg.query_selector('.ed-promos'); row.scroll_into_view_if_needed(); pg.wait_for_timeout(2500)
        cls = pg.evaluate("[...document.querySelectorAll('.ed-promos .ed-promo')].map(c=>c.className)")
        tag = q.replace('=', '_').replace(',', '')
        row.screenshot(path=f'r4/after_sw_{tag}.png')
        print(q, cls, 'console', msgs[:3], 'promo-variations?', any('promo-variations' in r for r in reqs), 'giveaway-hero?', any('giveaway-hero' in r for r in reqs))
        pg.close()

    # 2. default: network + race grow frames
    pg = b.new_page(viewport={"width": 1440, "height": 900}); reqs = []
    pg.on('request', lambda r: reqs.append(r.url))
    pg.goto(BASE, wait_until='networkidle')
    print('default: promo-variations requested =', any('promo-variations' in r for r in reqs), '| giveaway-hero requested =', any('giveaway-hero' in r for r in reqs), '| profile.css requested =', any('profile/profile.css' in r for r in reqs))
    pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(300)
    card = pg.query_selector('.ed-race')
    frames = []
    for i, t in enumerate([200, 500, 700, 1000, 1500]):
        pg.wait_for_timeout(t if i == 0 else t - [200, 500, 700, 1000, 1500][i - 1])
        f = f'r4/_g{i}.png'; card.screenshot(path=f); frames.append(f)
    sheet('r4/after_race_grow_1440.png', frames)
    pg.close()

    # 3. fan deal frames + hover
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(BASE, wait_until='networkidle')
    news = pg.query_selector('deepspot-news'); news.scroll_into_view_if_needed(); pg.wait_for_timeout(600)
    pg.mouse.move(5, 5)
    pg.evaluate("document.querySelector('deepspot-news').select(1,true)")
    win = pg.query_selector('deepspot-news .wn-window'); frames = []
    for i, t in enumerate([450, 350, 350, 400, 800]):
        pg.wait_for_timeout(t); f = f'r4/_f{i}.png'; win.screenshot(path=f); frames.append(f)
    # shrink the frames to half for the montage
    for f in frames:
        im = Image.open(f); im.resize((im.width // 2, im.height // 2)).save(f)
    sheet('r4/after_fan_deal_1440.png', frames[:3]); sheet('r4/after_fan_deal_1440b.png', frames[3:])
    pg.wait_for_timeout(1500)
    pg.hover('deepspot-news .wn-panel.wn-active .wn-fan .wn-pc:last-child'); pg.wait_for_timeout(900)
    win.screenshot(path='r4/after_fan_hover_1440.png')
    pg.close()

    # 4. reduced motion
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion='reduce'); pg = ctx.new_page(); msgs = []
    pg.on('console', lambda m: msgs.append(m.text) if m.type in ('error', 'warning') else None)
    pg.goto(BASE, wait_until='networkidle')
    card = pg.query_selector('.ed-race'); card.scroll_into_view_if_needed(); pg.wait_for_timeout(2500)
    card.screenshot(path='r4/after_reduced_race.png')
    news = pg.query_selector('deepspot-news'); news.scroll_into_view_if_needed(); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('deepspot-news').select(1,true)"); pg.wait_for_timeout(600)
    pg.query_selector('deepspot-news .wn-window').screenshot(path='r4/after_reduced_fan.png')
    print('reduced console', msgs[:3])
    ctx.close(); b.close()
