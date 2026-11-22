import { Navigate, Outlet } from 'react-router'

import { useMe } from '@/features/auth/hooks/useMe'

/** Inside RequireAuth: admin pages for admins only. The API checks too; this just hides them. */
export function RequireAdmin() {
  const me = useMe()
  if (me.data && !me.data.is_admin) return <Navigate to="/app" replace />
  return <Outlet />
}
