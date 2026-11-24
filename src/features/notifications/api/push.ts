import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type PushConfig = components['schemas']['PushConfig']
type SubscriptionIn = components['schemas']['SubscriptionIn']

export async function getPushConfig(): Promise<PushConfig> {
  const { data, error, response } = await api.GET('/v1/notifications/config')
  if (data) return data
  throw toApiError(response.status, error)
}

/** Tell the server this device wants notifications (for whoever is signed in now). */
export async function saveDevice(subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON()
  const body: SubscriptionIn = {
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
  }
  const { error, response } = await api.PUT('/v1/notifications/subscription', { body })
  if (!response.ok) throw toApiError(response.status, error)
}

export async function forgetDevice(endpoint: string): Promise<void> {
  const { error, response } = await api.POST('/v1/notifications/subscription/remove', {
    body: { endpoint },
  })
  if (!response.ok) throw toApiError(response.status, error)
}
