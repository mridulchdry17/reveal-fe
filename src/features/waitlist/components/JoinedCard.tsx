import { useState } from 'react'

type Props = {
  position: number
  alreadyJoined: boolean
  shareUrl: string
}

export function JoinedCard({ position, alreadyJoined, shareUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const shareText = `Reveal is coming to campus. Seven cards, photo last. Join the waitlist: ${shareUrl}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
      <p className="m-0 text-xs font-bold tracking-widest text-muted uppercase">
        {alreadyJoined ? 'Already on the list' : "You're on the list"}
      </p>
      <p className="m-0 font-display text-5xl font-extrabold tracking-tight">#{position}</p>
      <p className="m-0 text-sm text-muted">
        We'll email you when Reveal opens. The more of your batch that joins, the sooner it does.
      </p>
      <div className="flex flex-col gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center rounded-xl bg-text text-sm font-bold text-bg"
        >
          Share on WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="h-12 rounded-xl border border-border-strong text-sm font-semibold text-text"
        >
          {copied ? 'Link copied' : 'Copy link'}
        </button>
      </div>
    </section>
  )
}
