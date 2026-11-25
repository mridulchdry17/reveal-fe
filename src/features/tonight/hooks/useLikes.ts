import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getLikes, getSentLikes, matchBack, passLike, takeBackLike, type SentLike } from '../api/drops'
import { tonightKeys } from '../api/keys'

export function useLikes() {
  return useQuery({ queryKey: tonightKeys.likes, queryFn: getLikes })
}

export function useSentLikes() {
  return useQuery({ queryKey: tonightKeys.sent, queryFn: getSentLikes })
}

function useAnswerLike<R>(answer: (likeId: string) => Promise<R>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: answer,
    onSettled: () => queryClient.invalidateQueries({ queryKey: tonightKeys.likes }),
  })
}

export const useMatchBack = () => useAnswerLike(matchBack)
export const usePassLike = () => useAnswerLike(passLike)

/** Take back a like I sent; it leaves the Sent list at once. */
export function useTakeBack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: takeBackLike,
    onSuccess: (_result, likeId) =>
      queryClient.setQueryData<SentLike[]>(tonightKeys.sent, (sent) => sent?.filter((s) => s.id !== likeId)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: tonightKeys.sent }),
  })
}
