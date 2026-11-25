import { Link } from 'react-router'

import { ChevronRightIcon } from '@/components/icons'

import type { PublicProfile } from '../api/drops'

type Props = {
  to: string
  nickname: string
  cards: PublicProfile['guess_cards']
  /** A right guess sharpens their photo (we both have one). */
  sharpens: boolean
}

/** On a drop profile: how far I've got with their cards, and the way into the guess game. */
export function GuessInvite({ to, nickname, cards, sharpens }: Props) {
  const guessed = cards.filter((c) => c.answer !== null).length
  const right = cards.filter((c) => c.answer !== null && c.picked === c.answer).length
  const done = guessed === cards.length
  const label = done ? `See how you did on ${nickname}'s cards` : `Guess ${nickname}'s cards`

  return (
    <Link
      to={to}
      aria-label={label}
      className="flex items-center gap-4 rounded-[22px] bg-text px-4 py-4 text-bg no-underline transition-transform duration-150 active:scale-[0.99]"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[11px] font-bold tracking-[0.14em] text-peach uppercase">
          {done ? `${right} of ${cards.length} right` : `${guessed} of ${cards.length} guessed`}
        </span>
        <span className="font-display text-[24px] leading-[1.05]">
          {done ? 'See how you did' : guessed > 0 ? 'Keep guessing' : `Guess their ${cards.length} cards`}
        </span>
        <span className="text-[13px] text-bg/75">
          {sharpens ? 'One try each. Every right guess sharpens their photo.' : 'One try each. Instant conversation starter.'}
        </span>
      </span>
      <ChevronRightIcon className="size-5 shrink-0" />
    </Link>
  )
}
