
const CACHE_NAME = 'arogya-sahayak-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'https://rsms.me/inter/inter.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];

// 1. Install Event: Pre-cache the application shell.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up old caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Implement stale-while-revalidate for app assets.
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For API requests (Supabase, Geoapify, Gemini), go network-only. Don't cache them.
  const isApiRequest = event.request.url.includes('supabase.co') || 
                       event.request.url.includes('geoapify.com') ||
                       event.request.url.includes('google.com');

  if (isApiRequest) {
    // Network-only for APIs
    event.respondWith(fetch(event.request));
    return;
  }

  // Stale-while-revalidate for all other assets
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Return cached response if available, otherwise wait for the network
        return cachedResponse || fetchPromise;
      });
    })
  );
});


// PUSH NOTIFICATION HANDLING

// This listener is used for actual push events from a server.
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  const data = event.data ? event.data.json() : { title: 'Arogya Sahayak', body: 'You have a new health alert!' };

  const options = {
    body: data.body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: data.tag || 'default-tag',
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked.');
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it.
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window.
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});
