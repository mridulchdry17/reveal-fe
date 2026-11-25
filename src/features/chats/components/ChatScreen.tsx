import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { AlertIcon, ShieldCheckIcon } from '@/components/icons'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { ApiError } from '@/lib/api/errors'

import type { Card } from '../api/chats'
import { useChat, useEndChat, useMarkRead, useSendMessage, type SafetyAction } from '../hooks/useChats'
import { useRevealedOnce } from '../hooks/useRevealedOnce'
import {
  useAnswerSwap,
  useAskSwap,
  useGuessCard,
  useTheirPhoto,
  useTheirVoice,
  useWithdrawSwap,
} from '../hooks/useSwaps'
import { chatErrorMessage } from '../utils/errorMessage'
import { revealedChips, revealedLine } from '../utils/revealed'
import { displayName } from '../utils/swapCopy'
import { clockTime } from '../utils/time'
import { buildTimeline, cardProgress } from '../utils/timeline'
import { CardStrip } from './CardStrip'
import { Initial } from './ChatRow'
import { FullPictureSheet } from './FullPictureSheet'
import { GuessPanel } from './GuessPanel'
import { Revealed } from './Revealed'
import { SafetySheet } from './SafetySheet'
import { SwapRequest } from './SwapRequest'
import { SwapSheet } from './SwapSheet'
import { TheirPhoto } from './TheirPhoto'

const MESSAGE_MAX = 1000

type Props = {
  /** My own photo as a small round picture, composed in from the profile feature. */
  me?: ReactNode
}

