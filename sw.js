const CACHE='pautang-github-v1.32';
const FILES=['./','./index.html','./styles.css','./rose-theme.css','./app.js','./manifest.webmanifest','./pautang-icon.svg','./apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(saved=>{
    const network=fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response});
    return saved||network.catch(()=>caches.match(new URL('./index.html',self.registration.scope)));
  }));
});
