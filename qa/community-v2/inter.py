from playwright.sync_api import sync_playwright
B='http://localhost:8766'; out={}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page(); pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto(B+'/community/',wait_until='networkidle'); pg.wait_for_timeout(500)
    act=lambda: pg.evaluate("document.querySelector('.cv-car').dataset.index")
    pg.click('[data-next]'); out['next']=act()
    pg.click('[data-prev]'); out['prev']=act()
    pg.click('[data-dot="2"]'); out['dot2']=act()
    pg.focus('[data-dot="2"]'); pg.keyboard.press('ArrowRight'); out['key']=act()
    pg.click('[data-pause]'); out['paused']=pg.get_attribute('[data-pause]','aria-pressed')
    pg.click('[data-lb=all]'); out['lb_all']=pg.inner_text('[data-lbtitle]')+' / hidden month='+str(pg.get_attribute('[data-rows=month]','hidden'))
    pg.click('[data-lb=month]')
    s1=pg.inner_text('[data-u=s]'); pg.wait_for_timeout(2200); out['tick']=(s1,pg.inner_text('[data-u=s]'))
    t0=pg.inner_text('[data-pcount]'); pg.click('[data-pp-next]'); pg.wait_for_timeout(900); out['pp']=(t0,pg.inner_text('[data-pcount]'))
    pg.click('[data-opt="1"]'); 
    pg.click('[data-tab=high]'); out['high_n']=pg.locator('[data-grid] .cv-spot').count()
    pg.click('[data-tab=newest]'); out['newest_n']=pg.locator('[data-grid] .cv-spot').count()
    pg.click('[data-tab=near]'); pg.wait_for_timeout(1500); out['near_msg']=pg.inner_text('[data-basis]'); out['near_n']=pg.locator('[data-grid] .cv-spot').count()
    pg.click('[data-tab=trending]')
    first=pg.locator('[data-grid] .cv-spot').first
    first.locator('[data-v-yes]').click()
    pending=pg.locator('[data-pending] .cv-spot').first; pending.locator('[data-v-no]').click()
    first.locator('.ds-save').click(); sid=first.locator('.ds-save').get_attribute('data-save-spot')
    pg.locator('[data-road=trip-lists] [data-ud=up]').click(); pg.locator('[data-road=passports] [data-ud=down]').click()
    pg.reload(wait_until='networkidle'); pg.wait_for_timeout(500)
    out['poll_after_reload']=pg.get_attribute('[data-opt="1"]','aria-pressed')
    f=pg.locator('[data-grid] .cv-spot').first
    out['yes_after_reload']=f.locator('[data-v-yes]').get_attribute('aria-pressed'); out['pending_no']=pg.locator('[data-pending] .cv-spot').first.locator('[data-v-no]').get_attribute('aria-pressed')
    out['road_up']=pg.get_attribute('[data-road=trip-lists] [data-ud=up]','aria-pressed'); out['road_down']=pg.get_attribute('[data-road=passports] [data-ud=down]','aria-pressed')
    out['bookmark']=f.locator('.ds-save').get_attribute('aria-pressed')
    pg.goto(B+'/saved/',wait_until='networkidle'); pg.wait_for_timeout(800)
    out['saved_has']=sid.split('/')[-1] in pg.content(); 
    # reduced motion
    c2=b.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce'); p2=c2.new_page(); p2.goto(B+'/community/',wait_until='networkidle'); out['rm_pause_hidden']=p2.evaluate("document.querySelector('[data-pause]').hidden")
    # geolocation granted
    c3=b.new_context(viewport={'width':1440,'height':900},permissions=['geolocation'],geolocation={'latitude':35.68,'longitude':139.69}); p3=c3.new_page(); p3.goto(B+'/community/',wait_until='networkidle'); p3.click('[data-tab=near]'); p3.wait_for_timeout(1500)
    out['near_geo']=p3.locator('[data-grid] .cv-place').first.inner_text()
    b.close()
for k,v in out.items(): print(k,v)
