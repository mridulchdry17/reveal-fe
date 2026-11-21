import { ApiError } from '@/lib/api/errors'

const messages: Record<string, string> = {
  unauthenticated: "Google didn't confirm that account. Try again, or pick another account.",
  rate_limited: 'Too many tries from this network. Give it a few minutes.',
}

export function signInErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
