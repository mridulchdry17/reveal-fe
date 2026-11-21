import { Navigate, Outlet } from 'react-router'

import { useMe } from '@/features/auth/hooks/useMe'

/** Inside RequireAuth: the app is only for verified students; others go to /verify first. */
export function RequireVerified() {
  const me = useMe()
  if (me.data && !me.data.verified) return <Navigate to="/verify" replace />
  return <Outlet />
}
