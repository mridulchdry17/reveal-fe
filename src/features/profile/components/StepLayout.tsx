import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { AlertIcon } from '@/components/icons'

type Props = {
  step: 1 | 2 | 3 | 4
  backTo?: string
  title: string
  subtitle?: string
  children: ReactNode
  submitLabel: string
  submitting: boolean
  error?: string | null
}

/** "Profile n of 4": header, progress, title, the form's fields, and the submit button. */
export function StepLayout({ step, backTo, title, subtitle, children, submitLabel, submitting, error }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-3 pb-8">
      <header className="flex h-11 items-center justify-between">
        {backTo ? (
          <Link to={backTo} className="-ml-2 px-2 text-sm font-semibold text-muted no-underline">
            Back
          </Link>
        ) : (
          <span />
        )}
        <span className="text-[13px] text-muted">Profile {step} of 4</span>
      </header>
      <div aria-hidden="true" className="flex gap-1.5">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`h-1 flex-1 rounded-full ${n <= step ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>
      <div>
        <h1 className="m-0 font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 mb-0 text-[15px] leading-6 text-pretty text-muted">{subtitle}</p>
        )}
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
          className="h-[54px] rounded-2xl border-0 bg-accent text-base font-bold text-on-accent disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </div>
  )
}
