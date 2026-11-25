import { AlertIcon } from '@/components/icons'

type Props = {
  /** Shown while loading. */
  loading?: string
  /** Shown when it failed, with Try again. */
  error?: string
  onRetry?: () => void
}

/** Loading or error for a full-screen route outside the tab bar. */
export function ScreenStatus({ loading, error, onRetry }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 bg-bg px-6 text-text">
      {loading && <p className="m-0 text-sm text-muted">{loading}</p>}
      {error && (
        <>
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="h-11 w-fit rounded-full bg-text px-5 text-sm font-bold text-bg"
            >
              Try again
            </button>
          )}
        </>
      )}
    </div>
  )
}
