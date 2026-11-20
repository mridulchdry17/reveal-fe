import { ApiError } from '@/lib/api/errors'

/** Words the student sees for each failure. Keyed by the backend's error `code`. */
const messages: Record<string, string> = {
  rate_limited: 'Too many tries from this network. Probably hostel Wi-Fi. Give it a few minutes.',
}

export function waitlistErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and tap again."
}
