import json,sys,base64,os,itertools,subprocess,time
from playwright.sync_api import sync_playwright
OUT=os.path.dirname(os.path.abspath(__file__)); B='http://localhost:8799/'
S=json.load(open(r'C:/Users/CharD/Downloads/Mole Export/outfitter-3d/assets/scene.json',encoding='utf-8'))
ids={k:[t['id'] for t in v] for k,v in S['slots'].items()}
combos=[]
for j in ids['Jackets']:
  for b in ids['Body/Shirt']: combos.append({'Jackets':j,'Body/Shirt':b})
for f in ids['Face']:
  for m in ids['Mouth Area']: combos.append({'Face':f,'Mouth Area':m,'Body/Shirt':'Body_Shirt/Tux'})
for h in ids['Head/Hat']: combos.append({'Eyes':'Eyes/Aviators','Head/Hat':h,'Face':'Face/Bandaid','Body/Shirt':'Body_Shirt/Tux'})
for h in ids['Head/Hat']: combos.append({'Mouth Area':'Mouth_Area/Oni','Head/Hat':h,'Face':'Face/Pimple_Patch','Body/Shirt':'Body_Shirt/Tux'})
KEY=sys.argv[1]
with sync_playwright() as p:
  br=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  pg=br.new_page(viewport={'width':900,'height':900}); pg.goto(B); pg.wait_for_function('window.__mole',timeout=180000)
  START=int(sys.argv[2]); END=int(sys.argv[3])
  for i,c in list(enumerate(combos))[START:END]:
    pg.evaluate('([k,v])=>localStorage.setItem(k,v)',[KEY,json.dumps(c)]); pg.reload(); pg.wait_for_function('window.__mole',timeout=180000); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(700)
    url=pg.evaluate('''()=>{const M=__mole,T=M.THREE;const box=new T.Box3().setFromObject(M.base);const c=box.getCenter(new T.Vector3());const h=box.getSize(new T.Vector3()).y;const fv=M.camera.fov*Math.PI/360;const dist=h*0.62/Math.tan(fv);const d=M.camera.position.clone().sub(M.controls.target).normalize();M.controls.target.copy(c);M.camera.position.copy(c).add(d.multiplyScalar(dist));M.camera.lookAt(c);M.controls.update&&M.controls.update();return M.shot(360)}''')
    name='_'.join(v.split('/')[-1] for v in c.values())
    open(f'{OUT}/r_{i:03d}_{name}.png','wb').write(base64.b64decode(url.split(',')[1]))
    print(i,name,flush=True)
  br.close()
