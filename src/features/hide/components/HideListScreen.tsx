import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'

import { AlertIcon, CloseIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { ApiError } from '@/lib/api/errors'

import type { HideKind } from '../api/hides'
import { useAddHide, useHides, useRemoveHide } from '../hooks/useHides'
import { contactPicker, entriesFrom } from '../utils/contacts'
import { hideErrorMessage } from '../utils/errorMessage'

type Values = { kind: HideKind; value: string }

const kinds: HideKind[] = ['phone', 'email', 'instagram']

const fieldCopy: Record<
  HideKind,
  { tab: string; label: string; placeholder: string; inputMode: 'tel' | 'email' | 'text'; type: string }
> = {
  phone: { tab: 'Phone', label: 'Their phone number', placeholder: '98765 43210', inputMode: 'tel', type: 'tel' },
  email: {
    tab: 'Email',
    label: 'Their email',
    placeholder: 'name@adgips.ac.in',
    inputMode: 'email',
    type: 'email',
  },
  instagram: {
    tab: 'Instagram',
    label: 'Their Instagram',
    placeholder: '@theirname',
    inputMode: 'text',
    type: 'text',
  },
}

const kindLabels: Record<HideKind, string> = { phone: 'Phone', email: 'Email', instagram: 'Instagram' }

/** The hide list: people you never want to see here, or be seen by. */
export function HideListScreen() {
  const hides = useHides()
  const add = useAddHide()
  const remove = useRemoveHide()
  const [picked, setPicked] = useState<string | null>(null)
  const picker = contactPicker()

  const form = useForm<Values>({ defaultValues: { kind: 'phone', value: '' } })
  const kind = useWatch({ control: form.control, name: 'kind' })
  const valueError = form.formState.errors.value?.message

  const submit = form.handleSubmit((values) => {
    setPicked(null)
    if (!values.value.trim()) {
      form.setError('value', { message: `Add ${fieldCopy[values.kind].label.toLowerCase()}.` })
      return
    }
    add.mutate(
      { kind: values.kind, value: values.value.trim() },
      {
        onSuccess: () => form.reset({ kind: values.kind, value: '' }),
        onError: (error) => {
          const message = error instanceof ApiError ? error.fieldErrors.value : undefined
          if (message) form.setError('value', { message }, { shouldFocus: true })
        },
      },
    )
  })

  const pickContacts = async () => {
    if (!picker) return
    add.reset()
    setPicked(null)
    let entries
    try {
      entries = entriesFrom(await picker.select(['tel', 'email'], { multiple: true }))
    } catch {
      return // closed the picker
    }
    let added = 0
    for (const entry of entries) {
      try {
        await add.mutateAsync(entry)
        added += 1
      } catch {
        // Numbers from abroad or odd emails: skip them, say how many went in.
      }
    }
    if (entries.length) {
      setPicked(
        added === entries.length
          ? `Hid ${added} ${added === 1 ? 'contact' : 'contacts'}.`
          : `Hid ${added} of ${entries.length}. The rest weren't Indian mobile numbers or emails.`,
      )
    }
  }

  const items = hides.data?.items ?? []
  const formError = add.error && !(add.error instanceof ApiError && add.error.fieldErrors.value)

  return (
    <section className="rise pb-8">
      <Link
        to="/app/you"
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted no-underline"
      >
        <span aria-hidden="true">←</span> You
      </Link>
      <ScreenHeader
        kicker="Only you see this list"
        title="Hide people"
        accent="you know."
        subtitle="Seniors, your ex, your roommate. You won't see them, they won't see you, and nobody gets told. Works even if they join later."
      />

      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-5"
      >
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Hide them by</legend>
          <div className="grid grid-cols-3 gap-1 rounded-full border border-border-strong p-1">
            {kinds.map((value) => (
              <label
                key={value}
                className="flex h-11 cursor-pointer items-center justify-center rounded-full text-sm font-medium text-muted has-checked:bg-text has-checked:font-bold has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-text"
              >
                <input type="radio" value={value} {...form.register('kind')} className="sr-only" />
                {fieldCopy[value].tab}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {fieldCopy[kind].label}
          <input
            {...form.register('value')}
            type={fieldCopy[kind].type}
            inputMode={fieldCopy[kind].inputMode}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={320}
            placeholder={fieldCopy[kind].placeholder}
            aria-invalid={valueError ? true : undefined}
            aria-describedby={valueError ? 'hide-error' : undefined}
            className="h-12 w-full rounded-2xl border-[1.5px] border-field bg-bg px-4 text-[15px] font-normal text-text placeholder:text-muted focus:border-text focus:outline-none aria-invalid:border-accent-text"
          />
        </label>
        {valueError && (
          <p id="hide-error" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {valueError}
          </p>
        )}
        {formError && (
          <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {hideErrorMessage(add.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={add.isPending}
          className="h-12 rounded-full border-0 bg-text text-[15px] font-bold text-bg disabled:opacity-60"
        >
          {add.isPending ? 'Hiding…' : 'Hide them'}
        </button>
        {picker && (
          <button
            type="button"
            onClick={() => void pickContacts()}
            disabled={add.isPending}
            className="h-12 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60"
          >
            Pick from my contacts
          </button>
        )}
        {picked && (
          <p role="status" className="m-0 text-[13px] font-medium text-open">
            {picked}
          </p>
        )}
        <p className="m-0 text-xs leading-[1.45] text-muted">
          We check their college and Google email, and the phone or Instagram on their last card. We keep a scrambled
          fingerprint, never what you type.
        </p>
      </form>

      <div className="mt-7 flex items-baseline justify-between">
        <h2 className="m-0 font-display text-[28px] leading-none font-normal">Hidden</h2>
        {hides.data && (
          <span className="text-xs text-muted">
            {items.length} of {hides.data.max}
          </span>
        )}
      </div>

      {hides.isPending ? (
        <p className="mt-3 text-sm text-muted">Loading…</p>
      ) : hides.isError ? (
        <p role="alert" className="mt-3 text-sm text-accent-text">
          {hideErrorMessage(hides.error)}
        </p>
      ) : items.length === 0 ? (
        <p className="hatch mt-3 mb-0 rounded-[20px] border-[1.5px] border-dashed border-border-strong px-4 py-5 text-center text-sm text-muted">
          Nobody yet. Anyone you add disappears from your drops and Likes, both ways.
        </p>
      ) : (
        <ul aria-label="Hidden people" className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex min-h-14 items-center justify-between gap-3 rounded-[20px] border border-border bg-surface py-2 pr-2 pl-4"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-semibold">{item.hint}</span>
                <span className="text-xs text-muted">{kindLabels[item.kind]}</span>
              </span>
              <button
                type="button"
                aria-label={`Stop hiding ${item.hint}`}
                disabled={remove.isPending && remove.variables === item.id}
                onClick={() => remove.mutate(item.id)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-muted hover:bg-surface-2 disabled:opacity-50"
              >
                <CloseIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {remove.error && (
        <p role="alert" className="mt-2 mb-0 text-[13px] font-medium text-accent-text">
          {hideErrorMessage(remove.error)}
        </p>
      )}
    </section>
  )
}
