import { useQuery } from '@tanstack/react-query'

import { getVerificationStatus } from '../api/verification'
import { authKeys } from '../api/keys'

/** The ID card check. Refetches when the app comes back into view, to catch an approval. */
export function useVerificationStatus() {
  return useQuery({ queryKey: authKeys.verification, queryFn: getVerificationStatus })
}
