from pathlib import Path
import json,re
root=Path(__file__).parent/'source'
routes={'spot':'Deep Spot','stories':'Browse Stories','story':'Stories','guides':'Browse Guides','guide':'Guide','adventures':'Adventures','saved':'Your Fieldbook','plan-trip':'Plan an Adventure','map':'Interactive Map','community':'Community','leaderboard':'Top Contributors','competition':'DeepSpot Competition','contribute':'Share a Hidden Gem','mission':'Our Mission','faq':'Frequently Asked Questions','membership':'Founding Membership','app':'DeepSpot App','roadmap':'The Roadmap','privacy':'Privacy Policy','terms':'Terms of Service','cookies':'Cookie Policy','sponsored':'Partnerships','account':'Your Account'}
for route,title in routes.items():
 folder=root/route;folder.mkdir(exist_ok=True)
 page=f'''<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c101b"><title>{title} — DeepSpot</title><meta name="description" content="{title}. Discover the obscure, the weird, and the wonderful with DeepSpot.">
<script>try{{document.documentElement.dataset.theme=new URLSearchParams(location.search).get('theme')||localStorage.getItem('deepspot-theme')||'dark';}}catch{{}}</script>
<link rel="icon" href="/site/app-icon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/site-cta.css?v=expansion1"><link rel="stylesheet" href="/panel-colors.css?v=5"><link rel="stylesheet" href="/browse/browse.css"><link rel="stylesheet" href="/profile/links.css"><link rel="stylesheet" href="/site/vendor/leaflet.css"><link rel="stylesheet" href="/site/pages.css"><link rel="stylesheet" href="/site/finishing.css">
<script src="/panel-colors.js?v=2"></script><script defer src="/site-cta.js?v=expansion1"></script><script defer src="/site/navigation.js"></script><script defer src="/site/install.js"></script><script type="module" src="/site/pages.mjs"></script></head>
<body data-page="{route}"><a class="skip-link" href="#page-content">skip to content</a><ds-site-header></ds-site-header><main class="ds-page" id="page-content" tabindex="-1"><p class="ds-loading" role="status">Loading {title.lower()}…</p></main><deepspot-cta></deepspot-cta><noscript><p>Please enable JavaScript to explore this page, or <a href="https://www.deepspot.io/">visit DeepSpot</a>.</p></noscript></body></html>'''
 (folder/'index.html').write_text(page,encoding='utf-8')

# Preserve the existing home, browse and passport layouts while connecting them.
for file in ['index.html','browse/index.html','profile/index.html']:
 p=root/file;t=p.read_text(encoding='utf-8')
 if '/site/navigation.js' not in t:t=t.replace('</head>','<script defer src="/site/navigation.js"></script><script defer src="/site/install.js"></script><link rel="manifest" href="/manifest.webmanifest"></head>')
 t=t.replace('site-cta.js?v=footer1','site-cta.js?v=expansion1')
 (root/file).write_text(t,encoding='utf-8')

p=root/'site-cta.js';t=p.read_text(encoding='utf-8')
t=t.replace('href="https://www.deepspot.io/early-access" target="_blank" rel="noopener"','href="/contribute/"')
t=t.replace('href="#"','href="/"')
for route in ['map','mission','faq','privacy','terms','cookies']:t=t.replace('href="https://www.deepspot.io/'+route+'"','href="/'+route+'/"')
t=t.replace('<li><a href="/browse/">browse</a></li>','<li><a href="/browse/">browse</a></li><li><a href="/stories/">stories</a></li><li><a href="/guides/">guides</a></li><li><a href="/community/">community</a></li><li><a href="/saved/">your fieldbook</a></li><li><a href="/membership/">membership</a></li><li><a href="/account/">your account</a></li>')
t=t.replace('<span class="ds-footer-star" aria-hidden="true">✳</span>','<svg class="ds-footer-star" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg>')
p.write_text(t,encoding='utf-8')

# The SSR header and its React counterpart must match during hydration.
nav={'Browse':'browse','Map':'map','Adventures':'adventures','Stories':'stories','Community':'community','App':'app'}
p=root/'index.html';t=p.read_text(encoding='utf-8');start=t.index('<nav class="nav"') if '<nav class="nav"' in t else t.index('<nav aria-label="Main navigation"') if '<nav aria-label="Main navigation"' in t else -1
if start<0:
 m=re.search(r'<nav[^>]*aria-label="Main navigation"[^>]*>',t);start=m.start() if m else -1
if start>=0:
 end=t.index('</nav>',start);opening=t[start:t.index('>',start)+1]
 t=t[:start]+opening+''.join(f'<a href="/{path}/" style="color:inherit;text-decoration:none">{label}</a>' for label,path in nav.items())+t[end:]
