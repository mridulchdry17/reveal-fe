import { Link } from 'react-router'

import { guessKindLabels } from '@/utils/cardLabels'

import { useMyProfile } from '../hooks/useProfile'
import { guessStat } from '../utils/myCards'
import { stepPath } from '../utils/steps'

/** My three guess cards: the question and how often people get it right. Rendered in the You tab. */
export function GuessCardsSection() {
  const profile = useMyProfile()
  if (!profile.data) return null
  const cards = profile.data.guess_cards

  return (
    <section aria-labelledby="guess-cards-title" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="guess-cards-title" className="m-0 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Your guess cards
        </h2>
        <Link
          to={stepPath('guesses')}
          aria-label={cards.length === 0 ? 'Add guess cards' : 'Edit guess cards'}
          className="flex min-h-11 items-center text-sm font-semibold text-accent-text no-underline"
        >
          {cards.length === 0 ? 'Add' : 'Edit'}
        </Link>
      </div>
      <p className="m-0 -mt-2 text-xs text-muted">
        People guess these before you match. Each right guess sharpens your blurred photo for them, a little.
      </p>

      {cards.length === 0 ? (
        <p className="m-0 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          None yet. Add three so people have something to guess.
        </p>
      ) : (
        <ol aria-label="Your guess cards" className="m-0 flex list-none flex-col gap-2 p-0">
          {cards.map((card, i) => (
            <li key={card.id} className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {String(i + 1).padStart(2, '0')} · {guessKindLabels[card.kind]}
                </span>
                <span className="shrink-0 text-xs text-muted">{guessStat(card)}</span>
              </span>
              <span className="font-display text-[18px] leading-[1.2] font-normal">{card.question}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
