import { Link } from 'react-router'

import type { ChatSummary } from '../api/chats'
import { displayName } from '../utils/swapCopy'
import { Initial } from './ChatRow'

/** Matches nobody has written to yet, as a row of round avatars to tap into. */
export function NewMatches({ chats }: { chats: ChatSummary[] }) {
  return (
    <section aria-labelledby="new-matches" className="flex flex-col gap-3">
      <h2 id="new-matches" className="m-0 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        New matches
      </h2>
      <ul className="-mx-6 m-0 flex list-none gap-3.5 overflow-x-auto px-6 py-1 [scrollbar-width:none]">
        {chats.map((chat) => (
          <li key={chat.match_id} className="shrink-0">
            <Link
              to={`/app/chats/${chat.match_id}`}
              className="flex w-[72px] flex-col items-center gap-1.5 text-text no-underline"
            >
              <span className="rounded-full outline-2 outline-offset-2 outline-accent">
                <Initial name={chat.profile.nickname} size="lg" />
              </span>
              <span className="line-clamp-2 text-center text-xs leading-tight">{displayName(chat.profile)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
