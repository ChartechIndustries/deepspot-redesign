window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();window.dsInstallPrompt=event;});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/deepspot-redesign/sw.js').catch(()=>{}));
