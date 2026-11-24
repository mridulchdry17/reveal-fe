import { CheckIcon, LockIcon } from '@/components/icons'
import { branchLine, lookingForLabels } from '@/utils/cardLabels'

import type { Card, ChatProfile, ChatThread } from '../api/chats'
import { cardCopy } from '../utils/swapCopy'

type Props = {
  profile: ChatProfile
  cards: ChatThread['swaps']['cards']
  playing: boolean
  /** A hidden card to ask for, a request to answer, or an open voice note / photo to see. */
  onSelect: (card: Card) => void
}

const chip = 'flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] whitespace-nowrap'
const shown = `${chip} bg-open-bg font-semibold text-open`

function openValue(card: Card, profile: ChatProfile, playing: boolean): string {
  switch (card) {
    case 'first_name':
      return profile.first_name ?? cardCopy.first_name.label
    case 'branch':
      return profile.branch ? branchLine(profile.branch, profile.year) : cardCopy.branch.label
    case 'hometown':
      return profile.hometown ?? cardCopy.hometown.label
    case 'voice':
      return `${playing ? '❚❚' : '▶'} Voice${profile.voice_seconds ? ` · 0:${String(profile.voice_seconds).padStart(2, '0')}` : ''}`
    case 'photo':
      return 'See photo'
    case 'contact':
      if (!profile.contact) return cardCopy.contact.label
      return profile.contact.kind === 'instagram' ? `@${profile.contact.value}` : `+91 ${profile.contact.value}`
    default:
      return cardCopy[card].label
  }
}

/** Their cards and where each swap stands. Shown, hidden, pending and sealed look different. */
export function CardStrip({ profile, cards, playing, onSelect }: Props) {
  return (
    <ul aria-label="Their cards" className="-mx-4 m-0 flex list-none gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
      {profile.looking_for && (
        <li className={shown}>
          <CheckIcon className="size-3.5" />
          {lookingForLabels[profile.looking_for]}
        </li>
      )}
      {cards.map(({ card, state }) => {
        const { label, plural } = cardCopy[card]
        switch (state) {
          case 'open':
            return (
              <li key={card}>
                {card === 'voice' || card === 'photo' ? (
                  <button type="button" onClick={() => onSelect(card)} className={`${shown} border-0`}>
                    {openValue(card, profile, playing)}
                  </button>
                ) : (
                  <span className={`${shown} select-text`}>
                    <CheckIcon className="size-3.5" />
                    {openValue(card, profile, playing)}
                  </span>
                )}
              </li>
            )
          case 'can_ask':
            return (
              <li key={card}>
                <button
                  type="button"
                  aria-label={`Swap ${plural}`}
                  onClick={() => onSelect(card)}
                  className={`${chip} hatch border-[1.5px] border-dashed border-locked text-locked`}
                >
                  {card === 'photo' || card === 'contact' ? <LockIcon className="size-3" /> : null}
                  {label} · <span className="font-semibold">Swap</span>
                </button>
              </li>
            )
          case 'they_asked':
            return (
              <li key={card}>
                <button
                  type="button"
                  aria-label={`They want to swap ${plural}`}
                  onClick={() => onSelect(card)}
                  className={`${chip} border-2 border-accent bg-accent-bg font-semibold text-accent-text`}
                >
                  {label} · they asked
                </button>
              </li>
            )
          case 'you_asked':
            return (
              <li key={card} className={`${chip} border-[1.5px] border-accent bg-surface text-accent-text`}>
                {label} · waiting
              </li>
            )
          case 'locked':
            return (
              <li key={card} className={`${chip} border border-border bg-surface-2 text-muted`}>
                <LockIcon className="size-3" />
                {label} · {card === 'photo' ? 'after a card swap' : 'after photos'}
              </li>
            )
          case 'needs_yours':
            return (
              <li key={card} className={`${chip} border border-border bg-surface-2 text-muted`}>
                <LockIcon className="size-3" />
                {label} · add yours in You
              </li>
            )
          case 'needs_theirs':
            return (
              <li key={card} className={`${chip} border border-border bg-surface-2 text-muted`}>
                <LockIcon className="size-3" />
                {label} · not added yet
              </li>
            )
        }
      })}
    </ul>
  )
}
