import type { SentLike } from '../api/drops'
import { useSentLikePhoto } from '../hooks/useBlurredPhoto'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { likedKicker } from '../utils/likeOptions'
import { likeTime } from '../utils/likeTime'
import { Avatar } from './Avatar'
import { LikedAnswer } from './LikedAnswer'

type Props = {
  like: SentLike
  /** Asking "take it back?" on this card. */
  confirming: boolean
  busy: boolean
  onTakeBack: () => void
  onKeep: () => void
  onConfirm: () => void
}

/**
 * A like I sent. It always reads "Waiting for them": a pass looks exactly the same, so the
 * liker never learns of one.
 */
export function SentLikeCard({ like, confirming, busy, onTakeBack, onKeep, onConfirm }: Props) {
  const photo = useSentLikePhoto(like.id, like.has_blurred_photo)
  const photoUrl = useObjectUrl(photo.data)

  return (
    <article aria-label={like.nickname} className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Avatar url={like.has_blurred_photo ? photoUrl : null} />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 font-display text-[21px] leading-[1.1] font-normal">{like.nickname}</h2>
          <p className="m-0 mt-0.5 text-xs text-muted">You liked their answer</p>
        </div>
        <time dateTime={like.created_at} className="shrink-0 text-xs text-muted">
          {likeTime(like.created_at)}
        </time>
      </div>
      <LikedAnswer kicker={likedKicker(like.liked, 'Their')} answer={like.liked.answer} />
      {like.comment && <p className="m-0 text-[15px] leading-[1.45]">{like.comment}</p>}
      {confirming ? (
        <div role="group" aria-label="Take back this like?" className="flex flex-col gap-2 rounded-[18px] bg-surface-2 p-3">
          <p className="m-0 text-sm leading-5">Take back your like? It leaves their Likes, and they're never told.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onKeep}
              className="h-11 flex-1 rounded-full border border-border-strong bg-transparent text-sm font-semibold text-text"
            >
              Keep it
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="h-11 flex-1 rounded-full bg-text text-sm font-bold text-bg disabled:opacity-60"
            >
              Take back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTakeBack}
            className="h-11 shrink-0 rounded-full border border-border-strong bg-transparent px-[18px] text-sm text-text"
          >
            Take back
          </button>
          <span className="flex h-11 flex-1 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-muted">
            Waiting for them
          </span>
        </div>
      )}
    </article>
  )
}
