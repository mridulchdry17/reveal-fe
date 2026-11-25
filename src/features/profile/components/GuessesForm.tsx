import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useForm, useWatch, type FieldPath } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, CheckIcon } from '@/components/icons'
import { ApiError } from '@/lib/api/errors'

import type { GuessCardsUpdate, GuessKind, MyProfile, ProfileOptions } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { guessKindLabels } from '../utils/labels'
import { StepLayout } from './StepLayout'

type Props = {
  profile: MyProfile
  options: ProfileOptions
  onSave: (values: GuessCardsUpdate) => void
  saving: boolean
  error: unknown
}

/** Each slot has a fixed kind: an everyday choice, a hot take, a little thing. */
const KINDS: GuessKind[] = ['everyday', 'hot_take', 'little_thing']
const SLOTS = [0, 1, 2] as const
const LETTERS = ['A', 'B', 'C'] as const

function schemaFor(questionMax: number, optionMax: number) {
  const card = z
    .object({
      question: z
        .string()
        .trim()
        .min(1, 'Ask them something.')
        .max(questionMax, `Keep it under ${questionMax} characters.`),
      options: z.array(
        z.string().trim().min(1, 'Fill this one in.').max(optionMax, `Keep it under ${optionMax} characters.`),
      ),
      // Radios hold strings; '' until one is marked true.
      answer: z.string().regex(/^[0-2]$/, 'Mark which one is true.'),
    })
    .superRefine((value, ctx) => {
      const filled = value.options.filter(Boolean).map((o) => o.toLowerCase())
      if (filled.length === 3 && new Set(filled).size < 3) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'Give three different answers.' })
      }
    })
  return z.object({ cards: z.array(card) })
}

type CardValues = { question: string; options: string[]; answer: string }
type Values = { cards: CardValues[] }

/** Saved cards go back in the slot of their kind; any left over fill the remaining slots. */
function initialCards(saved: MyProfile['guess_cards']): CardValues[] {
  const left = [...saved]
  const bySlot = KINDS.map((kind) => {
    const at = left.findIndex((card) => card.kind === kind)
    return at >= 0 ? left.splice(at, 1)[0] : undefined
  })
  return bySlot.map((card) => {
    const fill = card ?? left.shift()
    return fill
      ? { question: fill.question, options: [...fill.options], answer: String(fill.answer) }
      : { question: '', options: ['', '', ''], answer: '' }
  })
}

/** Server paths like cards.1.options.2 that have an input on this form. */
const fieldPath = /^cards\.([0-2])\.(question|answer|options(\.[0-2])?)$/

