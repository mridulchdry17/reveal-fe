import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  answerSwap,
  askSwap,
  getTheirPhoto,
  getTheirVoice,
  guessCard,
  withdrawSwap,
  type Card,
  type ChatThread,
} from '../api/chats'
import { chatKeys } from '../api/keys'

function useBoardUpdate(matchId: string) {
  const queryClient = useQueryClient()
  return (board: ChatThread['swaps']) => {
    queryClient.setQueryData<ChatThread>(chatKeys.thread(matchId), (thread) =>
      thread ? { ...thread, swaps: board } : thread,
    )
    // An accepted swap opens their card's value too, which comes with the thread.
    void queryClient.invalidateQueries({ queryKey: chatKeys.thread(matchId), exact: true })
  }
}

export function useAskSwap(matchId: string) {
  const update = useBoardUpdate(matchId)
  return useMutation({ mutationFn: (card: Card) => askSwap(matchId, card), onSuccess: update })
}

export function useAnswerSwap(matchId: string) {
  const update = useBoardUpdate(matchId)
  return useMutation({
    mutationFn: ({ card, yes }: { card: Card; yes: boolean }) => answerSwap(matchId, card, yes),
    onSuccess: update,
  })
}

/** A guess landed: the thread brings the new photo pieces, and the pieces refetch the photo. */
export function useRefreshThread(matchId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: chatKeys.thread(matchId), exact: true })
}

export function useTheirPhoto(matchId: string, pieces: number[]) {
  return useQuery({
    queryKey: chatKeys.photo(matchId, pieces),
    queryFn: () => getTheirPhoto(matchId),
    enabled: pieces.length > 0,
    staleTime: Infinity,
    retry: false,
  })
}

export function useTheirVoice(matchId: string, open: boolean) {
  return useQuery({
    queryKey: chatKeys.voice(matchId),
    queryFn: () => getTheirVoice(matchId),
    enabled: open,
    staleTime: Infinity,
    retry: false,
  })
}

export function useWithdrawSwap(matchId: string) {
  const update = useBoardUpdate(matchId)
  return useMutation({ mutationFn: (card: Card) => withdrawSwap(matchId, card), onSuccess: update })
}

/** A guess from the chat: the reloaded thread brings the answer and any new photo piece. */
export function useGuessCard(matchId: string) {
  const refresh = useRefreshThread(matchId)
  return useMutation({
    mutationFn: ({ cardId, pick }: { cardId: string; pick: number }) => guessCard(cardId, pick),
    onSettled: () => void refresh(),
  })
}
