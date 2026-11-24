import { afterEach, vi } from 'vitest'

type Fake = { permission: NotificationPermission; answer: NotificationPermission; subscribed: boolean }

/** A browser that can do push: Notification, PushManager and a service worker. */
export function pushBrowser(fake: Fake) {
  const subscription = {
    endpoint: 'https://push.example.com/abc',
    toJSON: () => ({ endpoint: 'https://push.example.com/abc', keys: { p256dh: 'p', auth: 'a' } }),
    unsubscribe: vi.fn(async () => {
      fake.subscribed = false
      return true
    }),
  }
  const pushManager = {
    getSubscription: vi.fn(async () => (fake.subscribed ? subscription : null)),
    subscribe: vi.fn(async () => {
      fake.subscribed = true
      return subscription
    }),
  }
  const registration = { pushManager }
  vi.stubGlobal('PushManager', function PushManager() {})
  vi.stubGlobal('Notification', {
    get permission() {
      return fake.permission
    },
    requestPermission: vi.fn(async () => {
      fake.permission = fake.answer
      return fake.answer
    }),
  })
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve(registration), getRegistration: async () => registration },
  })
  return { pushManager, subscription }
}

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'serviceWorker')
})
