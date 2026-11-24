import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, CloseIcon } from '@/components/icons'

import type { LikeRequest, PublicProfile } from '../api/drops'

const COMMENT_MAX = 140

const schema = z.object({
  prompt_id: z.string().min(1),
  comment: z.string().max(COMMENT_MAX, `Keep it under ${COMMENT_MAX} characters`),
})
type Values = z.infer<typeof schema>

type Props = {
  profile: PublicProfile
  promptId: string
  sending: boolean
  error?: string
  onSend: (body: LikeRequest) => void
  onClose: () => void
}

/** Pick which prompt you're liking and, if you want, say something about it. */
export function LikeSheet({ profile, promptId, sending, error, onSend, onClose }: Props) {
  const titleId = useId()
  const { register, handleSubmit, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { prompt_id: promptId, comment: '' },
  })
  const comment = useWatch({ control, name: 'comment' })

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-text/30">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-[28px] border-t border-border bg-surface px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-border" />
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="m-0 font-display text-[28px] leading-none font-normal">
            Like {profile.nickname}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2.5 flex size-11 items-center justify-center bg-transparent text-muted"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((values) =>
            onSend({
              prompt_id: values.prompt_id,
              comment: values.comment.trim() || null,
            }),
          )}
          className="flex flex-col gap-4"
        >
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Which line are you liking?</legend>
            {profile.prompts.map((prompt) => (
              <label
                key={prompt.id}
                className="flex cursor-pointer flex-col gap-1 rounded-2xl border-2 border-transparent bg-bg p-3.5 has-checked:border-accent has-focus-visible:outline-2 has-focus-visible:outline-accent"
              >
                <input type="radio" value={prompt.id} {...register('prompt_id')} className="sr-only" />
                <span className="text-[13px] text-muted">{prompt.question}</span>
                <span className="font-display text-[19px] leading-tight font-normal italic">{prompt.answer}</span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${titleId}-comment`} className="text-sm font-semibold">
              Add a comment <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id={`${titleId}-comment`}
              rows={3}
              maxLength={COMMENT_MAX}
              placeholder="Say why it made you smile"
              {...register('comment')}
              className="resize-none rounded-2xl border-[1.5px] border-field bg-bg p-3.5 text-base text-text focus:border-accent focus:outline-none"
            />
            <span className="self-end text-xs text-muted">
              {comment.length} / {COMMENT_MAX}
            </span>
            {formState.errors.comment && (
              <p className="m-0 flex gap-2 text-sm text-accent-text">
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
                {formState.errors.comment.message}
              </p>
            )}
          </div>

          <p className="m-0 text-[13px] leading-5 text-muted">
            They see your profile, the line you liked and your comment. If they like you back, it's a match.
          </p>

          {error && (
            <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="flex h-[54px] items-center justify-center rounded-full bg-accent text-base font-bold text-on-accent disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send like'}
          </button>
        </form>
      </div>
    </div>
  )
}
