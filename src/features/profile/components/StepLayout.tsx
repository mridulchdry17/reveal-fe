import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

type Props = {
  step: 1 | 2 | 3 | 4 | 5
  backTo?: string
  /** The heading's plain words; with `accent` this is the heading's accessible name. */
  title: string
  /** Words after the title, in italic terracotta: "Give yourself a" + "nickname". */
  accent?: string
  subtitle?: string
  children: ReactNode
  submitLabel: string
  submitting: boolean
  error?: string | null
}

/** "Profile n of 5": header, progress, title, the form's fields, and the submit button. */
export function StepLayout({
  step,
  backTo,
  title,
  accent,
  subtitle,
  children,
  submitLabel,
  submitting,
  error,
}: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 overflow-x-clip px-5 pt-3 pb-8">
      <div className="flex flex-col gap-2.5">
        <header className="flex h-11 items-center justify-between">
          {backTo ? (
            <Link
              to={backTo}
              className="-ml-2 flex h-11 items-center px-2 text-sm font-semibold text-muted no-underline"
            >
              Back
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
            Profile {step} of 5
          </span>
        </header>
        <div aria-hidden="true" className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`h-1 flex-1 rounded-full ${n <= step ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>
      </div>
      <div className="rise">
        <ScreenHeader title={title} accent={accent} subtitle={subtitle} />
      </div>
      {children}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        {error && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-[54px] rounded-full border-0 bg-accent text-base font-bold text-on-accent transition-transform duration-150 active:scale-[0.97] disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </div>
  )
}
