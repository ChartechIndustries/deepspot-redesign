import json,base64
from playwright.sync_api import sync_playwright
B='http://localhost:8799/'
C=[('fez',{'Head/Hat':'Head_Hat/Fez'},(0.62,0.95)),('cig',{'Mouth Area':'Mouth_Area/Cig'},(0.35,0.75)),('lace',{'Body/Shirt':'Body_Shirt/Lace_Dress'},(0.1,0.45))]
with sync_playwright() as p:
  br=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  pg=br.new_page(viewport={'width':900,'height':900})
  for page,tag in [('_old.html','before'),('index.html','after')]:
    pg.goto(B+page); pg.wait_for_function('window.__mole',timeout=180000)
    for name,sel,(y0,y1) in C:
      pg.evaluate('v=>localStorage.setItem("mole-outfitter-3d-selection",v)',json.dumps(sel)); pg.reload(); pg.wait_for_function('window.__mole',timeout=180000); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(1500)
      url=pg.evaluate('''([y0,y1])=>{const M=__mole,T=M.THREE;const box=new T.Box3().setFromObject(M.base);const h=box.max.y-box.min.y;const c=box.getCenter(new T.Vector3());c.y=box.min.y+h*(y0+y1)/2;const fv=M.camera.fov*Math.PI/360;const dist=h*(y1-y0)*0.75/Math.tan(fv);const d=M.camera.position.clone().sub(M.controls.target).normalize();M.controls.target.copy(c);M.camera.position.copy(c).add(d.multiplyScalar(dist));M.camera.lookAt(c);return M.shot(400)}''',[y0,y1])
      open(f'alpha_{name}_{tag}.png','wb').write(base64.b64decode(url.split(',')[1])); print(name,tag,flush=True)
  br.close()
from PIL import Image,ImageDraw
s=Image.new('RGB',(1200,800),'white'); d=ImageDraw.Draw(s)
for i,(n,_,_) in enumerate(C):
  for j,t in enumerate(['before','after']):
    s.paste(Image.open(f'alpha_{n}_{t}.png').convert('RGB').resize((400,400)),(i*400,j*400)); d.text((i*400+4,j*400+4),f'{n} {t}',fill='yellow')
s.save('alpha_compare.jpg',quality=85)
