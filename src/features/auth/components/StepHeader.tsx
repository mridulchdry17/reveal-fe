import type { ReactNode } from 'react'

type Props = {
  /** Back or Sign out, on the left. */
  left: ReactNode
  step: 1 | 2 | 3
}

/** "Step 1 of 3" with segmented progress bars, shared by the verification screens. */
export function StepHeader({ left, step }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <header className="flex h-11 items-center justify-between">
        {left}
        <span className="text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
          Step {step} of 3
        </span>
      </header>
      <div aria-hidden="true" className="flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1 flex-1 rounded-full ${n <= step ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>
    </div>
  )
}
