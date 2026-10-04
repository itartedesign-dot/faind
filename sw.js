/* FAIND — service worker minimo
   Serve a rendere FAIND installabile come app. Le pagine arrivano sempre
   dalla rete (notizie fresche); solo se manca la connessione si mostra
   l'ultima home salvata. */
const CACHE = 'faind-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './assets/logo.webp'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => { if (res.ok && new URL(e.request.url).pathname === '/') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); } return res; })
        .catch(() => caches.match('./'))
    );
  }
});
