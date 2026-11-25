import { ListRow } from '@/components/ListRow'

import { useBlocks } from '../hooks/useBlocks'

/** The You-tab door to the people you blocked or reported. */
export function BlockedRow() {
  const blocks = useBlocks()
  const count = blocks.data?.length

  return <ListRow to="/app/you/blocked" title="Blocked and reported" value={count || undefined} />
}
