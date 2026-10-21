import sys,json,re,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,'../passport-v3')
from seed import SEEDED
from playwright.sync_api import sync_playwright
SRC='../../source/profile/'
AXE=open('../audit-20261019/axe.min.js',encoding='utf8').read()
AXEJS="""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' || '+(n.any.concat(n.all,n.none).map(c=>c.message).join('; ')).slice(0,160))}))}"""
cat=json.load(open('../../source/featured-spots.json',encoding='utf8'))
sp=[s for s in cat if s['id'].startswith('/blog/') and (s.get('image') or '').startswith('/editorial-assets') and not s['title'].startswith('PART OF')][:2]
SEED=[{'type':'spot','id':sp[0]['id']},{'type':'place','name':'Lisbon, old town at dawn'},{'type':'spot','id':sp[1]['id']}]
errs=[];res={}
def setup(pg,theme,draft=None,wtg=None):
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e:errs.append(str(e)))
    def fresh(route,f,ct):
        route.fulfill(body=open(SRC+f,'rb').read(),content_type=ct,headers={'cache-control':'no-store'})
    pg.route(re.compile(r'/profile/profile\.js'),lambda r:fresh(r,'profile.js','text/javascript'))
    pg.route(re.compile(r'/profile/profile\.css'),lambda r:fresh(r,'profile.css','text/css'))
    pg.route(re.compile(r'/profile/want-to-go\.mjs'),lambda r:fresh(r,'want-to-go.mjs','text/javascript'))
    init="try{localStorage.setItem('deepspot-theme','%s');if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');"%theme
    if draft:init+="localStorage.setItem('deepspot-profile-draft-v1',%s);"%json.dumps(draft)
    if wtg is not None:init+="localStorage.setItem('deepspot-want-to-go-v1',%s);"%json.dumps(json.dumps(wtg))
    init+="}}catch(e){}"
    pg.add_init_script(init)
def go(pg,user,theme):
    pg.goto(f'http://localhost:8766/profile/?user={user}&theme={theme}',wait_until='networkidle');pg.wait_for_selector('[aria-labelledby=pp-wtg]',timeout=8000);pg.wait_for_timeout(600)
def shot(pg,name):
    sec=pg.locator('section[aria-labelledby=pp-wtg]');sec.scroll_into_view_if_needed();pg.wait_for_timeout(400)
    sec.screenshot(path=name+'-section.png')
    box=sec.bounding_box();pg.evaluate("y=>scrollTo(0,y-60)",box['y']+pg.evaluate('scrollY'));pg.wait_for_timeout(300);pg.screenshot(path=name+'-view.png')
