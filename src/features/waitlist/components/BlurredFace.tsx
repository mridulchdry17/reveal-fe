type Props = {
  blur: number
}

/**
 * A drawn stand-in for someone's photo, always blurred. No real person, nothing to un-blur.
 * It's drawn at half size and scaled up, so the phone blurs a quarter of the pixels: the same look,
 * much cheaper on budget Android phones.
 */
export function BlurredFace({ blur }: Props) {
  return (
    <div aria-hidden="true" className="face absolute inset-0 overflow-hidden">
      <div
        className="face-blur absolute top-0 left-0 h-1/2 w-1/2 origin-top-left"
        style={{ filter: `blur(${blur / 2}px)`, transform: `scale(${2 * (1 + blur / 110)})` }}
      >
        <div className="face-hair absolute top-[14%] left-[14%] h-[44%] w-[72%]" />
        <div className="face-skin absolute top-[21%] left-[27%] h-[33%] w-[46%]" />
        <div className="face-body absolute top-[52%] left-[2%] h-[50%] w-[96%]" />
      </div>
      <div className="face-scrim absolute inset-0" />
    </div>
  )
}
