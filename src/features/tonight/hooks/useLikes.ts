import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getLikes, matchBack, passLike } from '../api/drops'
import { tonightKeys } from '../api/keys'

export function useLikes() {
  return useQuery({ queryKey: tonightKeys.likes, queryFn: getLikes })
}

function useAnswerLike(answer: (likeId: string) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: answer,
    onSettled: () => queryClient.invalidateQueries({ queryKey: tonightKeys.likes }),
  })
}

export const useMatchBack = () => useAnswerLike(matchBack)
export const usePassLike = () => useAnswerLike(passLike)
