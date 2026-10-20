from pathlib import Path
import json,re,html,shutil
from urllib.parse import urlparse,parse_qs
from bs4 import BeautifulSoup

base=Path(__file__).parent
root=base/'source'
research=max(Path('C:/Users/CharD/Downloads').glob('deepspot-site-research-20261008*.json'),key=lambda p:p.stat().st_mtime)
r=json.loads(research.read_text(encoding='utf-8'))
(base/'research').mkdir(exist_ok=True)
shutil.copy2(research,base/'research/original-site-20261008.json')
def direct(url):
 if not url:return None
 if '/_next/image?' in url:url=parse_qs(urlparse(url).query).get('url',[url])[0]
 if 'apple-touch-icon' in url:return None
 return url if url.startswith('https://') else None
def clean(markup):
 soup=BeautifulSoup(markup,'html.parser')
 for tag in list(soup.find_all(True)):
  if tag.name not in ['p','br','a','strong','em','i','b','h2','h3','h4','ul','ol','li','blockquote','img','figure','figcaption']:
   tag.unwrap();continue
  attrs=dict(tag.attrs);tag.attrs={}
  if tag.name=='a':
   href=attrs.get('href','')
   if href.startswith(('https://','http://','mailto:')):tag['href']=href;tag['target']='_blank';tag['rel']='noopener'
  if tag.name=='img':
   src=direct(attrs.get('src'))
   if not src:tag.decompose();continue
   tag['src']=src;tag['alt']=attrs.get('alt','');tag['loading']='lazy';tag['decoding']='async'
 return str(soup)

content=json.loads((root/'site/content.json').read_text(encoding='utf-8'))
content['capturedAt']='2026-10-08'
content['legal']=r['legal']
content['storyBodies']={a['url'].split('/')[-1]:{'html':clean(a['html']),'source':a['url']} for a in r['articles']}
oldstories=json.loads((root/'editorial-stories.json').read_text(encoding='utf-8'))
aliases=['basement','moscow','boundary','shark','hats','ama','melon','lake','witches']
tags=['history & folklore','history & folklore','history & walking','food & ritual','people & culture','living traditions','urban legends','nature','history & folklore']
stories=[]
for i,s in enumerate(r['stories']):
 existing=next((o for o in oldstories if o['id']==aliases[i]),{})
 stories.append({**s,'id':aliases[i],'slug':s['url'].split('/')[-1],'image':existing.get('image',aliases[i]),'cover':('/editorial-assets/'+existing['image']+'.jpg') if existing.get('image') and (root/('editorial-assets/'+existing['image']+'.jpg')).exists() else direct(s['cover']),'tag':tags[i],'authorImage':direct(s.get('authorImage'))})
(root/'editorial-stories.json').write_text(json.dumps(stories,ensure_ascii=False,indent=2),encoding='utf-8')

catalog=json.loads((root/'featured-spots.json').read_text(encoding='utf-8'))
for entry in r['browse']:
 existing=next((s for s in catalog if s['id']==entry['id']),None)
 entry['image']=existing.get('image') if existing and existing.get('image') else direct(entry.get('image'))
 entry['publisherImage']=direct(entry.get('publisherImage'))
 if existing:existing.update(entry)
 else:catalog.append(entry)
for s in r['spotDetails']:
 slug=s['id'].split('/')[-1]
 meta=content['spots'].setdefault(slug,{})
 meta.update({'html':clean(s['html']),'notes':s['notes'],'publisher':s.get('publisher'),'publisherHref':s.get('publisherHref'),'source':'https://www.deepspot.io'+s['id']})
 meta['photos']=[{**p,'src':direct(p['src'])} for p in s['photos'] if direct(p.get('src'))]
 spot=next((x for x in catalog if x['id']==s['id']),None)
 if spot and s.get('publisher'):spot['publisher']=s['publisher']
(root/'featured-spots.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
content['guides']=[]
for g in r['guides']:
 if 'test' in g['title'].lower():continue
 lines=g['label'].splitlines()
 guide={'id':parse_qs(urlparse(g['url']).query)['adventure'][0],'title':g['title'],'text':g['text'],'cover':direct(g.get('cover')),'kind':'list' if lines[0]=='LIST' else 'adventure','source':g['url'],'author':'DeepSpot','duration':'','distance':''}
 if len(lines)>2 and lines[2] !=g['title']:guide['duration']=lines[2].lower()
 if len(lines)>3 and 'KM' in lines[3]:guide['distance']=lines[3].lower()
 content['guides'].append(guide)
content['leaderboard']=r['leaderboard']
for entries in content['leaderboard'].values():
 for p in entries:p['image']=direct(p.get('image'))
content['sources']=[{'url':'https://www.deepspot.io/browse','accessed':'2026-10-08'},{'url':'https://www.deepspot.io/leaderboard','accessed':'2026-10-08'},{'url':'https://www.deepspot.io/membership','accessed':'2026-10-08'}]
(root/'site/content.json').write_text(json.dumps(content,ensure_ascii=False,indent=2),encoding='utf-8')
print('Content captured:',len(stories),'stories;',len(content['guides']),'guides;',len(r['spotDetails']),'full destination articles;',len(catalog),'catalog records')
