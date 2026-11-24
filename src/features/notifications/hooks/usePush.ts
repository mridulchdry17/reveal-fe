import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { currentSubscription, permission, pushSupported, subscribeDevice } from '@/lib/push'
import { canPromptInstall, isIos, isStandalone, onInstallPromptChange, promptInstall } from '@/lib/pwa'

import { pushKeys } from '../api/keys'
import { forgetDevice, getPushConfig, saveDevice } from '../api/push'

/**
 * Where this device stands with notifications:
 * - `disabled`: push is off on this server (no keys yet). Show nothing.
 * - `unavailable`: this browser can't do it.
 * - `install`: an iPhone in Safari. Push works only after Add to Home Screen.
 * - `denied`: they said no; only the browser's settings can undo it.
 * - `off` / `on`: ready to ask, or already getting them.
 */
export type PushState = 'loading' | 'disabled' | 'unavailable' | 'install' | 'denied' | 'off' | 'on'

export function usePush() {
  const queryClient = useQueryClient()
  const config = useQuery({ queryKey: pushKeys.config, queryFn: getPushConfig, staleTime: Infinity })
  const device = useQuery({ queryKey: pushKeys.device, queryFn: currentSubscription })
  const publicKey = config.data?.public_key ?? null

  const enable = useMutation({
    mutationFn: async () => {
      if (!publicKey) throw new Error('Push is off on this server')
      await saveDevice(await subscribeDevice(publicKey))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKeys.device }),
  })

  const disable = useMutation({
    mutationFn: async () => {
      const subscription = await currentSubscription()
      if (!subscription) return
      await forgetDevice(subscription.endpoint)
      await subscription.unsubscribe()
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKeys.device }),
  })

  // Re-send an existing subscription once per visit: if someone else signed in on this
  // phone before, notifications follow whoever is signed in now.
  const synced = useRef(false)
  useEffect(() => {
    const subscription = device.data
    if (!subscription || !publicKey || synced.current) return
    synced.current = true
    saveDevice(subscription).catch(() => {
      synced.current = false
    })
  }, [device.data, publicKey])

  const state = pushState({
    loading: config.isPending || device.isPending,
    serverOn: publicKey !== null,
    subscribed: device.data != null,
  })
  return { state, enable, disable }
}

function pushState(s: { loading: boolean; serverOn: boolean; subscribed: boolean }): PushState {
  if (pushSupported() === false) return isIos() && !isStandalone() ? 'install' : 'unavailable'
  if (s.loading) return 'loading'
  if (!s.serverOn) return 'disabled'
  if (permission() === 'denied') return 'denied'
  return s.subscribed && permission() === 'granted' ? 'on' : 'off'
}

/** Whether Chrome offered its own install dialog, and a way to show it. */
export function useInstallPrompt() {
  const available = useSyncExternalStore(onInstallPromptChange, canPromptInstall, () => false)
  return { available, install: promptInstall }
}
