type Props = {
  interests: string[]
  /** Say the drop matches on these (only when my preferences include shared interests). */
  matchedOn: boolean
}

/** My own interests on the countdown panel, as quiet chips. */
export function InterestChips({ interests, matchedOn }: Props) {
  if (interests.length === 0) return null
  return (
    <ul aria-label="Your interests" className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
      {interests.map((interest) => (
        <li key={interest} className="rounded-full border border-white/25 px-3 py-1.5 text-xs">
          {interest}
        </li>
      ))}
      {matchedOn && <li className="rounded-full border border-white/25 px-3 py-1.5 text-xs text-white/75">matched on these</li>}
    </ul>
  )
}
