import { Link } from 'react-router'

import { CheckIcon } from '@/components/icons'
import { guessKindLabels } from '@/utils/cardLabels'

import { useMyProfile } from '../hooks/useProfile'
import { stepPath } from '../utils/steps'

/** My three guess cards with the true answer marked. Rendered in the You tab. */
export function GuessCardsSection() {
  const profile = useMyProfile()
  if (!profile.data) return null
  const cards = profile.data.guess_cards

  return (
    <section
      aria-labelledby="guess-cards-title"
      className="flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 id="guess-cards-title" className="m-0 font-display text-[28px] leading-none font-normal">
          Your guess cards
        </h2>
        <p className="m-0 text-sm text-muted">
          People guess these before you match. Each right guess sharpens your blurred photo for them, a little.
        </p>
      </div>

      {cards.length === 0 ? (
        <p className="m-0 text-sm text-muted">None yet. Add three so people have something to guess.</p>
      ) : (
        <ol aria-label="Your guess cards" className="m-0 flex list-none flex-col gap-2 p-0">
          {cards.map((card) => (
            <li key={card.id} className="flex flex-col gap-1.5 rounded-[20px] border border-border bg-bg px-4 py-3">
              <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                {guessKindLabels[card.kind]}
              </span>
              <span className="font-display text-[22px] leading-[1.1] font-normal">{card.question}</span>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {card.options.map((option, i) =>
                  i === card.answer ? (
                    <li
                      key={option}
                      className="flex items-center gap-1 rounded-full bg-open-bg px-3 py-1.5 text-[13px] font-semibold text-open"
                    >
                      <CheckIcon className="size-3.5" />
                      {option}
                      <span className="font-normal"> · True</span>
                    </li>
                  ) : (
                    <li key={option} className="rounded-full border border-border px-3 py-1.5 text-[13px] text-muted">
                      {option}
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
        </ol>
      )}

      <Link
        to={stepPath('guesses')}
        className="flex h-11 w-fit items-center rounded-full bg-text px-5 text-sm font-bold text-bg no-underline"
      >
        {cards.length === 0 ? 'Add guess cards' : 'Edit guess cards'}
      </Link>
    </section>
  )
}
