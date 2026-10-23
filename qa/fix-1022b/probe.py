"""FIX-1022B probe. usage: python probe.py <tag> [comm|prof|seq|title|both|all]
comm  = first-load frames (390,1440) + deck-above-hero check
seq   = scroll to deck, frames at 0/.5/1/1.5/2/2.5/3.5s + measured reveal timing
title = title label dark+light at 1440/390/320
prof  = profile at every size, every tab, own + other, clip + fit checks + axe + console"""
import sys,asyncio,os,json
sys.path.insert(0,'C:/Users/CharD/Desktop/DeepSpot Globe/qa/onboarding-v2.2')
from h import *
from playwright.async_api import async_playwright
O=os.path.dirname(os.path.abspath(__file__))
tag=sys.argv[1] if len(sys.argv)>1 else 'r0'
what=sys.argv[2] if len(sys.argv)>2 else 'all'
ARGS=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
CLIP="""()=>{const out=[];const vw=innerWidth,vh=innerHeight;
for(const e of document.querySelectorAll('.pp-main *')){const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
 if(e.closest('[hidden]'))continue;
 let p=e.parentElement;while(p&&p!==document.body){const ps=getComputedStyle(p);if(/(hidden|clip|auto|scroll)/.test(ps.overflowY)||/(hidden|clip)/.test(ps.overflowX)){const pr=p.getBoundingClientRect();const scrolls=/(auto|scroll)/.test(ps.overflowY);
   if(!scrolls&&(r.bottom>pr.bottom+2||r.right>pr.right+2)&&e.children.length<6&&(e.textContent.trim()||e.tagName==='IMG'||e.tagName==='CANVAS'||e.tagName==='BUTTON')){out.push((e.className||e.tagName).toString().slice(0,40)+' in '+(p.className||p.tagName).toString().slice(0,30)+' by '+Math.round(Math.max(r.bottom-pr.bottom,r.right-pr.right)));}break;}p=p.parentElement;}
 if(r.bottom>vh+2&&getComputedStyle(document.documentElement).overflow==='hidden'&&e.children.length<4&&e.textContent.trim()&&!e.closest('.pp-rec,.pp-stage'))out.push('OFFSCREEN '+(e.className||e.tagName).toString().slice(0,40)+' by '+Math.round(r.bottom-vh));}
return [...new Set(out)].slice(0,25)}"""
FIT="""()=>{const o={};const vw=innerWidth,vh=innerHeight;o.ovx=document.documentElement.scrollWidth-vw;
const field=document.querySelector('.pp-field'),stage=document.querySelector('.pp-stage'),obj=document.querySelector('#pp-pane-pass .pp-passobj'),bar=document.querySelector('.pp-sharebar'),back=document.querySelector('.pp-tabs-back'),rec=document.querySelector('.pp-rec');
if(vw<1100)return o;
const fr=field.getBoundingClientRect();
const R=e=>e.getBoundingClientRect();
o.zoom=obj.style.zoom;o.stageScrolls=stage.scrollHeight>stage.clientHeight+1;
o.cardBottomOver=Math.round(R(obj).bottom-fr.bottom);o.barBottomOver=bar?Math.round(R(bar).bottom-fr.bottom):null;
o.cardTopUnderBack=Math.round(R(obj).top-R(back).bottom);
const tabs=[...document.querySelectorAll('.pp-vtab')].map(R);const bk=R(back);
o.tabsTopOver=Math.round(document.querySelector('.pp-book').getBoundingClientRect().top-Math.min(...tabs.map(t=>t.top)));
o.tabsBottomOver=Math.round(Math.max(...tabs.map(t=>t.bottom))-vh);
o.tabHitsBack=tabs.some(t=>!(t.right<bk.left||t.left>bk.right||t.bottom<bk.top||t.top>bk.bottom));
o.recScrolls=rec.scrollHeight>rec.clientHeight+1;o.recH=rec.clientHeight;o.recSH=rec.scrollHeight;
rec.scrollTop=rec.scrollHeight;const rr=R(rec);const kids=[...rec.querySelectorAll(':scope>*')].filter(k=>k.getBoundingClientRect().height>0);const last=kids[kids.length-1];o.lastBottomOver=Math.round(R(last).bottom-rr.bottom);rec.scrollTop=0;
const bio=document.querySelector('.pp-bio-text');if(bio&&bio.offsetParent){const b=bio.parentElement;o.bioClip=bio.scrollHeight>b.clientHeight+1;}
return o}"""
async def axe(pg):
  try:
    await pg.add_script_tag(path=AXE)
    r=await pg.evaluate("axe.run(document,{resultTypes:['violations']}).then(r=>r.violations.map(v=>v.id+':'+v.nodes.length+' '+v.nodes.slice(0,2).map(n=>n.target.join(' ')).join('|')))")
    return r
  except Exception as e: return ['axe-fail '+str(e)[:80]]
