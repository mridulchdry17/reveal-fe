import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { AlertIcon, LockIcon } from '@/components/icons'
import { ApiError } from '@/lib/api/errors'

import type { ContactKind } from '../api/profile'
import { useMyProfile, useRemoveContact, useSaveContact } from '../hooks/useProfile'
import { contactLabel } from '../utils/contact'
import { profileErrorMessage } from '../utils/errorMessage'

type Values = { kind: ContactKind; value: string }

const fieldCopy: Record<ContactKind, { label: string; placeholder: string; inputMode: 'text' | 'tel' }> = {
  instagram: { label: 'Instagram username', placeholder: '@yourname', inputMode: 'text' },
  phone: { label: 'Phone number', placeholder: '98765 43210', inputMode: 'tel' },
}

/** Card 7 in the You tab: add, change or remove your Instagram or phone. */
export function ContactSection() {
  const profile = useMyProfile()
  const save = useSaveContact()
  const remove = useRemoveContact()
  const [editing, setEditing] = useState(false)
  const contact = profile.data?.contact ?? null

  const form = useForm<Values>({ defaultValues: { kind: 'instagram', value: '' } })
  const kind = useWatch({ control: form.control, name: 'kind' })
  const valueError = form.formState.errors.value?.message

  if (!profile.data) return null

  const startEditing = () => {
    form.reset(contact ?? { kind: 'instagram', value: '' })
    save.reset()
    setEditing(true)
  }

  const submit = form.handleSubmit((values) => {
    if (!values.value.trim()) {
      form.setError('value', { message: `Add your ${fieldCopy[values.kind].label.toLowerCase()}.` })
      return
    }
    save.mutate(
      { kind: values.kind, value: values.value.trim() },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => {
          const message = error instanceof ApiError ? error.fieldErrors.value : undefined
          if (message) form.setError('value', { message }, { shouldFocus: true })
        },
      },
    )
  })

  const showForm = editing || !contact
  const formError = save.error && !(save.error instanceof ApiError && save.error.fieldErrors.value)

  return (
    <section
      aria-labelledby="contact-title"
      data-theme="editorial-night"
      className="rounded-[28px] bg-night p-5 text-text shadow-[0_16px_36px_rgb(20_17_15/0.25)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-peach uppercase">Sealed · opens last</p>
          <h2 id="contact-title" className="mt-1.5 mb-0 font-display text-[30px] leading-none font-normal">
            Your last <em className="text-peach">card</em>
          </h2>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-locked bg-locked-bg text-locked">
          <LockIcon className="size-5" />
        </span>
      </div>
      <p className="mt-2 mb-0 text-sm leading-[1.45] text-white/80">
        Instagram or phone, if you want. A match gets it only after you've both swapped photos. Never before.
      </p>

      {showForm ? (
        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-3">
          <fieldset className="m-0 border-0 p-0">
            <legend className="sr-only">Which one</legend>
            <div className="grid grid-cols-2 gap-1 rounded-full border border-border-strong p-1">
              {(['instagram', 'phone'] as const).map((value) => (
                <label
                  key={value}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-full text-sm font-medium text-white/80 has-checked:bg-text has-checked:font-bold has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-peach"
                >
                  <input type="radio" value={value} {...form.register('kind')} className="sr-only" />
                  {value === 'instagram' ? 'Instagram' : 'Phone'}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {fieldCopy[kind].label}
            <input
              {...form.register('value')}
              inputMode={fieldCopy[kind].inputMode}
              autoComplete="off"
              autoCapitalize="none"
              maxLength={40}
              placeholder={fieldCopy[kind].placeholder}
              aria-invalid={valueError ? true : undefined}
              aria-describedby={valueError ? 'contact-error' : undefined}
              className="h-12 w-full rounded-2xl border-[1.5px] border-field bg-surface px-4 text-[15px] font-normal text-text placeholder:text-muted focus:border-peach focus:outline-none aria-invalid:border-accent-text"
            />
          </label>
          {valueError && (
            <p id="contact-error" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {valueError}
            </p>
          )}
          {formError && (
            <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {profileErrorMessage(save.error)}
            </p>
          )}

          <div className="flex gap-2">
            {contact && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={save.isPending}
              className="h-11 flex-1 rounded-full border-0 bg-text text-sm font-bold text-bg disabled:opacity-60"
            >
              {save.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          <div className="hatch flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-locked px-4 py-3">
            <LockIcon className="size-4 shrink-0 text-locked" />
            <div className="min-w-0">
              <p className="m-0 font-display text-[22px] leading-tight font-normal break-all">{contactLabel(contact)}</p>
              <p className="m-0 text-xs text-white/80">Sealed until the photo swap</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditing}
              className="h-11 flex-1 rounded-full border-0 bg-text text-sm font-bold text-bg"
            >
              Change
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
              className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      {remove.error && (
        <p role="alert" className="mt-2 mb-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {profileErrorMessage(remove.error)}
        </p>
      )}
    </section>
  )
}
