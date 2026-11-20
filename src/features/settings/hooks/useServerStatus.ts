import { useQuery } from '@tanstack/react-query'

import { getHealth, healthKeys } from '../api/health'

export type ServerStatus = 'checking' | 'connected' | 'degraded' | 'offline'

export function useServerStatus(): ServerStatus {
  const query = useQuery({ queryKey: healthKeys.all, queryFn: getHealth, retry: false })

  if (query.isPending) return 'checking'
  if (query.isError) return 'offline'
  return query.data.status === 'ok' ? 'connected' : 'degraded'
}