def newctx(b,w,h,touch=False):
  return b.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch)
async def mkpage(ctx):
  pg=await ctx.new_page();pg.errs=[]
  pg.on('console',lambda m: pg.errs.append(m.text) if m.type=='error' else None)
  pg.on('pageerror',lambda e: pg.errs.append(str(e)))
  return pg
async def comm(b):
  for w,h in [(1440,900),(390,844)]:
    ctx=await newctx(b,w,h,w<800);pg=await mkpage(ctx)
    await pg.add_init_script("""window.__fr=[];(function(){const t0=performance.now();const iv=setInterval(()=>{const pm=document.querySelector('.pm'),gv=document.querySelector('.gv'),cv=document.querySelector('.cv');
      const vis=e=>{if(!e)return null;const r=e.getBoundingClientRect();return Math.round(r.top+scrollY)};
      window.__fr.push([Math.round(performance.now()-t0),!!cv,cv?+getComputedStyle(cv).opacity:null,vis(gv),vis(pm)]);},40);setTimeout(()=>clearInterval(iv),5000);})()""")
    await pg.goto(BASE+'/community/?theme=dark',wait_until='commit')
    prev=0
    for t in [150,300,500,800,1200,1800,2600,4000]:
      await pg.wait_for_timeout(t-prev);prev=t
      await pg.screenshot(path=f'{O}/{tag}-comm-{w}-{t:04d}.png')
    await pg.wait_for_timeout(1200)
    fr=await pg.evaluate("window.__fr")
    bad=[f for f in fr if f[1] and f[2] and f[2]>0.02 and f[4] is not None and (f[3] is None or f[4]<=f[3])]
    print('comm',w,'frames',len(fr),'deck-above-hero visible frames:',len(bad),bad[:3],'errs',pg.errs)
    print('   sample',[f for f in fr if f[1]][:6])
    await ctx.close()
SEQJS="""()=>{window.__ev=[];const pm=document.querySelector('.pm');window.__t0=performance.now();
 new MutationObserver(()=>{window.__ev.push([Math.round(performance.now()-window.__t0),pm.className])}).observe(pm,{attributes:true,attributeFilter:['class']});
 document.querySelector('.pm').scrollIntoView({block:'center'});}"""
async def seq(b):
  for w,h in [(1440,900),(390,844)]:
    ctx=await newctx(b,w,h,w<800);pg=await mkpage(ctx)
    await pg.goto(BASE+'/community/?theme=dark',wait_until='load');await pg.wait_for_selector('.pm',timeout=15000);await pg.wait_for_timeout(1800)
    await pg.evaluate("window.scrollTo(0,0)");await pg.wait_for_timeout(1500)
    await pg.evaluate(SEQJS)
    prev=0
    for t in [0,500,1000,1500,2000,2500,3500]:
      await pg.wait_for_timeout(t-prev);prev=t
      await pg.screenshot(path=f'{O}/{tag}-seq-{w}-{t:04d}.png')
    ev=await pg.evaluate("window.__ev")
    print('seq',w,ev,'errs',pg.errs)
    await ctx.close()
