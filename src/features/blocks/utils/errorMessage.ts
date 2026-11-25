import { ApiError } from '@/lib/api/errors'

export function blockErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return "That one's on us. Try again in a minute."
  return "Couldn't reach Reveal. Check your connection and try again."
}
