import sys
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
VIEWS={'1440d':(1440,900,'dark'),'1440l':(1440,900,'light'),'390d':(390,844,'dark')}
SPOT='/spot/?id=tochigi-underground-quarry'; STORY='/story/?id=shark'
def go(pg,u,theme,gate):
    sep='&' if '?' in u else '?'
    pg.goto(f'{B}{u}{sep}theme={theme}&gate={gate}'); pg.wait_for_timeout(1800)
def main(which):
  errs=[]
  with sync_playwright() as p:
    br=p.chromium.launch()
    for vk in which:
      w,h,theme=VIEWS[vk]
      ctx=br.new_context(viewport={'width':w,'height':h}); ctx.add_init_script("")
      pg=ctx.new_page()
      pg.on('console',lambda m:m.type=='error' and errs.append(m.text[:160]))
      pg.on('pageerror',lambda e:errs.append(str(e)[:160]))
      for name,u in [('spot',SPOT),('story',STORY)]:
        for st in ['out','free','member']:
          go(pg,u,theme,st); pg.screenshot(path=f'{name}-{st}-{vk}.png')
      # action sheets
      go(pg,'/community/',theme,'out')
      pg.locator('[data-save-spot]').first.scroll_into_view_if_needed(); pg.locator('[data-save-spot]').first.click(); pg.wait_for_timeout(600)
      pg.screenshot(path=f'action-save-{vk}.png'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
      pg.locator('[data-v-yes]').first.scroll_into_view_if_needed(); pg.locator('[data-v-yes]').first.click(); pg.wait_for_timeout(600)
      pg.screenshot(path=f'action-vote-{vk}.png')
      go(pg,SPOT,theme,'free')
      pg.locator('[data-gallery-open="1"]').first.scroll_into_view_if_needed(); pg.locator('[data-gallery-open="1"]').first.click(); pg.wait_for_timeout(600)
      pg.screenshot(path=f'member-gallery-{vk}.png')
      go(pg,'/community/',theme,'free')
      pg.locator('.gv-join').first.scroll_into_view_if_needed(); pg.locator('.gv-join').first.click(); pg.wait_for_timeout(600)
      pg.screenshot(path=f'member-giveaway-{vk}.png')
      ctx.close()
  print('errors',errs)
main(sys.argv[1:] or ['1440d'])
