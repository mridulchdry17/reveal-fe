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
        step="basics"
        title="Give yourself a"
        accent="nickname"
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
            className="h-[72px] rounded-[24px] border-2 border-field bg-surface px-5 font-display text-[34px] font-normal text-text focus:border-accent focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-muted">Try</span>
            {options.nickname_suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setValue('nickname', name)}
                className="min-h-11 rounded-full border-[1.5px] border-dashed border-border-strong bg-transparent px-3.5 font-display text-[17px] font-normal text-text italic"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 font-display text-[24px] leading-none font-normal">
            Your vibe <span className="font-sans text-sm text-muted">· pick one</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {options.vibes.map((vibe) => (
              <Chip key={vibe} type="radio" shape="tile" value={vibe} label={vibe} {...register('vibe')} />
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 font-display text-[24px] leading-none font-normal">
            Interests{' '}
            <span className="font-sans text-sm text-muted">
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
              className="h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-dashed border-border-strong bg-transparent px-4 text-sm text-text placeholder:text-muted"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={full || !custom.trim()}
              className="h-11 rounded-full border-0 bg-text px-5 text-sm font-bold text-bg disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </fieldset>
      </StepLayout>
    </form>
  )
}
