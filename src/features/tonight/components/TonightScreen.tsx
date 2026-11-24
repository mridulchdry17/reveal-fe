import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { AlertIcon, CloseIcon, HeartIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useObjectUrl } from '@/hooks/useObjectUrl'

import type { DropItem, LikeRequest } from '../api/drops'
import { useDropPhoto } from '../hooks/useBlurredPhoto'
import { useDropGuessed } from '../hooks/useGuessed'
import { useLikeItem, usePassItem, useTonight } from '../hooks/useTonight'
import type { GuessSlot } from '../types/guessSlot'
import { dropErrorMessage } from '../utils/errorMessage'
import { timeLeft } from '../utils/timeLeft'
import { DropProfile } from './DropProfile'
import { LikeSheet } from './LikeSheet'
import { MatchMoment } from './MatchMoment'
import { NextDrop } from './NextDrop'

type Props = {
  /** Their guess cards, composed in from the guess feature. */
  guess?: GuessSlot
  /** Shown once they're caught up: the notifications nudge, from its feature. */
  reminder?: ReactNode
}

/** Tonight's drop: one profile at a time. Like a line or pass; guessing their cards is optional. */
export function TonightScreen({ guess, reminder }: Props) {
  const drop = useTonight()
  const like = useLikeItem()
  const pass = usePassItem()
  const [liking, setLiking] = useState<{ item: DropItem; promptId: string } | null>(null)
  const [matched, setMatched] = useState<string | null>(null)
  const currentItem = drop.data?.items.find((item) => !item.decision)
  const currentId = currentItem?.id
  const guessed = useDropGuessed()
  const photo = useDropPhoto(
    currentId,
    currentItem?.profile.has_blurred_photo ?? false,
    currentItem?.profile.right_guesses ?? 0,
  )
  const photoUrl = useObjectUrl(photo.data)
  // Each new person starts at the top, not where the last one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentId])
  const closeSheet = useCallback(() => {
    setLiking(null)
    like.reset()
  }, [like])

  if (drop.isPending) {
    return <Header kicker="Tonight" subtitle="Getting tonight's drop…" />
  }
  if (drop.isError) {
    return (
      <section>
        <Header kicker="Tonight" />
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(drop.error)}
        </p>
        <button
          type="button"
          onClick={() => void drop.refetch()}
          className="mt-4 h-11 rounded-full bg-text px-5 text-sm font-bold text-bg"
        >
          Try again
        </button>
      </section>
    )
  }

  const { items, next_drop_at } = drop.data
  const current = items.find((item) => !item.decision)
  const seen = items.filter((item) => item.decision).length
  const next = `Next drop in ${timeLeft(next_drop_at)}`
  const kicker =
    items.length === 0
      ? 'Between drops'
      : current
        ? `${seen + 1} of ${items.length} tonight`
        : 'All caught up'

  const send = (body: LikeRequest) => {
    if (!liking) return
    const { item } = liking
    like.mutate(
      { itemId: item.id, body },
      {
        onSuccess: (result) => {
          setLiking(null)
          setMatched(result.matched ? item.profile.nickname : null)
        },
      },
    )
  }

  return (
    <section className="flex flex-col gap-4 pb-6">
      <Header
        kicker={kicker}
        subtitle={next}
        aside={
          items.length > 0 && (
            <span role="img" aria-label={`${seen} of ${items.length} seen`} className="flex gap-1 pb-2">
              {items.map((item) => (
                <span
                  key={item.id}
                  className={`h-1.5 w-[18px] rounded-full ${item.decision ? 'bg-accent' : 'bg-border-strong/50'}`}
                />
              ))}
            </span>
          )
        }
      />

      {matched && <MatchMoment nickname={matched} />}
      {(pass.isError || (like.isError && !liking)) && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(pass.error ?? like.error)}
        </p>
      )}

      {current ? (
        <>
          <DropProfile
            key={current.id}
            profile={current.profile}
            onLikePrompt={(promptId) => setLiking({ item: current, promptId })}
            photoUrl={current.profile.has_blurred_photo ? photoUrl : null}
            guess={guess?.({
              cards: current.profile.guess_cards,
              rightGuesses: current.profile.right_guesses,
              reward: current.profile.has_blurred_photo ? 'blur' : null,
              onGuessed: (cardId, result) => guessed.onGuessed(current.id, cardId, result),
              onStale: guessed.onStale,
            })}
          />
          <div className="flex items-center justify-center gap-6 pt-1">
            <button
              type="button"
              aria-label={`Pass on ${current.profile.nickname}`}
              disabled={pass.isPending}
              onClick={() => {
                setMatched(null)
                pass.mutate({ itemId: current.id })
              }}
              className="flex size-16 items-center justify-center rounded-full border-[1.5px] border-text bg-surface text-text transition-transform duration-150 active:scale-90 disabled:opacity-50"
            >
              <CloseIcon className="size-6" />
            </button>
            <button
              type="button"
              aria-label={`Like ${current.profile.nickname}`}
              onClick={() => {
                const first = current.profile.prompts[0]
                if (first) setLiking({ item: current, promptId: first.id })
              }}
              className="flex size-[76px] items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_14px_30px_-12px_rgb(180_83_44/0.7)] transition-transform duration-150 active:scale-90"
            >
              <HeartIcon className="size-8" />
            </button>
          </div>
          <p className="m-0 text-center text-[13px] text-muted">
            Tap a heart to like one answer. Passing is private.
          </p>
        </>
      ) : (
        <>
          <NextDrop
            nextDropAt={next_drop_at}
            heading={items.length > 0 ? "That's everyone for tonight" : 'No one new right now'}
            body={
              items.length > 0
                ? `${next}. People who like you show up in Chats.`
                : 'Your drop fills up as more of your college finishes their profiles. Check back later, or bring your friends in.'
            }
          />
          {reminder}
        </>
      )}

      {liking && (
        <LikeSheet
          profile={liking.item.profile}
          promptId={liking.promptId}
          sending={like.isPending}
          error={like.isError ? dropErrorMessage(like.error) : undefined}
          onSend={send}
          onClose={closeSheet}
        />
      )}
    </section>
  )
}

function Header({ kicker, subtitle, aside }: { kicker: string; subtitle?: string; aside?: ReactNode }) {
  return <ScreenHeader kicker={kicker} title="Tonight's" accent="drop" subtitle={subtitle} aside={aside} />
}
