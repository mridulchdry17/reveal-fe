import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ApiError } from '@/lib/api/errors'

import type { JoinWaitlistBody } from '../api/joinWaitlist'
import { waitlistErrorMessage } from '../utils/errorMessage'

// Light checks only. The server owns the real enrollment-number rule and
// returns a field error we show below the input.
const schema = z.object({
  enrollment_number: z.string().trim().min(1, 'Enter your enrollment number').max(40),
  email: z.string().trim().pipe(z.email('Enter a valid email')),
})

type Props = {
  onSubmit: (values: JoinWaitlistBody) => Promise<unknown>
}

export function WaitlistForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinWaitlistBody>({ resolver: zodResolver(schema) })

  async function submit(values: JoinWaitlistBody) {
    try {
      await onSubmit(values)
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? Object.entries(error.fieldErrors) : []
      if (fieldErrors.length > 0) {
        for (const [field, message] of fieldErrors) {
          if (field === 'enrollment_number' || field === 'email') setError(field, { message })
        }
        return
      }
      setError('root', { message: waitlistErrorMessage(error) })
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="enrollment_number" className="text-sm font-semibold">
          Enrollment number
        </label>
        <input
          id="enrollment_number"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={errors.enrollment_number ? true : undefined}
          aria-describedby="enrollment_number-hint"
          className="h-14 rounded-xl border-2 border-text bg-surface px-4 text-lg font-semibold tracking-wide text-text aria-invalid:border-accent"
          {...register('enrollment_number')}
        />
        <p id="enrollment_number-hint" className="m-0 text-xs text-muted">
          {errors.enrollment_number?.message ?? 'On your ID card. Never shown to anyone.'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby="email-hint"
          className="h-14 rounded-xl border-2 border-text bg-surface px-4 text-base text-text aria-invalid:border-accent"
          {...register('email')}
        />
        <p id="email-hint" className="m-0 text-xs text-muted">
          {errors.email?.message ?? "Any email you check. We'll only write when you're in."}
        </p>
      </div>

      {errors.root?.message && (
        <p role="alert" className="m-0 rounded-xl bg-accent-bg p-3 text-sm text-accent-text">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-14 rounded-2xl bg-accent text-base font-bold text-on-accent disabled:opacity-60"
      >
        {isSubmitting ? 'Joining…' : 'Join the waitlist'}
      </button>
    </form>
  )
}
