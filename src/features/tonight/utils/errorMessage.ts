import { ApiError } from '@/lib/api/errors'

const messages: Record<string, string> = {
  drop_item_closed: "Tonight's drop has moved on. Here's what's new.",
  drop_item_not_found: "Tonight's drop has moved on. Here's what's new.",
  prompt_not_found: 'They just changed that prompt. Pick another one.',
  guess_card_not_guessed: 'Guess that card first, or like one of their prompts.',
  already_liked: "You've already liked them.",
  like_not_found: 'That like is no longer here.',
  like_already_answered: 'You already answered that one.',
  profile_incomplete: 'Finish your profile to see the drop.',
}

export function dropErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'validation_error') {
      return 'No numbers, handles or links in comments. Keep it under 140 characters.'
    }
    return messages[error.code] ?? "That one's on us. Try again in a minute."
  }
  return "Couldn't reach Reveal. Check your connection and try again."
}
