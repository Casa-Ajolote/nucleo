const CACHE_NAME = 'nucleo-shell-v1'

const SHELL_ASSETS = [
  '/',
  '/dashboard',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Network-first for API, auth, and dynamic routes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/w/') ||
    request.method !== 'GET'
  ) {
    return
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()))
          }
          return res
        })
      )
    )
    return
  }

  // Stale-while-revalidate for HTML shell
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((res) => {
        if (res.ok) caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()))
        return res
      })
      return cached ?? fetchPromise
    })
  )
})
