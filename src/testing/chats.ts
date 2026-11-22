import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'

import { kabir } from './drops'
import { server } from './server'

type ChatSummary = components['schemas']['ChatSummary']
type ChatThread = components['schemas']['ChatThread']
type Message = components['schemas']['MessageOut']

export const matchId = 'm1'

export function message(id: string, body: string, mine: boolean): Message {
  return { id, body, mine, sent_at: '2026-11-22T16:40:00Z' }
}

export function chatSummary(overrides: Partial<ChatSummary> = {}): ChatSummary {
  return {
    match_id: matchId,
    profile: kabir,
    matched_at: '2026-11-22T16:35:00Z',
    last_message: null,
    unread: false,
    ...overrides,
  }
}

export function mockChats(chats: ChatSummary[] = []) {
  server.use(http.get(`${env.VITE_API_URL}/v1/chats`, () => HttpResponse.json(chats)))
}

export function mockThread(messages: Message[] = []) {
  const thread: ChatThread = {
    match_id: matchId,
    profile: kabir,
    matched_at: '2026-11-22T16:35:00Z',
    messages,
  }
  server.use(http.get(`${env.VITE_API_URL}/v1/chats/${matchId}`, () => HttpResponse.json(thread)))
  return thread
}
