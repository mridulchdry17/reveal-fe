import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { CheckIcon, LockIcon } from '@/components/icons'

import type { Card, CardsUpdate, LookingFor, MyProfile, ProfileOptions } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { branchSuggestions, yearLabels } from '../utils/labels'
import { StepLayout } from './StepLayout'

type CardState = 'shown' | 'hidden' | 'optional' | 'sealed'

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
  'h-12 w-full rounded-2xl border-[1.5px] border-field bg-surface px-3.5 text-[15px] text-text focus:border-text focus:outline-none'

/** A slight, alternating tilt so the cards look dealt rather than listed. */
const tilts = ['-rotate-[1.5deg]', 'rotate-[1.2deg]', '-rotate-1', 'rotate-[1.5deg]', '-rotate-[1.2deg]', 'rotate-1', '-rotate-[0.8deg]']

const cardTone: Record<CardState, string> = {
  shown: 'border-[1.5px] border-open bg-surface text-text',
  hidden: 'hatch border-[1.5px] border-dashed border-locked text-text',
  optional: 'border-[1.5px] border-dashed border-border-strong bg-surface-2 text-text',
  sealed: 'bg-night text-white',
}

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
    { card: 'voice', title: 'Voice note', detail: profile.voice_seconds ? `Added · ${profile.voice_seconds}s · opens by swap` : 'Optional · record it from the You tab', state: profile.voice_seconds ? 'hidden' : 'optional' },
    { card: 'photo', title: 'Photo', detail: profile.has_photo ? 'Added · opens by swap' : 'Optional · add it from the You tab', state: 'sealed' },
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
        step="cards"
        title="Your 7"
        accent="cards"
        subtitle="Same layout for everyone, nothing to decide. What you're looking for is shown; the rest open only when you both swap."
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

        <ol aria-label="Your cards" className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-3.5 p-0">
          {cards.map(({ card, title, detail, state }, i) => (
            <li
              key={card}
              className={`flex min-h-[124px] flex-col justify-between gap-3 rounded-[20px] p-3.5 shadow-[0_10px_24px_rgb(40_20_10/0.08)] ${cardTone[state]} ${tilts[i]} ${i === cards.length - 1 ? 'col-span-2' : ''}`}
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-display text-[21px] leading-none font-normal">{title}</span>
                <span className={`line-clamp-2 text-[13px] leading-[1.35] ${state === 'sealed' ? 'text-white/80' : 'text-muted'}`}>
                  {detail}
                </span>
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
  const base = 'flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold'
  switch (state) {
    case 'shown':
      return (
        <span className={`${base} bg-open-bg text-open`}>
          <CheckIcon className="size-3" />
          Shown
        </span>
      )
    case 'hidden':
      return <span className={`${base} bg-surface text-locked`}>Hidden</span>
    case 'optional':
      return <span className={`${base} bg-surface text-muted`}>Optional</span>
    case 'sealed':
      return (
        <span className={`${base} bg-white/10 text-peach`}>
          <LockIcon className="size-3.5" />
          Swap only
        </span>
      )
  }
}
