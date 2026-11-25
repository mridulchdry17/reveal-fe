import type { ReactNode } from 'react'

import { LockIcon } from '@/components/icons'
import { branchLine, guessKindLabels, lookingForLabels } from '@/utils/cardLabels'

import type { Card, CardSwap, ChatProfile, GuessCard } from '../api/chats'
import { cardCopy } from '../utils/swapCopy'

type Props = {
  profile: ChatProfile
  cards: CardSwap[]
  playing: boolean
  /** A hidden card to ask for, a request to answer or take back, or an open voice note to play. */
  onSelect: (card: Card) => void
  /** An unguessed guess card: opens the guess panel. */
  onGuess: (cardId: string) => void
  /** The last tile: the photo swap. */
  onFinale: () => void
}

const tile =
  'flex min-h-[52px] min-w-[92px] shrink-0 flex-col items-start justify-center gap-[3px] rounded-[14px] px-3 py-2 text-left'
const kicker = 'text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase'
const value = 'text-[13px] font-medium whitespace-nowrap'
// Card states differ by more than colour: shown = solid, hidden = hatched + dashed, pending = accent outline, sealed = lock.
const shown = `${tile} border border-border bg-surface text-text`
const hidden = `${tile} hatch border-[1.5px] border-dashed border-locked text-text`
const sealed = `${tile} border border-border bg-surface-2 text-muted`

function openValue(card: Card, profile: ChatProfile, playing: boolean): string {
  switch (card) {
    case 'first_name':
      return profile.first_name ?? 'Open'
    case 'branch':
      return profile.branch ? branchLine(profile.branch, profile.year) : 'Open'
    case 'hometown':
      return profile.hometown ?? 'Open'
    case 'looking_for':
      return profile.looking_for ? lookingForLabels[profile.looking_for] : 'Open'
    case 'voice':
      return `${playing ? '❚❚ Pause' : '▶ Play'}${profile.voice_seconds ? ` · 0:${String(profile.voice_seconds).padStart(2, '0')}` : ''}`
    case 'contact':
      if (!profile.contact) return 'Open'
      return profile.contact.kind === 'instagram' ? `@${profile.contact.value}` : `+91 ${profile.contact.value}`
    case 'photo':
      return 'Open'
  }
}

function Tile({ top, bottom, className }: { top: ReactNode; bottom: ReactNode; className: string }) {
  return (
    <span className={className}>
      <span className={kicker}>{top}</span>
      <span className={value}>{bottom}</span>
    </span>
  )
}

function SwapTile({ swap, profile, playing, onSelect }: { swap: CardSwap; profile: ChatProfile; playing: boolean; onSelect: Props['onSelect'] }) {
  const { card, state } = swap
  const { label, plural } = cardCopy[card]
  const lock = card === 'photo' || card === 'contact' ? <LockIcon className="mr-1 inline size-3 align-[-1px]" /> : null
  switch (state) {
    case 'open':
      return card === 'voice' ? (
        <button type="button" aria-label={playing ? 'Pause voice note' : 'Play voice note'} onClick={() => onSelect(card)} className={shown}>
          <span className={`${kicker} text-muted`}>{label}</span>
          <span className={value}>{openValue(card, profile, playing)}</span>
        </button>
      ) : (
        <Tile className={`${shown} select-text`} top={<span className="text-muted">{label}</span>} bottom={openValue(card, profile, playing)} />
      )
    case 'can_ask':
      return (
        <button type="button" aria-label={`Swap ${plural}`} onClick={() => onSelect(card)} className={hidden}>
          <span className={`${kicker} text-locked`}>
            {lock}
            {label}
          </span>
          <span className={value}>Ask to swap</span>
        </button>
      )
    case 'they_asked':
      return (
        <button
          type="button"
          aria-label={`They want to swap ${plural}`}
          onClick={() => onSelect(card)}
          className={`${tile} border-2 border-accent bg-accent-bg text-text`}
        >
          <span className={`${kicker} text-accent-text`}>{label}</span>
          <span className={`${value} font-semibold`}>They asked</span>
        </button>
      )
    case 'you_asked':
      return (
        <button
          type="button"
          aria-label={`You asked to swap ${plural}`}
          onClick={() => onSelect(card)}
          className={`${tile} border-[1.5px] border-accent bg-transparent text-text`}
        >
          <span className={`${kicker} text-accent-text`}>{label}</span>
          <span className={value}>You asked</span>
        </button>
      )
    case 'locked':
      return <Tile className={sealed} top={<>{<LockIcon className="mr-1 inline size-3 align-[-1px]" />}{label}</>} bottom="After photos" />
    case 'needs_yours':
      return <Tile className={sealed} top={<>{<LockIcon className="mr-1 inline size-3 align-[-1px]" />}{label}</>} bottom="Add yours in You" />
    case 'needs_theirs':
      return <Tile className={sealed} top={<>{<LockIcon className="mr-1 inline size-3 align-[-1px]" />}{label}</>} bottom="Not added yet" />
  }
}