def metrics(pg):
    return pg.evaluate("""()=>{const s=document.querySelector('section[aria-labelledby=pp-wtg]');const q=x=>s.querySelector(x);const cs=(e,p)=>e?getComputedStyle(e)[p]:null;
    return {bar:q('.pp-bar').getBoundingClientRect().height,body:cs(q('.pp-body'),'padding'),copyPad:cs(q('.pp-post-copy'),'padding'),ctlPad:cs(q('.pp-wtg-ctl'),'padding'),gap:cs(q('.pp-wtg'),'gap'),cols:cs(q('.pp-wtg'),'gridTemplateColumns'),input:q('#pp-wtg-in')?q('#pp-wtg-in').getBoundingClientRect().height:null,
    overflow:document.documentElement.scrollWidth>innerWidth,order:[...document.querySelectorAll('.pp-sec')].map(x=>x.getAttribute('aria-labelledby')).join(',')}}""")
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for w,th in ((1440,'dark'),(1440,'light'),(390,'dark')):
        tag=f'{th}-{w}'
        for label,wtg in (('empty',[]),('filled',SEED)):
            ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page();setup(pg,th,SEEDED,wtg);go(pg,'preview',th)
            shot(pg,f'preview-{label}-{tag}')
            try: res[f'm-{label}-{tag}']=metrics(pg) if label=='filled' else None
            except Exception as e: res[f'm-{label}-{tag}']=str(e)
            ctx.close()
        ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page();setup(pg,th);go(pg,'lampbane',th)
        shot(pg,f'real-lampbane-{tag}')
        res[f'real-{tag}']=[pg.evaluate("document.documentElement.scrollWidth>innerWidth"),pg.locator('section[aria-labelledby=pp-wtg]').inner_text()];ctx.close()
    for w in (390,320):
        for th in ('dark','light'):
            for label,wtg in (('empty',[]),('filled',SEED)):
                ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page();setup(pg,th,SEEDED,wtg);go(pg,'preview',th)
                pg.add_script_tag(content=AXE)
                res[f'ov-{w}-{th}-{label}']={'overflow':pg.evaluate("document.documentElement.scrollWidth>innerWidth"),'axe':pg.evaluate(AXEJS)};ctx.close()
    for w,th in ((1440,'dark'),(1440,'light')):
        for label,wtg in (('empty',[]),('filled',SEED)):
            ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page();setup(pg,th,SEEDED,wtg);go(pg,'preview',th);pg.add_script_tag(content=AXE)
            res[f'axe-{w}-{th}-{label}']=pg.evaluate(AXEJS);ctx.close()
    ctx=b.new_context(viewport={'width':1440,'height':900});pg=ctx.new_page();setup(pg,'dark');go(pg,'lampbane','dark');pg.add_script_tag(content=AXE);res['axe-real']=pg.evaluate(AXEJS);ctx.close()
    ctx=b.new_context(viewport={'width':1440,'height':900});pg=ctx.new_page();setup(pg,'dark',SEEDED,[]);go(pg,'preview','dark')
    F={}
    names=lambda:pg.evaluate("[...document.querySelectorAll('.pp-wtg-item strong')].map(e=>e.textContent)")
    stored=lambda:pg.evaluate("JSON.parse(localStorage.getItem('deepspot-want-to-go-v1')||'null')")
    cnt=lambda:pg.inner_text('#pp-wtg span')
    F['empty_text']=pg.inner_text('#pp-wtg-list');F['count0']=cnt()
    q=sp[0]['title'].split()[1].lower();F['query']=q
    pg.click('#pp-wtg-in');pg.keyboard.type(q);pg.wait_for_timeout(200)
    F['lb_open']=pg.get_attribute('#pp-wtg-in','aria-expanded');F['lb_n']=pg.locator('#pp-wtg-lb [role=option]').count()
    pg.screenshot(path='func-listbox.png')
    pg.keyboard.press('ArrowDown');F['active']=pg.get_attribute('#pp-wtg-in','aria-activedescendant');pg.keyboard.press('Enter');F['filled']=pg.input_value('#pp-wtg-in')
    pg.keyboard.press('Enter');pg.wait_for_timeout(200)
    F['after_spot']=stored()
    for t in ('  Lisbon   old town ','lisbon old town','   ','x'*80,'Tokyo'):
        pg.fill('#pp-wtg-in',t);pg.click('.pp-wtg-add');pg.wait_for_timeout(100);F['msg:'+t[:12]]=pg.inner_text('#pp-wtg-msg')
    F['stored']=stored();F['count']=cnt();F['names']=names()
    pg.click('[data-wtg=down][data-i="0"]');F['after_down']=names();F['focus_after_down']=pg.evaluate("document.activeElement.getAttribute('aria-label')")
    pg.click('[data-wtg=up][data-i="2"]');F['after_up']=names()
    F['first_up_disabled']=pg.is_disabled('[data-wtg=up][data-i="0"]')
    first=names()[0];pg.click(f'[data-wtg=rm][data-i="0"]');F['removed']=first;F['after_rm']=names();F['count_rm']=cnt()
    pg.reload(wait_until='networkidle');pg.wait_for_selector('[aria-labelledby=pp-wtg]');F['reload_names']=names();F['reload_count']=cnt()
    F['link']=pg.evaluate("document.querySelector('.pp-wtg-item a')?.getAttribute('href')")
    pg.evaluate("localStorage.setItem('deepspot-want-to-go-v1',JSON.stringify(Array.from({length:35},(_,i)=>({type:'place',name:'p'+i}))))");pg.reload(wait_until='networkidle');pg.wait_for_selector('[aria-labelledby=pp-wtg]')
    F['max_loaded']=cnt();pg.fill('#pp-wtg-in','extra');pg.click('.pp-wtg-add');F['full_msg']=pg.inner_text('#pp-wtg-msg')
    pg.evaluate("localStorage.setItem('deepspot-want-to-go-v1','{bad json')");pg.reload(wait_until='networkidle');pg.wait_for_selector('[aria-labelledby=pp-wtg]');F['badjson_count']=cnt()
    res['func']=F;ctx.close()
    b.close()
res['errors']=errs
json.dump(res,open('results.json','w'),indent=1,ensure_ascii=False)
print(json.dumps(res,indent=1,ensure_ascii=False)[:9000])
