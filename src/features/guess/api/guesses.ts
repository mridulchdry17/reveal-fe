import { api } from '@/lib/api/client'
import { toApiError } from '@/lib/api/errors'
import type { components } from '@/lib/api/schema'

export type GuessCard = components['schemas']['GuessCardOut']
export type GuessResult = components['schemas']['GuessResult']
export type HintResult = components['schemas']['HintResult']

/** One try at one of their cards. The answer comes back either way. */
export async function guessCard(cardId: string, pick: number): Promise<GuessResult> {
  const { data, error, response } = await api.POST('/v1/guesses/{card_id}', {
    params: { path: { card_id: cardId } },
    body: { pick },
  })
  if (data) return data
  throw toApiError(response.status, error)
}

/** Strike one wrong option off a card. One hint per person per night. */
export async function hintCard(cardId: string): Promise<HintResult> {
  const { data, error, response } = await api.POST('/v1/guesses/{card_id}/hint', {
    params: { path: { card_id: cardId } },
  })
  if (data) return data
  throw toApiError(response.status, error)
}
