import { useQuery } from '@tanstack/react-query'

import { getDropPhoto, getLikePhoto, getSentLikePhoto } from '../api/drops'
import { tonightKeys } from '../api/keys'

/**
 * Keep showing the last blur of the same person while the sharper one loads,
 * never someone else's.
 */
function sameId(id: string) {
  return <T,>(previous: T | undefined, query: { queryKey: readonly unknown[] } | undefined) =>
    query?.queryKey[1] === id ? previous : undefined
}

export function useDropPhoto(itemId: string | undefined, enabled: boolean, rightGuesses: number) {
  const id = itemId ?? ''
  return useQuery({
    queryKey: tonightKeys.dropPhoto(id, rightGuesses),
    queryFn: () => getDropPhoto(id),
    enabled: enabled && Boolean(itemId),
    placeholderData: sameId(id),
    staleTime: Infinity,
    retry: false,
  })
}

export function useLikePhoto(likeId: string, enabled: boolean, rightGuesses: number) {
  return useQuery({
    queryKey: tonightKeys.likePhoto(likeId, rightGuesses),
    queryFn: () => getLikePhoto(likeId),
    enabled,
    placeholderData: sameId(likeId),
    staleTime: Infinity,
    retry: false,
  })
}

/** Their blurred photo on a like I sent. It never changes, so it's fetched once. */
export function useSentLikePhoto(likeId: string, enabled: boolean) {
  return useQuery({
    queryKey: tonightKeys.sentPhoto(likeId),
    queryFn: () => getSentLikePhoto(likeId),
    enabled,
    staleTime: Infinity,
    retry: false,
  })
}
