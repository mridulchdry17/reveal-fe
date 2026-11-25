import { useMyProfile } from '@/features/profile/hooks/useProfile'
import { InterestChips } from '@/features/tonight/components/InterestChips'

/** My interests (from the profile feature) on the drop countdown (the tonight feature). */
export function MyInterests() {
  const profile = useMyProfile().data
  if (!profile) return null
  return (
    <InterestChips interests={profile.interests} matchedOn={profile.match_on.includes('shared_interests')} />
  )
}
