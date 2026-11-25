type Props = {
  /** Their photo, already blurred by the server; null when one of us has none. */
  url: string | null
  size?: 'sm' | 'md'
}

/** A small round blurred photo, or a "?" when there's none. Decoration: the name is next to it. */
export function Avatar({ url, size = 'md' }: Props) {
  const box = size === 'sm' ? 'size-[46px]' : 'size-12'
  return (
    <span
      aria-hidden="true"
      className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 font-display text-2xl text-muted select-none`}
    >
      {url ? (
        <img src={url} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
      ) : (
        '?'
      )}
    </span>
  )
}
