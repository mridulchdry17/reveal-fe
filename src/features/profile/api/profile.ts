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
export type Contact = components['schemas']['Contact']
export type ContactKind = components['schemas']['ContactKind']
type PhotoBody = components['schemas']['Body_update_photo_v1_profile_me_photo_put']
type VoiceBody = components['schemas']['Body_update_voice_v1_profile_me_voice_put']

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

export async function saveContact(body: Contact): Promise<MyProfile> {
  const { data, error, response } = await api.PUT('/v1/profile/me/contact', { body })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function removeContact(): Promise<MyProfile> {
  const { data, error, response } = await api.DELETE('/v1/profile/me/contact')
  if (data) return data
  throw toApiError(response.status, error)
}

/** Upload my photo (card 6). The server re-encodes it and keeps it private. */
export async function uploadPhoto(photo: Blob): Promise<MyProfile> {
  const form = new FormData()
  form.append('photo', photo, 'photo.jpg')
  const { data, error, response } = await api.PUT('/v1/profile/me/photo', {
    // The schema types file fields as strings; what's actually sent is this FormData.
    body: form as unknown as PhotoBody,
    bodySerializer: (body) => body as unknown as FormData,
  })
  if (data) return data
  throw toApiError(response.status, error)
}

/** My own photo. Fetched with the session token, so it can't be a plain <img src>. */
export async function getMyPhoto(): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/profile/me/photo', { parseAs: 'blob' })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function removePhoto(): Promise<MyProfile> {
  const { data, error, response } = await api.DELETE('/v1/profile/me/photo')
  if (data) return data
  throw toApiError(response.status, error)
}

/** Upload my voice note (card 5) as recorded. Optional; stays private. */
export async function uploadVoice({ recording, seconds }: { recording: Blob; seconds: number }): Promise<MyProfile> {
  const form = new FormData()
  const extension = recording.type.includes('mp4') ? 'm4a' : recording.type.includes('ogg') ? 'ogg' : 'webm'
  form.append('voice', recording, `voice.${extension}`)
  form.append('seconds', String(seconds))
  const { data, error, response } = await api.PUT('/v1/profile/me/voice', {
    body: form as unknown as VoiceBody,
    bodySerializer: (body) => body as unknown as FormData,
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getMyVoice(): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/profile/me/voice', { parseAs: 'blob' })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function removeVoice(): Promise<MyProfile> {
  const { data, error, response } = await api.DELETE('/v1/profile/me/voice')
  if (data) return data
  throw toApiError(response.status, error)
}
