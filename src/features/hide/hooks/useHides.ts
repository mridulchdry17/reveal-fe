import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { addHide, getHides, removeHide, type HideKind, type HideList } from '../api/hides'
import { hideKeys } from '../api/keys'

export function useHides() {
  return useQuery({ queryKey: hideKeys.list, queryFn: getHides })
}

/** Both answer with the whole list, so the cache just takes it. */
export function useAddHide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ kind, value }: { kind: HideKind; value: string }) => addHide(kind, value),
    onSuccess: (list: HideList) => queryClient.setQueryData(hideKeys.list, list),
  })
}

export function useRemoveHide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeHide,
    onSuccess: (list: HideList) => queryClient.setQueryData(hideKeys.list, list),
  })
}
