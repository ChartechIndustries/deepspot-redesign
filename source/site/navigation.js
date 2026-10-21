(()=>{
 const localSections=new Set(['browse','map','adventures','stories','tours','guides','community','app','mission','faq','privacy','terms','cookies','contribute','saved','plan-trip','leaderboard','membership','competition','roadmap','profile','account','forum','guide','story','spot','sponsored','inbox','invites']);
 let available=null;
 const getTheme=()=>document.documentElement.dataset.theme==='light'?'light':'dark';
 function destination(anchor){
  if(anchor.hasAttribute('data-original')||anchor.closest('.ds-prose')&&anchor.origin!==location.origin)return null;
  let u;try{u=new URL(anchor.getAttribute('href'),location.href);}catch{return null;}
  if(!/^https?:$/.test(u.protocol))return null;
  const official=/^(www\.)?deepspot\.io$/.test(u.hostname),parts=u.pathname.split('/').filter(Boolean);
  if(official){
   if(parts[0]==='blog'&&parts[1]&&available?.spots.includes(parts[1]))u=new URL('/spot/?id='+encodeURIComponent(parts[1]),location.origin);
   else if(parts[0]==='stories'&&parts[1]){if(!available?.stories[parts[1]])return null;u=new URL('/story/?id='+encodeURIComponent(available.stories[parts[1]]),location.origin);}
   else if(parts[0]==='user'&&parts[1]){if(!available?.profiles[parts[1]])return null;u=new URL('/profile/?user='+encodeURIComponent(available.profiles[parts[1]]),location.origin);}
   else if(parts[0]==='browse'&&['stories','guides'].includes(u.searchParams.get('tab')))u=new URL('/'+u.searchParams.get('tab')+'/',location.origin);
   else if(parts[0]==='map'&&u.searchParams.get('adventure')){if(!available?.guides.includes(u.searchParams.get('adventure')))return null;u=new URL('/guide/?id='+encodeURIComponent(u.searchParams.get('adventure')),location.origin);}
   else if(parts[0]==='map'&&u.searchParams.get('slug')&&!available?.mapped.includes(u.searchParams.get('slug')))return null;
   else if(parts[0]==='profile')u=new URL('/account/',location.origin);
   else if(localSections.has(parts[0])){u.host=location.host;u.protocol=location.protocol;u.pathname='/'+parts[0]+'/';}
   else return null;
  }
  if(u.origin!==location.origin)return null;
  if(u.pathname==='/'||localSections.has(u.pathname.split('/')[1])){u.searchParams.set('theme',getTheme());return u.pathname+u.search+u.hash;}
  return null;
 }
 if(!document.querySelector('link[href="/site/account-nav.css"]')){const accountStyle=document.createElement('link');accountStyle.rel='stylesheet';accountStyle.href='/site/account-nav.css';document.head.append(accountStyle);}
 function update(root=document){
  root.querySelectorAll('.header-controls,.br-settings').forEach(controls=>{if(!controls.querySelector('.ds-fieldbook-button')){const book=document.createElement('a');book.className='ds-fieldbook-button';book.href='/saved/';book.setAttribute('aria-label','Your fieldbook');book.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>';controls.prepend(book);}if(controls.querySelector('.ds-account-button'))return;const account=document.createElement('a');account.className='ds-account-button';account.href='/account/';account.setAttribute('aria-label','Your account');account.title='Your account';account.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg>';controls.prepend(account);});
  root.querySelectorAll('a[href]').forEach(a=>{const href=destination(a);if(href&&a.getAttribute('href')!==href){a.setAttribute('href',href);if(!a.hasAttribute('download')){a.removeAttribute('target');a.removeAttribute('rel');}}});}
 function homeMenu(){
  const header=document.querySelector('header.header'),controls=header?.querySelector('.header-controls');
  if(!controls||header.querySelector('.ds-home-menu'))return;
  const button=document.createElement('button');button.className='ds-home-menu';button.type='button';button.textContent='☰';button.setAttribute('aria-label','Open navigation');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','ds-home-navigation');
  const nav=document.createElement('nav');nav.id='ds-home-navigation';nav.className='ds-home-navigation';nav.hidden=true;nav.setAttribute('aria-label','Mobile navigation');
  nav.innerHTML=[['browse','browse'],['map','map'],['tours','tours'],['guides','guides'],['community','community'],['your fieldbook','saved'],['your account','account'],['membership','membership'],['contribute','contribute']].map(([label,path])=>`<a href="/${path}/?theme=${getTheme()}">${label}</a>`).join('');
  button.onclick=()=>{nav.hidden=!nav.hidden;button.setAttribute('aria-expanded',String(!nav.hidden));button.setAttribute('aria-label',nav.hidden?'Open navigation':'Close navigation');button.textContent=nav.hidden?'☰':'×';if(!nav.hidden)nav.querySelector('a').focus();};
  header.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){button.click();button.focus();}});
  controls.append(button);header.append(nav);
 }
 let frame;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{update();homeMenu();});};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a){const href=destination(a);if(href)a.href=href;}},true);
 fetch('/site/routes.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{available=data;schedule();}).catch(()=>{});
 update();homeMenu();
})();
