import sys,asyncio,json
sys.path.insert(0,'qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
JS="""(maxd)=>{const out=[];const d=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\\s+/).slice(0,3).join('.'):'');
function walk(e,dep){const cs=getComputedStyle(e);const r=e.getBoundingClientRect();const kids=[...e.children].filter(c=>!/^(SCRIPT|STYLE)$/.test(c.tagName));
out.push(' '.repeat(dep*2)+d(e)+' '+cs.display+(cs.position!='static'?' pos:'+cs.position:'')+' h'+Math.round(r.height)+' w'+Math.round(r.width)+' kids'+kids.length);
if(dep<maxd){const show=kids.slice(0,4);show.forEach(k=>walk(k,dep+1));if(kids.length>4)out.push(' '.repeat(dep*2+2)+'... +'+(kids.length-4));}}
const m=document.querySelector('main');walk(m,0);return out.join('\\n');}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':int(sys.argv[1]),'height':900})
    pg=await ctx.new_page()
    for u in sys.argv[3:]:
      await pg.goto(BASE+u,wait_until='load'); await pg.wait_for_timeout(3000)
      print('##',u); print(await pg.evaluate(JS,int(sys.argv[2])))
    await b.close()
asyncio.run(main())
