(()=>{
 /* onboarding (2026-10-21): the account button opens /welcome/ until onboarding is finished; ?onboard=1 on any page force-opens it for review */
 const onboarded=()=>{try{return !!localStorage.getItem('deepspot-onboarded-v1');}catch{return false;}};
 const passportHref='/profile/?user=preview';
 const welcomeHref=force=>{const u=new URLSearchParams(),here=location.pathname+location.search.replace(/[?&]onboard=1/,'').replace(/^&/,'?');if(location.pathname!=='/welcome/'&&location.pathname!=='/'&&/^\/(browse|spot|guides|guide|community|leaderboard|saved|plan-trip|map|tours|account|inbox|invites)\//.test(location.pathname))u.set('from',here);if(force)u.set('force','1');u.set('theme',document.documentElement.dataset.theme==='light'?'light':'dark');return '/welcome/?'+u;};
 if(new URLSearchParams(location.search).get('onboard')==='1'&&location.pathname!=='/welcome/'){location.replace(welcomeHref(true));return;}
 const accountHref=()=>onboarded()?passportHref:welcomeHref(false);
 const localSections=new Set(['welcome','browse','map','adventures','tours','guides','community','app','mission','faq','privacy','terms','cookies','contribute','saved','plan-trip','leaderboard','membership','competition','roadmap','profile','account','forum','guide','spot','sponsored','inbox','invites']);
 let available=null;
 const getTheme=()=>document.documentElement.dataset.theme==='light'?'light':'dark';
 function destination(anchor){
  if(anchor.hasAttribute('data-original')||anchor.closest('.ds-prose')&&anchor.origin!==location.origin)return null;
  let u;try{u=new URL(anchor.getAttribute('href'),location.href);}catch{return null;}
  if(!/^https?:$/.test(u.protocol))return null;
  const official=/^(www\.)?deepspot\.io$/.test(u.hostname),parts=u.pathname.split('/').filter(Boolean);
  if(official){
   if(parts[0]==='blog'&&parts[1]&&available?.spots.includes(parts[1]))u=new URL('/spot/?id='+encodeURIComponent(parts[1]),location.origin);
   else if(parts[0]==='user'&&parts[1]){if(!available?.profiles[parts[1]])return null;u=new URL('/profile/?user='+encodeURIComponent(available.profiles[parts[1]]),location.origin);}
   else if(parts[0]==='browse'&&['guides'].includes(u.searchParams.get('tab')))u=new URL('/'+u.searchParams.get('tab')+'/',location.origin);
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
 if(!document.querySelector('link[href^="/site/account-nav.css?v=28ee3cb3"]')){const accountStyle=document.createElement('link');accountStyle.rel='stylesheet';accountStyle.href='/site/account-nav.css?v=28ee3cb3';document.head.append(accountStyle);}
 function update(root=document){
  root.querySelectorAll('.header-controls,.br-settings').forEach(controls=>{if(!controls.querySelector('.ds-fieldbook-button')){const book=document.createElement('a');book.className='ds-fieldbook-button';book.href='/saved/';book.setAttribute('aria-label','Your fieldbook');book.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>';controls.prepend(book);}if(controls.querySelector('.ds-account-button'))return;const account=document.createElement('a');account.className='ds-account-button';account.href=accountHref();account.setAttribute('aria-label','Your passport');account.title='Your passport';account.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg>';controls.prepend(account);});
  root.querySelectorAll('a[href]').forEach(a=>{const href=destination(a);if(href&&a.getAttribute('href')!==href){a.setAttribute('href',href);if(!a.hasAttribute('download')){a.removeAttribute('target');a.removeAttribute('rel');}}});}
 function homeMenu(){
  const header=document.querySelector('header.header'),controls=header?.querySelector('.header-controls');
  if(!controls||header.querySelector('.ds-home-menu'))return;
  const button=document.createElement('button');button.className='ds-home-menu';button.type='button';button.textContent='☰';button.setAttribute('aria-label','Open navigation');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','ds-home-navigation');
  const nav=document.createElement('nav');nav.id='ds-home-navigation';nav.className='ds-home-navigation';nav.hidden=true;nav.setAttribute('aria-label','Mobile navigation');
  nav.innerHTML=[['browse','browse'],['map','map'],['tours','tours'],['community','community'],['your account','account']].map(([label,path])=>`<a href="/${path}/?theme=${getTheme()}">${label}</a>`).join('');
  button.onclick=()=>{nav.hidden=!nav.hidden;button.setAttribute('aria-expanded',String(!nav.hidden));button.setAttribute('aria-label',nav.hidden?'Open navigation':'Close navigation');button.textContent=nav.hidden?'☰':'×';if(!nav.hidden)nav.querySelector('a').focus();};
  header.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){button.click();button.focus();}});
  controls.append(button);header.append(nav);
 }
 let frame;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{update();homeMenu();});};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a){if(a.classList.contains('ds-account-button')){a.href=accountHref();return;}const href=destination(a);if(href)a.href=href;}},true);
 fetch('/site/routes.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{available=data;schedule();}).catch(()=>{});
 update();homeMenu();
})();
