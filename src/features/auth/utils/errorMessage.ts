import { env } from '@/config/env'
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

const verifyMessages: Record<string, string> = {
  not_college_account: `That's not a college account. Pick the one ending in @${env.VITE_COLLEGE_DOMAIN}.`,
  college_email_taken:
    'That college email is already linked to another Reveal account. Sign in with the Google account you used before.',
  unauthenticated: "Google didn't confirm that account. Try again.",
}

export function verifyErrorMessage(error: unknown): string {
  const message = error instanceof ApiError ? verifyMessages[error.code] : undefined
  return message ?? signInErrorMessage(error)
}
