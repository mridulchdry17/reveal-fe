import type { CSSProperties, ReactNode } from 'react'

const tones = {
  peach: 'bg-peach text-text',
  white: 'bg-white text-text',
  forest: 'bg-forest text-white',
  ink: 'bg-text text-bg',
} as const

type Props = {
  children: ReactNode
  tone?: keyof typeof tones
  /** Degrees. Small: -8 to 8. */
  tilt?: number
  className?: string
}

/**
 * A tilted label that gently floats, like a sticker on a laptop. Decoration only: hidden from
 * screen readers, so never put information here that isn't also on the page.
 */
export function Sticker({ children, tone = 'peach', tilt = -6, className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`float inline-block rounded-xl px-3 py-1.5 text-[11px] font-bold tracking-[0.06em] whitespace-nowrap uppercase ${tones[tone]} ${className}`}
      style={{ '--r': `${tilt}deg` } as CSSProperties}
    >
      {children}
    </span>
  )
}
