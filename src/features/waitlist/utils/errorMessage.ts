import { ApiError } from '@/lib/api/errors'

/** Words the student sees for each failure. Keyed by the backend's error `code`. */
const messages: Record<string, string> = {
  already_registered:
    'This enrollment number or email is already on the list with different details. Check for a typo.',
  rate_limited: 'Too many attempts from this network. Try again in a little while.',
}

export function waitlistErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? 'Something went wrong on our side. Try again.'
  }
  return "Can't reach Reveal right now. Check your connection and try again."
}
