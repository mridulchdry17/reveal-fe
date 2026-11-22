import { Navigate, Outlet } from 'react-router'

import { useMyProfile } from '@/features/profile/hooks/useProfile'
import { nextStep, stepPath } from '@/features/profile/utils/steps'

/** Inside RequireVerified: finish the four profile screens before the app. */
export function RequireProfile() {
  const profile = useMyProfile()

  if (profile.isPending) {
    return (
      <p role="status" className="m-0 flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">
        Loading…
      </p>
    )
  }
  // An error here shouldn't lock people out of the app; the screens handle their own errors.
  const step = profile.data ? nextStep(profile.data) : null
  if (step) return <Navigate to={stepPath(step)} replace />
  return <Outlet />
}
