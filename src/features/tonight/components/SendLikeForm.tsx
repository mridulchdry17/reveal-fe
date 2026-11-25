import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, CheckIcon, HeartIcon } from '@/components/icons'

import type { LikeRequest } from '../api/drops'
import type { LikeOption } from '../utils/likeOptions'
import { Avatar } from './Avatar'

const COMMENT_MAX = 140

/** Generic openers: tapping one adds it to the line, to edit or send as is. */
const suggestions = ['Okay, I need the story behind this', 'Same here, honestly', 'Tell me more?']

const schema = z.object({
  pick: z.string().min(1),
  comment: z.string().max(COMMENT_MAX, `Keep it under ${COMMENT_MAX} characters`),
})
type Values = z.infer<typeof schema>

type Props = {
  nickname: string
  photoUrl: string | null
  /** How I did on their cards; null when I haven't guessed any. */
  score: { right: number; total: number } | null
  options: LikeOption[]
  /** Which answer to start on (a card or prompt id from the URL). */
  initial: string | null
  sending: boolean
  error?: string
  onSend: (body: LikeRequest) => void
  onCancel: () => void
}

/** Full-screen "Say why you guessed it": one tab per answer I can like, an optional line, Send like. */
export function SendLikeForm({ nickname, photoUrl, score, options, initial, sending, error, onSend, onCancel }: Props) {
  const id = useId()
  const first = options.find((o) => o.id === initial) ?? options[0]
  const { register, handleSubmit, control, setValue, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { pick: first?.id ?? '', comment: '' },
  })
  const [pick, comment] = useWatch({ control, name: ['pick', 'comment'] })
  const option = options.find((o) => o.id === pick) ?? first

  const addSuggestion = (text: string) => {
    const next = comment.trim() ? `${comment.trim()} ${text}` : text
    setValue('comment', next.slice(0, COMMENT_MAX), { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const chosen = options.find((o) => o.id === values.pick)
        if (chosen) onSend(chosen.body(values.comment.trim() || null))
      })}
      className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))] text-text"
    >
      <div className="flex items-center gap-3">
        <Avatar url={photoUrl} size="sm" />
        <div>
          <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">
            {score ? `You got ${score.right} of ${score.total} right` : `Like ${nickname}`}
          </p>
          <p className="m-0 mt-0.5 font-display text-[21px]">{nickname}'s answers</p>
        </div>
      </div>

      <h1 className="mt-6 mb-0 font-display text-[48px] leading-[0.98] font-normal tracking-[-0.01em]">
        Say why you{' '}
        <br />
        <em className="text-accent-text">{score ? 'guessed it.' : 'liked it.'}</em>
      </h1>

      {option ? (
        <>
          <div
            role="tablist"
            aria-label="Pick an answer to like"
            className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]"
          >
            {options.map((o) => {
              const selected = o.id === option.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="tab"
                  id={`${id}-${o.id}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  onClick={() => setValue('pick', o.id)}
                  className={`h-10 max-w-[12rem] min-w-[6.5rem] flex-1 shrink-0 truncate rounded-full border-[1.5px] px-3.5 text-xs font-semibold ${
                    selected ? 'border-text bg-text text-bg' : 'border-border text-text'
                  }`}
                >
                  {o.tab}
                </button>
              )
            })}
          </div>
          <input type="hidden" {...register('pick')} />

          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-${option.id}`}
            className="mt-3 rounded-[20px] border border-border bg-surface p-[18px] shadow-[0_10px_30px_rgb(60_30_10/0.06)]"
          >
            <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{option.kicker}</p>
            <p className="mt-2.5 mb-0 font-display text-[23px] leading-[1.2] italic">“{option.answer}”</p>
            {option.guess && (
              <p
                className={`mt-2.5 mb-0 flex items-center gap-1 text-[13px] font-semibold ${
                  option.guess.right ? 'text-open' : 'text-muted'
                }`}
              >
                {option.guess.right ? (
                  <>
                    <CheckIcon className="size-3.5" />
                    You guessed right
                  </>
                ) : (
                  `You guessed ${option.guess.picked}`
                )}
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="mt-5 mb-0 text-sm text-muted">They have no answers to like yet.</p>
      )}

      <label htmlFor={`${id}-comment`} className="mt-5 text-[13px] text-muted">
        Add a line (optional)
      </label>
      <textarea
        id={`${id}-comment`}
        rows={3}
        maxLength={COMMENT_MAX}
        {...register('comment')}
        className="mt-2 w-full resize-none rounded-[18px] border-[1.5px] border-field bg-surface px-4 py-3.5 text-base leading-[1.45] text-text focus:border-accent focus:outline-none"
      />
      <span className="mt-1 self-end text-xs text-muted">
        {comment.length} / {COMMENT_MAX}
      </span>
      {formState.errors.comment && (
        <p className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {formState.errors.comment.message}
        </p>
      )}

      <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => addSuggestion(text)}
            className="h-[38px] shrink-0 rounded-full border border-border bg-surface px-3.5 text-[13px] text-text"
          >
            {text}
          </button>
        ))}
      </div>

      <div className="min-h-6 flex-1" />
      {error && (
        <p role="alert" className="mb-3 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <p className="mt-0 mb-3 text-center text-xs leading-normal text-muted">
        They see the answer you liked and this line, never a clear photo. They can match you straight back.
      </p>
      <div className="grid grid-cols-[1fr_1.6fr] gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={sending || !option}
          className="flex h-[54px] items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-bold text-on-accent disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send like'}
          <HeartIcon className="size-4 fill-current" />
        </button>
      </div>
    </form>
  )
}
