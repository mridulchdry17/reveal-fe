import { branchLine } from '@/utils/cardLabels'

import type { ChatThread } from '../api/chats'

const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

function daysText(days: number): string {
  if (days < 1) return 'less than a day'
  return `${WORDS[days] ?? days} ${days === 1 ? 'day' : 'days'}`
}

/**
 * "Took you 3 guesses, 4 swaps and two days." Guesses = their cards I tried, swaps = cards
 * opened before the photo, days = from the match to the photo swap.
 */
export function revealedLine({ profile, swaps, matched_at }: ChatThread): string {
  const guesses = profile.guess_cards.filter((c) => c.picked !== null).length
  const opened = swaps.cards.filter((c) => c.card !== 'photo' && c.state === 'open').length
  const photoAt = swaps.cards.find((c) => c.card === 'photo')?.decided_at
  const days = photoAt ? Math.floor((Date.parse(photoAt) - Date.parse(matched_at)) / 86_400_000) : 0
  return `Took you ${count(guesses, 'guess', 'guesses')}, ${count(opened, 'swap', 'swaps')} and ${daysText(days)}.`
}

/** What you know about them now, as short chips: guesses you got right, branch, hometown. */
export function revealedChips({ profile }: ChatThread): string[] {
  const right = profile.guess_cards.flatMap((c) =>
    c.answer !== null && c.picked === c.answer ? [c.options[c.answer] ?? ''] : [],
  )
  return [
    ...right,
    ...(profile.branch ? [branchLine(profile.branch, profile.year)] : []),
    ...(profile.hometown ? [profile.hometown] : []),
  ].filter(Boolean)
}
