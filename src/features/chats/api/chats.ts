import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type ChatSummary = components['schemas']['ChatSummary']
export type ChatThread = components['schemas']['ChatThread']
export type Message = components['schemas']['MessageOut']
export type ChatProfile = components['schemas']['PublicProfile']
export type ReportReason = components['schemas']['ReportReason']
export type SwapBoard = components['schemas']['SwapBoard']
export type Card = components['schemas']['Card']
export type CardState = components['schemas']['CardState']

const path = (matchId: string) => ({ params: { path: { match_id: matchId } } })

export async function getChats(): Promise<ChatSummary[]> {
  const { data, error, response } = await api.GET('/v1/chats')
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getChat(matchId: string): Promise<ChatThread> {
  const { data, error, response } = await api.GET('/v1/chats/{match_id}', path(matchId))
  if (data) return data
  throw toApiError(response.status, error)
}

export async function sendMessage(matchId: string, body: string): Promise<Message> {
  const { data, error, response } = await api.POST('/v1/chats/{match_id}/messages', {
    ...path(matchId),
    body: { body },
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function markRead(matchId: string): Promise<void> {
  const { error, response } = await api.POST('/v1/chats/{match_id}/read', path(matchId))
  if (!response.ok) throw toApiError(response.status, error)
}

export async function unmatch(matchId: string): Promise<void> {
  const { error, response } = await api.POST('/v1/matches/{match_id}/unmatch', path(matchId))
  if (!response.ok) throw toApiError(response.status, error)
}

export async function block(matchId: string): Promise<void> {
  const { error, response } = await api.POST('/v1/matches/{match_id}/block', path(matchId))
  if (!response.ok) throw toApiError(response.status, error)
}

export async function report(
  matchId: string,
  reason: ReportReason,
  details: string | null,
): Promise<void> {
  const { error, response } = await api.POST('/v1/matches/{match_id}/report', {
    ...path(matchId),
    body: { reason, details },
  })
  if (!response.ok) throw toApiError(response.status, error)
}

/** Ask to swap a card. If they already asked for it, this says yes. */
export async function askSwap(matchId: string, card: Card): Promise<SwapBoard> {
  const { data, error, response } = await api.POST('/v1/chats/{match_id}/swaps', {
    ...path(matchId),
    body: { card },
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function answerSwap(matchId: string, card: Card, yes: boolean): Promise<SwapBoard> {
  const params = { params: { path: { match_id: matchId, card } } }
  const { data, error, response } = yes
    ? await api.POST('/v1/chats/{match_id}/swaps/{card}/accept', params)
    : await api.POST('/v1/chats/{match_id}/swaps/{card}/decline', params)
  if (data) return data
  throw toApiError(response.status, error)
}

/** Their photo with only the open pieces; the server paints the rest over. */
export async function getTheirPhoto(matchId: string): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/chats/{match_id}/photo', {
    ...path(matchId),
    parseAs: 'blob',
  })
  if (data) return data
  throw toApiError(response.status, error)
}

export async function getTheirVoice(matchId: string): Promise<Blob> {
  const { data, error, response } = await api.GET('/v1/chats/{match_id}/voice', {
    ...path(matchId),
    parseAs: 'blob',
  })
  if (data) return data
  throw toApiError(response.status, error)
}
