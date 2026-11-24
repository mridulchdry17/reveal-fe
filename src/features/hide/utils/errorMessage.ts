import { ApiError } from '@/lib/api/errors'

export function hideErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'validation_error') {
      return Object.values(error.fieldErrors)[0] ?? 'Check what you typed and try again.'
    }
    if (error.code === 'hide_list_full') return 'Your list is full. Remove someone to add someone new.'
    if (error.code === 'hidden_contact_not_found') return 'Already removed.'
    return "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
