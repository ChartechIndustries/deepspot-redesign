from playwright.sync_api import sync_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
    b=p.chromium.launch(args=A)
    for u,n in [('/community/','cur-community'),('/competition/','cur-competition')]:
        pg=b.new_page(viewport={'width':1440,'height':900});pg.goto('http://localhost:8766'+u+'?theme=dark');pg.wait_for_timeout(2500);pg.screenshot(path=f'qa/giveaway/{n}.png',full_page=(n=='cur-competition'));
    b.close()
