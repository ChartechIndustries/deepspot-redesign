"""Cache-key audit: ?v= keys per referenced file. Flags (1) one file with different keys,
(2) local css/js/mjs refs without ?v=, (3) file committed after the key was introduced in the referrer, (4) missing targets."""
import re,os,subprocess,json,collections
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
SRC=os.path.join(ROOT,'source')
def git(*a): return subprocess.run(['git',*a],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace').stdout
files=[f for f in git('ls-files','source').splitlines() if re.search(r'\.(html|mjs|js|css)$',f) and '/_next/' not in f and '/vendor/' not in f and 'backups' not in f]
REF=re.compile(r'''(?:href|src)\s*=\s*["']([^"'#]+)["']|import\s*(?:[^'"]*?from\s*)?\(?\s*["']([^"']+)["']|url\(\s*["']?([^"')]+\.(?:css))["']?\s*\)|@import\s+["']([^"']+)["']''')
refs=collections.defaultdict(list); nokey=[]; missing=[]
for f in files:
  t=open(os.path.join(ROOT,f),encoding='utf-8',errors='replace').read()
  for m in REF.finditer(t):
    u=next(g for g in m.groups() if g)
    if re.match(r'^(https?:|data:|mailto:|//|#|javascript:)',u): continue
    path,_,q=u.partition('?')
    if not re.search(r'\.(css|js|mjs)$',path): continue
    base=os.path.dirname(f)
    tgt=os.path.normpath(os.path.join('source',path.lstrip('/')) if path.startswith('/') else os.path.join(base,path)).replace('\\','/')
    key=re.search(r'(?:^|&)v=([^&]+)',q); key=key.group(1) if key else None
    if not os.path.exists(os.path.join(ROOT,tgt)):
      if '${' not in u: missing.append((f,u))
      continue
    if key is None: nokey.append((f,u)); continue
    refs[tgt].append((f,key,u))
multi={t:sorted(set((k,f) for f,k,u in v)) for t,v in refs.items() if len(set(k for f,k,u in v))>1}
stale=[]
for tgt,v in refs.items():
  last=git('log','-1','--format=%ct','--',tgt).strip()
  if not last: continue
  last=int(last)
  for f,key,u in set(v):
    intro=git('log','--format=%ct','-S',u,'--',f).split()
    if not intro: continue
    t0=int(intro[-1])
    if last>t0: stale.append((tgt,f,key,last-t0))
out={'nrefs':sum(len(v) for v in refs.values()),'multi':multi,'nokey':nokey,'missing':missing,'stale':sorted(stale,key=lambda x:-x[3])}
json.dump(out,open(os.path.join(os.path.dirname(__file__),'cachekeys.json'),'w'),indent=1)
print('refs',out['nrefs'],'multi',len(multi),'nokey',len(nokey),'missing',len(missing),'stale',len(stale))
