import { Link } from 'react-router'

import type { ChatSummary } from '../api/chats'
import { shortTime } from '../utils/time'

/** One match in the Chats tab: who, the last line, and a "New" tag if it's unread. */
export function ChatRow({ chat }: { chat: ChatSummary }) {
  const { profile, last_message: last } = chat
  return (
    <Link
      to={`/app/chats/${chat.match_id}`}
      className={`flex items-center gap-3.5 rounded-[24px] bg-surface px-4 py-4 text-text no-underline shadow-[0_14px_30px_-26px_rgb(40_20_10/0.5)] transition-transform duration-150 active:scale-[0.98] ${
        chat.unread ? 'border-2 border-accent' : 'border border-border'
      }`}
    >
      <Initial name={profile.nickname} />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-display text-[24px] leading-none">{profile.nickname}</span>
          {chat.unread ? (
            <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-on-accent uppercase">
              New
            </span>
          ) : (
            <span className="shrink-0 text-xs text-muted">{shortTime(last?.sent_at ?? chat.matched_at)}</span>
          )}
        </span>
        <span className={`truncate text-[14px] ${chat.unread ? 'font-semibold text-text' : 'text-muted'}`}>
          {last ? `${last.mine ? 'You: ' : ''}${last.body}` : 'New match. Say hi!'}
        </span>
      </span>
    </Link>
  )
}

/** Their first letter on the hidden pattern: the photo stays closed until swaps open it. */
export function Initial({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={`hatch flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-locked font-display font-normal text-locked ${
        size === 'md' ? 'size-12 text-[26px]' : 'size-10 text-xl'
      }`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
