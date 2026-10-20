from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (1440,390):
        pg=b.new_page(viewport={'width':w,'height':844 if w==390 else 900});pg.goto('http://localhost:8766/community/?giveaway=g3&race=final');pg.wait_for_timeout(1800)
        btn=pg.locator('.gv-head [data-more]');btn.focus();btn.press('Enter');pg.wait_for_timeout(400)
        print(w,'open',pg.evaluate("!!document.querySelector('dialog.gv-dialog[open]')"),'focus in',pg.evaluate("document.querySelector('dialog.gv-dialog').contains(document.activeElement)"))
        for _ in range(12):pg.keyboard.press('Tab')
        print(' trapped',pg.evaluate("document.querySelector('dialog.gv-dialog').contains(document.activeElement)"))
        pg.screenshot(path=f'qa/giveaway/dialog-{w}.png')
        dims=pg.evaluate("(()=>{const d=document.querySelector('dialog.gv-dialog');return [d.scrollWidth,d.clientWidth,d.getBoundingClientRect().width]})()");print(' dims',dims)
        pg.keyboard.press('Escape');pg.wait_for_timeout(300)
        print(' closed',pg.evaluate("!document.querySelector('dialog.gv-dialog')"),'focus back',pg.evaluate("document.activeElement.matches('.gv-head [data-more]')"))
        # graphic cta read more via click
        pg.locator('.gv-cta [data-more]').click();pg.wait_for_timeout(300);print(' cta open',pg.evaluate("!!document.querySelector('dialog[open]')"));pg.click('.gv-x');pg.wait_for_timeout(200)
        print(' after x',pg.evaluate("document.activeElement.matches('.gv-cta [data-more]')"))
    b.close()
