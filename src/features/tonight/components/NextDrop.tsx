import { useNow } from '../hooks/useNow'
import { countdown, dropDay } from '../utils/countdown'

type Props = {
  nextDropAt: string
  heading: string
  body: string
}

/** The wait between drops: when the next one lands and a live countdown, on the forest panel. */
export function NextDrop({ nextDropAt, heading, body }: Props) {
  const now = useNow()
  const left = countdown(nextDropAt, now)
  const { day, time } = dropDay(nextDropAt, now)

  return (
    <section
      aria-labelledby="next-drop-heading"
      className="flex min-h-[calc(100dvh-230px)] flex-col items-center justify-center rounded-[32px] bg-forest px-6 py-10 text-center text-white"
    >
      <p className="m-0 text-xs font-semibold tracking-[0.18em] text-peach uppercase">
        Your next drop
      </p>
      <p className="mt-3 mb-0 font-display text-[60px] leading-[0.92]">
        {day}
        <br />
        at <em className="text-peach">{time}</em>
      </p>
      <div
        role="timer"
        aria-label={`${left.hours} hours ${left.minutes} minutes left`}
        className="mt-7 flex items-start gap-2.5 font-display"
      >
        {[
          [left.hours, 'hrs'],
          [left.minutes, 'min'],
          [left.seconds, 'sec'],
        ].map(([value, unit], i) => (
          <span key={unit} className="flex items-start gap-2.5">
            {i > 0 && <span className="text-[38px] leading-none text-peach">:</span>}
            <span className="flex flex-col items-center">
              <span className="text-[48px] leading-none tabular-nums">{value}</span>
              <span className="mt-1.5 font-sans text-[10px] tracking-[0.2em] text-white/70 uppercase">
                {unit}
              </span>
            </span>
          </span>
        ))}
      </div>
      <h2
        id="next-drop-heading"
        className="mt-8 mb-0 font-display text-[26px] leading-tight font-normal"
      >
        {heading}
      </h2>
      <p className="mt-2 mb-0 max-w-[30ch] text-sm leading-6 text-white/80">{body}</p>
    </section>
  )
}