/** Three guess cards, one at a time. All three save together from the last one. */
export function GuessesForm({ profile, options, onSave, saving, error }: Props) {
  const schema = useMemo(
    () => schemaFor(options.guess_question_max, options.guess_option_max),
    [options.guess_question_max, options.guess_option_max],
  )
  const { register, handleSubmit, setValue, setError, trigger, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { cards: initialCards(profile.guess_cards) },
  })
  const cards = useWatch({ control, name: 'cards' })
  const [current, setCurrent] = useState(0)

  // The server has the last word (e.g. no handles); put its reason under the field it's about.
  const placed = useMemo(() => {
    if (!(error instanceof ApiError) || error.code !== 'validation_error') return []
    return Object.entries(error.fieldPaths).filter(([path]) => fieldPath.test(path))
  }, [error])
  useEffect(() => {
    for (const [path, message] of placed) setError(path as FieldPath<Values>, { type: 'server', message })
  }, [placed, setError])
  // A new server error about a card: show that card (adjusting state while rendering, not in an effect).
  const [seen, setSeen] = useState(placed)
  if (seen !== placed) {
    setSeen(placed)
    const first = placed[0]?.[0].match(fieldPath)?.[1]
    if (first !== undefined) setCurrent(Number(first))
  }

  const isLast = current === SLOTS.length - 1
  const errors = formState.errors.cards?.[current]
  const formError = error
    ? placed.length > 0
      ? 'Fix the marked bits and try again.'
      : profileErrorMessage(error)
    : errors
      ? 'Finish this card first.'
      : null

  const save = handleSubmit(
    (values) =>
      onSave({
        cards: values.cards.map((card, i) => ({
          kind: KINDS[i] ?? 'everyday',
          question: card.question.trim(),
          options: card.options.map((o) => o.trim()),
          answer: Number(card.answer),
        })),
      }),
    // Something on an earlier card is off: show that card.
    (invalid) => {
      const first = SLOTS.find((i) => invalid.cards?.[i])
      if (first !== undefined) setCurrent(first)
    },
  )

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    if (isLast) return save(event)
    event.preventDefault()
    if (await trigger(`cards.${current}`)) {
      setCurrent(current + 1)
      window.scrollTo(0, 0)
    }
  }

  const kind = KINDS[current] ?? 'everyday'
  const card = cards[current]
  const suggestions = options.guess_suggestions[kind] ?? []
  const answer = card?.answer ?? ''

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <StepLayout
        step="guesses"
        onBack={current > 0 ? () => setCurrent(current - 1) : undefined}
        title="Make them"
        accent="guess you."
        subtitle="Write 3 small questions with one true answer. Every right guess brings your photo a little more into focus for them. It's never clear before you both say yes."
        submitLabel={isLast ? 'Next' : 'Next card'}
        submitting={saving}
        error={formError}
      >
        <ol aria-label="Your three cards" className="m-0 -mt-2 flex list-none gap-2 p-0">
          {SLOTS.map((i) => {
            const state = i < current ? 'done' : i === current ? 'current' : 'next'
            const look = {
              done: 'border-border bg-surface-2 text-text',
              current: 'border-accent bg-accent-bg text-accent-text',
              next: 'border-border bg-transparent text-muted',
            }[state]
            const kindLabel = guessKindLabels[KINDS[i] ?? 'everyday']
            return (
              <li
                key={i}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`flex min-h-9 flex-1 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold ${look}`}
              >
                {state === 'done' && <CheckIcon className="size-3 shrink-0" />}
                {state === 'current' && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />}
                <span className="truncate">{kindLabel}</span>
                {state === 'done' && <span className="sr-only">, done</span>}
              </li>
            )
          })}
        </ol>

        <fieldset
          key={current}
          className="rise m-0 flex min-w-0 flex-col gap-3 rounded-[24px] border border-border bg-surface p-4 shadow-[0_10px_24px_rgb(40_20_10/0.06)]"
        >
          <legend className="sr-only">
            Card {current + 1} of 3, {guessKindLabels[kind]}
          </legend>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
              {String(current + 1).padStart(2, '0')} · {guessKindLabels[kind]}
            </span>
            <span className="text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
              Sharpens your photo
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`guess-question-${current}`} className="sr-only">
              Question {current + 1}
            </label>
            <textarea
              id={`guess-question-${current}`}
              rows={2}
              maxLength={options.guess_question_max}
              placeholder={suggestions[0] ?? 'Ask something about you'}
              aria-invalid={errors?.question ? true : undefined}
              {...register(`cards.${current}.question`)}
              className="min-w-0 resize-none rounded-[18px] border-[1.5px] border-field bg-surface-2 px-3.5 py-2.5 font-display text-[23px] leading-[1.15] font-normal text-text placeholder:text-muted focus:border-text focus:outline-none"
            />
            <FieldError message={errors?.question?.message} />
          </div>

          <div role="group" aria-label={`Answers to question ${current + 1}`} className="flex flex-col gap-2">
            {SLOTS.map((j) => {
              const letter = LETTERS[j]
              const optionError = errors?.options?.[j]?.message
              const on = answer === String(j)
              return (
                <div key={j} role="group" aria-label={`Option ${letter}`} className="flex flex-col gap-1">
                  <div
                    className={`flex items-center gap-2.5 rounded-2xl border-[1.5px] bg-bg py-1.5 pr-1.5 pl-3.5 focus-within:border-text ${on ? 'border-accent' : 'border-field'}`}
                  >
                    <span aria-hidden="true" className="w-3 text-xs font-bold text-muted">
                      {letter}
                    </span>
                    <input
                      id={`guess-${current}-option-${j}`}
                      aria-label={`Answer ${letter}`}
                      maxLength={options.guess_option_max}
                      autoComplete="off"
                      aria-invalid={optionError ? true : undefined}
                      {...register(`cards.${current}.options.${j}`)}
                      className="h-10 min-w-0 flex-1 border-0 bg-transparent text-[15px] text-text focus:outline-none"
                    />
                    <label
                      className={`flex h-11 shrink-0 cursor-pointer items-center gap-1 rounded-full border-[1.5px] px-3 text-xs font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${on ? 'border-accent bg-accent text-on-accent' : 'border-border bg-transparent text-muted'}`}
                    >
                      <input
                        type="radio"
                        value={String(j)}
                        {...register(`cards.${current}.answer`)}
                        className="sr-only"
                      />
                      {on ? (
                        <>
                          True <CheckIcon className="size-3.5" />
                        </>
                      ) : (
                        'Mark true'
                      )}
                    </label>
                  </div>
                  <FieldError message={optionError} />
                </div>
              )
            })}
            <FieldError message={errors?.options?.message ?? errors?.options?.root?.message} />
            <FieldError message={errors?.answer?.message} />
          </div>
          <p className="m-0 text-xs leading-5 text-muted">
            Only you know which one is true. Keep it guessable, not impossible.
          </p>
        </fieldset>

        {suggestions.length > 0 && (
          <div className="-mt-2 flex flex-wrap items-center gap-2">
            <span className="w-full text-xs text-muted">Stuck? Borrow one</span>
            {suggestions.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() =>
                  setValue(`cards.${current}.question`, q, { shouldValidate: formState.isSubmitted })
                }
                className="min-h-11 rounded-full border border-border bg-surface px-3.5 text-left text-[13px] text-text"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </StepLayout>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="m-0 flex gap-2 text-sm text-accent-text">
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  )
}
