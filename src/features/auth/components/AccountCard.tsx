type Props = {
  name: string
  email: string
  isAdmin: boolean
  signingOut: boolean
  onSignOut: () => void
}

export function AccountCard({ name, email, isAdmin, signingOut, onSignOut }: Props) {
  return (
    <section
      aria-label="Account"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 truncate font-display text-lg font-bold">{name}</p>
          <p className="m-0 truncate text-sm text-muted">{email}</p>
        </div>
        {isAdmin && (
          <span className="shrink-0 rounded-full bg-open-bg px-2.5 py-1 text-xs font-bold text-open">
            Admin
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="h-11 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60"
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </section>
  )
}
