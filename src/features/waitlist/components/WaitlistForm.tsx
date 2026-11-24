import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, LockIcon } from '@/components/icons'
import { env } from '@/config/env'
import { ApiError } from '@/lib/api/errors'

import { waitlistErrorMessage } from '../utils/errorMessage'

// Light checks only. The server owns the real enrollment-number rule and
// returns a field error we show below the input.
const schema = z.object({
  enrollment_number: z.string().trim().min(1, 'Enter your enrollment number').max(40),
  email: z.string().trim().pipe(z.email("That email doesn't look right")),
  confirmed_adult: z.boolean().refine((value) => value, 'Reveal is only for people 18 or older'),
})

export type WaitlistFormValues = z.infer<typeof schema>
type Field = keyof WaitlistFormValues

type Props = {
  onSubmit: (values: WaitlistFormValues) => Promise<unknown>
}

const inputClass =
  'h-14 w-full rounded-2xl border-[1.5px] border-field bg-bg px-4 text-text outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted hover:border-muted focus:border-text focus:bg-surface focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--text)_14%,transparent)] aria-invalid:border-accent-text aria-invalid:bg-surface aria-invalid:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-2 disabled:text-muted'

export function WaitlistForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { enrollment_number: '', email: '', confirmed_adult: false },
  })

  async function submit(values: WaitlistFormValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? Object.entries(error.fieldErrors) : []
      const known = fieldErrors.filter((entry): entry is [Field, string] => entry[0] in values)
      if (known.length > 0) {
        known.forEach(([field, message], index) => setError(field, { message }, { shouldFocus: index === 0 }))
        return
      }
      setError('root', { message: waitlistErrorMessage(error) })
    }
  }

  const describedBy = (field: Field) => (errors[field] ? `${field}-error` : `${field}-hint`)

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <fieldset disabled={isSubmitting} className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0">
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="enrollment_number" className="text-sm font-semibold">
              Enrollment number
            </label>
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-locked-bg px-2 text-[11px] font-semibold text-locked">
              <LockIcon className="size-2.5" />
              Never shown
            </span>
          </div>
          <input
            id="enrollment_number"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            aria-invalid={errors.enrollment_number ? true : undefined}
            aria-describedby={describedBy('enrollment_number')}
            className={`${inputClass} text-lg font-semibold tracking-[0.06em] uppercase tabular-nums`}
            {...register('enrollment_number')}
          />
          <FieldMessage field="enrollment_number" error={errors.enrollment_number?.message}>
            Only to check you're a student here.{' '}
            <details className="inline">
              <summary className="inline cursor-pointer font-semibold text-text underline underline-offset-2">
                Why we ask
              </summary>
              <span className="mt-1 block">
                No outsiders, no fake profiles. Your number is never shown on your profile or to anyone.
                {env.VITE_CONTACT_EMAIL &&
                  ` If someone already used yours, write to ${env.VITE_CONTACT_EMAIL} and we'll fix it.`}
              </span>
            </details>
          </FieldMessage>
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-2 text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="you@gmail.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
            className={`${inputClass} text-base`}
            {...register('email')}
          />
          <FieldMessage field="email" error={errors.email?.message}>
            We'll write once, when you're in.
          </FieldMessage>
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirmed_adult" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              id="confirmed_adult"
              type="checkbox"
              aria-invalid={errors.confirmed_adult ? true : undefined}
              aria-describedby={errors.confirmed_adult ? 'confirmed_adult-error' : undefined}
              className="size-5 shrink-0 accent-text"
              {...register('confirmed_adult')}
            />
            I'm 18 or older
          </label>
          {errors.confirmed_adult?.message && (
            <ErrorText id="confirmed_adult-error">{errors.confirmed_adult.message}</ErrorText>
          )}
        </div>
      </fieldset>

      {errors.root?.message && (
        <p
          role="alert"
          className="mt-5 mb-0 flex gap-2 rounded-2xl bg-accent-bg p-3 text-sm font-medium text-accent-text"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        aria-busy={isSubmitting || undefined}
        aria-disabled={isSubmitting || undefined}
        className={`mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-base font-bold text-on-accent transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-text active:scale-[0.96] ${
          isSubmitting ? 'pointer-events-none' : 'hover:bg-[color-mix(in_oklab,var(--accent)_88%,black)]'
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-on-accent/40 border-t-on-accent" />
            Saving your spot…
          </>
        ) : (
          <>
            Save my spot <span aria-hidden="true">→</span>
          </>
        )}
      </button>
      <p className="mt-3 mb-0 text-center text-xs text-muted">Nothing about you is public. No spam.</p>
    </form>
  )
}

function FieldMessage({ field, error, children }: { field: Field; error?: string; children: ReactNode }) {
  if (error) return <ErrorText id={`${field}-error`}>{error}</ErrorText>
  return (
    <div id={`${field}-hint`} className="mt-2 mb-0 min-h-5 text-[13px] leading-5 text-muted">
      {children}
    </div>
  )
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 mb-0 flex items-start gap-1.5 text-[13px] leading-5 font-medium text-accent-text">
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  )
}
