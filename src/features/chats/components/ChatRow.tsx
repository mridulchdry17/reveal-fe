import { Link } from 'react-router'

import type { ChatSummary } from '../api/chats'
import { shortTime } from '../utils/time'

/** One match in the Chats tab: who, the last line, and a dot if it's new. */
export function ChatRow({ chat }: { chat: ChatSummary }) {
  const { profile, last_message: last } = chat
  return (
    <Link
      to={`/app/chats/${chat.match_id}`}
      className={`flex items-center gap-3.5 rounded-2xl bg-surface px-4 py-3.5 text-text no-underline ${
        chat.unread ? 'border-2 border-accent' : 'border border-border'
      }`}
    >
      <Initial name={profile.nickname} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-base font-bold">{profile.nickname}</span>
          {chat.unread ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-accent-text">
              New
              <span aria-hidden="true" className="size-2.5 rounded-full bg-accent" />
            </span>
          ) : (
            <span className="shrink-0 text-xs text-muted">
              {shortTime(last?.sent_at ?? chat.matched_at)}
            </span>
          )}
        </span>
        <span className={`truncate text-[13px] ${chat.unread ? 'font-semibold' : 'text-muted'}`}>
          {last ? `${last.mine ? 'You: ' : ''}${last.body}` : 'New match. Say hi!'}
        </span>
      </span>
    </Link>
  )
}

export function Initial({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-locked-bg font-display font-bold text-locked ${
        size === 'md' ? 'size-12 text-lg' : 'size-9 text-base'
      }`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
