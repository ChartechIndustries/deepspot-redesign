import json,base64,sys,random,os
sys.path.insert(0,r'C:/Users/CharD/Downloads/Mole Export')
import mole_rules
from playwright.sync_api import sync_playwright
OUT=os.path.dirname(os.path.abspath(__file__))
S=json.load(open(r'C:/Users/CharD/Downloads/Mole Export/outfitter-3d/assets/scene.json',encoding='utf-8'))
slots={s:[t['id'] for t in S['slots'][s]] for s in S['slotOrder']}
handles=sys.argv[1].split(',')
with sync_playwright() as p:
  br=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  pg=br.new_page(viewport={'width':900,'height':900}); pg.goto('http://localhost:8799/'); pg.wait_for_function('window.__mole',timeout=180000)
  for h in handles:
    rng=random.Random('deepspot-mole:'+h)   # seeded on the handle, like compose_server_example suggests
    sel=mole_rules.roll(slots,S['rules'],rng,0.15,{'Body/Shirt','Head/Hat'})
    pg.evaluate('v=>localStorage.setItem("mole-outfitter-3d-selection",v)',json.dumps(sel)); pg.reload(); pg.wait_for_function('window.__mole',timeout=180000); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(1500)
    url=pg.evaluate('''()=>{const M=__mole,T=M.THREE;M.scene.background=null;M.renderer.setClearColor(0x000000,0);const box=new T.Box3().setFromObject(M.base);const c=box.getCenter(new T.Vector3());const h=box.getSize(new T.Vector3()).y;const fv=M.camera.fov*Math.PI/360;const dist=h*0.62/Math.tan(fv);const d=M.camera.position.clone().sub(M.controls.target).normalize();M.controls.target.copy(c);M.camera.position.copy(c).add(d.multiplyScalar(dist));M.camera.lookAt(c);return M.shot(768)}''')
    open(f'{OUT}/{h}.png','wb').write(base64.b64decode(url.split(',')[1]))
    json.dump(sel,open(f'{OUT}/{h}.json','w')); print(h,sel,flush=True)
  br.close()
