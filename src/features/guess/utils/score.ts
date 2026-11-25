import type { GuessCard } from '../api/guesses'

/** Where the game starts: the first card I haven't guessed, or the end when there's none. */
export function firstOpenCard(cards: GuessCard[]): number {
  const open = cards.findIndex((c) => c.answer === null)
  return open === -1 ? cards.length : open
}

export function rightCount(cards: GuessCard[]): number {
  return cards.filter((c) => c.answer !== null && c.picked === c.answer).length
}

/** The end-of-game line, by how many I got right. */
export function scoreLine(right: number, total: number): string {
  if (total === 0) return 'No cards to guess yet.'
  if (total > 0 && right === total) return 'You know them already.'
  if (right > 0) return 'Close enough to say hi.'
  return 'Strangers, for now.'
}
