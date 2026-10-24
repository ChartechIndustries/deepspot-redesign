import sys,asyncio,os
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for (w,h,th,rm) in [(1440,900,'dark',False),(390,844,'light',False),(1440,900,'light',True)]:
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800,reduced_motion='reduce' if rm else 'no-preference')
      pg=await ctx.new_page();errs=[]
      pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e: errs.append(str(e)))
      await pg.goto(f'{BASE}/community/?theme={th}',wait_until='load');await pg.wait_for_selector('.dv-pin',timeout=30000);await pg.wait_for_timeout(1500)
      t=f'{w}-{th}{"-rm" if rm else ""}'
      # open via pin link
      await pg.click('.dv-pin a');await pg.wait_for_timeout(900)
      print(t,'open',await pg.evaluate("!!document.querySelector('dialog.ds-dlg[open]')"),'hash',await pg.evaluate('location.hash'))
      await pg.screenshot(path=f'{O}/dlg-{t}.png')
      print(t,'ol items',await pg.evaluate("document.querySelectorAll('.ds-dlg li').length"),'x size',await pg.evaluate("(()=>{const r=document.querySelector('.ds-dlg-x').getBoundingClientRect();return [r.width,r.height]})()"))
      # back closes
      await pg.go_back();await pg.wait_for_timeout(700)
      print(t,'after back open?',await pg.evaluate("!!document.querySelector('dialog.ds-dlg')"),'hash',await pg.evaluate('location.hash'))
      # esc
      await pg.click('.dv-pin a');await pg.wait_for_timeout(600);await pg.keyboard.press('Escape');await pg.wait_for_timeout(700)
      print(t,'after esc',await pg.evaluate("!!document.querySelector('dialog.ds-dlg')"),'hash',await pg.evaluate('location.hash'))
      # outside click (desktop)
      if w>800:
        await pg.click('.dv-pin a');await pg.wait_for_timeout(600);await pg.mouse.click(8,8);await pg.wait_for_timeout(700)
        print(t,'after outside',await pg.evaluate("!!document.querySelector('dialog.ds-dlg')"))
      # deep link
      await pg.goto(f'{BASE}/community/?theme={th}#guidelines',wait_until='load');await pg.wait_for_timeout(3000)
      print(t,'deeplink open',await pg.evaluate("!!document.querySelector('dialog.ds-dlg[open]')"))
      await pg.click('.ds-dlg-x');await pg.wait_for_timeout(700)
      print(t,'x closed',await pg.evaluate("!document.querySelector('dialog.ds-dlg')"),'hash',repr(await pg.evaluate('location.hash')))
      # chat arrival
      if not rm:
        await pg.evaluate("document.querySelector('[data-chat]').scrollIntoView({block:'center'})");await pg.wait_for_timeout(4200)
        await pg.screenshot(path=f'{O}/chat-typing-{t}.png');
        print(t,'typing row',await pg.evaluate("!!document.querySelector('.ch-typing')"),'rows',await pg.evaluate("document.querySelectorAll('.ch-row').length"))
        await pg.wait_for_timeout(2500);print(t,'rows after',await pg.evaluate("[...document.querySelectorAll('.ch-row')].map(r=>r.dataset.fid?.slice(-4)||'typing')"))
      print(t,'overflow',await pg.evaluate('document.documentElement.scrollWidth-innerWidth'),'errs',errs[:3])
      if rm:
        await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})");await pg.wait_for_timeout(500)
        await pg.click('[data-pm-deal]');await pg.wait_for_timeout(400);await pg.screenshot(path=f'{O}/rm-open-{t}.png')
      await ctx.close()
    await b.close()
asyncio.run(main())
