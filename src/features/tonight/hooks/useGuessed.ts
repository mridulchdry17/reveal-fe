import { useQueryClient } from '@tanstack/react-query'

import { type GuessResult, type ReceivedLike, type Tonight } from '../api/drops'
import { tonightKeys } from '../api/keys'
import { withGuess } from '../utils/withGuess'

/** Show a guess on the cached drop at once; the new right-guess count refetches the photo. */
export function useDropGuessed() {
  const queryClient = useQueryClient()
  return {
    onGuessed: (itemId: string, cardId: string, result: GuessResult) =>
      queryClient.setQueryData<Tonight>(tonightKeys.drop, (drop) =>
        drop && {
          ...drop,
          items: drop.items.map((i) => (i.id === itemId ? { ...i, profile: withGuess(i.profile, cardId, result) } : i)),
        },
      ),
    onStale: () => queryClient.invalidateQueries({ queryKey: tonightKeys.drop, exact: true }),
  }
}

export function useLikeGuessed() {
  const queryClient = useQueryClient()
  return {
    onGuessed: (likeId: string, cardId: string, result: GuessResult) =>
      queryClient.setQueryData<ReceivedLike[]>(tonightKeys.likes, (likes) =>
        likes?.map((l) => (l.id === likeId ? { ...l, profile: withGuess(l.profile, cardId, result) } : l)),
      ),
    onStale: () => queryClient.invalidateQueries({ queryKey: tonightKeys.likes, exact: true }),
  }
}
