from playwright.sync_api import sync_playwright
B='http://localhost:8766'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1440,'height':900})
    pg.goto(B+'/community/?theme=dark',wait_until='networkidle');pg.wait_for_timeout(800)
    cards=pg.evaluate("()=>[...document.querySelectorAll('.cv-pp a')].map(a=>[a.getAttribute('aria-label'),a.getAttribute('href')])")
    print(len(cards));bad=0
    for label,href in cards:
        q=b.new_page(viewport={'width':1440,'height':900});q.goto(B+href,wait_until='networkidle');q.wait_for_timeout(400)
        name=q.inner_text('#pp-name');ok=label==name+'’s passport' and q.locator('.pp-molebox .pp-mole img').count()==1
        print('OK ' if ok else 'BAD',label,href,name,q.locator('.pp-lvl b').inner_text() if q.locator('.pp-lvl b').count() else '-');bad+=not ok;q.close()
    print('bad',bad)
