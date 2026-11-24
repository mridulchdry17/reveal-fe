import { Link } from 'react-router'

type Props = {
  name: string
  email: string
  isAdmin: boolean
  signingOut: boolean
  onSignOut: () => void
}

export function AccountCard({ name, email, isAdmin, signingOut, onSignOut }: Props) {
  return (
    <section aria-label="Account" className="flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Signed in as</p>
          <p className="mt-1 mb-0 truncate font-display text-[22px] leading-tight font-normal">{name}</p>
          <p className="m-0 truncate text-sm text-muted">{email}</p>
        </div>
        {isAdmin && (
          <span className="shrink-0 rounded-full bg-open-bg px-2.5 py-1 text-xs font-bold text-open">Admin</span>
        )}
      </div>
      <div className="flex gap-2">
        {isAdmin && (
          <Link
            to="/admin"
            className="flex h-11 flex-1 items-center justify-center rounded-full bg-text text-sm font-bold text-bg no-underline"
          >
            Open admin
          </Link>
        )}
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </section>
  )
}
