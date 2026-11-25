import { CloseIcon, HeartIcon } from '@/components/icons'
import { useObjectUrl } from '@/hooks/useObjectUrl'

import type { ReceivedLike } from '../api/drops'
import { useLikePhoto } from '../hooks/useBlurredPhoto'
import { likedKicker } from '../utils/likeOptions'
import { likeTime } from '../utils/likeTime'
import { Avatar } from './Avatar'
import { LikedAnswer } from './LikedAnswer'

type Props = {
  like: ReceivedLike
  busy: boolean
  onPass: () => void
  onGuess: () => void
  onMatch: () => void
}

/** One like waiting on me: who, what they liked and said, then Not for me, Guess first or Match. */
export function ReceivedLikeCard({ like, busy, onPass, onGuess, onMatch }: Props) {
  const { profile } = like
  const photo = useLikePhoto(like.id, profile.has_blurred_photo, profile.right_guesses)
  const photoUrl = useObjectUrl(photo.data)

  return (
    <article
      aria-label={profile.nickname}
      className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-3">
        <Avatar url={profile.has_blurred_photo ? photoUrl : null} />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 font-display text-[21px] leading-[1.1] font-normal">{profile.nickname}</h2>
          {like.my_cards_total > 0 && (
            <p className="m-0 mt-0.5 text-xs text-muted">
              Got {like.their_right_guesses} of {like.my_cards_total} of yours right
            </p>
          )}
        </div>
        <time dateTime={like.created_at} className="shrink-0 text-xs text-muted">
          {likeTime(like.created_at)}
        </time>
      </div>
      <LikedAnswer kicker={likedKicker(like.liked, 'Your')} answer={like.liked.answer} />
      {like.comment && <p className="m-0 text-[15px] leading-[1.45]">{like.comment}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Not for me"
          disabled={busy}
          onClick={onPass}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-transparent text-muted disabled:opacity-60"
        >
          <CloseIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={onGuess}
          className="h-11 flex-1 rounded-full border border-border-strong bg-transparent text-sm font-semibold text-text"
        >
          Guess first
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onMatch}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent text-sm font-bold text-on-accent disabled:opacity-60"
        >
          Match
          <HeartIcon className="size-3.5 fill-current" />
        </button>
      </div>
    </article>
  )
}
