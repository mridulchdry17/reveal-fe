import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, CheckIcon } from '@/components/icons'

import { useLetIn } from '../hooks/useLetIn'
import { adminErrorMessage } from '../utils/errorMessage'

const schema = z.object({
  email: z.string().trim().pipe(z.email("That email doesn't look right")),
  note: z.string().trim().max(300),
})
type Values = z.infer<typeof schema>

const inputClass =
  'h-12 w-full rounded-xl border-[1.5px] border-field bg-bg px-3 text-text aria-invalid:border-accent-text'

/** Verify someone by hand, e.g. a first-year with no college email or ID card yet. */
export function LetInForm() {
  const letIn = useLetIn()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', note: '' } })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        letIn.mutate(
          { email: values.email, note: values.note || undefined },
          { onSuccess: () => reset() },
        ),
      )}
      className="flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5"
    >
      <p className="m-0 text-sm leading-6 text-muted">
        They need to sign in on Reveal first. Then enter the Google email they signed in with.
        Only let in people you know are at the college.
      </p>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Their email
        <input
          type="email"
          autoComplete="off"
          aria-invalid={errors.email ? true : undefined}
          {...register('email')}
          className={`${inputClass} font-normal`}
        />
        {errors.email && (
          <span className="flex gap-2 font-normal text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {errors.email.message}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Note for the log (optional)
        <input
          placeholder="First-year, CSE, my cousin"
          {...register('note')}
          className={`${inputClass} font-normal`}
        />
      </label>
      <button
        type="submit"
        disabled={letIn.isPending}
        className="h-[54px] rounded-full border-0 bg-accent text-sm font-bold text-on-accent disabled:opacity-60"
      >
        {letIn.isPending ? 'Letting in…' : 'Let them in'}
      </button>
      {letIn.isSuccess && (
        <p role="status" className="m-0 flex gap-2 text-sm text-open">
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          {letIn.data.name} ({letIn.data.email}) is in.
        </p>
      )}
      {letIn.isError && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {adminErrorMessage(letIn.error)}
        </p>
      )}
    </form>
  )
}
