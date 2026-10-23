"""smoke: every route at a width; console errors, failed/404 requests, a local css/js/mjs file requested under >1 URL (double load)"""
import sys,re,collections
from t import *
ROUTES=['/','/browse/','/spot/?id=tochigi-underground-quarry','/map/','/tours/','/stories/','/story/?id=shark','/guides/','/guide/?id=tas-aizu-samurai-cultural-tour','/adventures/','/saved/','/plan-trip/','/contribute/','/account/','/inbox/','/invites/','/community/','/leaderboard/','/competition/','/forum/','/mission/','/faq/','/membership/','/app/','/roadmap/','/sponsored/','/privacy/','/terms/','/cookies/','/profile/?user=wayfarer','/profile/?user=preview','/welcome/']
w=int(sys.argv[1]) if len(sys.argv)>1 else 1440
theme=sys.argv[2] if len(sys.argv)>2 else 'dark'
flt=sys.argv[3] if len(sys.argv)>3 else ''
bad=0
with sync_playwright() as p:
  for gl in (False,True):
    br=None
    for r in ROUTES:
      if flt and flt not in r: continue
      need=(r.split('?')[0]=='/' or 'profile' in r or 'community' in r or 'app' in r)
      if need!=gl: continue
      if br is None: br=p.chromium.launch(headless=True,args=GLARGS if gl else [])
      ctx=br.new_context(viewport={'width':w,'height':844 if w<800 else 900},has_touch=w<800,is_mobile=w<800)
      pg=ctx.new_page(); errs=[]; fails=[]; urls=collections.defaultdict(set)
      pg.on('console',lambda m: errs.append(m.text[:160]) if m.type=='error' else None)
      pg.on('pageerror',lambda e: errs.append('PE '+str(e)[:160]))
      def onresp(s):
        u=s.url.replace(B,'')
        if s.status>=400: fails.append(str(s.status)+' '+u[:100])
        m=re.match(r'^(/[^?]*\.(?:css|js|mjs))(\?.*)?$',u)
        if m: urls[m.group(1)].add(m.group(2) or '')
      pg.on('response',onresp)
      sep='&' if '?' in r else '?'
      pg.goto(B+r+sep+'theme='+theme,wait_until='load'); pg.wait_for_timeout(2500)
      pg.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.8)){scrollTo(0,y);await new Promise(x=>setTimeout(x,100))}scrollTo(0,0)}'); pg.wait_for_timeout(800)
      ov=pg.evaluate('document.documentElement.scrollWidth-innerWidth')
      dup={k:sorted(v) for k,v in urls.items() if len(v)>1}
      nokey=[k for k,v in urls.items() if v=={''}]
      flag=bool(errs or fails or dup or nokey or ov>0)
      bad+=flag
      print(('BAD ' if flag else 'ok  ')+r,'ov',ov,'errs',errs[:3],'fails',fails[:3],'dup',dup,'nokey',nokey[:4])
      ctx.close()
    if br: br.close()
print('bad',bad)
