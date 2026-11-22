import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { LockIcon } from '@/components/icons'

import type { Card, CardsUpdate, LookingFor, MyProfile, ProfileOptions } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { branchSuggestions, yearLabels } from '../utils/labels'
import { stepPath } from '../utils/steps'
import { StepLayout } from './StepLayout'

type CardState = 'shown' | 'hidden' | 'soon' | 'sealed'

type Props = {
  profile: MyProfile
  options: ProfileOptions
  onSave: (values: CardsUpdate) => void
  saving: boolean
  error: unknown
}

type Values = {
  branch: string
  year: string
  hometown: string
  looking_for: LookingFor | ''
}

const inputClass =
  'h-12 w-full rounded-xl border-[1.5px] border-field bg-surface px-3 text-[15px] text-text focus:border-text focus:outline-none'

export function CardsForm({ profile, options, onSave, saving, error }: Props) {
  const { register, handleSubmit, control } = useForm<Values>({
    defaultValues: {
      branch: profile.branch ?? '',
      year: profile.year ? String(profile.year) : '',
      hometown: profile.hometown ?? '',
      looking_for: profile.looking_for ?? '',
    },
  })
  const [hint, setHint] = useState<string | null>(null)
  const v = useWatch({ control })
  const lookingForLabel = options.looking_for.find((o) => o.value === v.looking_for)?.label

  const cards: { card: Card; title: string; detail: string; state: CardState }[] = [
    { card: 'first_name', title: 'First name', detail: profile.first_name || 'From your Google account', state: 'hidden' },
    { card: 'branch', title: 'Branch', detail: [v.branch, v.year && yearLabels[Number(v.year) - 1]].filter(Boolean).join(' · ') || 'Fill in above', state: 'hidden' },
    { card: 'hometown', title: 'Hometown', detail: v.hometown || 'Fill in above', state: 'hidden' },
    { card: 'looking_for', title: 'Looking for', detail: lookingForLabel ?? 'Fill in above', state: 'shown' },
    { card: 'voice', title: 'Voice note', detail: 'Optional · record a short clip, later', state: 'soon' },
    { card: 'photo', title: 'Photo', detail: 'Adding photos comes soon', state: 'sealed' },
    { card: 'contact', title: 'Instagram or phone', detail: profile.contact ? 'Added · the last swap' : 'Optional · add it from the You tab', state: 'sealed' },
  ]  // prettier-ignore

  const submit = handleSubmit((values) => {
    if (values.branch.trim().length < 2) return setHint('Add your branch.')
    if (!values.year) return setHint('Pick your year.')
    if (values.hometown.trim().length < 2) return setHint('Add your hometown.')
    if (!values.looking_for) return setHint("Pick what you're looking for.")
    setHint(null)
    onSave({
      branch: values.branch.trim(),
      year: Number(values.year),
      hometown: values.hometown.trim(),
      looking_for: values.looking_for,
    })
  })

  return (
    <form onSubmit={submit} noValidate>
      <StepLayout
        step={3}
        backTo={stepPath('prompts')}
        title="Your 7 cards"
        subtitle="Everyone sees what you're looking for. The rest stay hidden until you both agree to swap."
        submitLabel="Next"
        submitting={saving}
        error={hint ?? (error ? profileErrorMessage(error) : null)}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold sm:col-span-1">
            Branch
            <input list="branches" maxLength={40} {...register('branch')} className={`${inputClass} font-normal`} />
            <datalist id="branches">
              {branchSuggestions.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold sm:col-span-1">
            Year
            <select {...register('year')} className={`${inputClass} font-normal`}>
              <option value="">Pick one</option>
              {yearLabels.map((label, i) => (
                <option key={label} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
            Hometown
            <input maxLength={60} placeholder="Jaipur, Rajasthan" {...register('hometown')} className={`${inputClass} font-normal`} />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 text-sm font-semibold">
            Looking for
            <select {...register('looking_for')} className={`${inputClass} font-normal`}>
              <option value="">Pick one</option>
              {options.looking_for.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ol aria-label="Your cards" className="m-0 flex list-none flex-col gap-2 p-0">
          {cards.map(({ card, title, detail, state }, i) => (
            <li
              key={card}
              className={`flex items-center gap-3 rounded-[14px] border border-border px-3.5 py-3 ${state === 'shown' || state === 'hidden' ? 'bg-surface' : 'bg-surface-2'}`}
            >
              <span aria-hidden="true" className="w-6 text-[13px] text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-bold">{title}</span>
                <span className="truncate text-[13px] text-muted">{detail}</span>
              </span>
              <CardBadge state={state} />
            </li>
          ))}
        </ol>
      </StepLayout>
    </form>
  )
}

function CardBadge({ state }: { state: CardState }) {
  switch (state) {
    case 'shown':
      return <span className="rounded-full bg-open-bg px-3 py-1.5 text-[13px] font-bold text-open">Shown</span>
    case 'hidden':
      return (
        <span className="hatch rounded-full border border-dashed border-locked px-3 py-1.5 text-[13px] font-medium text-locked">
          Hidden
        </span>
      )
    case 'soon':
      return <span className="rounded-full bg-surface px-2.5 py-1.5 text-[13px] font-medium text-muted">Coming soon</span>
    case 'sealed':
      return (
        <span className="flex items-center gap-1 rounded-full bg-locked-bg px-2.5 py-1.5 text-[13px] font-medium text-locked">
          <LockIcon className="size-3.5" />
          Swap only
        </span>
      )
  }
}
