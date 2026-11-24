import { ApiError } from '@/lib/api/errors'

export function guessErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'already_guessed') return 'You already guessed this one.'
    if (error.code === 'guess_card_not_found') return 'They just changed this card. Try another one.'
    return "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
