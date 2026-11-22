import { useQuery } from '@tanstack/react-query'

import { getActions } from '../api/admin'
import { adminKeys } from '../api/keys'

export function useAdminActions() {
  return useQuery({ queryKey: adminKeys.actions, queryFn: getActions })
}
