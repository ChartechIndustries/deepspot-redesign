import sys,os,json
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','onboarding-v2.2'))
import h
from playwright.sync_api import sync_playwright
B='http://localhost:8766'; OUT=os.path.dirname(os.path.abspath(__file__))
GL=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
  br=p.chromium.launch(headless=True,args=GL)
  ctx=br.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page()
  pg.goto(B+'/'); pg.wait_for_timeout(3500)
  print('heroes',pg.evaluate("[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Extra Un-/.test(e.textContent)).map(e=>e.tagName+'.'+e.className+' vis='+(e.getBoundingClientRect().height>0)+' aria='+!!e.closest('[aria-hidden=true]')+' y='+Math.round(e.getBoundingClientRect().top+scrollY))"))
  print('state0',pg.evaluate("({th:document.documentElement.dataset.theme,cls:document.documentElement.className,pc:document.documentElement.dataset.panelColor,ls:JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>/theme|color|panel/i.test(k))))})"))
  print('buttons',pg.evaluate("[...document.querySelectorAll('header button, header a')].map(b=>b.tagName+'|'+(b.getAttribute('aria-label')||'')+'|'+b.textContent.trim().slice(0,20)+'|'+(b.getAttribute('href')||''))"))
  pg.locator('header button:has-text("Light"), header a:has-text("Light")').first.click(); pg.wait_for_timeout(2500)
  print('after theme click',pg.url,pg.evaluate("({th:document.documentElement.dataset.theme,cls:document.documentElement.className,bg:getComputedStyle(document.body).backgroundColor,ls:JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>/theme|color|panel/i.test(k))))})"))
  pg.screenshot(path=f'{OUT}/shots/probe2_home_after_theme_1440.png')
  b=pg.locator('header button:has-text("color"), header [aria-label*=olor]').first
  print('color btn',b.count())
  if b.count(): b.click(); pg.wait_for_timeout(1500)
  print('after color',pg.url,pg.evaluate("({pc:document.documentElement.dataset.panelColor,ls:JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>/theme|color|panel/i.test(k))))})"))
  pg.screenshot(path=f'{OUT}/shots/probe2_home_after_color_1440.png')
  pg.goto(B+'/browse/'); pg.wait_for_timeout(2000)
  print('browse',pg.evaluate("({th:document.documentElement.dataset.theme,pc:document.documentElement.dataset.panelColor})"))
  pg.locator('.br-theme').first.click(); pg.wait_for_timeout(500); pg.locator('.color-toggle').first.click(); pg.wait_for_timeout(500)
  print('browse after toggles',pg.evaluate("({th:document.documentElement.dataset.theme,pc:document.documentElement.dataset.panelColor,ls:JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>/theme|color|panel/i.test(k))))})"))
  for r in ['/','/community/','/profile/?user=wayfarer','/welcome/']:
    pg.goto(B+r); pg.wait_for_timeout(3000)
    print('carry',r,pg.evaluate("({th:document.documentElement.dataset.theme,pc:document.documentElement.dataset.panelColor,bg:getComputedStyle(document.body).backgroundColor})"))
    pg.screenshot(path=f'{OUT}/shots/probe2_carry_{r.strip("/").split("/")[0].split("?")[0] or "home"}_1440.png')
  ctx.close()
  # community spot vote, real button
  ctx=br.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); pg=ctx.new_page()
  pg.goto(B+'/community/'); pg.wait_for_timeout(3000)
  y=pg.locator('button:text-is("yes")').first; y.scroll_into_view_if_needed(); pg.wait_for_timeout(500)
  card=y.locator('xpath=ancestor::*[contains(@class,"cv") or self::article][1]')
  before=pg.evaluate("e=>e.closest('article,li,[class*=card]').outerHTML.length",y.element_handle())
  t0=pg.evaluate("e=>e.closest('article,li,[class*=card]').innerText",y.element_handle())
  y.click(); pg.wait_for_timeout(900)
  t1=pg.evaluate("e=>e.closest('article,li,[class*=card]').innerText",y.element_handle())
  print('vote before',repr(t0[-120:])); print('vote after',repr(t1[-160:]), 'pressed',y.get_attribute('aria-pressed'))
  y.screenshot(path=f'{OUT}/shots/probe2_vote_btn.png')
  pg.evaluate("e=>e.closest('article,li,[class*=card]').scrollIntoView({block:'center'})",y.element_handle()); pg.wait_for_timeout(300)
  pg.screenshot(path=f'{OUT}/shots/probe2_vote_390.png')
  ctx.close(); br.close()
