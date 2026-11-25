import { useId } from 'react'

import { AlertIcon, CloseIcon } from '@/components/icons'
import { guessKindLabels } from '@/utils/cardLabels'

import type { GuessCard, GuessResult } from '../api/chats'

type Props = {
  card: GuessCard
  /** The answer this tap got back, until the reloaded thread carries it. */
  result: GuessResult | undefined
  /** A right guess opens a piece of their photo (we both have one). */
  piecesReward: boolean
  pending: boolean
  error?: string
  onPick: (index: number) => void
  onClose: () => void
}

/** One of their guess cards, docked above the message box: one try, then their answer. */
export function GuessPanel({ card, result, piecesReward, pending, error, onPick, onClose }: Props) {
  const questionId = useId()
  const answer = card.answer ?? result?.answer ?? null
  const picked = card.picked ?? result?.picked ?? null
  const answered = answer !== null
  const right = answered && picked === answer

  return (
    <section
      aria-label="Guess"
      className="rise flex flex-col gap-2.5 rounded-[20px] border border-border bg-surface p-4 shadow-[0_-6px_24px_rgb(40_20_10/0.08)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          {guessKindLabels[card.kind]}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-my-2 -mr-2 flex size-11 items-center justify-center border-0 bg-transparent text-muted"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <p id={questionId} className="m-0 font-display text-[22px] leading-[1.15]">
        {card.question}
      </p>
      <div role="radiogroup" aria-labelledby={questionId} className="flex flex-col gap-1.5">
        {card.options.map((option, i) => {
          const isAnswer = answered && i === answer
          const isPick = i === picked
          // A hint already ruled this one out.
          const struck = !answered && card.struck === i
          const tag = isAnswer ? (isPick ? 'Your guess · their answer' : 'Their answer') : isPick ? 'Your guess' : ''
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isPick}
              disabled={answered || pending || struck}
              onClick={() => onPick(i)}
              className={`flex min-h-11 items-center gap-2.5 rounded-[12px] px-3.5 text-left text-sm ${
                isAnswer
                  ? 'border-[1.5px] border-open bg-open-bg font-semibold text-open'
                  : isPick
                    ? 'border-[1.5px] border-dashed border-text bg-transparent text-muted'
                    : 'border border-field bg-transparent text-text disabled:text-muted'
              }`}
            >
              <span className={`flex-1 ${struck ? 'line-through' : ''}`}>{option}</span>
              {tag && <span className="text-xs font-semibold">{tag}</span>}
            </button>
          )
        })}
      </div>
      {answered && (
        <p role="status" className={`m-0 text-[13px] font-medium ${right ? 'text-open' : 'text-muted'}`}>
          {right
            ? piecesReward
              ? 'Right. One more piece of their photo (up to 6).'
              : 'Right. You read them well.'
            : "Not quite. Now you've got something to ask about."}
        </p>
      )}
      {error && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </section>
  )
}
