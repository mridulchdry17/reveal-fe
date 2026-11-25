import { useEffect, useRef, useState } from 'react'

import { BlurredFace } from '@/components/BlurredFace'
import { ChatIcon, CheckIcon } from '@/components/icons'

import { describePlace } from '../utils/place'
import { shareUrl, whatsappMessage } from '../utils/share'

type Props = {
  position: number
  alreadyJoined: boolean
  college: string
  origin: string
}

export function JoinedCard({ position, alreadyJoined, college, origin }: Props) {
  const heading = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const place = describePlace(position)
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  useEffect(() => {
    heading.current?.focus()
  }, [])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl(origin, 'link'))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function nativeShare() {
    const url = shareUrl(origin, 'share')
    navigator.share({ title: 'Reveal', text: whatsappMessage(college, url) }).catch(() => undefined)
  }

  const placeLabel =
    place.kind === 'founding' ? `You're one of the first 50 at ${college}` : `Your place in line is ${place.number}`

  return (
    <section aria-live="polite" className="rise flex flex-col">
      <p
        className={`m-0 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase ${
          alreadyJoined ? 'text-white/70' : 'text-peach'
        }`}
      >
        <span className={`size-1.5 rounded-full ${alreadyJoined ? 'bg-white/70' : 'bg-peach'}`} />
        {alreadyJoined ? 'Already in line' : 'Spot saved'}
      </p>

      <h2
        ref={heading}
        tabIndex={-1}
        className="mt-3 mb-0 font-display text-[64px] leading-[0.86] font-normal tracking-[-0.03em] outline-none"
      >
        {alreadyJoined ? (
          <>
            You're <em className="text-peach">already in.</em>
          </>
        ) : (
          <>
            You're <em className="text-peach">in.</em>
          </>
        )}
      </h2>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? 'Show the front of your ticket' : 'Flip your ticket'}
        className="flip-card mx-auto mt-7 h-[290px] w-[204px] -rotate-3 border-0 bg-transparent p-0"
      >
        <span className="flip-inner block size-full" data-flipped={flipped ? '' : undefined}>
          <span className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-forest text-left text-white shadow-[0_30px_60px_rgb(0_0_0/0.5)] [backface-visibility:hidden]">
            <span className="relative block h-[140px]">
              <BlurredFace blur={18} />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center font-display text-[64px] text-white/90"
              >
                ?
              </span>
            </span>
            <span
              role="img"
              aria-label={placeLabel}
              className="flex flex-1 flex-col gap-0.5 border-t-2 border-dashed border-white/35 px-4 py-3"
            >
              <span className="truncate text-[10px] font-bold tracking-[0.16em] text-peach uppercase">{college}</span>
              {place.kind === 'founding' ? (
                <span className="font-display text-[44px] leading-[0.95]">
                  First <em>50</em>
                </span>
              ) : (
                <span className="font-display text-[52px] leading-[0.95] tabular-nums">
                  No. <em>{place.number}</em>
                </span>
              )}
              <span className="text-xs text-white/75">Admit one. Face not included.</span>
            </span>
          </span>
          <span className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-peach-strong p-5 text-left text-text [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase">The fine print</span>
            <span className="font-display text-[27px] leading-[1.05]">
              Your face stays a guess until <em>you</em> say yes.
            </span>
            <span className="text-xs leading-5">Students only. No swiping. Unmatch and everything closes.</span>
          </span>
        </span>
      </button>
      <p className="mt-3 mb-0 text-center text-xs text-white/60">Tap the ticket</p>

      <p className="mt-6 mb-0 text-[15px] leading-6 text-white/80">
        {alreadyJoined
          ? "Same spot, nothing lost. We'll email you the moment it opens."
          : "Reveal opens when enough of campus is in. A 9pm drop is only as good as who's in it."}
      </p>

      <p className="mt-6 mb-0 text-sm font-bold">Bring your friends in.</p>
      <div className="mt-3 flex w-full flex-col gap-2.5">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage(college, shareUrl(origin, 'wa')))}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-peach-strong text-base font-bold text-text no-underline transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white active:scale-[0.96]"
        >
          <ChatIcon className="size-5" />
          Send it to the group chat
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-white/30 bg-transparent text-sm font-semibold text-white transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.96]"
        >
          <span aria-live="polite" className="inline-flex items-center gap-2">
            {copied && <CheckIcon className="size-4 text-peach" />}
            {copied ? 'Link copied' : 'Copy link'}
          </span>
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="h-11 bg-transparent text-sm font-semibold text-white/75 underline underline-offset-4"
          >
            More ways to share
          </button>
        )}
      </div>
    </section>
  )
}
