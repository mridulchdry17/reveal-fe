import { useQueryClient } from '@tanstack/react-query'

import { type GuessResult, type PublicProfile, type ReceivedLike, type Tonight } from '../api/drops'
import { tonightKeys } from '../api/keys'
import { withGuess, withStruck } from '../utils/withGuess'

/** Tonight's one hint is gone: say so on the cached drop (it carries hint_used for every screen). */
function useHintGone() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.setQueryData<Tonight>(tonightKeys.drop, (drop) => drop && { ...drop, hint_used: true })
    void queryClient.invalidateQueries({ queryKey: tonightKeys.drop, exact: true })
  }
}

/** Show a guess or a hint on the cached drop at once; the new right-guess count refetches the photo. */
export function useDropGuessed() {
  const queryClient = useQueryClient()
  const onHintGone = useHintGone()
  const patch = (itemId: string, change: (profile: PublicProfile) => PublicProfile, hintUsed?: boolean) =>
    queryClient.setQueryData<Tonight>(tonightKeys.drop, (drop) =>
      drop && {
        ...drop,
        hint_used: hintUsed ?? drop.hint_used,
        items: drop.items.map((i) => (i.id === itemId ? { ...i, profile: change(i.profile) } : i)),
      },
    )
  return {
    onGuessed: (itemId: string, cardId: string, result: GuessResult) =>
      patch(itemId, (p) => withGuess(p, cardId, result)),
    onHinted: (itemId: string, cardId: string, struck: number) =>
      patch(itemId, (p) => withStruck(p, cardId, struck), true),
    onHintGone,
    onStale: () => queryClient.invalidateQueries({ queryKey: tonightKeys.drop, exact: true }),
  }
}

export function useLikeGuessed() {
  const queryClient = useQueryClient()
  const onHintGone = useHintGone()
  const patch = (likeId: string, change: (profile: PublicProfile) => PublicProfile) =>
    queryClient.setQueryData<ReceivedLike[]>(tonightKeys.likes, (likes) =>
      likes?.map((l) => (l.id === likeId ? { ...l, profile: change(l.profile) } : l)),
    )
  return {
    onGuessed: (likeId: string, cardId: string, result: GuessResult) =>
      patch(likeId, (p) => withGuess(p, cardId, result)),
    onHinted: (likeId: string, cardId: string, struck: number) => {
      patch(likeId, (p) => withStruck(p, cardId, struck))
      // The hint is one per night across the drop and likes.
      queryClient.setQueryData<Tonight>(tonightKeys.drop, (drop) => drop && { ...drop, hint_used: true })
    },
    onHintGone,
    onStale: () => queryClient.invalidateQueries({ queryKey: tonightKeys.likes, exact: true }),
  }
}
