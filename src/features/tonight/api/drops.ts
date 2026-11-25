import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type Tonight = components['schemas']['Tonight']
export type DropItem = components['schemas']['DropItemOut']
export type PublicProfile = components['schemas']['PublicProfile']
export type LikeRequest = components['schemas']['LikeRequest']
export type LikeResult = components['schemas']['LikeResult']
export type ReceivedLike = components['schemas']['ReceivedLike']
export type LookingFor = components['schemas']['LookingFor']
export type GuessResult = components['schemas']['GuessResult']
export type SentLike = components['schemas']['SentLike']
export type Liked = components['schemas']['Liked']
export type MatchResult = components['schemas']['MatchResult']

export async function getTonight(): Promise<Tonight> {
  const { data, error, response } = await api.GET('/v1/drops/tonight')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function likeItem(itemId: string, body: LikeRequest): Promise<LikeResult> {
  const { data, error, response } = await api.POST('/v1/drops/tonight/{item_id}/like', {
    params: { path: { item_id: itemId } },
    body,
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function passItem(itemId: string): Promise<void> {
  const { error, response } = await api.POST('/v1/drops/tonight/{item_id}/pass', {
    params: { path: { item_id: itemId } },
  })
  if (!response.ok) throw toApiError(response.status, error)
}

export async function getLikes(): Promise<ReceivedLike[]> {
  const { data, error, response } = await api.GET('/v1/likes')
  if (data) return data
  throw toApiError(response.status, error)
}

/** Like them back: it's a match, and the answer is the new chat. */
export async function matchBack(likeId: string): Promise<MatchResult> {
  const { data, error, response } = await api.POST('/v1/likes/{like_id}/match', {
    params: { path: { like_id: likeId } },
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function passLike(likeId: string): Promise<void> {
  const { error, response } = await api.POST('/v1/likes/{like_id}/pass', {
    params: { path: { like_id: likeId } },
  })
  if (!response.ok) throw toApiError(response.status, error)
}

/** Their photo blurred past recognition; a little clearer per right guess. Only if we both have one. */
export async function getDropPhoto(itemId: string): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/drops/tonight/{item_id}/photo', {
    params: { path: { item_id: itemId } },
    parseAs: 'blob',
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getLikePhoto(likeId: string): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/likes/{like_id}/photo', {
    params: { path: { like_id: likeId } },
    parseAs: 'blob',
  })
  if (data) return data
  throw toApiError(response.status, error)
}

/** Likes I sent that are still waiting. A pass looks the same: the liker never learns of one. */
export async function getSentLikes(): Promise<SentLike[]> {
  const { data, error, response } = await api.GET('/v1/likes/sent')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getSentLikePhoto(likeId: string): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/likes/sent/{like_id}/photo', {
    params: { path: { like_id: likeId } },
    parseAs: 'blob',
  })
  if (data) return data
  throw toApiError(response.status, error)
}

/** Take back a like I sent. */
export async function takeBackLike(likeId: string): Promise<void> {
  const { error, response } = await api.DELETE('/v1/likes/sent/{like_id}', {
    params: { path: { like_id: likeId } },
  })
  if (!response.ok) throw toApiError(response.status, error)
}
