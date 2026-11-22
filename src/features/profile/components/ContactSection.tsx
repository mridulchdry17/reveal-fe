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
    <section aria-labelledby="contact-title" className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-locked-bg text-locked">
          <LockIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 id="contact-title" className="m-0 text-[15px] font-bold">
            Your last card
          </h2>
          <p className="m-0 text-[13px] leading-5 text-muted">
            Instagram or phone. Optional. Opens only after you both swap photos.
          </p>
        </div>
      </div>

      {showForm ? (
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3">
          <fieldset className="m-0 border-0 p-0">
            <legend className="sr-only">Which one</legend>
            <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-bg p-1">
              {(['instagram', 'phone'] as const).map((value) => (
                <label
                  key={value}
                  className="flex h-10 cursor-pointer items-center justify-center rounded-[10px] text-sm font-medium has-checked:bg-text has-checked:font-bold has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-accent"
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
              className="h-12 w-full rounded-xl border-[1.5px] border-field bg-bg px-3 text-[15px] font-normal text-text focus:border-text focus:outline-none aria-invalid:border-accent-text"
            />
          </label>
          {valueError && (
            <p id="contact-error" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {valueError}
            </p>
          )}
          {formError && (
            <p role="alert" className="m-0 text-[13px] font-medium text-accent-text">
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
              className="h-11 flex-1 rounded-full border-0 bg-accent text-sm font-bold text-on-accent disabled:opacity-60"
            >
              {save.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <p className="m-0 rounded-xl bg-bg px-3 py-3 text-[15px] font-semibold break-all">{contactLabel(contact)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditing}
              className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
            >
              Change
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
              className="h-11 flex-1 rounded-full border-0 bg-transparent text-sm font-semibold text-muted disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      {remove.error && (
        <p role="alert" className="mt-2 mb-0 text-[13px] font-medium text-accent-text">
          {profileErrorMessage(remove.error)}
        </p>
      )}
    </section>
  )
}
