import { ApiError } from '@/lib/api/errors'

const messages: Record<string, string> = {
  account_not_found: 'No Reveal account with that email. Ask them to sign in first, then try again.',
  already_verified: "They're already verified.",
  already_reviewed: 'Someone already reviewed this one.',
  review_not_found: 'This review is gone. Refresh the list.',
  permission_denied: "This account isn't an admin.",
}

export function adminErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
