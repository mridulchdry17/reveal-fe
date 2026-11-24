import { Link } from 'react-router'

import { useMyProfile } from '../hooks/useProfile'
import { stepPath } from '../utils/steps'

/** Your nickname and a way back into the profile screens. Rendered inside the You tab. */
export function ProfileSummary() {
  const profile = useMyProfile()
  if (!profile.data) return null

  return (
    <section
      aria-label="Your profile"
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      <div className="min-w-0">
        <p className="m-0 text-[13px] text-muted">You appear as</p>
        <p className="m-0 truncate font-display text-xl font-normal">{profile.data.nickname}</p>
      </div>
      <Link
        to={stepPath('basics')}
        className="flex h-11 shrink-0 items-center rounded-full border-[1.5px] border-border-strong px-4 text-sm font-semibold text-text no-underline"
      >
        Edit profile
      </Link>
    </section>
  )
}
