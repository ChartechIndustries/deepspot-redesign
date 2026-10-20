from playwright.sync_api import sync_playwright
B='http://localhost:8766'
with sync_playwright() as p:
  br=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for w in [1440,390]:
    for r in ['/','/roadmap/','/stories/','/story/?id=boundary','/browse/','/community/','/account/','/competition/']:
      pg=br.new_page(viewport={'width':w,'height':900}); big=[]
      def on(resp):
        try: n=len(resp.body())
        except Exception: n=0
        big.append((n,resp.url.replace(B,'')))
      pg.on('response',on); pg.goto(B+r); pg.wait_for_timeout(2500)
      pg.evaluate('async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}}'); pg.wait_for_timeout(1500)
      tot=sum(b for b,_ in big); top=sorted(big,reverse=True)[:3]
      print(w,r,round(tot/1e6,1),'MB',len(big),'req |',' ; '.join(f'{round(b/1e3)}KB {u[:45]}' for b,u in top)); pg.close()
  br.close()
