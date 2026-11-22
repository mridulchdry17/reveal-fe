import { useMutation, useQueryClient } from '@tanstack/react-query'

import { letIn } from '../api/admin'
import { adminKeys } from '../api/keys'

export function useLetIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: letIn,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: adminKeys.actions }),
  })
}