p.write_text(t,encoding='utf-8')
p=root/'_next/static/chunks/page-C89T775K-v50.js';t=p.read_text(encoding='utf-8')
pattern=r'\]\.map\(\(e\) => e === `Browse`.*?\(0, Y\.jsx\)\(`span`, \{ children: e \}, e\)\),'
replacement='].map((e) => (0, Y.jsx)(`a`, {href: mounted ? `/${e.toLowerCase()}/?theme=${THEME}` : `/${e.toLowerCase()}/`, style:{color:`inherit`,textDecoration:`none`},children:e},e)),'
t,n=re.subn(pattern,replacement,t,flags=re.S);assert n==1,'React navigation match missing'
(root/'_next/static/chunks/page-C89T775K-v51.js').write_text(t,encoding='utf-8')
for name in ['index-B9ZOBUSp','layout-segment-context-BmbrN5Mh']:
 p=root/('_next/static/chunks/'+name+'-v50.js');t=p.read_text(encoding='utf-8').replace('-v50.js','-v51.js');(root/('_next/static/chunks/'+name+'-v51.js')).write_text(t,encoding='utf-8')
p=root/'index.html';p.write_text(p.read_text(encoding='utf-8').replace('-v50.js','-v51.js'),encoding='utf-8')

# Full stories and meaningful promo destinations replace preview-only dialogs.
p=root/'editorial.js';t=p.read_text(encoding='utf-8')
t=t.replace('src="/editorial-assets/${st.image}.jpg"','src="${st.cover||\'/editorial-assets/\'+st.image+\'.jpg\'}"')
old="if(story){const st=editorialStories[+story.dataset.story];show("
t=t.replace(old,"if(story){const st=editorialStories[+story.dataset.story];location.href='/story/?id='+encodeURIComponent(st.id)+'&theme='+document.documentElement.dataset.theme;return;show(")
t=t.replace("if(promo){const data=", "if(promo){location.href=({competition:'/competition/',week:'/spot/?id=tochigi-underground-quarry',roadmap:'/roadmap/'})[promo.dataset.promo]+(promo.dataset.promo==='week'?'&':'?')+'theme='+document.documentElement.dataset.theme;return;const data=")
t=t.replace('<h2>stories</h2>','<h2><a href="/stories/" style="color:inherit;text-decoration:none">stories</a></h2>')
p.write_text(t,encoding='utf-8')

# Add verified source profile records without fabricating biography or awards.
content=json.loads((root/'site/content.json').read_text(encoding='utf-8'))
people=content['leaderboard']['monthly']
profiles={'preview':False,'capturedAt':'2026-10-08','profiles':[{'id':re.sub(r'[^a-z0-9]+','-',p['name'].lower()),'name':p['name'],'contributions':p['spots']+p['stories'],'image':p['image'],'profileUrl':None,'originalProfile':'https://www.deepspot.io/user/'+p['name'],'handle':p['name'],'bio':None,'basedIn':None,'joined':p['joined'].replace('Joined ',''),'countries':None,'stories':p['stories'],'spots':p['spots'],'signature':None,'sample':False,'verifiedSnapshot':True} for p in people]}
(root/'profile/profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2),encoding='utf-8')
p=root/'profile/data.mjs';t=p.read_text(encoding='utf-8').replace("if(sample){","if(sample?.sample){")
t=t.replace("const name=names.find(name=>profileId(name)===id);if(!name)return null;","const name=names.find(name=>profileId(name)===id)||sample?.name;if(!name)return null;")
t=t.replace("s.publisher===name", "s.publisher?.toLowerCase()===name.toLowerCase()").replace("s.author===name", "s.author?.toLowerCase()===name.toLowerCase()")
t=t.replace("href:'https://www.deepspot.io'+spot.id", "href:'/spot/?id='+encodeURIComponent(spot.id.split('/').pop())")
t=t.replace("image:'/editorial-assets/'+s.image+'.jpg',href:'/?story='+encodeURIComponent(s.id)+'#stories'", "image:s.cover||'/editorial-assets/'+s.image+'.jpg',href:'/story/?id='+encodeURIComponent(s.id)")
t=t.replace("image:null,bio:null", "image:sample?.image||null,bio:null")
t=t.replace("stats:[{value:spots.length", "stats:sample?.verifiedSnapshot?[{value:sample.spots,label:'spots contributed'},{value:sample.stories,label:'stories shared'}]:[{value:spots.length")
t=t.replace("notice:'Contributions from this site’s current collection. Full profile details are not connected yet.'", "notice:sample?.verifiedSnapshot?'Profile totals captured from DeepSpot on October 8, 2026. Entries below are from this preview’s collection.':'Contributions from this site’s current collection. Full profile details are not connected yet.'")
p.write_text(t,encoding='utf-8')
p=root/'profile/identity.mjs';t=p.read_text(encoding='utf-8').replace("['/','/browse/']", "['/','/browse/','/spot/','/story/','/stories/','/guides/','/guide/','/community/','/leaderboard/','/saved/','/adventures/','/plan-trip/','/map/']");p.write_text(t,encoding='utf-8')
p=root/'community.js';t=p.read_text(encoding='utf-8').replace("<h3>top contributors</h3>","<h3><a href=\"/leaderboard/\" style=\"color:inherit;text-decoration:none\">top contributors ↗</a></h3>")
t=t.replace("${this.preview?'<span class=\"cl-sample\">sample profiles</span>':''}","${this.preview?'<span class=\"cl-sample\">sample profiles</span>':'<span class=\"cl-sample\">oct 2026</span>'}")
p.write_text(t,encoding='utf-8')
print('Built',len(routes),'connected routes and updated home, browse, profiles, and footer.')
