import { ListRow } from '@/components/ListRow'

import { useHides } from '../hooks/useHides'

/** The You-tab door to the hide list. */
export function HideSection() {
  const hides = useHides()
  const count = hides.data?.items.length ?? 0

  return (
    <ListRow
      to="/app/you/hidden"
      title="Hide people you know"
      detail={count === 0 ? 'Exes, classmates, your cousin. Silent, both ways.' : `Exes, classmates, your cousin. ${count} hidden`}
    />
  )
}
