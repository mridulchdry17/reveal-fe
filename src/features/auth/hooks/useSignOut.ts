import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clearToken } from '@/lib/auth/token'

import { signOut } from '../api/auth'
import { authKeys } from '../api/keys'

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signOut,
    // Sign out locally even if the server call fails: the device must not stay signed in.
    onSettled: () => {
      clearToken()
      // Tell everything watching the account first (the route guard redirects), then drop
      // every other cached response so the next person on this device sees nothing.
      queryClient.setQueryData(authKeys.me, null)
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.me[0] })
    },
  })
}
