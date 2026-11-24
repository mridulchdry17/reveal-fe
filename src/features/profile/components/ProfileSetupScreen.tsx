import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { Wordmark } from '@/components/Wordmark'

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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg text-text">
        <Wordmark className="text-[40px]" />
        <p role="status" className="m-0 text-sm text-muted">
          Loading…
        </p>
      </div>
    )
  }
  if (profile.isError || options.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
        <p className="m-0 font-display text-[36px] leading-none">
          Hmm, <em className="text-accent-text">that didn't load.</em>
        </p>
        <p role="alert" className="m-0 flex max-w-[32ch] gap-2 text-left text-sm text-muted">
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-accent-text" />
          {profileErrorMessage(profile.error ?? options.error)}
        </p>
        <button
          type="button"
          onClick={() => {
            void profile.refetch()
            void options.refetch()
          }}
          className="h-12 rounded-full border-0 bg-text px-6 text-sm font-bold text-bg"
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
