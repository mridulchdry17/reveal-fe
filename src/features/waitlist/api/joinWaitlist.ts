import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type JoinWaitlistBody = components['schemas']['WaitlistJoinRequest']
export type JoinWaitlistResult = components['schemas']['WaitlistJoinResponse']

/** Throws ApiError on any non-2xx response. */
export async function joinWaitlist(body: JoinWaitlistBody): Promise<JoinWaitlistResult> {
  const { data, error, response } = await api.POST('/v1/waitlist', { body })
  if (data) return data
  throw toApiError(response.status, error)
}
