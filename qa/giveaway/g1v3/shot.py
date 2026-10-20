import sys
from playwright.sync_api import sync_playwright
OUT='C:/Users/CharD/Desktop/DeepSpot Globe/qa/giveaway/g1v3/'+sys.argv[1]+'-'
with sync_playwright() as p:
  br=p.chromium.launch(); E=[]
  for w,th,col in [(1440,'dark','on'),(1440,'light','on'),(1024,'dark','on'),(390,'dark','on'),(1440,'dark','off')]:
    pg=br.new_page(viewport={'width':w,'height':900}); pg.on('pageerror',lambda e:E.append(str(e)[:120])); pg.on('console',lambda m:m.type=='error' and E.append(m.text[:120]))
    pg.add_init_script(f"try{{localStorage.setItem('deepspot-panel-color','{col}')}}catch(e){{}}")
    pg.goto(f'http://localhost:8766/community/?theme={th}&race=final'); pg.wait_for_timeout(2500)
    if col=='off': pg.evaluate("document.documentElement.dataset.panelColor='off'")
    pg.wait_for_timeout(300)
    gv=pg.locator('.gv').first; gv.screenshot(path=f'{OUT}gv-{w}-{th}-{col}.png')
    v=pg.locator('.cv-vm').first; v.screenshot(path=f'{OUT}vote-{w}-{th}-{col}.png')
    print(w,th,col,'overflow' if pg.evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth') else 'ok')
    pg.close()
  print('errors',E); br.close()
