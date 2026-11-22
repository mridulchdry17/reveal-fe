import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'

import {
  useMyProfile,
  useProfileOptions,
  useSaveBasics,
  useSaveCards,
  useSavePreferences,
  useSavePrompts,
} from '../hooks/useProfile'
import { profileErrorMessage } from '../utils/errorMessage'
import { stepPath, steps, type Step } from '../utils/steps'
import { BasicsForm } from './BasicsForm'
import { CardsForm } from './CardsForm'
import { PreferencesForm } from './PreferencesForm'
import { PromptsForm } from './PromptsForm'

const isStep = (value: string | undefined): value is Step => steps.some((s) => s === value)

/** The four profile screens. Each saves on Next, so leaving halfway keeps what's done. */
export function ProfileSetupScreen() {
  const { step } = useParams()
  const navigate = useNavigate()
  const profile = useMyProfile()
  const options = useProfileOptions()
  const basics = useSaveBasics()
  const prompts = useSavePrompts()
  const cards = useSaveCards()
  const preferences = useSavePreferences()

  // Each screen starts at the top, not where the last one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  if (!isStep(step)) return <Navigate to={stepPath('basics')} replace />

  if (profile.isPending || options.isPending) {
    return (
      <p role="status" className="m-0 flex min-h-dvh items-center justify-center bg-bg text-sm text-muted">
        Loading…
      </p>
    )
  }
  if (profile.isError || options.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <p role="alert" className="m-0 text-sm">
          {profileErrorMessage(profile.error ?? options.error)}
        </p>
        <button
          type="button"
          onClick={() => {
            void profile.refetch()
            void options.refetch()
          }}
          className="h-11 rounded-full border-[1.5px] border-border-strong bg-transparent px-5 text-sm font-semibold text-text"
        >
          Try again
        </button>
      </div>
    )
  }

  const next = (current: Step) => {
    const after = steps[steps.indexOf(current) + 1]
    navigate(after ? stepPath(after) : '/app', { replace: !after })
  }

  return (
    <div className="min-h-dvh bg-bg text-text">
      {step === 'basics' && (
        <BasicsForm
          profile={profile.data}
          options={options.data}
          onSave={(v) => basics.mutate(v, { onSuccess: () => next('basics') })}
          saving={basics.isPending}
          error={basics.error}
        />
      )}
      {step === 'prompts' && (
        <PromptsForm
          profile={profile.data}
          options={options.data}
          onSave={(v) => prompts.mutate(v, { onSuccess: () => next('prompts') })}
          saving={prompts.isPending}
          error={prompts.error}
        />
      )}
      {step === 'cards' && (
        <CardsForm
          profile={profile.data}
          options={options.data}
          onSave={(v) => cards.mutate(v, { onSuccess: () => next('cards') })}
          saving={cards.isPending}
          error={cards.error}
        />
      )}
      {step === 'preferences' && (
        <PreferencesForm
          profile={profile.data}
          onSave={(v) => preferences.mutate(v, { onSuccess: () => next('preferences') })}
          saving={preferences.isPending}
          error={preferences.error}
        />
      )}
    </div>
  )
}
