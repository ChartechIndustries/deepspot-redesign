"""before/after crops of the three card places at DPR 2. usage: python emboss.py before|after"""
import asyncio,sys
from playwright.async_api import async_playwright
from h import *
tag=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx=await b.new_context(viewport={'width':1440,'height':900},device_scale_factor=2); pg=await ctx.new_page()
    # profile
    await pg.goto(BASE+'/profile/?user=preview&theme=light',wait_until='load'); await pg.wait_for_selector('.pp-id9',timeout=20000); await pg.wait_for_timeout(2500)
    el=await pg.query_selector('.pp-id9'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(600)
    await el.screenshot(path=f'{OUT}/emb-{tag}-profile.png')
    r=await pg.evaluate("(()=>{const e=document.querySelector('.pp-id9 .pp-rows');const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()")
    await pg.screenshot(path=f'{OUT}/emb-{tag}-profile-rows.png',clip={'x':r[0]-10,'y':r[1]-6,'width':r[2]+20,'height':r[3]+12})
    r=await pg.evaluate("(()=>{const e=document.querySelector('.pp-id9 .pp-id9-mrz');const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()")
    await pg.screenshot(path=f'{OUT}/emb-{tag}-profile-mrz.png',clip={'x':r[0]-10,'y':r[1]-6,'width':r[2]+20,'height':r[3]+12})
    # community
    await pg.goto(BASE+'/community/?theme=dark',wait_until='load'); await pg.wait_for_selector('.pm-card',timeout=20000); await pg.wait_for_timeout(1500)
    await pg.evaluate("document.querySelector('.pm-card').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(3500)
    await pg.evaluate("document.querySelector('.pm-card').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1500)
    info=await pg.evaluate("[...document.querySelectorAll('.pm-card')].map(c=>{const r=c.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}).slice(0,8)")
    print(info)
    el=await pg.query_selector('.pm-card'); await el.screenshot(path=f'{OUT}/emb-{tag}-community.png')
    # onboarding card (filled name)
    await b.close()
asyncio.run(main())
