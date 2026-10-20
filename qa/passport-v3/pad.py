import sys,json
sys.path.insert(0,'.')
from seed import SEEDED
from playwright.sync_api import sync_playwright
B='http://localhost:8766'
d=json.loads(SEEDED);d.pop('signatureArt');SEED=json.dumps(d)
ok=[]
def check(name,cond):
    ok.append((name,bool(cond)));print('PASS' if cond else 'FAIL',name)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=b.new_context(viewport={'width':1440,'height':900},accept_downloads=True);pg=ctx.new_page()
    errs=[];pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('dialog',lambda dlg:(errs.append('DIALOG '+dlg.message),dlg.dismiss()))
    pg.add_init_script("try{if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('deepspot-profile-draft-v1',%s);localStorage.setItem('deepspot-theme','dark');}}catch(e){}"%json.dumps(SEED))
    pg.goto(B+'/profile/?user=preview&theme=dark',wait_until='networkidle');pg.wait_for_timeout(500)
    pg.click('#pp-tab-mark');cv=pg.locator('#pp-pad canvas');cv.scroll_into_view_if_needed();bx=cv.bounding_box()
    px=lambda:pg.evaluate("()=>{const c=document.querySelector('#pp-pad canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n}")
    def stroke(pts):
        cv.scroll_into_view_if_needed();bx=cv.bounding_box()
        pg.mouse.move(bx['x']+pts[0][0]*bx['width'],bx['y']+pts[0][1]*bx['height']);pg.mouse.down()
        for x,y in pts[1:]:pg.mouse.move(bx['x']+x*bx['width'],bx['y']+y*bx['height'],steps=6)
        pg.mouse.up()
    check('canvas starts blank',px()==0)
    pg.click('[data-tool=free]');pg.click('[data-tool=small]');pg.click('[data-color="#e5302d"]')
    stroke([(.1,.2),(.4,.7),(.6,.2),(.9,.7)]);a=px();check('smooth small stroke draws',a>200)
    pg.click('[data-tool=big]');pg.click('[data-color="#2a5bd7"]');stroke([(.1,.85),(.9,.85)]);b2=px();check('smooth big stroke draws more',b2>a+500)
    pg.click('[data-tool=pixel]');pg.click('[data-color="#3fb44a"]');stroke([(.2,.5),(.3,.4),(.4,.5),(.5,.4)]);c=px();check('pixel stroke draws',c>b2)
    pg.click('[data-tool=erase]');stroke([(.1,.85),(.9,.85)]);d2=px();check('eraser removes',d2<c)
    pg.click('[data-tool=erase]')
    pg.click('[data-tool=undo]');check('undo restores previous',px()==c)
    pg.click('[data-tool=undo]');pg.click('[data-tool=undo]');check('undo x3 back to smooth stroke only',px()==a)
    pg.click('[data-tool=clear]');check('clear step 1 only arms',pg.get_attribute('[data-tool=clear]','data-confirm')=='true' and px()==a)
    check('arm text sure?',pg.inner_text('[data-tool=clear] span').strip().lower()=='sure?')
    pg.click('[data-tool=clear]');check('clear step 2 empties',px()==0)
    pg.click('[data-tool=undo]');check('undo after clear brings art back',px()==a)
    pg.click('[data-tool=free]');pg.click('[data-tool=small]');pg.click('[data-color="#e5302d"]');stroke([(.1,.5),(.9,.5)])
    pg.click('[data-tool=save]');pg.wait_for_timeout(300)
    saved=pg.evaluate("()=>JSON.parse(localStorage.getItem('deepspot-profile-draft-v1')).signatureArt");check('save writes png to draft',saved.startswith('data:image/png;base64,'))
    check('save switches back to passport tab',pg.get_attribute('#pp-tab-pass','aria-selected')=='true' and pg.locator('#pp-sig img').count()==1)
    check('status says saved','Saved' in pg.text_content('.sp-status'))
    pg.click('#pp-tab-pass');pg.screenshot(path='shots/pad-after-draw.png');pg.click('#pp-tab-mark')
    pg.reload(wait_until='networkidle');pg.wait_for_timeout(900)
    check('signature strip shows art after reload',pg.locator('#pp-sig img').count()==1)
    pg.click('#pp-tab-mark')
    check('reload keeps art in canvas',px()>200)
    pg.screenshot(path='shots/pad-after-reload.png')
    # share image
    pg.click('.pp-share');pg.wait_for_selector('.pp-download[aria-disabled=false]',timeout=15000)
    with pg.expect_download() as dl:pg.click('.pp-download')
    dl.value.save_as('shots/share-image.png')
    r=pg.evaluate("""async()=>{const href=document.querySelector('.pp-download').href;const img=new Image();img.src=href;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
      const at=(a,b)=>[...x.getImageData(a,b,1,1).data];let red=0,moleish=0;
      const art=x.getImageData(92,640,540,280).data;for(let i=0;i<art.length;i+=4)if(art[i]>200&&art[i+1]<80&&art[i+2]<80)red++;
      const av=x.getImageData(102,144,176,176).data;for(let i=0;i<av.length;i+=4){const r=av[i],g=av[i+1],bl=av[i+2];if(!(Math.abs(r-7)<8&&Math.abs(g-214)<8&&Math.abs(bl-83)<8)&&!(r>240&&g>240))moleish++;}
      return [img.width,img.height,red,moleish]}""")
    check('share image 1600x1100',r[0]==1600 and r[1]==1100);check('share image has art strokes (red px %d)'%r[2],r[2]>100);check('share image has mole pixels (%d)'%r[3],r[3]>5000)
    pg.keyboard.press('Escape')
    # read-only elsewhere
    pg.goto(B+'/profile/?user=lampbane&theme=dark',wait_until='networkidle');pg.wait_for_timeout(500)
    check('other passport has no canvas/tools',pg.locator('#pp-pad canvas').count()==0 and pg.locator('.sp-tools').count()==0)
    check('other passport shows no-art state',pg.locator('.sp-empty').count()==1)
    check('no dialogs/errors',not errs);print(errs)
    b.close()
print('FAILS',[n for n,c in ok if not c])
