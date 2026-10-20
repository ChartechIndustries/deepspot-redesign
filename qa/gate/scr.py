from playwright.sync_api import sync_playwright
with sync_playwright() as p:
  br=p.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':900})
  for n,u in [('spot','/spot/?id=tochigi-underground-quarry'),('story','/story/?id=shark')]:
    pg.goto('http://localhost:8766'+u+'&theme=dark&gate=out'); pg.wait_for_timeout(1800)
    pg.evaluate("document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(400)
    pg.screenshot(path=f'{n}-out-scrolled-1440d.png')
