// Service worker: guarda la app en el móvil para que funcione sin conexión.
// Sube CACHE cada vez que cambie algún archivo para forzar la actualización.

const CACHE = 'zurifit-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/main.js',
  './js/store.js',
  './js/stats.js',
  './js/data/exercises.js',
  './js/data/program.js',
  './js/data/messages.js',
  './js/data/achievements.js',
  './js/lib/dom.js',
  './js/lib/fx.js',
  './js/lib/timer.js',
  './js/lib/charts.js',
  './js/views/onboarding.js',
  './js/views/home.js',
  './js/views/workout.js',
  './js/views/summary.js',
  './js/views/progress.js',
  './js/views/routine.js',
  './js/views/achievements.js',
  './js/views/settings.js',
  './js/views/sheet.js',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-180.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // La navegación va primero a la red y cae al caché si no hay conexión.
  if (req.mode === 'navigate') {
    ev.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  ev.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
