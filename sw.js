// Boşmatik PWA Service Worker
const CACHE_NAME = 'bosmatik-v3.0';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install event - cache files
self.addEventListener('install', event => {
  console.log('🔧 Service Worker yükleniyor...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Dosyalar cache\'leniyor');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker yüklendi');
        self.skipWaiting(); // Hemen aktif ol
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker aktifleştiriliyor...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker aktif');
      self.clients.claim(); // Tüm sayfaları kontrol et
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'de varsa döndür
        if (response) {
          return response;
        }
        
        // Network'ten getir ve cache'le
        return fetch(event.request).then(response => {
          // Geçerli response kontrolü
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Response'u klonla (stream sadece bir kez okunabilir)
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Offline durumunda fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Background sync for data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync çalışıyor');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Offline'da biriken verileri sync et
  return new Promise(resolve => {
    console.log('📊 Veriler senkronize ediliyor...');
    // Burada offline'da biriken verileri sunucuya gönderebiliriz
    resolve();
  });
}

// Push notifications (gelecekte eklenebilir)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('./index.html')
  );
});
