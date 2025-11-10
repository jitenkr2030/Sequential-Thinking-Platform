const CACHE_NAME = 'sequential-thinking-v1';
const OFFLINE_CACHE = 'sequential-thinking-offline-v1';
const API_CACHE = 'sequential-thinking-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/globals.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/_error.js',
  '/_next/static/css/app/layout.css'
];

// API endpoints that can be cached
const CACHEABLE_API_ENDPOINTS = [
  '/api/health',
  '/api/sequential-thinking',
  '/api/analytics/dashboard',
  '/api/knowledge-graph/domains',
  '/api/knowledge-graph/tools'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== API_CACHE) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(event.request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this is a cacheable API endpoint
  const isCacheable = CACHEABLE_API_ENDPOINTS.some(endpoint => 
    url.pathname.startsWith(endpoint)
  );
  
  if (isCacheable && request.method === 'GET') {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      
      // Cache successful responses
      if (networkResponse.ok) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      // Fallback to cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline response for API requests
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'You are currently offline. Some features may be limited.',
          cached: true
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json',
            'X-Offline': 'true'
          }
        }
      );
    }
  }
  
  // For non-cacheable API requests, try network only
  return fetch(request);
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    // Return a basic offline response for other requests
    return new Response(
      'Offline',
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/plain',
          'X-Offline': 'true'
        }
      }
    );
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Sequential Thinking Platform',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/badge-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/explore-icon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-icon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Sequential Thinking Platform', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-learning-progress') {
    event.waitUntil(syncLearningProgress());
  }
});

// Sync learning progress when online
async function syncLearningProgress() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    // Sync with server
    for (const data of offlineData) {
      await fetch('/api/learning-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    }
    
    // Clear synced data
    await clearOfflineData();
    
    console.log('Service Worker: Learning progress synced successfully');
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Helper functions for IndexedDB operations
async function getOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SequentialThinkingDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineProgress'], 'readonly');
      const store = transaction.objectStore('offlineProgress');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    };
  });
}

async function clearOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SequentialThinkingDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineProgress'], 'readwrite');
      const store = transaction.objectStore('offlineProgress');
      const clear = store.clear();
      
      clear.onsuccess = () => resolve();
      clear.onerror = () => reject(clear.error);
    };
  });
}

// Message handling from client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'CACHE_OFFLINE_CONTENT') {
    event.waitUntil(
      cacheOfflineContent(event.data.content)
    );
  }
});

// Cache offline content for learning
async function cacheOfflineContent(content) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    
    // Cache reasoning maps and scenarios
    for (const item of content) {
      if (item.url) {
        const response = await fetch(item.url);
        if (response.ok) {
          await cache.put(item.url, response);
        }
      }
    }
    
    console.log('Service Worker: Offline content cached successfully');
  } catch (error) {
    console.error('Service Worker: Failed to cache offline content', error);
  }
}