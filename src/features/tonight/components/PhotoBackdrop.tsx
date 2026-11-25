/** Their blurred photo filling the screen, or a plain dark panel when one of us has none. */
export function PhotoBackdrop({ url }: { url: string | null }) {
  if (!url) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-night pb-40 font-display text-[220px] leading-none text-white/[0.07] italic">
        ?
      </span>
    )
  }
  return (
    <img
      src={url}
      alt=""
      draggable={false}
      className="pointer-events-none absolute inset-0 size-full object-cover"
    />
  )
}
