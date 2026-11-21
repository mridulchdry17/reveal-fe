import { useMutation, useQueryClient } from '@tanstack/react-query'

import { verifyCollegeEmail } from '../api/auth'
import { authKeys } from '../api/keys'

export function useVerifyCollegeEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: verifyCollegeEmail,
    onSuccess: (me) => {
      queryClient.setQueryData(authKeys.me, me)
    },
  })
}
