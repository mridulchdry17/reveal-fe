import { useId } from 'react'

import { AlertIcon, CheckIcon } from '@/components/icons'
import { ApiError } from '@/lib/api/errors'
import { guessKindLabels } from '@/utils/cardLabels'

import type { GuessCard, GuessResult } from '../api/guesses'
import { useGuess } from '../hooks/useGuess'
import { guessCopy, type PhotoReward } from '../utils/copy'
import { guessErrorMessage } from '../utils/errorMessage'

export type GuessCardsProps = {
  cards: GuessCard[]
  rightGuesses: number
  /** What a right guess does to their photo here; null when it does nothing. */
  reward: PhotoReward
  /** Heading: "Guess them", "Guess first". */
  title?: string
  /** A guess landed: update what the screen shows (cards, right guesses, photo). */
  onGuessed: (cardId: string, result: GuessResult) => void
  /** The card changed or was already guessed elsewhere: reload the profile. */
  onStale: () => void
}

/** Their guess cards: one tap per card, then the true answer and what it changed. */
export function GuessCards({ cards, rightGuesses, reward, title = 'Guess them', onGuessed, onStale }: GuessCardsProps) {
  const headingId = useId()
  if (cards.length === 0) return null
  const copy = guessCopy[reward ?? 'none']
  const guessed = cards.filter((c) => c.answer !== null).length

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <h3 id={headingId} className="m-0 font-display text-[28px] leading-none font-normal">
          {title}
        </h3>
        <span className="flex flex-col items-end gap-1.5">
          <span
            role="img"
            aria-label={`${guessed} of ${cards.length} guessed`}
            className="flex gap-1"
          >
            {cards.map((c) => (
              <span
                key={c.id}
                className={`h-1.5 w-[18px] rounded-full ${
                  c.answer === null ? 'bg-border-strong/50' : c.picked === c.answer ? 'bg-open' : 'bg-text'
                }`}
              />
            ))}
          </span>
          <span className="text-xs font-semibold text-muted">
            {rightGuesses} of {cards.length} right
          </span>
        </span>
      </div>
      <p className="m-0 px-1 text-[13px] leading-5 text-muted">{copy.hint}</p>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {cards.map((card) => (
          <GuessCardItem key={card.id} card={card} copy={copy} onGuessed={onGuessed} onStale={onStale} />
        ))}
      </ol>
    </section>
  )
}

type ItemProps = {
  card: GuessCard
  copy: (typeof guessCopy)[keyof typeof guessCopy]
  onGuessed: GuessCardsProps['onGuessed']
  onStale: GuessCardsProps['onStale']
}

function GuessCardItem({ card, copy, onGuessed, onStale }: ItemProps) {
  const guess = useGuess()
  const questionId = useId()
  // The server's answer once the screen has it; until then, the one this tap got back.
  const answer = card.answer ?? guess.data?.answer ?? null
  const picked = card.picked ?? guess.data?.picked ?? null

  const pick = (index: number) =>
    guess.mutate(
      { cardId: card.id, pick: index },
      {
        onSuccess: (result) => onGuessed(card.id, result),
        onError: (error) => {
          if (error instanceof ApiError && ['already_guessed', 'guess_card_not_found'].includes(error.code)) onStale()
        },
      },
    )

  return (
    <li className="flex flex-col gap-3 rounded-[22px] border border-border bg-bg px-4 pt-4 pb-4">
      <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        {guessKindLabels[card.kind]}
      </span>
      <span id={questionId} className="font-display text-[24px] leading-[1.1] font-normal">
        {card.question}
      </span>

      {answer === null ? (
        <div role="group" aria-labelledby={questionId} className="flex flex-col gap-2">
          {card.options.map((option, i) => (
            <button
              key={option}
              type="button"
              disabled={guess.isPending}
              onClick={() => pick(i)}
              className="min-h-12 rounded-[18px] border-[1.5px] border-field bg-surface px-4 py-2.5 text-left text-[15px] font-semibold text-text transition-transform duration-150 active:scale-[0.98] disabled:opacity-60"
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <>
          <ul aria-label={`Answers to "${card.question}"`} className="m-0 flex list-none flex-col gap-2 p-0">
            {card.options.map((option, i) => {
              const isTrue = i === answer
              const mine = i === picked
              return (
                <li
                  key={option}
                  className={`flex min-h-12 items-center justify-between gap-2 rounded-[18px] px-4 py-2.5 text-[15px] ${
                    isTrue
                      ? 'border-[1.5px] border-open bg-open-bg font-semibold text-open'
                      : mine
                        ? 'border-[1.5px] border-dashed border-text text-text'
                        : 'border border-border text-muted'
                  }`}
                >
                  <span>{option}</span>
                  {isTrue ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold">
                      <CheckIcon className="size-3.5" />
                      True{mine && ' · your pick'}
                    </span>
                  ) : (
                    mine && <span className="shrink-0 text-xs font-bold">Your pick · Nope</span>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="m-0 text-sm font-semibold">{picked === answer ? copy.right : copy.wrong}</p>
        </>
      )}

      {guess.isError && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {guessErrorMessage(guess.error)}
        </p>
      )}
    </li>
  )
}
