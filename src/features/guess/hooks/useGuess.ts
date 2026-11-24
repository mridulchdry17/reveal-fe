import { useMutation } from '@tanstack/react-query'

import { guessCard } from '../api/guesses'

/**
 * Guess one card. The screen that shows the profile owns its cache, so it updates
 * itself through the callbacks GuessCards raises.
 */
export function useGuess() {
  return useMutation({
    mutationFn: ({ cardId, pick }: { cardId: string; pick: number }) => guessCard(cardId, pick),
  })
}
