from playwright.sync_api import sync_playwright
B='http://localhost:8766'
with sync_playwright() as p:
  br=p.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':900})
  for n,u in [('spot','/spot/?id=tochigi-underground-quarry'),('story','/story/?id=shark'),('membership','/membership/')]:
    pg.goto(B+u+'&theme=dark' if '?' in u else B+u+'?theme=dark'); pg.wait_for_timeout(1500)
    pg.screenshot(path=f'base/{n}.png')
