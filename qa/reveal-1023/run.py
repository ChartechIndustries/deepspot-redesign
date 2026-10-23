import sys,asyncio,json,os,re
sys.path.insert(0,'qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
OUTD=os.path.dirname(os.path.abspath(__file__))
PAGES={'home':'/','browse':'/browse/','map':'/map/','community':'/community/','profile-preview':'/profile/?user=preview','profile-wayfarer':'/profile/?user=wayfarer',
 'stories':'/stories/','story':'/story/?id=basement','spot':'/spot/?id=akabane-haunted-bar','guides':'/guides/','leaderboard':'/leaderboard/','roadmap':'/roadmap/','faq':'/faq/','welcome':'/welcome/','404':'/404.html'}
only=[a for a in sys.argv[1:] if not a.startswith('-') and not re.fullmatch(r'w\d+',a)]
widths=[int(a[1:]) for a in sys.argv[1:] if re.fullmatch(r'w\d+',a)] or [390,1440]
axe=open(AXE).read()
async def scroll_pass(pg,shots,tag):
  H=await pg.evaluate("innerHeight"); pane=await pg.evaluate("document.documentElement.classList.contains('pp-app')")
  sel="document.querySelector('.pp-rec')" if pane else "document.scrollingElement"
  tot=await pg.evaluate(f"{sel}.scrollHeight"); y=0; mid=False
  while y<tot:
    y+=int(H*.55)
    await pg.evaluate(f"{sel}.scrollTo(0,{y})")
    if shots and not mid and y>=H*.5:
      await pg.wait_for_timeout(260); await pg.screenshot(path=f'{OUTD}/{tag}_mid.png'); mid=True
    await pg.wait_for_timeout(180)
    tot=await pg.evaluate(f"{sel}.scrollHeight")
  await pg.wait_for_timeout(1700)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for name,u in PAGES.items():
      if only and name not in only: continue
      for w in widths+([320] if not only else []):
        ctx=await b.new_context(viewport={'width':w,'height':844 if w<800 else 900},has_touch=w<800,is_mobile=w<800)
        pg=await ctx.new_page(); errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror',lambda e: errs.append('PE '+str(e)))
        ok=False
        for _try in range(2):
          try:
            await pg.goto(BASE+u+('&' if '?' in u else '?')+'theme=dark',wait_until='domcontentloaded',timeout=45000); ok=True; break
          except Exception as ex: print('goto retry',name,w,str(ex)[:60],flush=True)
        if not ok: print(f'{name}_{w} SKIPPED (goto failed twice)',flush=True); await ctx.close(); continue
        await pg.wait_for_timeout(120)
        tag=f'{name}_{w}'
        await pg.wait_for_timeout(2300)
        h0=await pg.evaluate("window.__dsReveal?[window.__dsReveal.hidden.size,document.querySelectorAll('.rv').length]:null")
        if w in (390,1440): await pg.screenshot(path=f'{OUTD}/{tag}_top.png')
        await scroll_pass(pg,w in (390,1440),tag)
        r=await pg.evaluate("({hid:window.__dsReveal?window.__dsReveal.hidden.size:-1,rv:document.querySelectorAll('.rv').length,anim:document.getAnimations().filter(a=>a.effect&&a.effect.getKeyframes&&a.effect.getKeyframes().some(k=>k.translate)).length,sw:document.documentElement.scrollWidth,iw:innerWidth})")
        pane=await pg.evaluate("document.documentElement.classList.contains('pp-app')")
        if pane: await pg.evaluate("document.querySelector('.pp-rec').scrollTo(0,0)")
        else: await pg.evaluate("scrollTo(0,0)")
        await pg.wait_for_timeout(400)
        if w in (390,1440): await pg.screenshot(path=f'{OUTD}/{tag}_final.png',full_page=not pane)
        ax=None
        if w in (390,1440):
          await pg.add_script_tag(content=axe); ax=await pg.evaluate("axe.run().then(r=>r.violations.map(v=>v.id+':'+v.nodes.length))")
        print(f'{tag:24} load(hidden,rv)={h0} end={r} overflow={r["sw"]>r["iw"]} errs={[e[:90] for e in errs]} axe={ax}',flush=True)
        await ctx.close()
    await b.close()
asyncio.run(main())
