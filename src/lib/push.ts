/** Web Push in the browser: feature detection and the device's subscription. */

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function permission(): NotificationPermission {
  return 'Notification' in window ? Notification.permission : 'default'
}

/** This device's subscription, or null. Never waits for a service worker that isn't there. */
export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration()
  return (await registration?.pushManager.getSubscription()) ?? null
}

/** Ask (must run from a tap), then subscribe this device with the server's VAPID key. */
export async function subscribeDevice(publicKey: string): Promise<PushSubscription> {
  const answer = await Notification.requestPermission()
  if (answer !== 'granted') throw new PushDeniedError()
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(publicKey),
  })
}

export class PushDeniedError extends Error {
  constructor() {
    super('Notifications were not allowed')
    this.name = 'PushDeniedError'
  }
}

/** VAPID keys come base64url-encoded; the browser wants the raw bytes. */
export function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
  return bytes
}
