"""Targeted probes for audit 2026-10-22. One browser, below-normal priority."""
import sys,os,json,re
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','onboarding-v2.2'))
import h
from playwright.sync_api import sync_playwright
B='http://localhost:8766'; OUT=os.path.dirname(os.path.abspath(__file__))
R=[]
def ok(n,c,i=''): R.append((n,'PASS' if c else 'FAIL',str(i)[:300])); print(R[-1],flush=True)
GL=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
with sync_playwright() as p:
  br=p.chromium.launch(headless=True,args=GL)
  def page(w,h,**kw):
    ctx=br.new_context(viewport={'width':w,'height':h},has_touch=w<800,is_mobile=w<800,**kw); pg=ctx.new_page(); pg.errs=[]
    pg.on('pageerror',lambda e: pg.errs.append(str(e)[:200])); pg.on('console',lambda m: m.type=='error' and pg.errs.append(m.text[:200]))
    return ctx,pg
  # 1 gate: what is below the gate when scrolled to the bottom
  for r,nm in [('/spot/?id=tochigi-underground-quarry','spot'),('/story/?id=shark','story')]:
    ctx,pg=page(390,844); pg.goto(B+r); pg.wait_for_timeout(2000)
    info=pg.evaluate("""()=>{const g=document.querySelector('.gt-sheet,[class*=gate]');const gr=g&&g.getBoundingClientRect();
      return {sh:document.documentElement.scrollHeight,gate:g&&(g.className+'').slice(0,60),gb:gr&&Math.round(gr.bottom+scrollY),pos:g&&getComputedStyle(g).position,
       foot:!!document.querySelector('.ds-footer'),ovf:getComputedStyle(document.documentElement).overflow+'/'+getComputedStyle(document.body).overflow}}""")
    pg.evaluate("scrollTo(0,document.documentElement.scrollHeight)"); pg.wait_for_timeout(600)
    pg.screenshot(path=f'{OUT}/shots/probe_gate_{nm}_bottom_390.png')
    ok(f'gate {nm}: page ends at gate (no dead space)',info['gb'] and info['sh']-info['gb']<120,info)
    ctx.close()
  # 2 home: duplicate hero / what sits after the footer
  ctx,pg=page(390,844); pg.goto(B+'/'); pg.wait_for_timeout(3500)
  d=pg.evaluate("""()=>({h1:[...document.querySelectorAll('h1')].length,heroes:[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Extra Un-/.test(e.textContent)).length,
     sh:document.documentElement.scrollHeight,
     fixed:[...document.querySelectorAll('body *')].filter(e=>['fixed','sticky'].includes(getComputedStyle(e).position)&&e.getBoundingClientRect().height>200).map(e=>e.tagName+'.'+(e.className+'').slice(0,40)+' '+getComputedStyle(e).position+' h'+Math.round(e.getBoundingClientRect().height)).slice(0,6)})""")
  ok('home: one hero in DOM',d['heroes']<=1,d)
  pg.evaluate("scrollTo(0,document.documentElement.scrollHeight)"); pg.wait_for_timeout(900); pg.screenshot(path=f'{OUT}/shots/probe_home_bottom_390.png')
  # 3 theme + colour toggles on home, persistence to subpage and back
  pg.evaluate("localStorage.clear()"); pg.goto(B+'/'); pg.wait_for_timeout(3000)
  th0=pg.evaluate("document.documentElement.dataset.theme")
  btn=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>/light|dark/i.test((b.getAttribute('aria-label')||'')+b.textContent)&&b.offsetParent);if(!b)return null;b.click();return b.textContent.trim()}""")
  pg.wait_for_timeout(500); th1=pg.evaluate("document.documentElement.dataset.theme")
  ok('home theme toggle flips theme',th0!=th1,(th0,th1,btn))
  cb=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>/colou?r/i.test((b.getAttribute('aria-label')||'')+b.textContent)&&b.offsetParent);if(!b)return null;b.click();return b.textContent.trim()}""")
  pg.wait_for_timeout(500); pc=pg.evaluate("document.documentElement.dataset.panelColor||getComputedStyle(document.documentElement).getPropertyValue('--x')")
  ok('home colour toggle sets panelColor=off',pc=='off',(cb,pc))
  pg.screenshot(path=f'{OUT}/shots/probe_home_light_coloroff_390.png')
  for r in ['/community/','/browse/','/profile/?user=wayfarer','/welcome/','/map/']:
    pg.goto(B+r); pg.wait_for_timeout(2200)
    s=pg.evaluate("[document.documentElement.dataset.theme,document.documentElement.dataset.panelColor||null,getComputedStyle(document.body).backgroundColor]")
    ok(f'theme+colour carry to {r}',s[0]==th1 and s[1]=='off',s)
    pg.screenshot(path=f'{OUT}/shots/probe_carry_{r.strip("/").split("/")[0].split("?")[0] or "home"}_390.png')
  pg.goto(B+'/'); pg.wait_for_timeout(2500)
  s=pg.evaluate("[document.documentElement.dataset.theme,document.documentElement.dataset.panelColor||null]")
  ok('theme+colour carry back to home',s[0]==th1 and s[1]=='off',s)
  ctx.close()
  # 4 reduced motion
  for r in ['/','/community/','/tours/','/browse/','/profile/?user=wayfarer']:
    ctx,pg=page(1440,900,reduced_motion='reduce'); pg.goto(B+r); pg.wait_for_timeout(3000)
    pg.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}}'); pg.wait_for_timeout(1500)
    a=pg.evaluate("""()=>document.getAnimations().filter(a=>a.playState==='running'&&(a.effect&&a.effect.getComputedTiming().iterations===Infinity)).map(a=>{const t=a.effect.target;return (a.animationName||a.constructor.name)+'@'+(t?t.tagName+'.'+(t.className+'').split(' ')[0]:'')}).slice(0,8)""")
    ok(f'reduced motion: no infinite animations on {r}',not a,a); ctx.close()
  # 5 404 page
  ctx,pg=page(390,844); pg.goto(B+'/404.html'); pg.wait_for_timeout(1500)
  d=pg.evaluate("({sw:document.documentElement.scrollWidth,t:document.body.innerText.slice(0,120),links:[...document.querySelectorAll('a')].length})")
  ok('404.html renders at 390',d['sw']<=390 and d['links']>3,d); pg.screenshot(path=f'{OUT}/shots/probe_404_390.png',full_page=True); ctx.close()
  # 5b author links that are not in profiles.json
  for u in ['bodhi-schulz','kris','lana-velkov','six']:
    ctx,pg=page(390,844); pg.goto(B+'/profile/?user='+u); pg.wait_for_timeout(2500)
    t=pg.evaluate("document.body.innerText.replace(/\\s+/g,' ').slice(0,260)")
    pg.screenshot(path=f'{OUT}/shots/probe_author_{u}_390.png')
    ok(f'author link /profile/?user={u} shows a real profile',not re.search(r'not found|no explorer|doesn.t exist|missing',t,re.I),t); ctx.close()
  # 6 follow (other profile), community vote, edit profile dialog open/close
  ctx,pg=page(390,844); pg.goto(B+'/profile/?user=wayfarer'); pg.wait_for_timeout(3000)
  f=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>/^follow/i.test(b.textContent.trim())&&b.offsetParent);if(!b)return null;const t0=b.textContent.trim();b.click();return t0}""")
  pg.wait_for_timeout(900); t1=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>/follow/i.test(b.textContent)&&b.offsetParent);return b&&[b.textContent.trim(),b.getAttribute('aria-pressed')]}""")
  cnt=pg.evaluate("(document.body.innerText.match(/(\\d+) followers/i)||[])[1]")
  ok('follow toggles',f and t1 and t1[0]!=f,(f,t1,cnt)); pg.screenshot(path=f'{OUT}/shots/probe_follow_390.png')
  pg.reload(); pg.wait_for_timeout(2500); t2=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>/follow/i.test(b.textContent)&&b.offsetParent);return b&&b.textContent.trim()}""")
  ok('follow persists on reload',t2==t1[0] if t1 else False,(t1,t2)); ctx.close()
  ctx,pg=page(390,844); pg.goto(B+'/community/'); pg.wait_for_timeout(3000)
  pg.evaluate("document.querySelector('.cv-vote, [data-vote], button')?.scrollIntoView()")
  v=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='yes'&&b.offsetParent);if(!b)return null;b.scrollIntoView({block:'center'});const card=b.closest('article,li,div');const before=card.innerText.slice(0,200);b.click();return before}""")
  pg.wait_for_timeout(900)
  after=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>(b.textContent.trim()==='yes'||b.getAttribute('aria-pressed')==='true')&&b.offsetParent);const c=b&&b.closest('article,li,div');return c&&[c.innerText.slice(0,200),b.getAttribute('aria-pressed'),b.className]}""")
  ok('community spot vote changes state',v and after and (after[0]!=v or after[1]=='true'),(v and v[:80],after))
  pg.screenshot(path=f'{OUT}/shots/probe_vote_390.png')
  ups=pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(b=>/up|vote/i.test(b.getAttribute('aria-label')||'')&&b.offsetParent&&b.closest('[class*=road],[class*=rm]'));if(!b)return null;b.scrollIntoView({block:'center'});const c=b.closest('article,li,div');const t=c.innerText;b.click();return [b.getAttribute('aria-label'),t.slice(0,80)]}""")
  pg.wait_for_timeout(700)
  ok('roadmap vote button found + clicked',ups,ups); pg.screenshot(path=f'{OUT}/shots/probe_roadmapvote_390.png')
  ok('community no page errors',not pg.errs,pg.errs[:3]); ctx.close()
  for w,hh in [(390,844),(1440,900)]:
    ctx,pg=page(w,hh); pg.goto(B+'/profile/?user=preview'); pg.wait_for_timeout(3000)
    pg.evaluate("[...document.querySelectorAll('button')].find(b=>/edit profile/i.test(b.textContent)&&b.offsetParent)?.click()"); pg.wait_for_timeout(1200)
    d=pg.evaluate("""()=>{const d=document.querySelector('dialog[open],[role=dialog]:not([hidden])');if(!d)return null;const r=d.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),focus:document.activeElement&&document.activeElement.tagName+'.'+(document.activeElement.className+'').slice(0,30),sw:document.documentElement.scrollWidth}}""")
    ok(f'edit dialog opens {w}',d and d['sw']<=w,d); pg.screenshot(path=f'{OUT}/shots/probe_editdialog_{w}.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
    ok(f'edit dialog Esc closes {w}',not pg.evaluate("!!document.querySelector('dialog[open]')"))
    ok(f'profile no page errors {w}',not pg.errs,pg.errs[:3]); ctx.close()
  br.close()
json.dump(R,open(f'{OUT}/probe.json','w'),indent=1)
print('FAILS',sum(1 for r in R if r[1]=='FAIL'),'of',len(R))
