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
      className="flex flex-col gap-2.5 rounded-2xl border-2 border-accent bg-accent-bg p-3.5"
    >
      <p className="m-0 text-sm leading-5">
        <span className="font-bold">
          {nickname} wants to swap {cardCopy[card].plural}.
        </span>{' '}
        {swapOutcome(card)} Can't be undone.
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
