import { Navigate, Outlet, useLocation } from 'react-router'

import { useMe } from '@/features/auth/hooks/useMe'

/** Everything under /app needs a signed-in account; others go to /sign-in and come back. */
export function RequireAuth() {
  const me = useMe()
  const location = useLocation()

  if (me.isPending) {
    return (
      <p role="status" className="m-0 flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">
        Loading…
      </p>
    )
  }

  if (me.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p role="alert" className="m-0 text-sm text-text">
          Couldn't reach Reveal. Check your connection.
        </p>
        <button
          type="button"
          onClick={() => void me.refetch()}
          className="h-11 rounded-full border-[1.5px] border-border-strong bg-transparent px-5 text-sm font-semibold text-text"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!me.data) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/sign-in?next=${next}`} replace />
  }

  return <Outlet />
}
