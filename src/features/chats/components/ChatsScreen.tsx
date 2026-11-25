import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Sticker } from '@/components/Sticker'

import { useChats } from '../hooks/useChats'
import { chatErrorMessage } from '../utils/errorMessage'
import { ChatRow } from './ChatRow'
import { NewMatches } from './NewMatches'

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
  const fresh = chats.data?.filter((c) => c.last_message === null) ?? []
  const talking = chats.data?.filter((c) => c.last_message !== null) ?? []
  const ended = (useLocation().state as { ended?: keyof typeof endedMessages } | null)?.ended

  return (
    <section className="flex flex-col gap-3 pb-6">
      <ScreenHeader title="Chats" subtitle="Swap cards as you talk. Their photo opens piece by piece." />
      {ended && (
        <p role="status" className="m-0 rounded-[20px] border border-border bg-surface-2 p-4 text-sm leading-5">
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
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-[28px] bg-forest px-5 pt-7 pb-5 text-white">
          <Sticker tone="peach" tilt={6} className="absolute top-4 right-4">
            no swiping here
          </Sticker>
          <h2 className="m-0 mt-4 max-w-[12ch] font-display text-[38px] leading-[0.95] font-normal">
            Your chats <em className="text-peach">start here.</em>
          </h2>
          <p className="m-0 text-sm leading-6 text-white/80">
            No matches yet. Like an answer in tonight's drop; when they like you back, you can chat here.
          </p>
          <Link
            to="/app/tonight"
            className="mt-1 inline-flex h-11 w-fit items-center rounded-full bg-white px-5 text-sm font-bold text-text no-underline"
          >
            Open tonight's drop
          </Link>
        </div>
      )}
      {fresh.length > 0 && <NewMatches chats={fresh} />}
      {talking.length > 0 && (
        <section aria-labelledby="talking" className="-mx-3 mt-2 flex flex-col gap-1">
          <h2 id="talking" className="m-0 px-3 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Talking
          </h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {talking.map((chat) => (
              <li key={chat.match_id}>
                <ChatRow chat={chat} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}
