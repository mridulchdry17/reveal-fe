import { useState } from 'react'
import { Link } from 'react-router'

import { CloseIcon } from '@/components/icons'

import { usePush } from '../hooks/usePush'

const DISMISSED = 'reveal.pingNudge'

function dismissedBefore(): boolean {
  try {
    return localStorage.getItem(DISMISSED) === '1'
  } catch {
    return false
  }
}

/** A small nudge on Tonight, once caught up: "want a ping when the next drop lands?" */
export function DropReminder() {
  const { state, enable } = usePush()
  const [hidden, setHidden] = useState(dismissedBefore)
  if (hidden || (state !== 'off' && state !== 'install')) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED, '1')
    } catch {
      // Private mode: it just comes back next visit.
    }
    setHidden(true)
  }

  return (
    <aside aria-label="Notifications" className="flex items-center gap-3 rounded-[24px] bg-peach px-4 py-3 text-text">
      <p className="m-0 flex-1 text-sm leading-[1.35] font-semibold">Want a ping when the next drop lands?</p>
      {state === 'off' ? (
        <button
          type="button"
          onClick={() => enable.mutate()}
          disabled={enable.isPending}
          className="h-11 shrink-0 rounded-full border-0 bg-text px-4 text-sm font-bold text-bg disabled:opacity-60"
        >
          Ping me
        </button>
      ) : (
        <Link
          to="/app/you#notifications"
          className="flex h-11 shrink-0 items-center rounded-full bg-text px-4 text-sm font-bold text-bg no-underline"
        >
          How
        </Link>
      )}
      <button
        type="button"
        aria-label="Not now"
        onClick={dismiss}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-text"
      >
        <CloseIcon className="size-4" />
      </button>
    </aside>
  )
}
