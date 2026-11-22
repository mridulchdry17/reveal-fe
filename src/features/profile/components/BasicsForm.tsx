import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { BasicsUpdate, MyProfile, ProfileOptions } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { Chip } from './Chip'
import { StepLayout } from './StepLayout'

type Props = {
  profile: MyProfile
  options: ProfileOptions
  onSave: (values: BasicsUpdate) => void
  saving: boolean
  error: unknown
}

export function BasicsForm({ profile, options, onSave, saving, error }: Props) {
  const { register, handleSubmit, setValue, control } = useForm<BasicsUpdate>({
    defaultValues: {
      nickname: profile.nickname ?? '',
      vibe: profile.vibe ?? '',
      interests: profile.interests,
    },
  })
  const [custom, setCustom] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const interests = useWatch({ control, name: 'interests' })
  const choices = [...new Set([...options.interest_suggestions, ...interests])]
  const full = interests.length >= options.max_interests

  const toggle = (item: string) =>
    setValue(
      'interests',
      interests.includes(item) ? interests.filter((i) => i !== item) : [...interests, item],
    )

  const addCustom = () => {
    const item = custom.trim()
    if (!item || full) return
    if (!interests.some((i) => i.toLowerCase() === item.toLowerCase())) toggle(item)
    setCustom('')
  }

  const submit = handleSubmit((values) => {
    if (values.nickname.trim().length < 2) return setHint('Pick a nickname first.')
    if (!values.vibe) return setHint('Pick your vibe.')
    if (values.interests.length < options.min_interests) {
      return setHint(`Pick at least ${options.min_interests} interests.`)
    }
    setHint(null)
    onSave({ ...values, nickname: values.nickname.trim() })
  })

  return (
    <form onSubmit={submit} noValidate>
      <StepLayout
        step={1}
        title="Give yourself a nickname"
        subtitle="Something that sounds like you. It's your name here until you swap first names."
        submitLabel="Next"
        submitting={saving}
        error={hint ?? (error ? profileErrorMessage(error) : null)}
      >
        <div className="flex flex-col gap-2.5">
          <label htmlFor="nickname" className="sr-only">
            Nickname
          </label>
          <input
            id="nickname"
            maxLength={30}
            autoComplete="off"
            {...register('nickname')}
            className="h-14 rounded-[14px] border-2 border-field bg-surface px-4 font-display text-xl font-bold text-text focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-muted">Try</span>
            {options.nickname_suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setValue('nickname', name)}
                className="min-h-11 rounded-full border border-border bg-transparent px-3 text-sm font-medium text-text"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 text-base font-bold">
            Your vibe <span className="text-sm font-normal text-muted">· pick one</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {options.vibes.map((vibe) => (
              <Chip key={vibe} type="radio" shape="tile" value={vibe} label={vibe} {...register('vibe')} />
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 text-base font-bold">
            Interests{' '}
            <span className="text-sm font-normal text-muted">
              · {options.min_interests} to {options.max_interests} ({interests.length} picked)
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {choices.map((item) => (
              <Chip
                key={item}
                type="checkbox"
                label={item}
                checked={interests.includes(item)}
                disabled={full && !interests.includes(item)}
                onChange={() => toggle(item)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <label htmlFor="custom-interest" className="sr-only">
              Add your own interest
            </label>
            <input
              id="custom-interest"
              value={custom}
              maxLength={24}
              placeholder="+ Add your own"
              disabled={full}
              onChange={(event) => setCustom(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCustom()
                }
              }}
              className="h-11 min-w-0 flex-1 rounded-full border border-dashed border-border-strong bg-transparent px-3.5 text-sm text-text"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={full || !custom.trim()}
              className="h-11 rounded-full border border-border bg-transparent px-4 text-sm font-semibold text-text disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </fieldset>
      </StepLayout>
    </form>
  )
}
