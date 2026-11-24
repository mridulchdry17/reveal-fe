import { useEffect, useId } from 'react'

import { CloseIcon, LockIcon } from '@/components/icons'

type Props = {
  url: string | null
  pieces: number[]
  nickname: string
  onClose: () => void
}

const CELLS = Array.from({ length: 9 }, (_, i) => i)

/**
 * Their photo, full screen. The server already painted over closed pieces; here they're
 * hatched with a lock so it reads as "not yet". No drag, long-press save or right-click.
 */
export function TheirPhoto({ url, pieces, nickname, onClose }: Props) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const all = pieces.length === 9
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-text/90 px-4 py-6"
    >
      <div className="flex w-full max-w-md items-center justify-between text-bg">
        <h2 id={titleId} className="m-0 text-base font-bold">
          {nickname}'s photo
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mr-2 flex size-11 items-center justify-center bg-transparent text-bg"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl select-none [-webkit-touch-callout:none]"
        onContextMenu={(event) => event.preventDefault()}
      >
        {url ? (
          <img
            src={url}
            alt={`${nickname}'s photo, ${pieces.length} of 9 pieces open`}
            draggable={false}
            className="pointer-events-none block w-full"
          />
        ) : (
          <div className="aspect-[3/4] w-full bg-surface-2" />
        )}
        {/* Covers the image so a long press hits this layer, not the picture. */}
        <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {CELLS.map((n) =>
            pieces.includes(n) ? (
              <span key={n} />
            ) : (
              <span key={n} className="hatch flex items-center justify-center border border-dashed border-locked/60 text-locked">
                <LockIcon className="size-5" />
              </span>
            ),
          )}
        </div>
      </div>
      <p className="m-0 max-w-md text-center text-[13px] leading-5 text-bg/80">
        {all
          ? 'You swapped photos.'
          : `${pieces.length} of 9 pieces open. Each card you swap opens one; swapping photos opens the rest.`}
      </p>
    </div>
  )
}
