import { useEffect, useId } from 'react'

import { BackIcon } from '@/components/icons'

import type { ChatProfile, CardState } from '../api/chats'

type Props = {
  /** First name if open, else nickname. */
  name: string
  photoUrl: string | null
  line: string
  chips: string[]
  voice: { seconds: number | null; playing: boolean; onToggle: () => void } | null
  contact: { state: CardState; value: ChatProfile['contact'] }
  onSwapContact: () => void
  onClose: () => void
}

function contactText(contact: Props['contact'], name: string): { title: string; sub: string } {
  const { state, value } = contact
  if (state === 'open' && value) {
    return {
      title: value.kind === 'instagram' ? `@${value.value}` : `+91 ${value.value}`,
      sub: 'You swapped contacts. Take it off Reveal whenever you like.',
    }
  }
  if (state === 'you_asked') return { title: 'You asked to swap contacts', sub: `It opens for both of you when ${name} says yes.` }
  if (state === 'they_asked') return { title: `${name} wants to swap contacts`, sub: 'Both open at once. Can’t be undone.' }
  if (state === 'needs_yours') return { title: 'Contact is the last card', sub: 'Add yours in the You tab to swap it.' }
  if (state === 'needs_theirs') return { title: 'Contact is the last card', sub: `${name} hasn’t added one yet.` }
  return { title: 'Contact is the last card', sub: 'Take it off Reveal when you’re both ready.' }
}

/** "You both said yes": their whole photo, what it took to get here, and the last card left. */
export function Revealed({ name, photoUrl, line, chips, voice, contact, onSwapContact, onClose }: Props) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { title, sub } = contactText(contact, name)
  const canSwap = contact.state === 'can_ask' || contact.state === 'they_asked'
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-30 overflow-y-auto bg-bg text-text"
    >
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <div
          className="relative h-[min(470px,56dvh)] shrink-0 overflow-hidden bg-night select-none [-webkit-touch-callout:none]"
          onContextMenu={(event) => event.preventDefault()}
        >
          {photoUrl && (
            <img
              src={photoUrl}
              alt={`${name}'s photo`}
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full object-cover"
            />
          )}
          {/* Covers the picture, so a long press or drag hits this layer instead. */}
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent from-55% to-night/75" />
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            className="absolute top-[max(1rem,env(safe-area-inset-top))] left-3.5 flex size-11 items-center justify-center rounded-full border-0 bg-night/40 text-white"
          >
            <BackIcon className="size-5" />
          </button>
          <div className="absolute right-[22px] bottom-[22px] left-[22px] text-white">
            <p className="m-0 text-[11px] font-semibold tracking-[0.16em] text-peach uppercase">You both said yes</p>
            <h2 id={titleId} className="m-0 mt-1.5 font-display text-[52px] leading-none font-normal">
              Hi, <em>{name}.</em>
            </h2>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3.5 px-5 pt-[18px] pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          <p className="m-0 text-sm leading-[1.5] text-muted">
            {line} The photo stays inside Reveal and goes away if either of you unmatches.
          </p>
          {(chips.length > 0 || voice) && (
            <ul aria-label="What you know" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {chips.map((chip) => (
                <li key={chip} className="rounded-[14px] border border-border bg-surface px-3 py-[7px] text-xs">
                  {chip}
                </li>
              ))}
              {voice && (
                <li>
                  <button
                    type="button"
                    onClick={voice.onToggle}
                    aria-label={voice.playing ? 'Pause voice note' : 'Play voice note'}
                    className="inline-flex min-h-[30px] items-center gap-1.5 rounded-[14px] border border-border bg-surface px-3 text-xs text-text"
                  >
                    <span aria-hidden="true">{voice.playing ? '❚❚' : '▶'}</span>
                    Voice{voice.seconds ? ` · 0:${String(voice.seconds).padStart(2, '0')}` : ''}
                  </button>
                </li>
              )}
            </ul>
          )}

          <div className="flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-4">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-accent-bg text-accent-text"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16v12H4z" />
                <path d="M4 7l8 6 8-6" />
              </svg>
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[15px] font-medium select-text">{title}</span>
              <span className="text-[13px] text-muted">{sub}</span>
            </span>
          </div>

          <div className="flex-1" />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[52px] flex-1 rounded-full border border-border-strong bg-transparent text-[15px] font-medium text-text"
            >
              Back to chat
            </button>
            {canSwap && (
              <button
                type="button"
                onClick={onSwapContact}
                className="min-h-[52px] flex-[1.3] rounded-full border-0 bg-accent text-[15px] font-semibold text-on-accent"
              >
                Swap contact
              </button>
            )}
            {contact.state === 'you_asked' && (
              <button
                type="button"
                disabled
                className="min-h-[52px] flex-[1.3] rounded-full border-0 bg-surface-2 text-[15px] font-semibold text-muted"
              >
                Asked ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
