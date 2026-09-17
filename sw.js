const CACHE_NAME = 'respira-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('firebaseapp.com') || e.request.url.includes('gstatic.com')) { e.respondWith(fetch(e.request)); return; }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
