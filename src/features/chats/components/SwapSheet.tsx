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
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-text/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rise flex w-full max-w-md flex-col gap-5 rounded-t-[28px] border-t border-border bg-surface px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-border-strong" />
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
            {mode === 'ask' ? 'Card swap' : 'They asked first'}
          </p>
          <h2 id={titleId} className="m-0 font-display text-[44px] leading-[0.95] font-normal tracking-[-0.01em]">
            {mode === 'ask' ? (
              <>
                Swap <em className="text-accent-text">{plural}</em>?
              </>
            ) : (
              <>
                {nickname} wants to swap <em className="text-accent-text">{plural}</em>
              </>
            )}
          </h2>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          <li className="flex flex-col gap-1 rounded-[20px] border-[1.5px] border-accent bg-accent-bg p-4">
            <span className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">If you swap</span>
            <span className="text-[15px] leading-6">
              {swapOutcome(card)} Can't be undone.
              {mode === 'ask' && <span className="text-muted"> Nothing opens until {nickname} says yes too.</span>}
            </span>
          </li>
          <li className="flex flex-col gap-1 rounded-[20px] border border-border bg-bg p-4">
            <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">If not yet</span>
            <span className="text-[15px] leading-6">
              {mode === 'ask' ? 'Nothing is asked. Keep talking.' : 'Nothing opens. The chat carries on.'}
            </span>
          </li>
        </ul>
        {error && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        <div className="grid grid-cols-[1fr_2fr] gap-2.5">
          <button
            type="button"
            disabled={pending}
            onClick={onNotYet}
            className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text disabled:opacity-60"
          >
            Not yet
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onSwap}
            className="h-[54px] rounded-full border-0 bg-accent text-base font-bold text-on-accent disabled:opacity-60"
          >
            {pending ? 'Swapping…' : 'Swap'}
          </button>
        </div>
      </div>
    </div>
  )
}
