import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { AlertIcon, CloseIcon, HeartIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useObjectUrl } from '@/hooks/useObjectUrl'

import { useDropPhoto } from '../hooks/useBlurredPhoto'
import { usePassItem, useTonight } from '../hooks/useTonight'
import { dropErrorMessage } from '../utils/errorMessage'
import { timeLeft } from '../utils/timeLeft'
import { DropProfile } from './DropProfile'
import { GuessInvite } from './GuessInvite'
import { NextDrop } from './NextDrop'

type Props = {
  /** Shown once they're caught up: the notifications nudge, from its feature. */
  reminder?: ReactNode
  /** My interests on the countdown, composed in from the profile feature. */
  interests?: ReactNode
}

/**
 * Tonight's drop: one profile at a time, with their prompts and cards. Guessing opens the
 * full-screen game; Like opens Send like; Pass is one tap. Caught up = the countdown.
 */
export function TonightScreen({ reminder, interests }: Props) {
  const navigate = useNavigate()
  const drop = useTonight()
  const pass = usePassItem()
  const currentItem = drop.data?.items.find((item) => !item.decision)
  const currentId = currentItem?.id
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

  if (!current) {
    return (
      <NextDrop
        nextDropAt={next_drop_at}
        status={items.length > 0 ? "That's everyone for tonight" : 'No one new right now'}
        note={
          items.length > 0
            ? 'People who like you show up in Likes.'
            : 'Your drop fills up as more of your college finishes their profiles. Bring your friends in.'
        }
        interests={interests}
        reminder={reminder}
      />
    )
  }

  const { profile } = current
  const likeUrl = (answer?: string) =>
    `/app/tonight/${current.id}/like${answer ? `?answer=${encodeURIComponent(answer)}` : ''}`

  return (
    <section className="flex flex-col gap-4 pb-6">
      <Header
        kicker={`${seen + 1} of ${items.length} tonight`}
        subtitle={`Next drop in ${timeLeft(next_drop_at)}`}
        aside={
          <span role="img" aria-label={`${seen} of ${items.length} seen`} className="flex gap-1 pb-2">
            {items.map((item) => (
              <span
                key={item.id}
                className={`h-1.5 w-[18px] rounded-full ${item.decision ? 'bg-accent' : 'bg-border-strong/50'}`}
              />
            ))}
          </span>
        }
      />

      {pass.isError && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(pass.error)}
        </p>
      )}

      <DropProfile
        key={current.id}
        profile={profile}
        onLikePrompt={(promptId) => void navigate(likeUrl(promptId))}
        photoUrl={profile.has_blurred_photo ? photoUrl : null}
        guess={
          profile.guess_cards.length > 0 && (
            <GuessInvite
              to={`/app/tonight/${current.id}`}
              nickname={profile.nickname}
              cards={profile.guess_cards}
              sharpens={profile.has_blurred_photo}
            />
          )
        }
      />
      <div className="flex items-center justify-center gap-6 pt-1">
        <button
          type="button"
          aria-label={`Pass on ${profile.nickname}`}
          disabled={pass.isPending}
          onClick={() => pass.mutate({ itemId: current.id })}
          className="flex size-16 items-center justify-center rounded-full border-[1.5px] border-text bg-surface text-text transition-transform duration-150 active:scale-90 disabled:opacity-50"
        >
          <CloseIcon className="size-6" />
        </button>
        <button
          type="button"
          aria-label={`Like ${profile.nickname}`}
          onClick={() => void navigate(likeUrl())}
          className="flex size-[76px] items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_14px_30px_-12px_rgb(180_83_44/0.7)] transition-transform duration-150 active:scale-90"
        >
          <HeartIcon className="size-8" />
        </button>
      </div>
      <p className="m-0 text-center text-[13px] text-muted">Tap a heart to like one answer. Passing is private.</p>
    </section>
  )
}

function Header({ kicker, subtitle, aside }: { kicker: string; subtitle?: string; aside?: ReactNode }) {
  return <ScreenHeader kicker={kicker} title="Tonight's" accent="drop" subtitle={subtitle} aside={aside} />
}
