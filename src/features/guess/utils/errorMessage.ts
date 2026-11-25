import { ApiError } from '@/lib/api/errors'

const messages: Record<string, string> = {
  already_guessed: 'You already guessed this one.',
  guess_card_not_found: 'They just changed this card. Try another one.',
  hint_already_used: "You've used tonight's hint. You get a new one with the next drop.",
}

export function guessErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return messages[error.code] ?? "That one's on us. Try again in a minute."
  return "Couldn't reach Reveal. Check your connection and try again."
}
