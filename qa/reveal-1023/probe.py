import sys,asyncio,json
sys.path.insert(0,'qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
PAGES=['/','/browse/','/map/','/community/','/profile/?user=preview','/stories/','/story/?id=','/spot/','/guides/','/leaderboard/','/roadmap/','/faq/','/404.html']
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for w in (390,1440):
      ctx=await b.new_context(viewport={'width':w,'height':900})
      pg=await ctx.new_page()
      for u in sys.argv[1:] or PAGES:
        await pg.goto(BASE+u,wait_until='load'); await pg.wait_for_timeout(2500)
        r=await pg.evaluate("""()=>{const d=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).join('.'):'');
        const m=document.querySelector('main');const out=[];
        out.push('body>'+[...document.body.children].map(d).join(' | '));
        if(m){out.push('main '+d(m)+' >> '+[...m.children].map(c=>d(c)+'['+Math.round(c.getBoundingClientRect().height)+']').join(' | '));}
        return out.join('\\n');}""")
        print('##',w,u,'\n',r)
      await ctx.close()
    await b.close()
asyncio.run(main())
