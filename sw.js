// ══════════════════════════════════════════
//  TLpos Pro — Service Worker v2.0
//  Cache-first for shell, Network-first for CDN
// ══════════════════════════════════════════

const CACHE_NAME   = 'tlpos-pro-v2';
const SHELL_CACHE  = 'tlpos-shell-v2';
const CDN_CACHE    = 'tlpos-cdn-v2';

// App shell — always cached locally
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

// CDN libraries to cache
const CDN_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.4/dexie.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700&display=swap'
];

// ── Install ──
self.addEventListener('install', event => {
  console.log('[SW] Installing TLpos Pro v2');
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(SHELL_URLS);
      }),
      caches.open(CDN_CACHE).then(cache => {
        console.log('[SW] Caching CDN libraries');
        return Promise.allSettled(
          CDN_URLS.map(url =>
            fetch(url, { mode: 'cors' })
              .then(res => { if (res.ok) cache.put(url, res); })
              .catch(() => console.warn('[SW] Could not cache:', url))
          )
        );
      })
    ]).then(() => self.skipWaiting())
  );
});

// ── Activate ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating TLpos Pro v2');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![SHELL_CACHE, CDN_CACHE, CACHE_NAME].includes(k))
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch Strategy ──
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Skip non-GET and browser-extension requests
  if (event.request.method !== 'GET') return;
  if (url.startsWith('chrome-extension://')) return;

  // Camera / media — never intercept
  if (url.includes('getUserMedia') || event.request.destination === 'video') return;

  // App shell — Cache First
  if (SHELL_URLS.some(u => url.endsWith(u.replace('./', '')))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(SHELL_CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // CDN libraries — Cache First with network fallback
  const isCDN = CDN_URLS.some(u => url.includes(new URL(u).hostname)) ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('unpkg.com') ||
    url.includes('cdn.jsdelivr.net') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com');

  if (isCDN) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request, { mode: 'cors' }).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CDN_CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Everything else — Network first, cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── Background Sync (future use) ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
