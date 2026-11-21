import { useQuery } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/errors'
import { clearToken, getToken } from '@/lib/auth/token'

import { getMe, type Me } from '../api/auth'
import { authKeys } from '../api/keys'

/** The signed-in account, or null when signed out. */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<Me | null> => {
      if (!getToken()) return null
      try {
        return await getMe()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearToken()
          return null
        }
        throw error
      }
    },
    staleTime: 5 * 60_000,
  })
}
