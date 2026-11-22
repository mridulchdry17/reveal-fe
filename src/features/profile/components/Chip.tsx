import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type: 'checkbox' | 'radio'
  label: string
  /** Pills for tags; tiles for a grid of bigger choices. */
  shape?: 'pill' | 'tile'
}

/** A real checkbox or radio, styled as a chip so it stays keyboard- and screen-reader-friendly. */
export function Chip({ label, shape = 'pill', className = '', ...input }: Props) {
  const box =
    shape === 'pill'
      ? 'min-h-11 rounded-full px-3.5 text-sm'
      : 'h-12 justify-center rounded-2xl px-3 text-[15px]'
  return (
    <label
      className={`flex cursor-pointer items-center border border-border bg-transparent font-medium text-text has-checked:border-accent has-checked:bg-accent-bg has-checked:text-accent-text has-disabled:cursor-not-allowed has-disabled:opacity-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${box} ${className}`}
    >
      <input {...input} className="sr-only" />
      {label}
    </label>
  )
}
