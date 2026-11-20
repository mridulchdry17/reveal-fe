import type { CSSProperties } from 'react'

import { LockIcon } from '@/components/icons'

/** Cards still face-down, with the tab that names what's hidden. */
const hidden = [
  // Further back sits higher, so every tab stays visible above the card in front of it.
  { tab: 'Name', tabPosition: 'left-4', x: '-6px', y: '-46px', r: '-2deg', peek: false },
  { tab: 'Hometown', tabPosition: 'left-1/2 -translate-x-1/2', x: '0px', y: '-38px', r: '0.5deg', peek: false },
  { tab: 'Photo', tabPosition: 'right-4', x: '6px', y: '-30px', r: '2deg', peek: true },
]

const voiceBars = [6, 12, 18, 10, 16, 8, 14, 6]

/**
 * What another student would actually see: one shown card (their words, branch,
 * voice note) in front of the cards they haven't swapped yet.
 */
export function HeroProfile() {
  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label="Example profile. Shown: a line they wrote, their branch (CSE, 2nd year) and a voice note. Hidden until you both swap: name, hometown and photo."
        className="relative mx-auto h-[256px] w-full max-w-[300px]"
      >
        {hidden.map((card, index) => (
          <div
            key={card.tab}
            aria-hidden="true"
            className="stack-card absolute inset-x-0 bottom-0 h-[180px]"
            style={{ '--x': card.x, '--y': card.y, '--r': card.r, '--i': index } as CSSProperties}
          >
            <div className={`relative size-full ${card.peek ? 'peek' : ''}`}>
              <span
                className={`absolute bottom-full ${card.tabPosition} inline-flex h-6 items-center gap-1 rounded-t-lg border-[1.5px] border-b-0 border-dashed border-locked bg-locked-bg px-2.5 text-[11px] font-bold text-locked`}
              >
                {card.tab === 'Photo' && <LockIcon className="size-3" />}
                {card.tab}
              </span>
              <span className="block size-full rounded-[18px] hatch border-[1.5px] border-dashed border-locked" />
            </div>
          </div>
        ))}

        <div
          aria-hidden="true"
          className="stack-card absolute inset-x-0 bottom-0 flex h-[180px] flex-col gap-2 rounded-[18px] border border-border bg-surface p-4 text-left shadow-[0_1px_0_rgb(42_30_46/0.04),0_18px_36px_-20px_rgb(42_30_46/0.45)]"
          style={{ '--x': '0px', '--y': '0px', '--r': '0deg', '--i': hidden.length } as CSSProperties}
        >
          <span className="inline-flex h-6 items-center self-start rounded-full bg-open-bg px-2.5 text-[11px] font-bold text-open">
            CSE · 2nd year
          </span>
          <span className="mt-1 text-[11px] font-semibold text-muted">A hill I'll die on</span>
          <span className="font-display text-[20px] leading-[1.15] font-extrabold tracking-[-0.02em]">
            Maggi at 2am is a personality trait.
          </span>
          <span className="mt-auto inline-flex h-9 items-center gap-2 self-start rounded-full bg-surface-2 pr-3 pl-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-text text-bg">
              <svg viewBox="0 0 16 16" className="size-2.5" fill="currentColor" aria-hidden="true">
                <path d="M5 3.5v9l7.5-4.5z" />
              </svg>
            </span>
            <span className="flex items-center gap-[3px]">
              {voiceBars.map((height, index) => (
                <span key={index} className="w-[3px] rounded-full bg-muted" style={{ height }} />
              ))}
            </span>
            <span className="text-[11px] font-semibold text-muted tabular-nums">0:14</span>
          </span>
        </div>
      </div>

      <figcaption className="mt-4 flex justify-center gap-5 text-[12px] font-semibold whitespace-nowrap text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3.5 w-2.5 rounded-[3px] border border-border-strong bg-surface" />
          Shown
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3.5 w-2.5 rounded-[3px] hatch border border-dashed border-locked" />
          Hidden until you both swap
        </span>
      </figcaption>
    </figure>
  )
}
