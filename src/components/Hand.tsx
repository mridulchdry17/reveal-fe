import type { CSSProperties } from 'react'

import { LockIcon } from './icons'

export type HandCard = {
  label: string
  state: 'shown' | 'hidden' | 'sealed'
  /** Shown cards flip face-up in this order after being dealt. */
  flipOrder?: number
  /** A hidden card that lifts now and then, as if asking to be swapped. */
  peek?: boolean
}

type Props = {
  cards: HandCard[]
  /** Describes the whole hand for screen readers; the cards themselves are decorative. */
  label: string
}

/** The brand's signature: a fan of profile cards, some shown, some hidden. */
export function Hand({ cards, label }: Props) {
  const middle = (cards.length - 1) / 2

  return (
    <ul role="img" aria-label={label} className="hand m-0 mx-auto list-none p-0">
      {cards.map((card, index) => (
        <li
          key={card.label}
          aria-hidden="true"
          className="hand-card"
          style={{ '--k': index - middle, '--i': index, '--n': card.flipOrder ?? 0 } as CSSProperties}
        >
          <div
            className="card-inner"
            data-flip={card.flipOrder !== undefined ? '' : undefined}
            data-peek={card.peek ? '' : undefined}
          >
            {card.state === 'shown' ? (
              <>
                <ShownFace label={card.label} index={index} />
                <HiddenFace label={card.label} back />
              </>
            ) : (
              <HiddenFace label={card.label} sealed={card.state === 'sealed'} />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function ShownFace({ label, index }: { label: string; index: number }) {
  return (
    <div className="card-face flex flex-col justify-between bg-open p-1.5 text-bg md:p-2">
      <span className="font-display text-[10px] font-extrabold tabular-nums opacity-70 md:text-xs">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex flex-col gap-1">
        <span className="h-1 w-[70%] rounded-full bg-bg/55" />
        <span className="h-1 w-[45%] rounded-full bg-bg/55" />
      </span>
      <span className="text-[10px] leading-none font-bold tracking-[0.06em] uppercase md:text-[11px]">
        {label}
      </span>
    </div>
  )
}

function HiddenFace({ label, sealed = false, back = false }: { label: string; sealed?: boolean; back?: boolean }) {
  return (
    <div
      className={`card-face hatch flex flex-col justify-end border-[1.5px] border-dashed border-border-strong p-1.5 ${
        back ? 'back' : ''
      }`}
    >
      {sealed && (
        <LockIcon className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 text-locked md:size-4" />
      )}
      <span className="text-[10px] leading-none font-bold tracking-[0.06em] text-locked uppercase md:text-[11px]">
        {label}
      </span>
    </div>
  )
}
