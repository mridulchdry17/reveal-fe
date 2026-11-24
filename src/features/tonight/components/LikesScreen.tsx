import { useState } from 'react'
import { Link } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

import { useLikeGuessed } from '../hooks/useGuessed'
import { useLikes, useMatchBack, usePassLike } from '../hooks/useLikes'
import type { GuessSlot } from '../types/guessSlot'
import { dropErrorMessage } from '../utils/errorMessage'
import { MatchMoment } from './MatchMoment'
import { ReceivedLikeCard } from './ReceivedLikeCard'

type Props = {
  /** Their guess cards, composed in from the guess feature. */
  guess?: GuessSlot
}

/** People who liked one of my prompts. Like back to match, or pass without them knowing. */
export function LikesScreen({ guess }: Props) {
  const likes = useLikes()
  const guessed = useLikeGuessed()
  const matchBack = useMatchBack()
  const pass = usePassLike()
  const [matched, setMatched] = useState<string | null>(null)
  const busy = matchBack.isPending || pass.isPending
  const error = matchBack.error ?? pass.error
  const count = likes.data?.length ?? 0

  return (
    <section className="flex flex-col gap-4 pb-6">
      <Link
        to="/app/chats"
        className="-ml-1 flex h-11 w-fit items-center px-1 text-sm font-semibold text-muted no-underline"
      >
        ← Chats
      </Link>
      <ScreenHeader
        kicker={count > 0 ? `${count} waiting` : 'Your likes'}
        title="Liked"
        accent="you"
        subtitle="They liked your words first. Like them back to match; passing is private."
      />

      {matched && <MatchMoment nickname={matched} />}
      {error && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(error)}
        </p>
      )}

      {likes.isPending && <p className="m-0 text-sm text-muted">Loading…</p>}
      {likes.isError && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(likes.error)}
        </p>
      )}
      {likes.data?.length === 0 && (
        <div className="flex flex-col gap-2 rounded-[28px] border-[1.5px] border-dashed border-border-strong bg-surface px-6 py-8 text-center">
          <h2 className="m-0 font-display text-[30px] leading-none font-normal">No likes waiting</h2>
          <p className="m-0 text-sm leading-6 text-muted">
            When someone likes one of your answers, they land here. Specific answers get more likes than safe
            ones.
          </p>
        </div>
      )}

      {likes.data?.map((like) => (
        <ReceivedLikeCard
          key={like.id}
          like={like}
          guess={guess}
          busy={busy}
          onGuessed={(cardId, result) => guessed.onGuessed(like.id, cardId, result)}
          onStale={guessed.onStale}
          onPass={() => {
            setMatched(null)
            pass.mutate(like.id)
          }}
          onMatch={() => matchBack.mutate(like.id, { onSuccess: () => setMatched(like.profile.nickname) })}
        />
      ))}
    </section>
  )
}
