import { ApiError } from '@/lib/api/errors'

export function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'validation_error') {
      return 'No numbers, handles or links in chat yet. Those open with the contact swap.'
    }
    if (error.code === 'match_not_found') return 'This chat has ended.'
    if (error.code === 'swap_not_allowed') return "That card can't be swapped right now."
    if (error.code === 'swap_not_found') return 'That request is already answered.'
    if (error.code === 'swap_not_yours') return 'Only the one who asked can take it back.'
    if (error.code === 'already_guessed') return 'You already guessed this one.'
    if (error.code === 'guess_card_not_found') return 'They just changed this card. Try another one.'
    return "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
