import { Link } from 'react-router'

import { BackIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

import { useBlocks } from '../hooks/useBlocks'
import { blockErrorMessage } from '../utils/errorMessage'

const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** Everyone you blocked or reported. They can't see you and you can't see them. */
export function BlockedListScreen() {
  const blocks = useBlocks()

  return (
    <section className="rise pb-8">
      <Link
        to="/app/you"
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted no-underline"
      >
        <BackIcon className="size-4" /> You
      </Link>
      <ScreenHeader
        title="Blocked"
        accent="and reported."
        subtitle="People you blocked or reported from a chat. You won't see each other again."
      />

      {blocks.isPending ? (
        <p role="status" className="m-0 text-sm text-muted">
          Loading…
        </p>
      ) : blocks.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="m-0 text-sm text-accent-text">
            {blockErrorMessage(blocks.error)}
          </p>
          <button
            type="button"
            onClick={() => void blocks.refetch()}
            className="h-11 rounded-full border-0 bg-text px-5 text-sm font-bold text-bg"
          >
            Try again
          </button>
        </div>
      ) : blocks.data.length === 0 ? (
        <p className="m-0 rounded-[18px] border border-border bg-surface px-4 py-5 text-center text-sm text-muted">
          No one blocked. If someone makes you uneasy, the shield in any chat blocks or reports them.
        </p>
      ) : (
        <ul
          aria-label="Blocked people"
          className="m-0 flex list-none flex-col divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-surface p-0"
        >
          {blocks.data.map((item) => (
            <li key={item.id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0 truncate font-display text-[20px] leading-tight font-normal">
                {item.nickname}
              </span>
              <time dateTime={item.blocked_at} className="shrink-0 text-[13px] text-muted">
                {day.format(new Date(item.blocked_at))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
