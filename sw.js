const V = 'rp-e3073329de';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'data.bin'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'rp-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const rid = (e.notification.data && e.notification.data.rem) || '';
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(l => {
    for (const c of l){ if ('focus' in c){ c.postMessage({rem: rid || 'x'}); return c.focus(); } }
    return self.clients.openWindow('./');
  }));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin){
    if (u.pathname.endsWith('/data.bin')){      /* данные: сначала сеть (чтобы цены обновлялись), без сети из памяти */
      e.respondWith(fetch(r, {cache: 'no-cache'}).then(res => { if (res.ok){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
      return;
    }
    e.respondWith(caches.match(r, {ignoreSearch: true}).then(m => m || fetch(r).then(res => { if (res.ok){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open('rp-fonts').then(c => c.match(r).then(m => { const f = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => m); return m || f; })));
  }
});
