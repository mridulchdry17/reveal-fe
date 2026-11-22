import { useQuery } from '@tanstack/react-query'

import { getReports } from '../api/admin'
import { adminKeys } from '../api/keys'

export function useReports() {
  return useQuery({ queryKey: adminKeys.reports, queryFn: getReports })
}
