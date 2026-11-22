import { ApiError } from '@/lib/api/errors'

/** A whole-form message; field messages come from error.fieldErrors. */
export function profileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'validation_error') {
      const first = Object.values(error.fieldErrors)[0]
      return first ?? 'Check what you wrote and try again.'
    }
    if (error.code === 'permission_denied') return "Verify you're a student first."
    return "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
