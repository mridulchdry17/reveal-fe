import type { GuessResult, PublicProfile } from '../api/drops'

/** Their profile as the server will send it after this guess. */
export function withGuess(profile: PublicProfile, cardId: string, result: GuessResult): PublicProfile {
  if (!profile.guess_cards.some((c) => c.id === cardId && c.answer === null)) return profile
  return {
    ...profile,
    guess_cards: profile.guess_cards.map((c) =>
      c.id === cardId ? { ...c, picked: result.picked, answer: result.answer } : c,
    ),
    right_guesses: profile.right_guesses + (result.correct ? 1 : 0),
  }
}

/** Their profile after my hint struck a wrong option off one card. */
export function withStruck(profile: PublicProfile, cardId: string, struck: number): PublicProfile {
  return {
    ...profile,
    guess_cards: profile.guess_cards.map((c) => (c.id === cardId ? { ...c, struck } : c)),
  }
}