function GuessTile({ card, onGuess }: { card: GuessCard; onGuess: Props['onGuess'] }) {
  const kind = guessKindLabels[card.kind]
  if (card.answer === null) {
    return (
      <button
        type="button"
        aria-label={`Guess: ${card.question}`}
        onClick={() => onGuess(card.id)}
        className={`${tile} border-[1.5px] border-accent bg-accent-bg text-text`}
      >
        <span className={`${kicker} text-accent-text`}>{kind}</span>
        <span className={value}>Guess it →</span>
      </button>
    )
  }
  const right = card.picked === card.answer
  return (
    <Tile
      className={shown}
      top={
        <span className="text-muted">
          {kind}
          {right && (
            <>
              {' '}
              <span aria-hidden="true">✓</span>
              <span className="sr-only">(you guessed right)</span>
            </>
          )}
        </span>
      }
      bottom={card.options[card.answer] ?? ''}
    />
  )
}

/**
 * Everything you can learn about them, left to right: their guess cards, the cards you swap,
 * and the photo as the finale. Each tile is a small-caps kicker over a value or what to do.
 */
export function CardStrip({ profile, cards, playing, onSelect, onGuess, onFinale }: Props) {
  const photo = cards.find((c) => c.card === 'photo')
  const hasLookingFor = cards.some((c) => c.card === 'looking_for')
  // The photo is the finale tile; contact only matters once photos are swapped.
  const swaps = cards.filter((c) => c.card !== 'photo' && !(c.card === 'contact' && c.state === 'locked'))
  return (
    <ul aria-label="Their cards" className="-mx-4 m-0 flex list-none gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
      {profile.guess_cards.map((card) => (
        <li key={card.id} className="flex shrink-0">
          <GuessTile card={card} onGuess={onGuess} />
        </li>
      ))}
      {!hasLookingFor && profile.looking_for && (
        <li className="flex shrink-0">
          <Tile className={shown} top={<span className="text-muted">{cardCopy.looking_for.label}</span>} bottom={lookingForLabels[profile.looking_for]} />
        </li>
      )}
      {swaps.map((swap) => (
        <li key={swap.card} className="flex shrink-0">
          <SwapTile swap={swap} profile={profile} playing={playing} onSelect={onSelect} />
        </li>
      ))}
      {photo && (
        <li className="flex shrink-0">
          <button
            type="button"
            aria-label="Full picture"
            onClick={onFinale}
            className={`${tile} min-w-[110px] border-0 bg-forest text-white`}
          >
            <span className={`${kicker} text-peach`}>
              {photo.state !== 'open' && <LockIcon className="mr-1 inline size-3 align-[-1px]" />}
              Finale
            </span>
            <span className={value}>Full picture →</span>
          </button>
        </li>
      )}
    </ul>
  )
}
