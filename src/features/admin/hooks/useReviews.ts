import { useQuery } from '@tanstack/react-query'

import { getReviews } from '../api/admin'
import { adminKeys } from '../api/keys'

export function useReviews() {
  return useQuery({ queryKey: adminKeys.reviews, queryFn: getReviews })
}
