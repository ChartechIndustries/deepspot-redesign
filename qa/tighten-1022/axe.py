import sys
from t import *
AX=open('../audit-20261019/axe.min.js',encoding='utf-8').read()
def f(pg,route,w,theme):
  pg.evaluate(AX); pg.wait_for_timeout(300)
  return pg.evaluate("axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']}).then(r=>r.violations.map(v=>v.id+':'+v.nodes.map(n=>n.target[0]+' '+(n.any[0]&&n.any[0].message||'').slice(0,90)).join('|')))")
for th in ('light','dark'):
  for w in (1440,390):
    print(th,w,run(f,[('/',w,th)],gl=True,wait=4500))
