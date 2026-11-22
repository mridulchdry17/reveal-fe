import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type MyProfile = components['schemas']['MyProfile']
export type ProfileOptions = components['schemas']['ProfileOptions']
export type BasicsUpdate = components['schemas']['BasicsUpdate']
export type PromptsUpdate = components['schemas']['PromptsUpdate']
export type CardsUpdate = components['schemas']['CardsUpdate']
export type PreferencesUpdate = components['schemas']['PreferencesUpdate']
export type Card = components['schemas']['Card']
export type LookingFor = components['schemas']['LookingFor']
export type Gender = components['schemas']['Gender']
export type InterestedIn = components['schemas']['InterestedIn']
export type MatchOn = components['schemas']['MatchOn']

export async function getProfileOptions(): Promise<ProfileOptions> {
  const { data, error, response } = await api.GET('/v1/profile/options')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getMyProfile(): Promise<MyProfile> {
  const { data, error, response } = await api.GET('/v1/profile/me')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function saveBasics(body: BasicsUpdate): Promise<MyProfile> {
  const { data, error, response } = await api.PUT('/v1/profile/me/basics', { body })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function savePrompts(body: PromptsUpdate): Promise<MyProfile> {
  const { data, error, response } = await api.PUT('/v1/profile/me/prompts', { body })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function saveCards(body: CardsUpdate): Promise<MyProfile> {
  const { data, error, response } = await api.PUT('/v1/profile/me/cards', { body })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function savePreferences(body: PreferencesUpdate): Promise<MyProfile> {
  const { data, error, response } = await api.PUT('/v1/profile/me/preferences', { body })
  if (data) return data
  throw toApiError(response.status, error)
}
