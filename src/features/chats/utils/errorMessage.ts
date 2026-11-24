import { ApiError } from '@/lib/api/errors'

export function chatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'validation_error') {
      return 'No numbers, handles or links in chat yet. Those open with the contact swap.'
    }
    if (error.code === 'match_not_found') return 'This chat has ended.'
    if (error.code === 'swap_not_allowed') return "That card can't be swapped right now."
    if (error.code === 'swap_not_found') return 'They took that back.'
    return "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
