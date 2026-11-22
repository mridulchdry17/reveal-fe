import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/errors'

import { getTonight, likeItem, passItem, type LikeRequest, type Tonight } from '../api/drops'
import { tonightKeys } from '../api/keys'

export function useTonight() {
  return useQuery({ queryKey: tonightKeys.drop, queryFn: getTonight })
}

type Decision = NonNullable<Tonight['items'][number]['decision']>

/** After an answer, mark that profile in the cached drop. If the drop moved on, reload it. */
function useAnswer<V extends { itemId: string }, R>(
  answer: (vars: V) => Promise<R>,
  decision: Decision,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: answer,
    onSuccess: (_result, { itemId }) =>
      queryClient.setQueryData<Tonight>(tonightKeys.drop, (drop) =>
        drop && {
          ...drop,
          items: drop.items.map((i) => (i.id === itemId ? { ...i, decision } : i)),
        },
      ),
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'drop_item_closed') {
        void queryClient.invalidateQueries({ queryKey: tonightKeys.drop })
      }
    },
  })
}

export const useLikeItem = () =>
  useAnswer(({ itemId, body }: { itemId: string; body: LikeRequest }) => likeItem(itemId, body), 'liked')

export const usePassItem = () => useAnswer(({ itemId }: { itemId: string }) => passItem(itemId), 'passed')
