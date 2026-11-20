import { useEffect, useRef, useState } from 'react'

import { ChatIcon, CheckIcon, LockIcon } from '@/components/icons'

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
    <section aria-live="polite" className="rise flex flex-col items-center text-center">
      <p
        className={`m-0 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] uppercase ${
          alreadyJoined ? 'text-muted' : 'text-open'
        }`}
      >
        <span className={`size-1.5 rounded-full ${alreadyJoined ? 'bg-muted' : 'bg-open'}`} />
        {alreadyJoined ? 'Already in line' : "You're in line"}
      </p>

      <div className="ticket mt-5 h-[240px] w-[176px] -rotate-3" role="img" aria-label={placeLabel}>
        <div className="ticket-inner size-full" data-static={alreadyJoined ? '' : undefined}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[18px] hatch border-[1.5px] border-dashed border-locked [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <LockIcon className="size-6 text-locked" />
            <span className="mt-2 text-[11px] font-bold tracking-[0.08em] text-locked uppercase">Your place</span>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between rounded-[18px] bg-text p-4 text-left text-bg shadow-[0_1px_0_rgb(42_30_46/0.06),0_18px_30px_-16px_rgb(42_30_46/0.55)] [backface-visibility:hidden]">
            <span className="font-display text-sm font-extrabold tracking-[-0.02em]">Reveal</span>
            {place.kind === 'founding' ? (
              <span className="flex flex-col">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">One of the</span>
                <span className="font-display text-[44px] leading-[0.95] font-extrabold tracking-[-0.04em]">
                  first 50
                </span>
              </span>
            ) : (
              <span className="flex flex-col">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase opacity-70">No.</span>
                <span className="font-display text-[56px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">
                  {place.number}
                </span>
              </span>
            )}
            <span className="flex justify-between gap-2 text-[11px] font-semibold opacity-80">
              <span className="truncate">{college}</span>
              <span className="shrink-0">Waitlist</span>
            </span>
          </div>
        </div>
      </div>

      <h2
        ref={heading}
        tabIndex={-1}
        className="mt-7 mb-0 font-display text-[32px] leading-none font-extrabold tracking-[-0.03em] outline-none"
      >
        {alreadyJoined ? "You're already in." : "You're in."}
      </h2>
      <p className="mx-auto mt-3 mb-0 max-w-[30ch] text-[15px] leading-6 text-pretty text-muted">
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
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent text-base font-bold text-on-accent no-underline transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-text active:scale-[0.96]"
        >
          <ChatIcon className="size-5" />
          Send on WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text active:scale-[0.96]"
        >
          <span aria-live="polite" className="inline-flex items-center gap-2">
            {copied && <CheckIcon className="size-4 text-open" />}
            {copied ? 'Link copied' : 'Copy link'}
          </span>
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="h-11 bg-transparent text-sm font-semibold text-muted underline underline-offset-4"
          >
            More ways to share
          </button>
        )}
      </div>
    </section>
  )
}
