import { useId, useState, type ReactNode } from 'react'

import { AlertIcon, BackIcon, CheckIcon, CloseIcon, HeartIcon, SparkleIcon } from '@/components/icons'
import { ApiError } from '@/lib/api/errors'
import { guessKindLabels } from '@/utils/cardLabels'

import type { GuessCard, GuessResult } from '../api/guesses'
import { useGuess } from '../hooks/useGuess'
import { useHint } from '../hooks/useHint'
import { guessCopy, type PhotoReward } from '../utils/copy'
import { guessErrorMessage } from '../utils/errorMessage'
import { firstOpenCard, rightCount, scoreLine } from '../utils/score'

export type GuessGameProps = {
  nickname: string
  /** One line under the name: "Night owl · Books · Films". */
  about: string
  cards: GuessCard[]
  /** Tonight's one hint is already gone. */
  hintUsed: boolean
  /** What a right guess does to their photo here; null when it does nothing. */
  reward: PhotoReward
  /** Their blurred photo (or a plain stand-in), full-bleed behind the game. */
  backdrop: ReactNode
  /** The round heart and the end button: "Like" + "Like an answer" in the drop, "Match" for a like. */
  like: { label: string; cta: string; body: string }
  backLabel: string
  /** Pass or like is on its way. */
  busy: boolean
  error?: string
  onBack: () => void
  onPass: () => void
  onLike: () => void
  /** A guess landed: update what the screen shows (cards, right guesses, photo). */
  onGuessed: (cardId: string, result: GuessResult) => void
  /** The hint struck an option off a card. */
  onHinted: (cardId: string, struck: number) => void
  /** The server says tonight's hint was already used. */
  onHintGone: () => void
  /** The card changed or was already guessed elsewhere: reload the profile. */
  onStale: () => void
}

/**
 * Guess their cards one at a time over their blurred photo: pick, confirm with Guess, see the
 * true answer, move on. One try per card; at the end, how many I got right. Pass and Like are
 * always there, so guessing never gates either.
 */
