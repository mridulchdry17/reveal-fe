import type { ReactNode } from 'react'

type Props = {
  /** The heading's plain words. Together with `accent` this is the heading's accessible name. */
  title: string
  /** Words after the title, set in italic terracotta: "Tonight's" + "drop". */
  accent?: string
  /** Small uppercase line above the heading. */
  kicker?: ReactNode
  subtitle?: ReactNode
  /** Right side of the title row: a count, a progress bar, a button. */
  aside?: ReactNode
}

/** The editorial page title: kicker, big serif heading with an italic accent word, subtitle. */
export function ScreenHeader({ title, accent, kicker, subtitle, aside }: Props) {
  return (
    <header className="flex flex-col gap-2 pb-4">
      {kicker && (
        <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">{kicker}</p>
      )}
      <div className="flex items-end justify-between gap-3">
        <h1 className="m-0 font-display text-[44px] leading-[0.95] font-normal tracking-[-0.01em]">
          {title}
          {accent && (
            <>
              {' '}
              <em className="text-accent-text">{accent}</em>
            </>
          )}
        </h1>
        {aside}
      </div>
      {subtitle && <p className="m-0 text-[15px] leading-[1.45] text-pretty text-muted">{subtitle}</p>}
    </header>
  )
}
