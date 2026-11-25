import { useEffect, useId } from 'react'

import { CloseIcon } from '@/components/icons'
import { PhotoPieces } from '@/components/PhotoPieces'

type Props = {
  url: string | null
  pieces: number[]
  nickname: string
  onClose: () => void
}

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
      className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-night px-4 py-6 text-white"
    >
      <div className="flex w-full max-w-md items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-peach uppercase">
            {all ? 'All 9 pieces' : `${pieces.length} of 9 pieces`}
          </p>
          <h2 id={titleId} className="m-0 truncate font-display text-[36px] leading-[0.95] font-normal">
            {nickname}'s <em className="text-peach">photo</em>
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/30 bg-transparent text-white"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[24px] select-none [-webkit-touch-callout:none]"
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
          <div className="aspect-[3/4] w-full bg-white/10" />
        )}
        <PhotoPieces open={pieces} />
      </div>
      <p className="m-0 max-w-md text-center text-sm leading-6 text-white/80">
        {all
          ? 'You swapped photos.'
          : `${pieces.length} of 9 pieces open. Each card you swap or guess right opens one, up to 6; swapping photos opens the rest.`}
      </p>
    </div>
  )
}
