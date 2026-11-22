import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approveReview, rejectReview } from '../api/admin'
import { adminKeys } from '../api/keys'

function useAfterDecision() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.reviews })
    void queryClient.invalidateQueries({ queryKey: adminKeys.actions })
  }
}

export function useApproveReview() {
  return useMutation({ mutationFn: approveReview, onSuccess: useAfterDecision() })
}

export function useRejectReview() {
  return useMutation({ mutationFn: rejectReview, onSuccess: useAfterDecision() })
}
