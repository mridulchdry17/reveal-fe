import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { AlertIcon, ShieldCheckIcon } from '@/components/icons'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { ApiError } from '@/lib/api/errors'

import type { Card } from '../api/chats'
import { useChat, useEndChat, useMarkRead, useSendMessage, type SafetyAction } from '../hooks/useChats'
import { useAnswerSwap, useAskSwap, useRefreshThread, useTheirPhoto, useTheirVoice } from '../hooks/useSwaps'
import type { GuessSlot } from '../types/guessSlot'
import { chatErrorMessage } from '../utils/errorMessage'
import { shortTime } from '../utils/time'
import { CardStrip } from './CardStrip'
import { Initial } from './ChatRow'
import { GuessSheet } from './GuessSheet'
import { SafetySheet } from './SafetySheet'
import { SwapRequest } from './SwapRequest'
import { SwapSheet } from './SwapSheet'
import { TheirPhoto } from './TheirPhoto'

const MESSAGE_MAX = 1000

type Props = {
  /** Their guess cards, composed in from the guess feature. */
  guess?: GuessSlot
}

/** One chat. New messages arrive by polling every few seconds while it's open. */
export function ChatScreen({ guess }: Props) {
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
  const [guessOpen, setGuessOpen] = useState(false)
  const refreshThread = useRefreshThread(matchId)
  const [playing, setPlaying] = useState(false)
  const ask = useAskSwap(matchId)
  const answer = useAnswerSwap(matchId)
  const bottom = useRef<HTMLDivElement>(null)
  const audio = useRef<HTMLAudioElement>(null)

  const board = chat.data?.swaps
  const pieces = board?.photo_pieces ?? []
  const voiceOpen = board?.cards.some((c) => c.card === 'voice' && c.state === 'open') ?? false
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
  const closeGuess = useCallback(() => setGuessOpen(false), [])

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
  const request = swaps.cards.find((c) => c.state === 'they_asked')
  const unguessed = profile.guess_cards.filter((c) => c.answer === null).length
  const answerError = answer.isError ? chatErrorMessage(answer.error) : undefined
  const select = (card: Card) => {
    const state = swaps.cards.find((c) => c.card === card)?.state
    if (state === 'open' && card === 'photo') return setPhotoOpen(true)
    if (state === 'open' && card === 'voice') {
      const player = audio.current
      if (player?.paused) void player.play()
      else player?.pause()
      return
    }
    ask.reset()
    answer.reset()
    setAsking(card)
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
              aria-label={`See ${profile.nickname}'s photo`}
              onClick={() => setPhotoOpen(true)}
              className="size-10 shrink-0 overflow-hidden rounded-full border-[1.5px] border-text bg-surface-2 p-0"
            >
              <img src={photoUrl} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
            </button>
          ) : (
            <Initial name={profile.nickname} size="sm" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="m-0 truncate font-display text-[26px] leading-none font-normal">{profile.nickname}</h1>
            <p className="m-0 truncate text-xs text-muted">{profile.vibe}</p>
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
        <CardStrip profile={profile} cards={swaps.cards} playing={playing} onSelect={select} />
        {guess && unguessed > 0 && (
          <button
            type="button"
            onClick={() => setGuessOpen(true)}
            className="flex min-h-11 w-fit items-center gap-2 rounded-full border-[1.5px] border-dashed border-border-strong bg-transparent px-4 text-[13px] font-semibold text-text"
          >
            Guess {profile.nickname}'s cards
            <span className="font-normal text-muted">· {unguessed} left</span>
          </button>
        )}
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
        {messages.length === 0 && (
          <li className="m-auto flex max-w-[280px] flex-col items-center gap-2 text-center">
            <span className="font-display text-[34px] leading-[0.95]">
              Pehle baat, <em className="text-accent-text">phir photo.</em>
            </span>
            <span className="text-sm leading-6 text-muted">
              You matched with {profile.nickname}. Either of you can say hi first.
            </span>
          </li>
        )}
        {messages.map((m) => (
          <li
            key={m.id}
            className={`flex max-w-[80%] flex-col gap-0.5 ${m.mine ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <span className="sr-only">{m.mine ? 'You' : profile.nickname}:</span>
            <span
              className={`rounded-[20px] px-4 py-2.5 text-[15px] leading-snug break-words whitespace-pre-wrap ${
                m.mine
                  ? 'rounded-br-md bg-forest text-white'
                  : 'rounded-bl-md border border-border bg-surface text-text shadow-[0_8px_20px_-16px_rgb(40_20_10/0.5)]'
              }`}
            >
              {m.body}
            </span>
            <span className="px-1 text-[11px] text-muted">{shortTime(m.sent_at)}</span>
          </li>
        ))}
      </ol>
      <div ref={bottom} />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-bg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {request && (
          <SwapRequest
            card={request.card}
            nickname={profile.nickname}
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
            placeholder="Say something real"
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

      {asking && (sheetState === 'can_ask' || sheetState === 'they_asked') && (
        <SwapSheet
          card={asking}
          nickname={profile.nickname}
          mode={sheetState === 'they_asked' ? 'answer' : 'ask'}
          pending={ask.isPending || answer.isPending}
          error={
            ask.isError ? chatErrorMessage(ask.error) : answer.isError ? chatErrorMessage(answer.error) : undefined
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
          onClose={closeSwap}
        />
      )}

      {guessOpen && guess && (
        <GuessSheet nickname={profile.nickname} onClose={closeGuess}>
          {guess({
            cards: profile.guess_cards,
            rightGuesses: profile.right_guesses,
            reward: profile.has_blurred_photo ? 'pieces' : null,
            onGuessed: () => void refreshThread(),
            onStale: () => void refreshThread(),
          })}
        </GuessSheet>
      )}

      {photoOpen && pieces.length > 0 && (
        <TheirPhoto url={photoUrl} pieces={pieces} nickname={profile.nickname} onClose={closePhoto} />
      )}

      {safetyOpen && (
        <SafetySheet
          nickname={profile.nickname}
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
