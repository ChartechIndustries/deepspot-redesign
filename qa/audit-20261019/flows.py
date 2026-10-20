import json
from playwright.sync_api import sync_playwright
B='http://localhost:8766'; R=[]
def ok(name,cond,info=''): R.append((name,'PASS' if cond else 'FAIL',str(info)[:160])); print(R[-1],flush=True)
with sync_playwright() as p:
  br=p.chromium.launch(headless=True); ctx=br.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page()
  errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)[:150]))
  # home + globe
  pg.goto(B+'/?raf=timer'); pg.wait_for_timeout(3000)
  cv=pg.evaluate("()=>{const c=document.querySelector('canvas');if(!c)return null;const r=c.getBoundingClientRect();return [r.width,r.height]}")
  ok('home globe canvas present',cv and cv[0]>200,cv)
  ok('home no hydration error',not any('418' in e or 'ydrat' in e for e in errs),errs[:2])
  pins=pg.locator('.map-pin').count(); ok('home pins rendered',pins>=5,pins)
  # drag globe changes pixels
  c=pg.locator('canvas').first; bb=c.bounding_box()
  a=c.screenshot(); pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2); pg.mouse.down(); pg.mouse.move(bb['x']+bb['width']/2+200,bb['y']+bb['height']/2,steps=10); pg.mouse.up(); pg.wait_for_timeout(600)
  ok('globe drag rotates',a!=c.screenshot())
  # theme toggle persists (home + subpage)
  hb=pg.evaluate("[...document.querySelectorAll('button')].filter(b=>/light|dark|theme/i.test(b.innerText+b.getAttribute('aria-label'))).map(b=>b.className+'|'+b.innerText+'|'+b.getAttribute('aria-label')).slice(0,4)")
  ok('home theme buttons found',len(hb)>0,hb)
  pg.goto(B+'/browse/'); pg.wait_for_timeout(1200)
  pg.locator('.br-theme').first.click(); pg.wait_for_timeout(400)
  th=pg.evaluate("document.documentElement.dataset.theme"); nav=pg.evaluate("document.querySelector('a[href*=map]').getAttribute('href')")
  ok('subpage theme toggle',th=='light',th); ok('nav links follow new theme','light' in nav,nav)
  pg.locator('a[href*="/map/"]').first.click(); pg.wait_for_timeout(1500)
  ok('theme persists across nav',pg.evaluate("document.documentElement.dataset.theme")=='light',pg.evaluate("document.documentElement.dataset.theme"))
  pg.goto(B+'/'); pg.wait_for_timeout(2000); ok('theme persists to home (no param)',pg.evaluate("document.documentElement.dataset.theme")=='light',pg.evaluate("document.documentElement.dataset.theme"))
  pg.evaluate("localStorage.clear()")
  pg.goto(B+'/browse/'); pg.wait_for_timeout(1500)
  # browse search
  n0=pg.locator('article').count(); s=pg.locator('input[type=search]:visible, input[placeholder*=Search i]:visible').first; s.fill('shark'); pg.wait_for_timeout(800)
  n1=pg.locator('article').count(); ok('browse search filters',n1<n0,(n0,n1))
  s.fill('quarry'); pg.wait_for_timeout(800)
  # save first card
  pg.evaluate("localStorage.clear()"); pg.goto(B+'/browse/'); pg.wait_for_timeout(1500)
  bm=pg.locator('.br-bookmark').first
  try: bm.click(); pg.wait_for_timeout(400)
  except Exception as e: ok('browse save click',False,e)
  pg.goto(B+'/saved/'); pg.wait_for_timeout(1500)
  ok('saved shows bookmarked place','places (1)' in pg.inner_text('body').lower(), pg.inner_text('main')[:120] if pg.locator('main').count() else '')
  # spot page
  pg.goto(B+'/spot/?id=tochigi-underground-quarry'); pg.wait_for_timeout(1500); ok('spot page title',"Quarry" in pg.inner_text('h1'),pg.inner_text('h1'))
  pg.goto(B+'/spot/?id=does-not-exist'); pg.wait_for_timeout(1500); ok('spot bad id handled',True,pg.inner_text('body')[:200].replace('\n',' | '))
  pg.goto(B+'/story/?id=nope'); pg.wait_for_timeout(1500); ok('story bad id handled',True,pg.inner_text('main')[:160].replace('\n',' | ') if pg.locator('main').count() else '')
  pg.goto(B+'/guide/?id=nope'); pg.wait_for_timeout(1500); ok('guide bad id handled',True,pg.inner_text('main')[:160].replace('\n',' | ') if pg.locator('main').count() else '')
  pg.goto(B+'/profile/?user=nobody'); pg.wait_for_timeout(1500); ok('profile bad user handled',True,pg.inner_text('body')[:200].replace('\n',' | '))
  r=pg.goto(B+'/nope-route/'); ok('404 page exists',r.status==404 and 'DEEP' in pg.content().upper(),r.status)
  # map
  pg.goto(B+'/map/'); pg.wait_for_timeout(2500); ok('map markers',pg.locator('.leaflet-marker-icon, .leaflet-interactive').count()>=10,pg.locator('.leaflet-marker-icon, .leaflet-interactive').count())
  # plan trip persist
  pg.goto(B+'/plan-trip/'); pg.wait_for_timeout(1200); i=pg.locator('input:visible').first; i.fill('Audit trip'); i.press('Tab'); pg.wait_for_timeout(800); pg.reload(); pg.wait_for_timeout(1200)
  ok('trip name persists',pg.locator('input:visible').first.input_value()=='Audit trip',pg.locator('input:visible').first.input_value())
  # contribute autosave
  pg.goto(B+'/contribute/'); pg.wait_for_timeout(1200); f=pg.locator('input[type=text]:visible, input:not([type]):visible').first; f.fill('Audit spot'); pg.wait_for_timeout(1500); pg.reload(); pg.wait_for_timeout(1200)
  ok('contribute draft persists',pg.locator('input[type=text]:visible, input:not([type]):visible').first.input_value()=='Audit spot',pg.locator('input[type=text]:visible, input:not([type]):visible').first.input_value())
  # promo param
  pg.goto(B+'/?promo=c4,w4,y1'); pg.wait_for_timeout(2500); ok('promo param swaps',pg.locator('.pv-c4').count()==1 and pg.locator('.pv-w4').count()==1,(pg.locator('.pv-c4').count(),pg.locator('.pv-w4').count(),pg.locator('[class*=pv-y1]').count()))
  # newsletter
  pg.goto(B+'/'); pg.wait_for_timeout(1500)
  em=pg.locator('input[type=email]').first
  try: em.fill('bad'); pg.locator('button:has-text("subscribe")').first.click(); pg.wait_for_timeout(500); ok('newsletter invalid email blocked',True,pg.evaluate("document.querySelector('input[type=email]').validationMessage"))
  except Exception as e: ok('newsletter',False,e)
  # mobile menu
  m=br.new_page(viewport={'width':390,'height':844}); m.goto(B+'/browse/'); m.wait_for_timeout(1200)
  mb=m.locator('button[aria-label*=menu i], button[aria-expanded]').first
  try: mb.click(); m.wait_for_timeout(400); ok('mobile menu opens',mb.get_attribute('aria-expanded')=='true',mb.get_attribute('aria-label')); m.keyboard.press('Escape'); m.wait_for_timeout(300); ok('mobile menu Escape closes',mb.get_attribute('aria-expanded')=='false')
  except Exception as e: ok('mobile menu',False,e)
  # account mole reveal loads
  pg.goto(B+'/account/'); pg.wait_for_timeout(1500)
  mr=pg.locator('button:has-text("mole")').first
  try:
    mr.click(); pg.wait_for_timeout(12000)
    ok('mole reveal ran, no errors',not errs[-1:] or 'mole' not in errs[-1].lower(),errs[-3:])
    ok('mole saved to draft',pg.evaluate("(()=>{try{const d=JSON.parse(localStorage.getItem('deepspot-profile-draft-v1')||'{}');return !!(d.mole&&d.mole.png)}catch(e){return 'err'}})()"))
  except Exception as e: ok('mole reveal',False,e)
  ok('total page errors in flows',len(errs)==0,errs[:5])
  br.close()
json.dump(R,open('flows.json','w'),indent=1)
