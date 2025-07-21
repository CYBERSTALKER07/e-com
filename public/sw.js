// Bagozza PWA Service Worker - Safari Compatible
var CACHE_NAME = 'bagozza-v1.0.0';
var STATIC_CACHE = 'bagozza-static-v1.0.0';
var DYNAMIC_CACHE = 'bagozza-dynamic-v1.0.0';

// Files to cache immediately
var STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add your images and icons
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon-180x180.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// API endpoints to cache
var API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/stores/,
  /\/api\/auth/
];

// Install event - cache static files
self.addEventListener('install', function(event) {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch(function(err) {
        console.log('[SW] Cache error:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper function to check if request is for API
function isAPIRequest(request) {
  return API_CACHE_PATTERNS.some(function(pattern) {
    return pattern.test(request.url);
  });
}

// Helper function to check if request is for navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Helper function to check if request is for static assets
function isStaticAsset(request) {
  var url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Handle API requests with network-first strategy
function handleAPIRequest(request) {
  return fetch(request)
    .then(function(response) {
      // If successful, update cache and return response
      if (response.ok) {
        var responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(function(cache) {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch(function() {
      // If network fails, try to serve from cache
      return caches.match(request)
        .then(function(response) {
          if (response) {
            return response;
          }
          // Return offline response for API
          return new Response(JSON.stringify({
            error: 'Offline',
            message: 'No internet connection'
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        });
    });
}

// Handle navigation requests
function handleNavigationRequest(request) {
  return fetch(request)
    .catch(function() {
      // If network fails, serve cached index.html or offline page
      return caches.match('/index.html')
        .then(function(response) {
          if (response) {
            return response;
          }
          return caches.match('/offline.html');
        });
    });
}

// Handle static asset requests with cache-first strategy
function handleStaticAssetRequest(request) {
  return caches.match(request)
    .then(function(response) {
      if (response) {
        return response;
      }
      // If not in cache, fetch from network and cache
      return fetch(request)
        .then(function(response) {
          if (response.ok) {
            var responseClone = response.clone();
            caches.open(STATIC_CACHE)
              .then(function(cache) {
                cache.put(request, responseClone);
              });
          }
          return response;
        });
    });
}

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle navigation requests
  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }
  
  // Default: try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(request)
          .then(function(response) {
            if (response.ok) {
              var responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(function(cache) {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
      .catch(function() {
        // Fallback to offline page for HTML requests
        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Handle background sync (Safari has limited support)
self.addEventListener('sync', function(event) {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  }
  
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Handle push notifications (Safari support varies)
self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);
  
  var title = 'Buyursin';
  var options = {
    body: 'У вас новое уведомление',
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag: 'general',
    renotify: true
  };
  
  if (event.data) {
    try {
      var data = event.data.json();
      title = data.title || title;
      options.body = data.body || options.body;
      options.tag = data.tag || options.tag;
    } catch (e) {
      options.body = event.data.text() || options.body;
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  var urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(function(clientList) {
        // Check if there's already a window/tab open with the target URL
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', function(event) {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    var urls = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(function(cache) {
          return cache.addAll(urls);
        })
    );
  }
});

// Sync functions
function syncCart() {
  return new Promise(function(resolve) {
    // Notify main thread about cart sync
    self.clients.matchAll()
      .then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({
            type: 'SYNC_CART',
            message: 'Cart sync completed'
          });
        });
      });
    resolve();
  });
}

function syncOrders() {
  return new Promise(function(resolve) {
    // Notify main thread about order sync
    self.clients.matchAll()
      .then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({
            type: 'SYNC_ORDERS',
            message: 'Orders sync completed'
          });
        });
      });
    resolve();
  });
}