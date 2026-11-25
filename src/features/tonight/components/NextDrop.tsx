import type { ReactNode } from 'react'

import { BlurredFace } from '@/components/BlurredFace'

import { useNow } from '../hooks/useNow'
import { countdown, dropDay } from '../utils/countdown'

type Props = {
  nextDropAt: string
  /** Where things stand: "That's everyone for tonight", "No one new right now". */
  status: string
  /** One more honest line under the status, when there is one. */
  note?: string
  /** My interests as chips, composed in from the profile feature. */
  interests?: ReactNode
  /** The drop reminder, composed in from the notifications feature. */
  reminder?: ReactNode
}

/** The wait between drops, filling the screen: when the next one lands and a live countdown. */
export function NextDrop({ nextDropAt, status, note, interests, reminder }: Props) {
  const now = useNow()
  const left = countdown(nextDropAt, now)
  const { day, time } = dropDay(nextDropAt, now)

  return (
    <section
      aria-labelledby="next-drop-heading"
      className="-mx-6 -mt-6 flex min-h-[calc(100dvh-78px)] flex-col items-center bg-forest px-6 pt-14 pb-6 text-center text-white"
    >
      <p className="m-0 text-xs font-semibold tracking-[0.16em] text-peach uppercase">Your next drop</p>
      <h1 id="next-drop-heading" className="mt-3.5 mb-0 font-display text-[64px] leading-[0.95] font-normal">
        {day}
        <br />
        at <em className="text-peach">{time}</em>
      </h1>
      <p className="mt-4 mb-0 max-w-[300px] text-[15px] leading-[1.55] text-white/80">
        A few people on your wavelength. No endless scroll, no swiping. Just a few worth a real guess.
      </p>

      {/* Stand-ins, not anyone real: a hint of the blurred faces the drop brings. */}
      <div aria-hidden="true" className="relative mt-6 h-[250px] w-[300px]">
        <span className="absolute top-[30px] left-[8px] h-[200px] w-[140px] -rotate-10 overflow-hidden rounded-[22px]">
          <BlurredFace blur={16} />
        </span>
        <span className="absolute top-[30px] right-[8px] h-[200px] w-[140px] rotate-10 overflow-hidden rounded-[22px]">
          <BlurredFace blur={16} />
        </span>
        <span className="absolute top-[6px] left-[72px] flex h-[230px] w-[156px] items-center justify-center overflow-hidden rounded-[24px] border border-white/25 shadow-[0_24px_50px_rgb(0_0_0/0.35)]">
          <BlurredFace blur={22} />
          <span className="relative font-display text-[72px] text-white/90">?</span>
        </span>
      </div>

      <div
        role="timer"
        aria-label={`${left.hours} hours ${left.minutes} minutes left`}
        className="mt-4 flex items-start gap-2.5 font-display"
      >
        {[
          [left.hours, 'hrs'],
          [left.minutes, 'min'],
          [left.seconds, 'sec'],
        ].map(([value, unit], i) => (
          <span key={unit} className="flex items-start gap-2.5">
            {i > 0 && <span className="text-[40px] leading-[1.1] text-peach">:</span>}
            <span className="flex flex-col items-center">
              <span className="text-[50px] leading-none tabular-nums">{value}</span>
              <span className="mt-1.5 font-sans text-[10px] tracking-[0.2em] text-white/75 uppercase">{unit}</span>
            </span>
          </span>
        ))}
      </div>

      {interests && <div className="mt-5">{interests}</div>}

      <div className="flex-1" />
      <h2 className="mt-6 mb-0 text-sm font-semibold">{status}</h2>
      {note && <p className="mt-1 mb-0 max-w-[32ch] text-[13px] leading-5 text-white/75">{note}</p>}
      {reminder && <div className="mt-4 w-full text-left">{reminder}</div>}
    </section>
  )
}
