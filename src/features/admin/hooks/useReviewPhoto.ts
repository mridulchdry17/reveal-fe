import { useQuery } from '@tanstack/react-query'

import { getReviewPhoto, type PhotoKind } from '../api/admin'
import { adminKeys } from '../api/keys'

/** Photos are deleted on review, so never refetch or keep them around. */
export function useReviewPhoto(reviewId: string, kind: PhotoKind) {
  return useQuery({
    queryKey: adminKeys.photo(reviewId, kind),
    queryFn: () => getReviewPhoto(reviewId, kind),
    staleTime: Infinity,
    gcTime: 0,
  })
}
