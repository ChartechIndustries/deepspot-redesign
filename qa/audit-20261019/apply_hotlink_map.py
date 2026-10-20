"""Replace hotlinked image URLs with local copies (editorial-assets/ext/).
Usage: python apply_hotlink_map.py source/featured-spots.json [more files]
Map: hotlink-map.json (raw URL text as in the file -> local path). Longest URL first; exact-token match."""
import json,re,sys,os
here=os.path.dirname(os.path.abspath(__file__))
mp=json.load(open(os.path.join(here,'hotlink-map.json'),encoding='utf-8'))
for f in sys.argv[1:]:
    t=open(f,encoding='utf-8').read(); n=0
    for u in sorted(mp,key=len,reverse=True):
        t,c=re.subn(re.escape(u)+r'(?=["\\\s<>])',lambda m:mp[u],t); n+=c
    open(f,'w',encoding='utf-8',newline='').write(t); print(f,n,'replaced')
