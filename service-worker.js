/**
 * ByfiPlay Service Worker — byfiplayglobal.com.ng
 * ------------------------------------------------
 * Caching strategy:
 *   - HTML (navigation): network-first → cache → offline fallback
 *   - CSS, JS, images, fonts: cache-first with stale-while-revalidate
 *   - Videos: network-first (not precached — too large)
 *
 * Bump CACHE_VERSION on every production deploy that changes cached assets.
 */

const CACHE_VERSION = 'byfiplay-v2.0.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

/** Core shell assets precached during install (root-relative paths) */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/artiste.html',
  '/sound.html',
  '/studio.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/css/index.css',
  '/css/mobile.css',
  '/css/flip.css',
  '/css/advert.css',
  '/css/constant.css',
  '/css/pwa.css',
  '/js/advert.js',
  '/js/script.js',
  '/js/index.js',
  '/js/price.js',
  '/js/constant.js',
  '/js/pwa.js',
  '/img/IMG-20251201-WA0006.jpg',
  '/img/icons8-drag-list-down-48%5B1%5D.png',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/apple-touch-icon.png'
];

const OFFLINE_URL = '/offline.html';

function isStaticAsset(url) {
  if (url.origin !== self.location.origin) {
    return false;
  }
  return /\.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|webmanifest)(\?|$)/i.test(
    url.pathname
  );
}

function isVideoAsset(url) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url.pathname);
}

function cacheKey(request) {
  return request.url;
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(cacheKey(request), networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    if (request.mode === 'navigate') {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) {
        return offline;
      }
    }

    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then(function (response) {
        if (response && response.ok) {
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(cacheKey(request), response);
          });
        }
      })
      .catch(function () {
        /* offline — cached copy is fine */
      });

    return cached;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(cacheKey(request), networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) {
        return offline;
      }
    }

    throw error;
  }
}

/* --- Install: precache core assets (tolerates missing optional files) --- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(function (cache) {
        return Promise.allSettled(
          PRECACHE_URLS.map(function (url) {
            return cache.add(new Request(url, { cache: 'reload' }));
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

/* --- Activate: purge outdated caches and take control immediately --- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== STATIC_CACHE && key !== RUNTIME_CACHE;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

/* --- Message: allow pages to trigger immediate activation of waiting worker --- */
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* --- Fetch: route requests by type --- */
self.addEventListener('fetch', function (event) {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  const isGoogleFont =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (url.origin !== self.location.origin && !isGoogleFont) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isVideoAsset(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url) || isGoogleFont) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
