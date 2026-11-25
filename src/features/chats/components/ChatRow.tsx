import { Link } from 'react-router'

import type { ChatSummary } from '../api/chats'
import { displayName, pendingLine } from '../utils/swapCopy'
import { listTime } from '../utils/time'
import { cardProgress } from '../utils/timeline'

/** One chat in the Talking list: who, when, the last line (or a waiting swap) and how many cards are open. */
export function ChatRow({ chat }: { chat: ChatSummary }) {
  const { profile, last_message: last, pending_swap: pending } = chat
  const { open, total } = cardProgress(profile)
  const line = pending ? pendingLine(pending) : last ? `${last.mine ? 'You: ' : ''}${last.body}` : 'New match. Say hi!'
  return (
    <Link
      to={`/app/chats/${chat.match_id}`}
      className="flex items-center gap-3.5 rounded-[18px] px-3 py-3 text-text no-underline transition-colors duration-150 active:bg-surface-2"
    >
      <Initial name={displayName(profile)} pieces={chat.photo_pieces} />
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-display text-[21px] leading-tight">{displayName(profile)}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
            {chat.unread && (
              <>
                <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
                <span className="sr-only">New message,</span>
              </>
            )}
            {listTime(last?.sent_at ?? chat.matched_at)}
          </span>
        </span>
        <span className={`truncate text-sm ${chat.unread ? 'font-semibold text-text' : 'text-muted'}`}>{line}</span>
        <span className="mt-[3px] flex items-center gap-1.5">
          <Pips open={open} total={total} />
          <span className="text-[11px] text-muted">
            {open} of {total} open
          </span>
        </span>
      </span>
    </Link>
  )
}

function Pips({ open, total }: { open: number; total: number }) {
  return (
    <span aria-hidden="true" className="flex gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 w-3 rounded-full ${i < open ? 'bg-accent' : 'bg-border-strong/60'}`} />
      ))}
    </span>
  )
}

type InitialProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  /** How many of their 9 photo pieces are open: a small "3/9" tag, no picture. */
  pieces?: number
}

/** Their first letter on the hidden pattern: no photo in lists; it opens piece by piece in the chat. */
export function Initial({ name, size = 'md', pieces = 0 }: InitialProps) {
  const box = { sm: 'size-10 text-xl', md: 'size-14 text-[28px]', lg: 'size-16 text-[30px]' }[size]
  return (
    <span aria-hidden="true" className="relative shrink-0">
      <span
        className={`hatch flex items-center justify-center rounded-full border-[1.5px] border-dashed border-locked font-display font-normal text-locked ${box}`}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
      {pieces > 0 && (
        <span className="absolute -right-1 -bottom-1 rounded-full border border-border bg-surface px-1.5 py-px text-[10px] font-semibold text-text">
          {pieces}/9
        </span>
      )}
    </span>
  )
}
