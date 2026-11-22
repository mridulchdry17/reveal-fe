import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type ChatSummary = components['schemas']['ChatSummary']
export type ChatThread = components['schemas']['ChatThread']
export type Message = components['schemas']['MessageOut']
export type ChatProfile = components['schemas']['PublicProfile']
export type ReportReason = components['schemas']['ReportReason']

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
