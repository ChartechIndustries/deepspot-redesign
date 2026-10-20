from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1440,'height':900})
    pg.goto('http://localhost:8766/community/?race=final');pg.wait_for_timeout(2500)
    print('sections',pg.evaluate("[...document.querySelectorAll('.cv>section,.cv>div')].map(e=>e.className.split(' ').slice(0,2).join('.'))"))
    print('old banner/board gone',pg.evaluate("!document.querySelector('.cv-car,.cv-board,.cv-pass')"))
    pg.click('.cv-opt >> nth=0');print('poll pressed',pg.evaluate("document.querySelector('.cv-opt').getAttribute('aria-pressed')"))
    pg.click('[data-tab=newest]');print('tab newest',pg.evaluate("document.querySelector('[data-tab=newest]').getAttribute('aria-pressed')"),pg.evaluate("document.querySelectorAll('.cv-spot').length"))
    pg.click('.cv-vote [data-v-yes] >> nth=0');print('vote',pg.evaluate("document.querySelector('.cv-vote').dataset.v"))
    pg.click('[data-ud=up] >> nth=0');print('road',pg.evaluate("document.querySelector('[data-road]').dataset.v"))
    pg.goto('http://localhost:8766/community/?v=hub1');pg.wait_for_timeout(1500);print('hub1',pg.evaluate("document.body.innerText.length>500"))
    pg.goto('http://localhost:8766/community/?v=old');pg.wait_for_timeout(1500);print('old',pg.evaluate("document.body.innerText.length>500"))
    # replay button works
    pg.goto('http://localhost:8766/community/?giveaway=g5');pg.wait_for_timeout(5500)
    pg.click('[data-replay]');pg.wait_for_timeout(900);print('replay running',pg.evaluate("!document.querySelector('.gv-stage').classList.contains('gv-done')"))
    pg.wait_for_timeout(4000);print('done again',pg.evaluate("document.querySelector('.gv-stage').classList.contains('gv-done')"),pg.evaluate("document.querySelector('.gv-stage').classList.contains('gv-idle')"))
    # reduced motion
    ctx=b.new_context(reduced_motion='reduce',viewport={'width':1440,'height':900});q=ctx.new_page();q.goto('http://localhost:8766/community/?giveaway=g2');q.wait_for_timeout(1500)
    print('reduced: pts',q.evaluate("document.querySelector('.gv-pts').textContent"),'replay hidden',q.evaluate("document.querySelector('[data-replay]').hidden"),'t',q.evaluate("document.querySelector('.gv-rc').style.getPropertyValue('--t')"))
    b.close()
