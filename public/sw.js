self.addEventListener('install', (event) => {
  // Immediately activate updated SW
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Take control of open clients
  event.waitUntil(self.clients.claim())
})

// For now, just pass all network requests through.
// You can add real caching later if you want offline support.
self.addEventListener('fetch', () => {})
