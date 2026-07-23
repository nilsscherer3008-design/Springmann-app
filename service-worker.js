// Sani AG – Service Worker
const CACHE_NAME = 'sani-ag-v2';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Beim Installieren: App-Hülle cachen, damit die App als installierbar erkannt wird
// und beim nächsten Start schneller/offline-fähig lädt.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}) // falls z.B. Icons noch fehlen, Install trotzdem nicht blockieren
  );
  self.skipWaiting();
});

// Alte Caches beim Aktivieren aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first, mit Cache-Fallback (z.B. bei schlechtem Empfang)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push-Benachrichtigung (Notfall-Alarm) auch im Hintergrund/bei geschlossener App anzeigen
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : {};
  self.registration.showNotification(d.title || '🚨 NOTFALL!', {
    body: d.body || 'Ein Notfall wurde ausgelöst!',
    icon: d.icon || './icon-192.png',
    badge: './icon-192.png',
    tag: 'sani-notfall',
    // renotify: sonst würde ein zweiter Notfall die erste Meldung lautlos
    // ersetzen (gleicher tag) — es soll aber jedes Mal wieder alarmieren.
    renotify: true,
    silent: false,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300]
  });
});

// Klick auf die Benachrichtigung -> App öffnen und den lauten Anruf-Bildschirm
// zeigen. Das Antippen ist eine Nutzer-Aktion, deshalb darf ab hier auch wieder
// Ton abgespielt werden — vorher (Bildschirm aus) blockiert das Handy das.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          // App läuft noch im Hintergrund -> Bescheid geben, dass sie klingeln soll
          client.postMessage({ type: 'emergency-notification' });
          return client.focus();
        }
      }
      // App war ganz zu -> mit Notfall-Kennzeichen öffnen
      if (self.clients.openWindow) return self.clients.openWindow('./index.html?notfall=1');
    })
  );
});
