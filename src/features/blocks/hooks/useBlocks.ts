import { useQuery } from '@tanstack/react-query'

import { getBlocks } from '../api/blocks'
import { blockKeys } from '../api/keys'

export function useBlocks() {
  return useQuery({ queryKey: blockKeys.list, queryFn: getBlocks })
}
