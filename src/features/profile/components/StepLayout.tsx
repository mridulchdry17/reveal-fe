import type { ReactNode } from 'react'

import { AlertIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { StepProgress } from '@/components/StepProgress'

import { previousStep, stepNumber, stepPath, type Step } from '../utils/steps'

type Props = {
  step: Step
  /** Overrides the default back arrow (to the previous screen), e.g. to go back one guess card. */
  onBack?: () => void
  /** The heading's plain words; with `accent` this is the heading's accessible name. */
  title: string
  /** Words after the title, in italic terracotta: "Give yourself a" + "nickname". */
  accent?: string
  subtitle?: ReactNode
  children: ReactNode
  /** The main button's words; leave out to show only `secondary`. */
  submitLabel?: string
  submitting: boolean
  error?: string | null
  /** A quieter action under the main button, like "Skip for now". */
  secondary?: ReactNode
}

/** "Step n of 7": header, progress, title, the form's fields, and the submit button. */
export function StepLayout({
  step,
  onBack,
  title,
  accent,
  subtitle,
  children,
  submitLabel,
  submitting,
  error,
  secondary,
}: Props) {
  const previous = previousStep(step)
  const back = onBack ? { onClick: onBack } : previous ? { to: stepPath(previous) } : undefined
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 overflow-x-clip px-5 pt-3 pb-8">
      <StepProgress step={stepNumber(step)} back={back} />
      <div className="rise">
        <ScreenHeader title={title} accent={accent} subtitle={subtitle} />
      </div>
      {children}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        {error && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        {submitLabel && (
          <button
            type="submit"
            disabled={submitting}
            className="h-[54px] rounded-full border-0 bg-accent text-base font-bold text-on-accent transition-transform duration-150 active:scale-[0.97] disabled:opacity-60"
          >
            {submitting ? 'Saving…' : submitLabel}
          </button>
        )}
        {secondary}
      </div>
    </div>
  )
}
