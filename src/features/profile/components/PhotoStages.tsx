import { BlurredFace } from '@/components/BlurredFace'
import { PhotoPieces } from '@/components/PhotoPieces'

type Props = {
  /** My photo, or null for a drawn stand-in. */
  url: string | null
}

const stages = [
  { label: 'In the drop', blur: 14, open: null },
  { label: 'After right guesses', blur: 6, open: null },
  { label: 'After card swaps', blur: 0, open: [1, 3, 4, 8] },
  { label: 'Both said yes', blur: 0, open: null },
] as const

/**
 * How my photo looks to someone else along the way. Before a match it's blurred and each right
 * guess sharpens it; after a match it opens in 9 pieces through swaps, all 9 once both say yes.
 * Blur here is a local preview: the real blur is done by the server.
 */
export function PhotoStages({ url }: Props) {
  return (
    <ol aria-label="How your photo looks to them" className="m-0 grid list-none grid-cols-4 gap-2 p-0">
      {stages.map((stage) => (
        <li key={stage.label} className="flex min-w-0 flex-col gap-1.5">
          <span
            aria-hidden="true"
            className="relative block aspect-[3/4] overflow-hidden rounded-[14px] bg-surface-2 select-none [-webkit-touch-callout:none]"
            onContextMenu={(event) => event.preventDefault()}
          >
            {url ? (
              <img
                src={url}
                alt=""
                draggable={false}
                className="pointer-events-none size-full object-cover"
                style={
                  stage.blur
                    ? { filter: `blur(${stage.blur}px)`, transform: `scale(${1 + stage.blur / 40})` }
                    : undefined
                }
              />
            ) : (
              <BlurredFace blur={stage.blur} />
            )}
            {stage.open && <PhotoPieces open={stage.open} size="sm" />}
          </span>
          <span className="text-[11px] leading-[1.3] text-muted">{stage.label}</span>
        </li>
      ))}
    </ol>
  )
}
