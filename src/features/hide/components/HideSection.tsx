import { Link } from 'react-router'

import { useHides } from '../hooks/useHides'

/** The You-tab door to the hide list. */
export function HideSection() {
  const hides = useHides()
  const count = hides.data?.items.length ?? 0

  return (
    <Link
      to="/app/you/hidden"
      className="flex min-h-16 items-center justify-between gap-3 rounded-[20px] border border-border bg-surface px-4 py-3 text-text no-underline"
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-semibold">Hide people you know</span>
        <span className="text-[13px] text-muted">
          {count === 0 ? 'Seniors, an ex, your roommate. Silent, both ways.' : `${count} hidden. Silent, both ways.`}
        </span>
      </span>
      <span aria-hidden="true" className="text-lg text-muted">
        →
      </span>
    </Link>
  )
}
