import { useEffect, useId, type ReactNode } from 'react'

import { CloseIcon } from '@/components/icons'

type Props = {
  nickname: string
  children: ReactNode
  onClose: () => void
}

/** A sheet over the chat holding their guess cards. Stays open to show each answer. */
export function GuessSheet({ nickname, children, onClose }: Props) {
  const titleId = useId()
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
        className="rise flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-[28px] border-t border-border bg-surface px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-border-strong" />
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="m-0 font-display text-[40px] leading-[0.95] font-normal tracking-[-0.01em]">
            Guess <em className="text-accent-text">{nickname}</em>
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-transparent text-text"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text"
        >
          Back to the chat
        </button>
      </div>
    </div>
  )
}
