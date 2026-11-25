import type { components } from '@/lib/api/schema'
import { guessKindLabels } from '@/utils/cardLabels'

import type { LikeRequest, Liked, PublicProfile } from '../api/drops'

type GuessKind = components['schemas']['GuessKind']

/** One answer of theirs I can like: a guess card I've guessed, or a prompt. */
export type LikeOption = {
  id: string
  /** Short tab label: "Everyday", "Hot take", or the prompt's question. */
  tab: string
  kicker: string
  answer: string
  /** For a guessed card: what I guessed. */
  guess?: { right: boolean; picked: string }
  body: (comment: string | null) => LikeRequest
}

export const shortKindLabels: Record<GuessKind, string> = {
  everyday: 'Everyday',
  hot_take: 'Hot take',
  little_thing: 'Little thing',
}

/**
 * Guess cards first (only ones I've guessed: the server refuses the rest), then prompts.
 * A card's liked answer is its true option.
 */
export function likeOptions(profile: PublicProfile): LikeOption[] {
  const cards = profile.guess_cards.flatMap((card): LikeOption[] => {
    if (card.answer === null || card.picked === null) return []
    return [
      {
        id: card.id,
        tab: shortKindLabels[card.kind],
        kicker: guessKindLabels[card.kind],
        answer: card.options[card.answer] ?? '',
        guess: { right: card.picked === card.answer, picked: card.options[card.picked] ?? '' },
        body: (comment) => ({ guess_card_id: card.id, comment }),
      },
    ]
  })
  const prompts = profile.prompts.map(
    (prompt): LikeOption => ({
      id: prompt.id,
      tab: prompt.question,
      kicker: prompt.question,
      answer: prompt.answer,
      body: (comment) => ({ prompt_id: prompt.id, comment }),
    }),
  )
  return [...cards, ...prompts]
}

/** "YOUR HOT TAKE" / "YOUR PROMPT" (or THEIR, on likes I sent): what a like was about. */
export function likedKicker(liked: Liked, whose: 'Your' | 'Their'): string {
  if (liked.kind === 'guess' && liked.guess_kind) return `${whose} ${guessKindLabels[liked.guess_kind].toLowerCase()}`
  return `${whose} prompt`
}

/** "Night owl · Books · Films" under a name. */
export function aboutLine(profile: PublicProfile): string {
  return [profile.vibe, ...profile.interests].filter(Boolean).join(' · ')
}
