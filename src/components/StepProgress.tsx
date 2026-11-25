import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { BackIcon } from '@/components/icons'
import { ONBOARDING_STEPS } from '@/config/onboarding'

type Props = {
  step: number
  /** A back arrow to a path, a back arrow with a handler, or anything else (e.g. Sign out). */
  back?: { to: string } | { onClick: () => void } | { node: ReactNode }
}

const arrow =
  '-ml-2.5 flex size-11 items-center justify-center rounded-full border-0 bg-transparent text-text no-underline'

/** "STEP n OF 7" with progress dashes and a back arrow: the header of every onboarding screen. */
export function StepProgress({ step, back }: Props) {
  let left: ReactNode = <span />
  if (back && 'to' in back) {
    left = (
      <Link to={back.to} aria-label="Back" className={arrow}>
        <BackIcon className="size-[22px]" />
      </Link>
    )
  } else if (back && 'onClick' in back) {
    left = (
      <button type="button" aria-label="Back" onClick={back.onClick} className={arrow}>
        <BackIcon className="size-[22px]" />
      </button>
    )
  } else if (back) {
    left = back.node
  }
  return (
    <div className="flex flex-col gap-2">
      <header className="flex h-11 items-center justify-between">
        {left}
        <span className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
          Step {step} of {ONBOARDING_STEPS}
        </span>
      </header>
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: ONBOARDING_STEPS }, (_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>
    </div>
  )
}
