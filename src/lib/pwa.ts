/**
 * Installing the app to the home screen. iOS only allows push for installed web apps
 * (16.4+), so the app needs to know whether it's installed and how to ask.
 */

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

/** Call once at startup: Chrome fires this early and only once. */
export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as InstallPromptEvent
    listeners.forEach((notify) => notify())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    listeners.forEach((notify) => notify())
  })
}

export function canPromptInstall(): boolean {
  return deferred !== null
}

export function onInstallPromptChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Shows the browser's own install dialog. Resolves true if they installed. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const event = deferred
  deferred = null
  await event.prompt()
  const { outcome } = await event.userChoice
  listeners.forEach((notify) => notify())
  return outcome === 'accepted'
}

export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true
}

/**
 * iPhone or iPad, for the "Add to Home Screen" steps only. Push support itself is
 * feature-detected (see lib/push.ts); this just decides which instructions to show.
 */
export function isIos(): boolean {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

/** Instagram, WhatsApp and friends open links in a browser that can't install or push. */
export function isInAppBrowser(): boolean {
  return /Instagram|FBAN|FBAV|WhatsApp|Snapchat|Line\//.test(navigator.userAgent)
}
