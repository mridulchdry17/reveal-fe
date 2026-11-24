import { useEffect, useId } from 'react'

import { AlertIcon } from '@/components/icons'

import type { Card } from '../api/chats'
import { cardCopy, swapOutcome } from '../utils/swapCopy'

type Props = {
  card: Card
  nickname: string
  /** 'ask': I'm proposing. 'answer': they asked and I'm deciding. */
  mode: 'ask' | 'answer'
  pending: boolean
  error?: string
  onSwap: () => void
  onNotYet: () => void
  onClose: () => void
}

/** The confirm step for a swap: both outcomes said plainly, then Not yet or Swap. */
export function SwapSheet({ card, nickname, mode, pending, error, onSwap, onNotYet, onClose }: Props) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { plural } = cardCopy[card]
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-text/30">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-md flex-col gap-4 rounded-t-[28px] border-t border-border bg-surface px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-border" />
        <h2 id={titleId} className="m-0 font-display text-[28px] leading-none font-normal">
          {mode === 'ask' ? `Swap ${plural}?` : `${nickname} wants to swap ${plural}`}
        </h2>
        <p className="m-0 text-[15px] leading-6">
          {swapOutcome(card)} Can't be undone.
          {mode === 'ask' && (
            <span className="text-muted"> Nothing opens until {nickname} says yes too.</span>
          )}
        </p>
        {error && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onNotYet}
            className="h-12 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text disabled:opacity-60"
          >
            Not yet
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onSwap}
            className="h-12 flex-1 rounded-full border-0 bg-accent text-[15px] font-bold text-on-accent disabled:opacity-60"
          >
            {pending ? 'Swapping…' : 'Swap'}
          </button>
        </div>
      </div>
    </div>
  )
}
