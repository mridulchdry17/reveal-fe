import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { Gender, InterestedIn, MatchOn, MyProfile, PreferencesUpdate } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { genderLabels, interestedInLabels, matchOnLabels } from '../utils/labels'
import { stepPath } from '../utils/steps'
import { Chip } from './Chip'
import { StepLayout } from './StepLayout'

type Props = {
  profile: MyProfile
  onSave: (values: PreferencesUpdate) => void
  saving: boolean
  error: unknown
}

type Values = {
  gender: Gender | ''
  interested_in: InterestedIn | ''
  match_on: MatchOn[]
}

/** One choice from three, as big tap tiles. */
function Tiles<T extends string>({
  legend,
  name,
  labels,
  register,
}: {
  legend: string
  name: 'gender' | 'interested_in'
  labels: Record<T, string>
  register: ReturnType<typeof useForm<Values>>['register']
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2.5 font-display text-[24px] leading-none font-normal">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(labels) as [T, string][]).map(([value, label]) => (
          <Chip key={value} type="radio" shape="tile" value={value} label={label} {...register(name)} />
        ))}
      </div>
    </fieldset>
  )
}

export function PreferencesForm({ profile, onSave, saving, error }: Props) {
  const { register, handleSubmit } = useForm<Values>({
    defaultValues: {
      gender: profile.gender ?? '',
      interested_in: profile.interested_in ?? '',
      match_on: profile.match_on,
    },
  })
  const [hint, setHint] = useState<string | null>(null)

  const submit = handleSubmit((values) => {
    if (!values.gender) return setHint('Tell us who you are.')
    if (!values.interested_in) return setHint('Pick who you want to see.')
    setHint(null)
    onSave({
      gender: values.gender,
      interested_in: values.interested_in,
      match_on: values.match_on,
    })
  })

  return (
    <form onSubmit={submit} noValidate>
      <StepLayout
        step={5}
        backTo={stepPath('cards')}
        title="Who should we"
        accent="show you?"
        subtitle="Tell us who you are and who you'd like to meet. Tap one of each."
        submitLabel="Finish profile"
        submitting={saving}
        error={hint ?? (error ? profileErrorMessage(error) : null)}
      >
        <Tiles legend="I am" name="gender" labels={genderLabels} register={register} />
        <Tiles legend="Interested in" name="interested_in" labels={interestedInLabels} register={register} />

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2.5 font-display text-[24px] leading-none font-normal">
            Match me on <span className="font-sans text-sm text-muted">· optional</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(matchOnLabels) as [MatchOn, string][]).map(([value, label]) => (
              <Chip key={value} type="checkbox" value={value} label={label} {...register('match_on')} />
            ))}
          </div>
        </fieldset>
      </StepLayout>
    </form>
  )
}
