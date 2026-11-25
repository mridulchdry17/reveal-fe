import { ListRow } from '@/components/ListRow'

type Props = {
  name: string
  email: string
  isAdmin: boolean
  signingOut: boolean
  onSignOut: () => void
}

/** Rows for a grouped list: who's signed in with a Sign out button, and the admin door for admins. */
export function AccountCard({ name, email, isAdmin, signingOut, onSignOut }: Props) {
  return (
    <>
      {isAdmin && <ListRow to="/admin" title="Open admin" />}
      <div className="flex min-h-14 items-center gap-3 py-2 pr-2 pl-4">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px]">{name}</span>
            {isAdmin && (
              <span className="shrink-0 rounded-full bg-open-bg px-2 py-0.5 text-[11px] font-bold text-open">Admin</span>
            )}
          </span>
          <span className="truncate text-xs text-muted">{email}</span>
        </span>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="h-11 shrink-0 rounded-full border-0 bg-transparent px-3 text-[15px] font-semibold text-accent-text disabled:opacity-60"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  )
}
