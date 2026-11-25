import { useMutation } from '@tanstack/react-query'

import { hintCard } from '../api/guesses'

/** Strike a wrong option off one card. The screen showing the profile updates its own cache. */
export function useHint() {
  return useMutation({ mutationFn: (cardId: string) => hintCard(cardId) })
}
