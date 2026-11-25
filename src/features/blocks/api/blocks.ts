import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type Blocked = components['schemas']['BlockedOut']

/** People I blocked (or reported, which also blocks), latest first. List only: no unblock. */
export async function getBlocks(): Promise<Blocked[]> {
  const { data, error, response } = await api.GET('/v1/blocks')
  if (data) return data
  throw toApiError(response.status, error)
}
