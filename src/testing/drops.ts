import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'

import { server } from './server'

type PublicProfile = components['schemas']['PublicProfile']
type DropItem = components['schemas']['DropItemOut']
type ReceivedLike = components['schemas']['ReceivedLike']

/** Kabir as everyone first sees him: what he's looking for; the rest hidden until swaps. */
export const kabir: PublicProfile = {
  nickname: 'Sunset chaser',
  vibe: 'Night owl',
  interests: ['Books', 'Football', 'Films'],
  prompts: [
    { id: 'k1', question: "I'll fall for you if", answer: 'You send me songs without context' },
    { id: 'k2', question: 'Unpopular opinion', answer: 'Mess food is underrated' },
    { id: 'k3', question: 'My ideal Sunday', answer: 'Cricket, then a long nap' },
  ],
  first_name: null,
  branch: null,
  year: null,
  hometown: null,
  looking_for: 'serious',
  voice_seconds: null,
  contact: null,
  shown_cards: ['looking_for'],
  hidden_cards: ['first_name', 'branch', 'hometown', 'photo', 'contact'],
}

/** As if a few cards were already open between you (swaps aren't built yet). */
export const dev: PublicProfile = {
  ...kabir,
  nickname: 'Lost playlist',
  first_name: 'Dev',
  branch: 'ECE',
  year: 3,
  hometown: null,
  looking_for: null,
  shown_cards: ['first_name', 'branch'],
  hidden_cards: ['hometown', 'looking_for', 'photo', 'contact'],
  prompts: [{ id: 'd1', question: 'Hot take', answer: 'Rain ruins plans, never moods' }],
}

export function dropItem(id: string, profile: PublicProfile, decision: DropItem['decision'] = null) {
  return { id, decision, profile }
}

/** Mock GET /v1/drops/tonight; the next drop is 20h 14m after the test's clock. */
export function mockDrop(items: DropItem[]) {
  const next = new Date(Date.now() + (20 * 60 + 14) * 60_000 - 30_000).toISOString()
  server.use(
    http.get(`${env.VITE_API_URL}/v1/drops/tonight`, () =>
      HttpResponse.json({ drop_date: '2026-11-22', next_drop_at: next, items }),
    ),
  )
}

export function mockLikes(likes: ReceivedLike[] = []) {
  server.use(http.get(`${env.VITE_API_URL}/v1/likes`, () => HttpResponse.json(likes)))
}
