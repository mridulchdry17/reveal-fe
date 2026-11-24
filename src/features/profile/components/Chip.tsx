import type { InputHTMLAttributes } from 'react'

import { CheckIcon } from '@/components/icons'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type: 'checkbox' | 'radio'
  label: string
  /** Pills for tags; tiles for a grid of bigger choices. */
  shape?: 'pill' | 'tile'
}

/**
 * A real checkbox or radio, styled as a chip so it stays keyboard- and screen-reader-friendly.
 * Picked = filled ink with a check, so it reads without colour.
 */
export function Chip({ label, shape = 'pill', className = '', ...input }: Props) {
  const box =
    shape === 'pill'
      ? 'min-h-11 rounded-full px-4 text-sm'
      : 'min-h-14 justify-center rounded-[18px] px-3 text-center text-[15px]'
  return (
    <label
      className={`group flex cursor-pointer items-center gap-1.5 border-[1.5px] border-border bg-surface font-semibold text-text transition-transform duration-150 active:scale-[0.97] has-checked:border-text has-checked:bg-text has-checked:text-bg has-disabled:cursor-not-allowed has-disabled:opacity-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${box} ${className}`}
    >
      <input {...input} className="sr-only" />
      <CheckIcon className="hidden size-3.5 shrink-0 group-has-checked:block" />
      {label}
    </label>
  )
}