export function GuessGame(props: GuessGameProps) {
  const { nickname, about, cards, backdrop, like, backLabel, busy, error, onBack, onPass, onLike } = props
  const [index, setIndex] = useState(() => firstOpenCard(cards))
  const total = cards.length
  const done = index >= total
  const card = cards[index]
  const guessed = cards.filter((c) => c.answer !== null)

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden bg-night text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 select-none [-webkit-touch-callout:none]"
        onContextMenu={(event) => event.preventDefault()}
      >
        {backdrop}
        {/* Keeps the name readable over any photo. */}
        <span className="absolute inset-x-0 top-0 h-60 bg-[linear-gradient(rgb(20_12_8/0.6),rgb(20_12_8/0))]" />
      </div>

      <header className="relative px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={backLabel}
            onClick={onBack}
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-white"
          >
            <BackIcon className="size-5" />
          </button>
          <span role="img" aria-label={`${guessed.length} of ${total} guessed`} className="flex flex-1 gap-1.5">
            {cards.map((c) => (
              <span
                key={c.id}
                className={`h-[3px] flex-1 rounded-full ${
                  c.answer === null ? 'bg-white/25' : c.picked === c.answer ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="m-0 font-display text-[42px] leading-none font-normal text-balance">{nickname}</h1>
            {about && <p className="mt-2 mb-0 text-[13px] text-white/90">{about}</p>}
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs">
              <CheckIcon className="size-3" />
              Verified student
            </span>
          </div>
          <div className="flex shrink-0 flex-col gap-3">
            <button
              type="button"
              aria-label={`Pass on ${nickname}`}
              disabled={busy}
              onClick={onPass}
              className="flex size-[50px] items-center justify-center rounded-full border border-white/45 bg-white/20 text-white backdrop-blur-sm transition-transform duration-150 active:scale-90 disabled:opacity-60"
            >
              <CloseIcon className="size-[18px]" />
            </button>
            <button
              type="button"
              aria-label={`${like.label} ${nickname}`}
              disabled={busy}
              onClick={onLike}
              className="flex size-[50px] items-center justify-center rounded-full bg-accent text-on-accent transition-transform duration-150 active:scale-90 disabled:opacity-60"
            >
              <HeartIcon className="size-5 fill-current" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1" />

      <section
        aria-label={done ? 'How you did' : 'Guess'}
        className="relative mx-3 mb-[max(0.875rem,env(safe-area-inset-bottom))] flex flex-col gap-2.5 rounded-[26px] bg-surface p-[18px] text-text shadow-[0_20px_50px_rgb(20_10_5/0.3)]"
      >
        {done || !card ? (
          <Summary
            right={rightCount(cards)}
            total={total}
            like={like}
            busy={busy}
            onPass={onPass}
            onLike={onLike}
          />
        ) : (
          <CardTurn
            key={card.id}
            card={card}
            number={index + 1}
            last={index === total - 1}
            {...props}
            onNext={() => setIndex(index + 1)}
          />
        )}
        {error && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </section>
    </div>
  )
}

type TurnProps = GuessGameProps & {
  card: GuessCard
  number: number
  last: boolean
  onNext: () => void
}

/** One card: pick an option, confirm with Guess, then the true answer and Next card. */
function CardTurn({ card, number, last, hintUsed, reward, onNext, onGuessed, onHinted, onHintGone, onStale }: TurnProps) {
  const questionId = useId()
  const guess = useGuess()
  const hint = useHint()
  const [choice, setChoice] = useState<number | null>(null)
  const copy = guessCopy[reward ?? 'none']
  // The server's answer once the screen has it; until then, the one this guess got back.
  const answer = card.answer ?? guess.data?.answer ?? null
  const picked = card.picked ?? guess.data?.picked ?? null
  const struck = card.struck ?? hint.data?.struck ?? null
  const answered = answer !== null
  const pick = choice === struck ? null : choice
  const failed = guess.error ?? hint.error

  const confirm = () => {
    if (pick === null) return
    guess.mutate(
      { cardId: card.id, pick },
      {
        onSuccess: (result) => onGuessed(card.id, result),
        onError: (e) => {
          if (e instanceof ApiError && ['already_guessed', 'guess_card_not_found'].includes(e.code)) onStale()
        },
      },
    )
  }

  const takeHint = () =>
    hint.mutate(card.id, {
      onSuccess: (result) => onHinted(result.card_id, result.struck),
      onError: (e) => {
        if (e instanceof ApiError && e.code === 'hint_already_used') onHintGone()
        if (e instanceof ApiError && e.code === 'already_guessed') onStale()
      },
    })

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
          {String(number).padStart(2, '0')} · {guessKindLabels[card.kind]}
        </span>
        {reward === 'blur' && (
          <span className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">Sharpens the photo</span>
        )}
      </div>
      <p id={questionId} className="m-0 font-display text-[25px] leading-[1.12] font-normal">
        {card.question}
      </p>
      <div role="radiogroup" aria-labelledby={questionId} className="flex flex-col gap-2">
        {card.options.map((option, i) => {
          const isTrue = answered && i === answer
          const mine = answered && i === picked
          const off = !answered && i === struck
          const chosen = !answered && i === pick
          const tone = isTrue
            ? 'border-open bg-open-bg text-open font-semibold'
            : mine
              ? 'border-accent-text text-accent-text'
              : chosen
                ? 'border-text bg-surface-2'
                : off
                  ? 'border-border text-muted line-through'
                  : 'border-border'
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={answered ? i === picked : chosen}
              disabled={answered || off || guess.isPending}
              onClick={() => setChoice(i)}
              className={`flex min-h-12 items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-2 text-left text-[15px] text-text transition-colors duration-150 disabled:cursor-default ${tone}`}
            >
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-semibold no-underline"
              >
                {'ABC'[i] ?? i + 1}
              </span>
              <span className="flex-1">
                {option}
                {off && <span className="sr-only"> (struck off by your hint)</span>}
              </span>
              {isTrue && <span className="shrink-0 text-xs font-bold">Their answer</span>}
              {mine && !isTrue && <span className="shrink-0 text-xs font-bold">Your guess</span>}
            </button>
          )
        })}
      </div>

      {answered && (
        <p role="status" className={`m-0 text-[13px] font-semibold ${picked === answer ? 'text-open' : 'text-accent-text'}`}>
          {picked === answer ? copy.right : copy.wrong}
        </p>
      )}
      {failed && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {guessErrorMessage(failed)}
        </p>
      )}

      <div className="mt-0.5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={takeHint}
          disabled={hintUsed || answered || struck !== null || hint.isPending}
          className={`flex min-h-11 items-center gap-1.5 text-[13px] ${hintUsed || struck !== null ? 'text-muted' : 'text-text'}`}
        >
          <SparkleIcon className="size-3.5" />
          {hintUsed || struck !== null ? 'Hint used tonight' : 'Use your hint'}
        </button>
        {answered ? (
          <button
            type="button"
            onClick={onNext}
            className="h-[46px] rounded-full bg-accent px-6 text-[15px] font-bold text-on-accent"
          >
            {last ? 'See how you did' : 'Next card'}
          </button>
        ) : (
          <button
            type="button"
            onClick={confirm}
            disabled={pick === null || guess.isPending}
            className="h-[46px] rounded-full bg-accent px-7 text-[15px] font-bold text-on-accent disabled:bg-accent-bg disabled:text-accent-text"
          >
            Guess
          </button>
        )}
      </div>
    </>
  )
}

type SummaryProps = {
  right: number
  total: number
  like: GuessGameProps['like']
  busy: boolean
  onPass: () => void
  onLike: () => void
}

function Summary({ right, total, like, busy, onPass, onLike }: SummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">
        {total > 0 ? `${right} of ${total} right` : 'Nothing to guess yet'}
      </span>
      <p className="m-0 font-display text-[27px] leading-[1.1] font-normal">{scoreLine(right, total)}</p>
      <p className="m-0 text-sm leading-normal text-muted">{like.body}</p>
      <div className="mt-1 grid grid-cols-[1fr_1.4fr] gap-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={onPass}
          className="h-[50px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text disabled:opacity-60"
        >
          Pass
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onLike}
          className="h-[50px] rounded-full bg-accent text-[15px] font-bold text-on-accent disabled:opacity-60"
        >
          {like.cta}
        </button>
      </div>
    </div>
  )
}
