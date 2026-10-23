"""Check every internal href found by the crawl (no browser)."""
import json,glob,os,urllib.request,urllib.parse
OUT=os.path.dirname(os.path.abspath(__file__))
src={}
for f in glob.glob(OUT+'/res_*.json'):
  for r in json.load(open(f)):
    for h in r.get('hrefs',[]):
      u=urllib.parse.urlsplit(h); q=[(k,v) for k,v in urllib.parse.parse_qsl(u.query) if k!='theme']
      key=u.path+('?'+urllib.parse.urlencode(q) if q else '')
      src.setdefault(key,set()).add(r['route'])
bad=[]
import re
for k,rs in sorted(src.items()):
  try:
    body=urllib.request.urlopen('http://localhost:8766'+urllib.parse.quote(k,safe='/?=&%'),timeout=10).read(4000).decode('utf-8','replace'); code=200
  except Exception as e: code=str(e)[:60]
  if code!=200: bad.append((k,code,sorted(rs)[:4]))
print(len(src),'unique internal links;',len(bad),'bad')
for b in bad: print(b)
# param-driven pages: verify ids exist in routes.json
R=json.load(open(OUT+'/../../source/site/routes.json',encoding='utf-8'))
for k in src:
  u=urllib.parse.urlsplit(k); q=dict(urllib.parse.parse_qsl(u.query))
  if u.path=='/spot/' and q.get('id') and q['id'] not in R['spots']: print('unknown spot id',k,sorted(src[k])[:3])
  if u.path=='/story/' and q.get('id') and q['id'] not in R['stories'].values() and q['id'] not in R['stories']: print('unknown story id',k,sorted(src[k])[:3])
  if u.path=='/profile/' and q.get('user') and q['user'] not in R['profiles'].values() and q['user'] not in ('preview',): print('unknown profile',k,sorted(src[k])[:3])
json.dump({'n':len(src),'bad':bad},open(OUT+'/links.json','w'),indent=1)
