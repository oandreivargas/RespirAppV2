const CACHE_NAME = 'respira-v54';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
 
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
 
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
 
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for Firebase calls
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || url.hostname.includes('firebaseapp.com') || url.hostname.includes('firestore.googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Segurança: o cache só guarda GET do próprio app (nunca POST nem domínios de terceiros)
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Network-first for app files, fallback to cache
  e.respondWith(
    fetch(e.request).then(r => {
      // Só armazena respostas válidas (evita cachear erros/redirecionamentos)
      if (r && r.ok && r.type === 'basic') {
        const rc = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, rc));
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
