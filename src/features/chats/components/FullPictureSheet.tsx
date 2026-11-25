import { useEffect, useId, useState, type ReactNode } from 'react'

import { AlertIcon, LockIcon } from '@/components/icons'
import { PhotoPieces } from '@/components/PhotoPieces'

import type { CardState } from '../api/chats'

type Props = {
  /** Their first name once open, else their nickname. */
  name: string
  /** Where the photo swap stands. */
  state: CardState
  /** My own photo, composed in from the profile feature; a plain "You" circle without it. */
  me?: ReactNode
  theirPhotoUrl: string | null
  pieces: number[]
  pending: boolean
  error?: string
  /** Say yes: asks, or accepts if they already asked. Only after the confirm step. */
  onReady: () => void
  onWithdraw: () => void
  /** Both said yes: go to the revealed screen. */
  onSee: () => void
  onClose: () => void
}

const blocked: Partial<Record<CardState, (name: string) => string>> = {
  locked: () =>
    'Photos come after your first card swap. Swap a name, branch or hometown first; each swap opens a piece.',
  needs_yours: () => 'Add your photo in the You tab first. Photos only swap both ways.',
  needs_theirs: (name) => `${name} hasn't added a photo yet. You can ask once they do.`,
}

/** The photo swap, as its own sheet: who's ready, and a yes that takes a second, deliberate tap. */
export function FullPictureSheet(props: Props) {
  const { name, state, me, theirPhotoUrl, pieces, pending, error, onReady, onWithdraw, onSee, onClose } = props
  const titleId = useId()
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const why = blocked[state]?.(name)
  const meReady = state === 'you_asked' || state === 'open'
  const themReady = state === 'they_asked' || state === 'open'

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-text/40 px-3">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rise mb-[max(1.25rem,env(safe-area-inset-bottom))] flex max-h-[calc(100dvh-2.5rem)] w-full overflow-y-auto max-w-md flex-col items-center rounded-[28px] border border-border bg-surface px-5 pt-6 pb-5 text-center shadow-[0_-10px_40px_rgb(40_20_10/0.12)]"
      >
        <div className="flex">
          <span className="relative flex size-[86px] items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-surface-2 font-display text-[28px]">
            {me ?? 'You'}
          </span>
          <span
            role="img"
            aria-label={state === 'open' ? `${name}'s photo` : `${name}'s photo, ${pieces.length} of 9 pieces open`}
            onContextMenu={(event) => event.preventDefault()}
            className="relative -ml-[18px] flex size-[86px] items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-surface-2 select-none [-webkit-touch-callout:none]"
          >
            {theirPhotoUrl ? (
              <>
                <img
                  src={theirPhotoUrl}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 size-full object-cover"
                />
                {state !== 'open' && <PhotoPieces open={pieces} size="sm" />}
              </>
            ) : (
              <span aria-hidden="true" className="hatch absolute inset-0" />
            )}
            {!theirPhotoUrl && (
              <span aria-hidden="true" className="relative text-locked">
                <LockIcon className="size-6" />
              </span>
            )}
          </span>
        </div>

        <h2 id={titleId} className="m-0 mt-[18px] font-display text-[36px] leading-[1.02] font-normal">
          Ready for the <em className="text-accent-text">full picture?</em>
        </h2>
        <p className="m-0 mt-3 max-w-[290px] text-sm leading-[1.5] text-muted">
          {why ?? 'Photos open only when you both say yes. Either of you can unmatch any time, and access ends with it.'}
        </p>

        {!why && (
          <ul className="m-0 mt-[18px] flex w-full list-none flex-col gap-2 p-0">
            <li className="flex items-center justify-between rounded-[14px] border border-border px-4 py-3.5">
              <span className="text-[15px]">You</span>
              <span className={`text-sm font-semibold ${meReady ? 'text-open' : 'text-muted'}`}>
                {meReady ? 'Ready ✓' : 'Not yet'}
              </span>
            </li>
            <li className="flex items-center justify-between rounded-[14px] border border-border px-4 py-3.5">
              <span className="text-[15px]">{name}</span>
              <span className={`text-sm ${themReady ? 'font-semibold text-open' : 'text-muted'}`}>
                {themReady ? 'Ready ✓' : 'Deciding'}
              </span>
            </li>
          </ul>
        )}

        {error && (
          <p role="alert" className="m-0 mt-3 flex gap-2 text-left text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        {(state === 'can_ask' || state === 'they_asked') &&
          (confirming ? (
            <div className="mt-4 flex w-full flex-col gap-2.5 text-left">
              <p className="m-0 flex flex-col gap-1 rounded-[18px] border-[1.5px] border-accent bg-accent-bg p-3.5 text-sm leading-5">
                <span className="text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">If you both say yes</span>
                {state === 'they_asked'
                  ? `${name} already said yes, so both photos open now, at the same moment. Can't be undone.`
                  : `Both photos open at the same moment. Can't be undone once you both say yes.`}
              </p>
              <p className="m-0 flex flex-col gap-1 rounded-[18px] border border-border bg-bg p-3.5 text-sm leading-5">
                <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">If not yet</span>
                Nothing changes. Keep chatting.
              </p>
              <div className="grid grid-cols-[1fr_2fr] gap-2.5">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirming(false)}
                  className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text disabled:opacity-60"
                >
                  Not yet
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={onReady}
                  className="h-[54px] rounded-full border-0 bg-accent text-base font-bold text-on-accent disabled:opacity-60"
                >
                  {pending ? 'Swapping…' : 'Swap'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 h-[54px] w-full rounded-full border-0 bg-forest text-base font-semibold text-white"
            >
              I'm ready
            </button>
          ))}
        {state === 'you_asked' && (
          <button
            type="button"
            disabled={pending}
            onClick={onWithdraw}
            className="mt-4 h-[54px] w-full rounded-full border-0 bg-surface-2 text-base font-semibold text-text disabled:opacity-60"
          >
            {pending ? 'Taking it back…' : 'Changed my mind'}
          </button>
        )}
        {state === 'open' && (
          <button
            type="button"
            onClick={onSee}
            className="mt-4 h-[54px] w-full rounded-full border-0 bg-forest text-base font-semibold text-white"
          >
            See the full picture
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-2 min-h-11 border-0 bg-transparent px-3 text-sm text-muted"
        >
          Keep chatting for now
        </button>
      </div>
    </div>
  )
}
