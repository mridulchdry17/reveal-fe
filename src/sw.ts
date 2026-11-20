/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

type PushPayload = { title?: string; body?: string; url?: string }

// The server only ever sends generic copy: never names, message text or photos.
self.addEventListener('push', (event) => {
  const data = (event.data?.json() ?? {}) as PushPayload
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Cards', {
      body: data.body ?? '',
      icon: '/icon.svg',
      data: { url: data.url ?? '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const { url } = event.notification.data as { url: string }
  event.waitUntil(self.clients.openWindow(url))
})
