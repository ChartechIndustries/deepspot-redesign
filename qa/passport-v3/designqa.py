import sys,json
sys.path.insert(0,'.')
from seed import SEEDED,EMPTY
from shoot import VIEWS
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
JS="""()=>{
 const px=v=>parseFloat(v)||0,out={body:[],bar:[],card:[],aqua:[],scale:[]};
 const phone=innerWidth<=650;
 document.querySelectorAll('.pp-body').forEach(e=>{const c=getComputedStyle(e);out.body.push([c.paddingTop,c.paddingRight,c.paddingBottom,c.paddingLeft].map(px))});
 document.querySelectorAll('.pp-bar').forEach(e=>{const c=getComputedStyle(e);out.bar.push([e.getBoundingClientRect().height,px(c.paddingLeft),px(c.paddingRight)])});
 document.querySelectorAll('.pp-rec .pp-card:not(.pp-idcard):not(.pp-markcard),.pp-post-copy,.pp-post>a .pp-post-copy').forEach(e=>{const c=getComputedStyle(e);out.card.push([e.className,[c.paddingTop,c.paddingRight,c.paddingBottom,c.paddingLeft].map(px)])});
 const aq=[131,205,206];
 document.querySelectorAll('.pp-main *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width<=120&&r.height<=120)return;if(!r.width)return;const m=getComputedStyle(e).backgroundColor.match(/[\d.]+/g);if(!m||m.length>3&&+m[3]===0)return;const d=Math.hypot(m[0]-aq[0],m[1]-aq[1],m[2]-aq[2]);if(d<45)out.aqua.push([e.className||e.tagName,m.join(','),Math.round(r.width),Math.round(r.height)])});
 const ok=new Set([0,8,12,16,24,32,48]);
 document.querySelectorAll('.pp-field-in *,.pp-rec *').forEach(e=>{const c=getComputedStyle(e);for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft','rowGap','columnGap']){const v=px(c[k]);if(!ok.has(v)&&c[k]!=='normal')out.scale.push([e.className||e.tagName,k,c[k]])}});
 out.phone=phone;return out}"""
agg={'body':set(),'bar':set(),'card':set(),'aqua':[],'scale':{}}
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    for n,(user,seed) in VIEWS.items():
        for w in (1440,1024,768,390):
            for th in ('dark','light'):
                for panel in (('on','off') if (w==1440 and th=='dark') else ('on',)):
                    ctx=b.new_context(viewport={'width':w,'height':900});pg=ctx.new_page()
                    init="try{localStorage.setItem('deepspot-theme','%s');localStorage.setItem('deepspot-panel-colors','%s');"%(th,panel)
                    if seed: init+="localStorage.setItem('deepspot-profile-draft-v1',%s);"%json.dumps(seed)
                    pg.add_init_script(init+"}catch(e){}")
                    pg.goto(f'{B}/profile/?user={user}&theme={th}',wait_until='networkidle');pg.wait_for_timeout(500)
                    for tab in ('passport','mark'):
                        if tab=='mark': pg.click('#pp-tab-mark')
                        r=pg.evaluate(JS)
                        for x in r['body']:agg['body'].add((w<=650,tuple(x)))
                        for x in r['bar']:agg['bar'].add((w<=650,tuple(x)))
                        for c,x in r['card']:agg['card'].add((c.replace('pp-card','').strip(),tuple(x)))
                        agg['aqua']+= [(n,w,th,panel,a) for a in r['aqua']]
                        for s in r['scale']:agg['scale'][tuple(s)]=agg['scale'].get(tuple(s),0)+1
                    ctx.close()
    b.close()
print('body paddings (phone?,[t,r,b,l]):',sorted(agg['body']))
print('bar (phone?,[height,padL,padR]):',sorted(agg['bar']))
print('card paddings:',sorted(agg['card']))
print('aqua >120x120:',agg['aqua'][:10],len(agg['aqua']))
print('off-scale spacing values:',len(agg['scale']));
for k,v in list(agg['scale'].items())[:25]:print(' ',k,v)
