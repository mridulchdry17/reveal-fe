import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type FieldPath } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, CheckIcon } from '@/components/icons'
import { ApiError } from '@/lib/api/errors'

import type { GuessCardsUpdate, GuessKind, MyProfile, ProfileOptions } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { Chip } from './Chip'
import { StepLayout } from './StepLayout'

type Props = {
  profile: MyProfile
  options: ProfileOptions
  onSave: (values: GuessCardsUpdate) => void
  saving: boolean
  error: unknown
}

const KINDS: GuessKind[] = ['everyday', 'hot_take', 'little_thing']
const SLOTS = [0, 1, 2] as const

function schemaFor(questionMax: number, optionMax: number) {
  const card = z
    .object({
      kind: z.enum(KINDS),
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

type Values = { cards: { kind: GuessKind; question: string; options: string[]; answer: string }[] }

/** Server paths like cards.1.options.2 that have an input on this form. */
const fieldPath = /^cards\.[0-2]\.(kind|question|answer|options(\.[0-2])?)$/

export function GuessesForm({ profile, options, onSave, saving, error }: Props) {
  const schema = useMemo(
    () => schemaFor(options.guess_question_max, options.guess_option_max),
    [options.guess_question_max, options.guess_option_max],
  )
  const { register, handleSubmit, setValue, setError, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      cards: SLOTS.map((i) => {
        const saved = profile.guess_cards[i]
        return saved
          ? { kind: saved.kind, question: saved.question, options: [...saved.options], answer: String(saved.answer) }
          : { kind: KINDS[i] ?? 'everyday', question: '', options: ['', '', ''], answer: '' }
      }),
    },
  })
  const cards = useWatch({ control, name: 'cards' })

  // The server has the last word (e.g. no handles); put its reason under the field it's about.
  const placed = useMemo(() => {
    if (!(error instanceof ApiError) || error.code !== 'validation_error') return []
    return Object.entries(error.fieldPaths).filter(([path]) => fieldPath.test(path))
  }, [error])
  useEffect(() => {
    for (const [path, message] of placed) setError(path as FieldPath<Values>, { type: 'server', message })
  }, [placed, setError])

  const formError = error
    ? placed.length > 0
      ? 'Fix the marked bits and try again.'
      : profileErrorMessage(error)
    : formState.errors.cards
      ? 'Fill in all three cards first.'
      : null

  const submit = handleSubmit((values) =>
    onSave({
      cards: values.cards.map((card) => ({
        kind: card.kind,
        question: card.question.trim(),
        options: card.options.map((o) => o.trim()),
        answer: Number(card.answer),
      })),
    }),
  )

  return (
    <form onSubmit={submit} noValidate>
      <StepLayout
        step="guesses"
        title="Make them"
        accent="guess you."
        subtitle="Ask three things about you and mark the true answer. Each right guess sharpens your blurred photo for them, a little. It never gets clear before you both swap."
        submitLabel="Next"
        submitting={saving}
        error={formError}
      >
        {SLOTS.map((i) => {
          const card = cards[i]
          const errors = formState.errors.cards?.[i]
          const suggestions = options.guess_suggestions[card?.kind ?? 'everyday'] ?? []
          return (
            <fieldset
              key={i}
              className="m-0 flex min-w-0 flex-col gap-3 rounded-[24px] border-[1.5px] border-border bg-surface p-4 shadow-[0_10px_24px_rgb(40_20_10/0.06)] focus-within:border-accent"
            >
              <legend className="sr-only">Guess card {i + 1}</legend>
              <span className="text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
                Card {i + 1} of 3
              </span>

              <div role="radiogroup" aria-label={`Kind of question ${i + 1}`} className="flex flex-wrap gap-1.5">
                {options.guess_kinds.map((kind) => (
                  <Chip
                    key={kind.value}
                    type="radio"
                    value={kind.value}
                    label={kind.label}
                    className="min-h-11 px-3.5 text-[13px]"
                    {...register(`cards.${i}.kind`)}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor={`guess-question-${i}`} className="sr-only">
                  Question {i + 1}
                </label>
                <textarea
                  id={`guess-question-${i}`}
                  rows={2}
                  maxLength={options.guess_question_max}
                  placeholder={suggestions[0] ?? 'Ask something about you'}
                  aria-invalid={errors?.question ? true : undefined}
                  {...register(`cards.${i}.question`)}
                  className="min-w-0 resize-none rounded-[18px] border-[1.5px] border-field bg-surface-2 px-3.5 py-2.5 font-display text-[24px] leading-[1.15] font-normal text-text placeholder:text-muted focus:border-text focus:outline-none"
                />
                <FieldError message={errors?.question?.message} />
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] text-muted">Try</span>
                    {suggestions.slice(0, 3).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setValue(`cards.${i}.question`, q, { shouldValidate: formState.isSubmitted })}
                        className="min-h-11 rounded-full border-[1.5px] border-dashed border-border-strong bg-transparent px-3 text-left font-display text-[16px] font-normal text-text italic"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div role="group" aria-label={`Answers to question ${i + 1}`} className="flex flex-col gap-2">
                <span className="text-sm font-semibold">
                  Three answers <span className="font-normal text-muted">· one is true</span>
                </span>
                {SLOTS.map((j) => {
                  const optionError = errors?.options?.[j]?.message
                  return (
                    <div key={j} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`guess-${i}-option-${j}`} className="sr-only">
                          Answer {j + 1} to question {i + 1}
                        </label>
                        <input
                          id={`guess-${i}-option-${j}`}
                          maxLength={options.guess_option_max}
                          autoComplete="off"
                          aria-invalid={optionError ? true : undefined}
                          {...register(`cards.${i}.options.${j}`)}
                          className="h-12 min-w-0 flex-1 rounded-2xl border-[1.5px] border-field bg-surface px-3.5 text-[15px] text-text focus:border-text focus:outline-none"
                        />
                        <label className="group flex h-11 shrink-0 cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-dashed border-border-strong px-3 text-[13px] font-bold text-muted has-checked:border-solid has-checked:border-open has-checked:bg-open-bg has-checked:text-open has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
                          <input
                            type="radio"
                            value={String(j)}
                            aria-label={`Answer ${j + 1} is true`}
                            {...register(`cards.${i}.answer`)}
                            className="sr-only"
                          />
                          <CheckIcon className="hidden size-3.5 group-has-checked:block" />
                          True
                        </label>
                      </div>
                      <FieldError message={optionError} />
                    </div>
                  )
                })}
                <FieldError message={errors?.options?.message ?? errors?.options?.root?.message} />
                <FieldError message={errors?.answer?.message} />
              </div>
            </fieldset>
          )
        })}
        <p className="m-0 text-[13px] text-muted">
          Make the wrong answers believable, that's the fun. No numbers, handles or links.
        </p>
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