/** One chat. New messages arrive by polling every few seconds while it's open. */
export function ChatScreen({ me }: Props) {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const chat = useChat(matchId)
  const send = useSendMessage(matchId)
  const { mutate: markRead } = useMarkRead(matchId)
  const end = useEndChat(matchId)
  const [draft, setDraft] = useState('')
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [asking, setAsking] = useState<Card | null>(null)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [guessing, setGuessing] = useState<string | null>(null)
  const [fullPicture, setFullPicture] = useState(false)
  const guessCard = useGuessCard(matchId)
  const withdraw = useWithdrawSwap(matchId)
  const [playing, setPlaying] = useState(false)
  const ask = useAskSwap(matchId)
  const answer = useAnswerSwap(matchId)
  const bottom = useRef<HTMLDivElement>(null)
  const audio = useRef<HTMLAudioElement>(null)

  const board = chat.data?.swaps
  const pieces = board?.photo_pieces ?? []
  const voiceOpen = board?.cards.some((c) => c.card === 'voice' && c.state === 'open') ?? false
  const photoState = board?.cards.find((c) => c.card === 'photo')?.state
  const revealed = useRevealedOnce(matchId, photoState === 'open')
  const photo = useTheirPhoto(matchId, pieces)
  const voice = useTheirVoice(matchId, voiceOpen)
  const photoUrl = useObjectUrl(photo.data)
  const voiceUrl = useObjectUrl(voice.data)

  const messages = chat.data?.messages ?? []
  const last = messages.at(-1)
  // Seen their latest message: clear the unread dot. Scroll to it either way.
  useEffect(() => {
    if (last && !last.mine) markRead()
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [last, markRead])

  const closeSwap = useCallback(() => setAsking(null), [])
  const closePhoto = useCallback(() => setPhotoOpen(false), [])
  const closeGuess = useCallback(() => setGuessing(null), [])
  const closeFullPicture = useCallback(() => setFullPicture(false), [])

  const closeSafety = useCallback(() => {
    setSafetyOpen(false)
    end.reset()
  }, [end])

  const ended = chat.error instanceof ApiError && chat.error.code === 'match_not_found'
  if (chat.isPending) return <Shell>{null}</Shell>
  if (chat.isError) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="m-0 font-display text-[36px] leading-none font-normal">
            {ended ? 'This chat has ended' : "Couldn't open this chat"}
          </h1>
          <p className="m-0 text-sm text-muted">
            {ended ? 'It closed for both of you.' : chatErrorMessage(chat.error)}
          </p>
          <Link
            to="/app/chats"
            className="mt-2 inline-flex h-11 items-center rounded-full bg-text px-5 text-sm font-bold text-bg no-underline"
          >
            Back to Chats
          </Link>
        </div>
      </Shell>
    )
  }

  const { profile, swaps } = chat.data
  const name = displayName(profile)
  const progress = cardProgress(profile)
  const timeline = buildTimeline(messages, swaps, profile)
  const request = swaps.cards.find((c) => c.state === 'they_asked')
  const guessed = guessing ? profile.guess_cards.find((c) => c.id === guessing) : undefined
  const answerError = answer.isError ? chatErrorMessage(answer.error) : undefined
  const contact = swaps.cards.find((c) => c.card === 'contact')
  const toggleVoice = () => {
    const player = audio.current
    if (player?.paused) void player.play()
    else player?.pause()
  }
  const select = (card: Card) => {
    const state = swaps.cards.find((c) => c.card === card)?.state
    if (state === 'open' && card === 'voice') return toggleVoice()
    ask.reset()
    answer.reset()
    withdraw.reset()
    setAsking(card)
  }
  const openGuess = (cardId: string) => {
    guessCard.reset()
    setGuessing(cardId)
  }
  const openFinale = () => {
    if (photoState === 'open') return revealed.open()
    ask.reset()
    answer.reset()
    withdraw.reset()
    setFullPicture(true)
  }
  const sheetState = asking ? swaps.cards.find((c) => c.card === asking)?.state : undefined
  const submit = () => {
    const body = draft.trim()
    if (!body || send.isPending) return
    send.mutate(body, { onSuccess: () => setDraft('') })
  }
  const act = (action: SafetyAction) =>
    end.mutate(action, {
      onSuccess: () => navigate('/app/chats', { replace: true, state: { ended: action.kind } }),
    })

  return (
    <Shell>
      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-bg/95 px-4 pt-3 pb-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Link
            to="/app/chats"
            aria-label="Back to Chats"
            className="-ml-2 flex size-11 items-center justify-center text-xl text-text no-underline"
          >
            ←
          </Link>
          {photoUrl ? (
            <button
              type="button"
              aria-label={`See ${name}'s photo`}
              onClick={() => setPhotoOpen(true)}
              className="size-10 shrink-0 overflow-hidden rounded-full border-[1.5px] border-text bg-surface-2 p-0"
            >
              <img src={photoUrl} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
            </button>
          ) : (
            <Initial name={name} size="sm" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="m-0 truncate font-display text-[24px] leading-[1.1] font-normal">{name}</h1>
            <p className="m-0 truncate text-xs text-muted">
              {progress.open} of {progress.total} cards open
              {profile.first_name && ` · was ${profile.nickname}`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Report, block or unmatch"
            onClick={() => setSafetyOpen(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-surface text-text"
          >
            <ShieldCheckIcon className="size-[22px]" />
          </button>
        </div>
        <CardStrip
          profile={profile}
          cards={swaps.cards}
          playing={playing}
          onSelect={select}
          onGuess={openGuess}
          onFinale={openFinale}
        />
        {voiceUrl && (
          <audio
            ref={audio}
            src={voiceUrl}
            preload="auto"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        )}
      </header>

      <ol aria-label="Messages" className="m-0 flex flex-1 list-none flex-col gap-2 px-4 py-4">
        {timeline.length === 0 && (
          <li className="m-auto flex max-w-[280px] flex-col items-center gap-2 text-center">
            <span className="font-display text-[34px] leading-[0.95]">
              Pehle baat, <em className="text-accent-text">phir photo.</em>
            </span>
            <span className="text-sm leading-6 text-muted">
              You matched with {profile.nickname}. Either of you can say hi first.
            </span>
          </li>
        )}
        {timeline.map((item) => {
          if (item.kind === 'day') {
            return (
              <li key={item.key} className="self-center pt-1 text-[11px] tracking-[0.14em] text-muted uppercase">
                {item.label}
              </li>
            )
          }
          if (item.kind === 'swap') {
            return (
              <li key={item.key} className="self-center rounded-[12px] bg-open-bg px-3 py-1.5 text-center text-xs text-open">
                {item.text}
              </li>
            )
          }
          const m = item.message
          return (
            <li
              key={item.key}
              className={`flex max-w-[78%] flex-col gap-0.5 ${m.mine ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <span className="sr-only">{m.mine ? 'You' : name}:</span>
              <span
                className={`rounded-[18px] px-3.5 py-[11px] text-[15px] leading-[1.4] break-words whitespace-pre-wrap ${
                  m.mine
                    ? 'rounded-br-md bg-forest text-white'
                    : 'rounded-bl-md border border-border bg-surface text-text'
                }`}
              >
                {m.body}
              </span>
              <span className="px-1 text-[11px] text-muted">{clockTime(m.sent_at)}</span>
            </li>
          )
        })}
      </ol>
      <div ref={bottom} />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-bg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {guessed && (
          <GuessPanel
            key={guessed.id}
            card={guessed}
            result={guessCard.data}
            piecesReward={profile.has_blurred_photo}
            pending={guessCard.isPending}
            error={guessCard.isError ? chatErrorMessage(guessCard.error) : undefined}
            onPick={(pick) => guessCard.mutate({ cardId: guessed.id, pick })}
            onClose={closeGuess}
          />
        )}
        {request && !guessed && (
          <SwapRequest
            card={request.card}
            nickname={name}
            pending={answer.isPending}
            onAnswer={(yes) => answer.mutate({ card: request.card, yes })}
          />
        )}
        {answerError && !asking && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {answerError}
          </p>
        )}
        {send.isError && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {chatErrorMessage(send.error)}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <textarea
            id="message"
            rows={1}
            maxLength={MESSAGE_MAX}
            value={draft}
            placeholder="Say something"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            className="max-h-32 min-h-12 flex-1 resize-none rounded-[24px] border-[1.5px] border-field bg-surface px-4 py-3 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim() || send.isPending}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-transform duration-150 active:scale-90 disabled:opacity-40"
          >
            <svg
              viewBox="0 0 16 16"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2.5 8h10M8.5 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </form>

      {asking && (sheetState === 'can_ask' || sheetState === 'they_asked' || sheetState === 'you_asked') && (
        <SwapSheet
          card={asking}
          nickname={name}
          mode={sheetState === 'they_asked' ? 'answer' : sheetState === 'you_asked' ? 'withdraw' : 'ask'}
          pending={ask.isPending || answer.isPending || withdraw.isPending}
          error={
            ask.isError
              ? chatErrorMessage(ask.error)
              : answer.isError
                ? chatErrorMessage(answer.error)
                : withdraw.isError
                  ? chatErrorMessage(withdraw.error)
                  : undefined
          }
          onSwap={() =>
            sheetState === 'they_asked'
              ? answer.mutate({ card: asking, yes: true }, { onSuccess: () => setAsking(null) })
              : ask.mutate(asking, { onSuccess: () => setAsking(null) })
          }
          onNotYet={() =>
            sheetState === 'they_asked'
              ? answer.mutate({ card: asking, yes: false }, { onSuccess: () => setAsking(null) })
              : setAsking(null)
          }
          onWithdraw={() => withdraw.mutate(asking, { onSuccess: () => setAsking(null) })}
          onClose={closeSwap}
        />
      )}

      {fullPicture && photoState && (
        <FullPictureSheet
          name={name}
          state={photoState}
          me={me}
          theirPhotoUrl={photoUrl}
          pieces={pieces}
          pending={ask.isPending || answer.isPending || withdraw.isPending}
          error={
            ask.isError
              ? chatErrorMessage(ask.error)
              : answer.isError
                ? chatErrorMessage(answer.error)
                : withdraw.isError
                  ? chatErrorMessage(withdraw.error)
                  : undefined
          }
          onReady={() =>
            photoState === 'they_asked'
              ? answer.mutate({ card: 'photo', yes: true }, { onSuccess: closeFullPicture })
              : ask.mutate('photo')
          }
          onWithdraw={() => withdraw.mutate('photo')}
          onSee={() => {
            setFullPicture(false)
            revealed.open()
          }}
          onClose={closeFullPicture}
        />
      )}

      {revealed.show && (
        <Revealed
          name={name}
          photoUrl={photoUrl}
          line={revealedLine(chat.data)}
          chips={revealedChips(chat.data)}
          voice={voiceOpen ? { seconds: profile.voice_seconds, playing, onToggle: toggleVoice } : null}
          contact={{ state: contact?.state ?? 'locked', value: profile.contact }}
          onSwapContact={() => select('contact')}
          onClose={revealed.close}
        />
      )}

      {photoOpen && pieces.length > 0 && (
        <TheirPhoto url={photoUrl} pieces={pieces} nickname={name} onClose={closePhoto} />
      )}

      {safetyOpen && (
        <SafetySheet
          nickname={name}
          pending={end.isPending}
          error={end.isError ? chatErrorMessage(end.error) : undefined}
          onAction={act}
          onClose={closeSafety}
        />
      )}
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">{children}</div>
    </div>
  )
}
