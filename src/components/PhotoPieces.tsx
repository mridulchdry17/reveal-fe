import { LockIcon } from '@/components/icons'

const CELLS = Array.from({ length: 9 }, (_, i) => i)

type Props = {
  /** Open cells, 0 to 8, left to right and top to bottom. */
  open: readonly number[]
  /** Lock size: big on a full-screen photo, small on a thumbnail. */
  size?: 'sm' | 'md'
}

/**
 * A 3×3 grid laid over a photo: open cells are clear, closed ones hatched with a lock.
 * Also covers the image, so a long press hits this layer rather than the picture.
 */
export function PhotoPieces({ open, size = 'md' }: Props) {
  const lock = size === 'sm' ? 'size-3' : 'size-5'
  return (
    <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 grid-rows-3">
      {CELLS.map((n) =>
        open.includes(n) ? (
          <span key={n} />
        ) : (
          <span key={n} className="hatch flex items-center justify-center border border-dashed border-locked/60 text-locked">
            <LockIcon className={lock} />
          </span>
        ),
      )}
    </div>
  )
}
