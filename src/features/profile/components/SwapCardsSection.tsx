import { ListCard, ListRow } from '@/components/ListRow'

import { useMyProfile } from '../hooks/useProfile'
import { swapCardRows } from '../utils/myCards'

/** The six cards that open only by swapping, one row each. A row opens that card's editor. */
export function SwapCardsSection() {
  const profile = useMyProfile()
  if (!profile.data) return null

  return (
    <section aria-labelledby="swap-cards-title" className="flex flex-col gap-2">
      <h2 id="swap-cards-title" className="m-0 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        Swap cards · open only by swapping
      </h2>
      <ListCard>
        {swapCardRows(profile.data).map((row) =>
          row.to ? (
            <ListRow
              key={row.label}
              to={row.to}
              title={row.label}
              value={row.value}
              todo={!row.added}
              aria-label={`${row.label}: ${row.value}`}
            />
          ) : (
            <div key={row.label} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px]">{row.label}</span>
                <span className="text-xs text-muted">From your Google account</span>
              </span>
              <span className="shrink-0 text-sm text-muted">{row.value}</span>
            </div>
          ),
        )}
      </ListCard>
    </section>
  )
}
