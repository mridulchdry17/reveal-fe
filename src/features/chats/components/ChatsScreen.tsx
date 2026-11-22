import type { ReactNode } from 'react'
import { useLocation } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

import { useChats } from '../hooks/useChats'
import { chatErrorMessage } from '../utils/errorMessage'
import { ChatRow } from './ChatRow'

type Props = {
  /** People who liked you, composed in from the tonight feature by the app routes. */
  likes?: ReactNode
}

const endedMessages = {
  unmatch: 'Unmatched. The chat is closed for both of you.',
  block: "Blocked. You won't see each other again.",
  report: "Reported and blocked. Thanks for telling us; an admin will look at it.",
} as const

export function ChatsScreen({ likes }: Props) {
  const chats = useChats()
  const ended = (useLocation().state as { ended?: keyof typeof endedMessages } | null)?.ended

  return (
    <section className="flex flex-col gap-3 pb-6">
      <ScreenHeader title="Chats" />
      {ended && (
        <p role="status" className="m-0 rounded-2xl bg-surface-2 p-3.5 text-sm leading-5">
          {endedMessages[ended]}
        </p>
      )}
      {likes}
      {chats.isPending && <p className="m-0 text-sm text-muted">Loading…</p>}
      {chats.isError && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {chatErrorMessage(chats.error)}
        </p>
      )}
      {chats.data?.length === 0 && (
        <p className="m-0 text-sm leading-6 text-muted">
          No matches yet. Like a line in tonight's drop; when they like you back, you can chat
          here.
        </p>
      )}
      {chats.data && chats.data.length > 0 && (
        <ul aria-label="Matches" className="m-0 flex list-none flex-col gap-2.5 p-0">
          {chats.data.map((chat) => (
            <li key={chat.match_id}>
              <ChatRow chat={chat} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
