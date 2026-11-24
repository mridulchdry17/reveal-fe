import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { AlertIcon, CheckIcon } from '@/components/icons'

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
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-text/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rise flex max-h-[90dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-[28px] border-t border-border bg-surface px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-border-strong" />
        <div className="flex flex-col gap-2">
          <p id={titleId} className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
            Like {profile.nickname}
          </p>
          <h2 className="m-0 font-display text-[40px] leading-[0.95] font-normal tracking-[-0.01em]">
            Say why you <em className="text-accent-text">liked it.</em>
          </h2>
          <p className="m-0 text-[15px] leading-[1.45] text-muted">A line from you beats a plain heart.</p>
        </div>

        <form
          onSubmit={handleSubmit((values) =>
            onSend({
              prompt_id: values.prompt_id,
              comment: values.comment.trim() || null,
            }),
          )}
          className="flex flex-col gap-5"
        >
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Which answer got you?</legend>
            {profile.prompts.map((prompt) => (
              <label
                key={prompt.id}
                className="group flex cursor-pointer items-start gap-3 rounded-[22px] border-[1.5px] border-border bg-bg p-4 has-checked:border-accent has-checked:bg-accent-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              >
                <input type="radio" value={prompt.id} {...register('prompt_id')} className="sr-only" />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                    {prompt.question}
                  </span>
                  <span className="font-display text-[22px] leading-[1.1] font-normal italic">
                    “{prompt.answer}”
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-field text-on-accent group-has-checked:border-accent group-has-checked:bg-accent"
                >
                  <CheckIcon className="hidden size-3.5 group-has-checked:block" />
                </span>
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
              placeholder="This is so real because…"
              {...register('comment')}
              className="resize-none rounded-[20px] border-[1.5px] border-field bg-bg p-3.5 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none"
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
            They see your profile, the answer you liked and your comment. If they like you back, it's a match.
          </p>

          {error && (
            <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="grid grid-cols-[1fr_2fr] gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="h-[54px] rounded-full bg-accent text-base font-bold text-on-accent disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send like'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
