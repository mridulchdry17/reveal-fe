import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type HideList = components['schemas']['HideList']
export type Hidden = components['schemas']['HiddenOut']
export type HideKind = components['schemas']['IdentityKind']

export async function getHides(): Promise<HideList> {
  const { data, error, response } = await api.GET('/v1/hides')
  if (data) return data
  throw toApiError(response.status, error)
}

/** Hide someone. The answer is the same whether or not they're on Reveal. */
export async function addHide(kind: HideKind, value: string): Promise<HideList> {
  const { data, error, response } = await api.POST('/v1/hides', { body: { kind, value } })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function removeHide(id: string): Promise<HideList> {
  const { data, error, response } = await api.DELETE('/v1/hides/{entry_id}', {
    params: { path: { entry_id: id } },
  })
  if (data) return data
  throw toApiError(response.status, error)
}
