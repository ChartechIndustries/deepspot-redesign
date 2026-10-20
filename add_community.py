from pathlib import Path
import json,shutil
r=Path(__file__).parent/'source'
latest=max(Path('C:/Users/CharD/Downloads').glob('deepspot-site-research-20261008*.json'),key=lambda p:p.stat().st_mtime)
research=json.loads(latest.read_text(encoding='utf-8'));content=json.loads((r/'site/content.json').read_text(encoding='utf-8'))
names=['DeepSpot Team','DeepSpot Team','Ben Wallace','ShutterBug'];kinds=['poll','announcement','travel advice','photography']
content['forum']=[{'id':p['url'].split('/')[-1],'title':p['title'],'body':p['html'],'url':p['url'],'author':names[i],'category':kinds[i],'replies':[4,0,1,4][i]} for i,p in enumerate(research['forum'])]
content['pending']=[{'title':'No Feathers or Wax on this Yugoslav Icarus Statue','place':'Icarus on the Air Force Command Building','text':'An Art Deco Icarus on abandoned Yugoslav Modernist architecture.','author':'Lana Velkov'},{'title':"An Architectural Abomination Known as the ‘Little Red Riding Hood’",'place':'YU Biznis Centar','text':'A metal-clad building with an unmistakable silhouette.','author':'Lana Velkov'},{'title':'A Legend of Three Sisters in Love with the Same Sailor','place':'Tre Sorelle Palace','text':'A medieval palace and the legend of the three sisters who lived there.','author':'Lana Velkov'}]
(r/'site/content.json').write_text(json.dumps(content,ensure_ascii=False,indent=2),encoding='utf-8');shutil.copy2(latest,r.parent/'research/original-site-20261008.json')
p=r/'site/pages.mjs';t=p.read_text(encoding='utf-8')
needle="const notice='<p class=\"ds-note\">Source content captured from DeepSpot on October 8, 2026.</p>';"
addition='''
function communityFeed(content){return `<section class="ds-community-feed">${heading('around the community.')}<div class="ds-tabs" role="group" aria-label="Community activity"><button data-feed-tab="submissions" aria-pressed="true">submissions</button><button data-feed-tab="forum" aria-pressed="false">forum</button><a href="${localURL('/roadmap/')}">roadmap ↗</a></div><div id="community-feed-content"></div></section>`;}
function wireCommunity(content){const show=tab=>{const target=$('#community-feed-content');$$('[data-feed-tab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.feedTab===tab));target.innerHTML=tab==='forum'?`<div class="ds-forum-list">${content.forum.map(f=>`<a href="${localURL('/forum/',{id:f.id})}"><span class="ds-eyebrow">${esc(f.category)} · ${esc(f.author)}</span><h3>${esc(f.title)}</h3><span>${f.replies} replies ${icon('arrow')}</span></a>`).join('')}</div><p class="ds-note">Discussion snapshot from October 8, 2026. Open a topic to read it or continue the conversation on DeepSpot.</p>`:`<div class="ds-three">${content.pending.map(p=>`<article><span class="ds-eyebrow">awaiting review · sep 30, 2026</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><p class="ds-note">by ${esc(p.author)}</p>${outbound('review on DeepSpot','https://www.deepspot.io/community','secondary')}</article>`).join('')}</div><p class="ds-note">Pending submissions captured from the original community page. Reviews and votes continue on DeepSpot.</p>`;};$$('[data-feed-tab]').forEach(b=>b.onclick=()=>show(b.dataset.feedTab));show('submissions');}
'''
t=t.replace(needle,needle+addition)
t=t.replace("${notice}${heading('make your mark.')}","${notice}${communityFeed(content)}${heading('make your mark.')}")
needle="else if(route==='leaderboard'){"
branch="""else if(route==='forum'){
  const f=content.forum.find(f=>f.id===params.get('id'));
  if(f){title(f.title);root.innerHTML=`<nav class="ds-breadcrumb"><a href="${localURL('/community/')}">community</a><span>/ forum</span></nav><header class="ds-story-title"><span class="ds-eyebrow">${esc(f.category)}</span><h1>${esc(f.title)}</h1><div class="ds-meta"><span>by ${esc(f.author)}</span><span>${f.replies} replies on DeepSpot</span><button class="ds-text-link" data-share-page>share ${icon('share')}</button></div></header><article class="ds-story-body ds-prose"><p style="white-space:pre-line">${esc(f.body)}</p><div class="ds-rule"></div><h2>keep the conversation going.</h2><p>Read the replies, add your perspective, or join the discussion on the original community forum.</p>${outbound('read replies & respond',f.url,'')}${notice}</article>`;}
  else {root.innerHTML=pageTitle('The','conversation.','Questions, local knowledge, and ideas from the DeepSpot community.')+communityFeed(content);wireCommunity(content);$('[data-feed-tab="forum"]').click();}
 }
 """
t=t.replace(needle,branch+needle)
t=t.replace("function outboundText(label,url)","function outboundText(label,url)")
t=t.replace("loadData().then(render).catch", "loadData().then(async data=>{await render(data);if(route==='community')wireCommunity(data.content);}).catch")
p.write_text(t,encoding='utf-8')
(r/'forum').mkdir(exist_ok=True)
t=(r/'community/index.html').read_text(encoding='utf-8').replace('data-page="community"','data-page="forum"').replace('Community — DeepSpot','Community Forum — DeepSpot')
(r/'forum/index.html').write_text(t,encoding='utf-8')
p=r/'site/navigation.js';t=p.read_text(encoding='utf-8').replace("'account','guide'","'account','forum','guide'");p.write_text(t,encoding='utf-8')
print('Community submissions, forum topics and reading pages added.')
