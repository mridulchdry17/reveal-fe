import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setToken } from '@/lib/auth/token'

import { signInWithGoogle } from '../api/auth'
import { authKeys } from '../api/keys'

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: ({ token, user }) => {
      setToken(token)
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}
