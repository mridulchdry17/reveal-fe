/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>
}

// Take over open tabs as soon as a new version is deployed (registerType: 'autoUpdate').
// Without this, returning visitors keep running the old build until every tab is closed.
void self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

type PushPayload = { title?: string; body?: string; url?: string; tag?: string }

// The server only ever sends generic copy: never names, message text or photos.
self.addEventListener('push', (event) => {
  const data = (event.data?.json() ?? {}) as PushPayload
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Cards', {
      body: data.body ?? '',
      icon: '/icon.svg',
      // Same tag replaces the last one: a chat shows one notification, not one per message.
      tag: data.tag,
      data: { url: data.url ?? '/app' },
    }),
  )
})

// Open the app where the notification points, reusing a window that's already open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const { url } = event.notification.data as { url: string }
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin)
      if (open) {
        await open.focus()
        await open.navigate(url)
        return
      }
      await self.clients.openWindow(url)
    })(),
  )
})
