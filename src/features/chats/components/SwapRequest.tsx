import type { Card } from '../api/chats'
import { cardCopy, swapOutcome } from '../utils/swapCopy'

type Props = {
  card: Card
  nickname: string
  pending: boolean
  onAnswer: (yes: boolean) => void
}

/** Their request, right above the message box, with both outcomes and both buttons. */
export function SwapRequest({ card, nickname, pending, onAnswer }: Props) {
  return (
    <section
      aria-label="Swap request"
      className="rise flex flex-col gap-3 rounded-[24px] border-2 border-accent bg-accent-bg p-4"
    >
      <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">Swap request</p>
      <p className="m-0 flex flex-col gap-1">
        <span className="font-display text-[24px] leading-[1.05] font-normal">
          {nickname} wants to swap {cardCopy[card].plural}.
        </span>{' '}
        <span className="text-[13px] leading-5 text-text">{swapOutcome(card)} Can't be undone.</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onAnswer(false)}
          className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-surface text-sm font-semibold text-text disabled:opacity-60"
        >
          Not yet
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onAnswer(true)}
          className="h-11 flex-1 rounded-full border-0 bg-accent text-sm font-bold text-on-accent disabled:opacity-60"
        >
          Swap
        </button>
      </div>
    </section>
  )
}
