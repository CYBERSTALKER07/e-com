// Bagozza PWA Service Worker
const CACHE_NAME = 'bagozza-v1.0.0';
const STATIC_CACHE = 'bagozza-static-v1.0.0';
const DYNAMIC_CACHE = 'bagozza-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add your CSS and JS files
  '/src/main.tsx',
  '/src/index.css',
  // Add your images and icons
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon-180x180.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/stores/,
  /\/api\/auth/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch(err => console.log('[SW] Cache error:', err))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
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

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase.co') ||
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Handle API requests with cache-first strategy for GET requests
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  if (request.method === 'GET') {
    try {
      // Try network first for fresh data
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      
      // If network fails, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('[SW] Serving API from cache:', request.url);
        return cachedResponse;
      }
      
      // Return network response even if not ok
      return networkResponse;
    } catch (error) {
      // Network error, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('[SW] Network failed, serving API from cache:', request.url);
        return cachedResponse;
      }
      
      // Return offline response
      return new Response(
        JSON.stringify({ 
          error: 'Network unavailable', 
          offline: true,
          message: 'You are currently offline. Some features may not be available.'
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // For non-GET requests, always try network
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable',
        message: 'Cannot perform this action while offline.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network response is not ok, try cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || await caches.match('/offline.html');
    
  } catch (error) {
    // Network error, try cache first, then offline page
    const cachedResponse = await caches.match(request);
    return cachedResponse || await caches.match('/offline.html');
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  // Try cache first for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For images, return a placeholder if offline
    if (request.destination === 'image') {
      return new Response(
        '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Image unavailable offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Sync cart data when online
async function syncCart() {
  try {
    // Get stored cart data and sync with server
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_CART' });
    });
  } catch (error) {
    console.log('[SW] Cart sync failed:', error);
  }
}

// Sync order data when online
async function syncOrders() {
  try {
    // Get stored order data and sync with server
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_ORDERS' });
    });
  } catch (error) {
    console.log('[SW] Order sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    image: data.image,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/pwa-64x64.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/pwa-64x64.png'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'bagozza-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app to relevant page
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientList => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Share target API (if supported)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  // Handle shared content
  const formData = await request.formData();
  const title = formData.get('title');
  const text = formData.get('text');
  const url = formData.get('url');
  
  // Redirect to app with shared content
  return Response.redirect(`/?shared=true&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, 302);
}