async def title(b):
  for theme in ['dark','light']:
    for w,h in [(1440,900),(390,844),(320,640)]:
      ctx=await newctx(b,w,h,w<800);pg=await mkpage(ctx)
      await pg.goto(BASE+f'/community/?theme={theme}',wait_until='load');await pg.wait_for_selector('.pm',timeout=15000);await pg.wait_for_timeout(1500)
      await pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})");await pg.wait_for_timeout(1100)
      await pg.screenshot(path=f'{O}/{tag}-title-{theme}-{w}.png')
      ov=await pg.evaluate("({sw:document.documentElement.scrollWidth,iw:innerWidth,h2:document.querySelector('.pm h2').getBoundingClientRect().toJSON()})")
      a=await axe(pg)
      print('title',theme,w,'ovx',ov['sw']-ov['iw'],'h2 l/r',round(ov['h2']['left']),round(ov['h2']['right']),'axe',a,'errs',pg.errs)
      await ctx.close()
SIZES=[(1100,620),(1100,800),(1280,720),(1366,768),(1440,900),(1536,864),(1680,1050),(1920,1080),(2560,1440)]
TABS=['wtg','explored','picks','contrib','items']
SHOTALL={(1100,620),(1366,768),(1920,1080)}
async def prof(b):
  for user in ['preview','wayfarer']:
    for w,h in SIZES+[(390,844),(360,740),(320,640)]:
      ctx=await newctx(b,w,h,w<800);pg=await mkpage(ctx)
      await pg.goto(BASE+'/welcome/?reset=1',wait_until='load')
      await pg.evaluate("localStorage.setItem('deepspot-session-preview',JSON.stringify({state:'free',email:'j@e.com'}))")
      await pg.goto(BASE+f'/profile/?user={user}&theme=dark',wait_until='load');await pg.wait_for_timeout(2200)
      desk=w>=1100
      for t in TABS:
        await pg.evaluate("t=>document.querySelector('#pp-vt-'+t).click()",t);await pg.wait_for_timeout(700 if t=='wtg' else 350)
        c=await pg.evaluate(CLIP);f=await pg.evaluate(FIT)
        issues=[]
        if f.get('ovx',0)>0:issues.append('OVERFLOW-X %d'%f['ovx'])
        if desk:
          if f['cardBottomOver']>0 or (f['barBottomOver'] or 0)>0:issues.append('LEFT clipped card%s bar%s'%(f['cardBottomOver'],f['barBottomOver']))
          if f['tabsTopOver']>0 or f['tabsBottomOver']>0:issues.append('TABS out top%s bottom%s'%(f['tabsTopOver'],f['tabsBottomOver']))
          if f['tabHitsBack']:issues.append('TAB HITS BACK LINK')
          if f['lastBottomOver']>1:issues.append('REC bottom unreachable %s'%f['lastBottomOver'])
          if f.get('bioClip'):issues.append('BIO clipped')
        print(user,f'{w}x{h}',t,'zoom',f.get('zoom'),'stageScroll',f.get('stageScrolls'),'rec',f.get('recH'),'/',f.get('recSH'),'ISSUES' if issues else 'ok',issues,'clip',json.dumps(c) if c else '')
        if (w,h) in SHOTALL or t=='wtg':
          await pg.screenshot(path=f'{O}/{tag}-prof-{user}-{w}x{h}-{t}.png')
        if desk and (w,h) in SHOTALL and t in('contrib','items'):
          await pg.evaluate("document.querySelector('.pp-rec').scrollTop=1e5");await pg.wait_for_timeout(150)
          await pg.screenshot(path=f'{O}/{tag}-prof-{user}-{w}x{h}-{t}-bottom.png');await pg.evaluate("document.querySelector('.pp-rec').scrollTop=0")
      if (w,h) in [(1100,620),(1366,768),(1920,1080),(390,844),(320,640)]:
        print('   axe',user,w,h,await axe(pg))
      print('   console',user,w,h,pg.errs)
      await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=ARGS)
    if what in('all','both','comm'):await comm(b)
    if what in('all','seq'):await seq(b)
    if what in('all','title'):await title(b)
    if what in('all','both','prof'):await prof(b)
    await b.close()
asyncio.run(main())
