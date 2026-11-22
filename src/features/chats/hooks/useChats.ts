import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  block,
  getChat,
  getChats,
  markRead,
  report,
  sendMessage,
  unmatch,
  type ChatThread,
  type ReportReason,
} from '../api/chats'
import { chatKeys } from '../api/keys'

// No push or sockets yet: poll while the screen is open. Paused when the tab is hidden.
const LIST_POLL_MS = 15_000
const THREAD_POLL_MS = 3_000

export function useChats() {
  return useQuery({ queryKey: chatKeys.list, queryFn: getChats, refetchInterval: LIST_POLL_MS })
}

export function useChat(matchId: string) {
  return useQuery({
    queryKey: chatKeys.thread(matchId),
    queryFn: () => getChat(matchId),
    // Stop asking once it fails, e.g. the chat ended; the screen says so.
    refetchInterval: (query) => (query.state.status === 'error' ? false : THREAD_POLL_MS),
    retry: false,
  })
}

export function useSendMessage(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => sendMessage(matchId, body),
    onSuccess: (message) => {
      queryClient.setQueryData<ChatThread>(chatKeys.thread(matchId), (thread) =>
        thread && !thread.messages.some((m) => m.id === message.id)
          ? { ...thread, messages: [...thread.messages, message] }
          : thread,
      )
      void queryClient.invalidateQueries({ queryKey: chatKeys.list, exact: true })
    },
  })
}

export function useMarkRead(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markRead(matchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.list, exact: true }),
  })
}

export type SafetyAction =
  | { kind: 'unmatch' }
  | { kind: 'block' }
  | { kind: 'report'; reason: ReportReason; details: string | null }

/** Unmatch, block or report: each ends the chat for both. */
export function useEndChat(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (action: SafetyAction) => {
      if (action.kind === 'unmatch') return unmatch(matchId)
      if (action.kind === 'block') return block(matchId)
      return report(matchId, action.reason, action.details)
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: chatKeys.thread(matchId) })
      return queryClient.invalidateQueries({ queryKey: chatKeys.list, exact: true })
    },
  })
}
