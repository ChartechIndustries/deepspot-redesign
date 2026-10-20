import sys,json,urllib.request,urllib.parse
def api(**p):
    p['format']='json'
    u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(p)
    r=urllib.request.Request(u,headers={'User-Agent':'DeepSpotPrototype/1.0 (tomcat1205167@gmail.com)'})
    return json.load(urllib.request.urlopen(r))
q=' '.join(sys.argv[1:])
d=api(action='query',list='search',srsearch=q,srnamespace=6,srlimit=15)
for s in d['query']['search']: print(s['title'])
