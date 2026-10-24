// The preview deliberately uses the network for content. No account data, map
// tiles, drafts or editorial pages are cached by this service worker.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
