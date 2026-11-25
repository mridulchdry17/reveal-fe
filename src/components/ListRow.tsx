import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { ChevronRightIcon } from './icons'

type Props = {
  to: string
  title: ReactNode
  /** A smaller line under the title. */
  detail?: ReactNode
  /** Right side, before the chevron: "Added", "0:22", a count. */
  value?: ReactNode
  /** The value reads as something still to do (accent text), not a fact. */
  todo?: boolean
  'aria-label'?: string
}

/** One tappable row in a grouped list card (the You tab's swap cards and settings). */
export function ListRow({ to, title, detail, value, todo, 'aria-label': label }: Props) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="flex min-h-14 items-center gap-3 px-4 py-2.5 text-text no-underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-text"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px]">{title}</span>
        {detail && <span className="text-xs text-muted">{detail}</span>}
      </span>
      {value !== undefined && (
        <span className={`shrink-0 text-sm ${todo ? 'font-semibold text-accent-text' : 'text-muted'}`}>{value}</span>
      )}
      <ChevronRightIcon className="size-4 shrink-0 text-muted" />
    </Link>
  )
}

/** The rounded card that groups ListRows, with a hairline between rows. */
export function ListCard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div
      role={label ? 'group' : undefined}
      aria-label={label}
      className="flex flex-col divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-surface"
    >
      {children}
    </div>
  )
}
