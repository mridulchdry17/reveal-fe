import { useObjectUrl } from '@/hooks/useObjectUrl'

import type { GuessResult, ReceivedLike } from '../api/drops'
import { useLikePhoto } from '../hooks/useBlurredPhoto'
import type { GuessSlot } from '../types/guessSlot'
import { DropProfile } from './DropProfile'

type Props = {
  like: ReceivedLike
  guess?: GuessSlot
  busy: boolean
  onGuessed: (cardId: string, result: GuessResult) => void
  onStale: () => void
  onPass: () => void
  onMatch: () => void
}

/** One like waiting for me: what they liked, who they are, optional guessing, then Pass or Like back. */
export function ReceivedLikeCard({ like, guess, busy, onGuessed, onStale, onPass, onMatch }: Props) {
  const { profile } = like
  const photo = useLikePhoto(like.id, profile.has_blurred_photo, profile.right_guesses)
  const photoUrl = useObjectUrl(photo.data)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-5 shadow-[0_18px_40px_-30px_rgb(40_20_10/0.45)]">
        <p className="m-0 text-[13px] text-muted">
          <span className="font-display text-[26px] leading-none text-text">{profile.nickname}</span> liked "
          {like.prompt_question}"
        </p>
        <div className="flex flex-col gap-1 rounded-[20px] border border-border bg-bg px-4 py-3">
          <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Your answer</span>
          <span className="font-display text-[22px] leading-[1.1] font-normal italic">“{like.prompt_answer}”</span>
        </div>
        {like.comment && (
          <div className="flex flex-col gap-1 self-start rounded-[20px] rounded-tl-md bg-forest px-4 py-3 text-white">
            <span className="text-[11px] font-bold tracking-[0.14em] text-peach uppercase">They said</span>
            <p className="m-0 font-display text-[22px] leading-[1.1] font-normal italic">“{like.comment}”</p>
          </div>
        )}
      </div>
      <DropProfile
        profile={profile}
        photoUrl={profile.has_blurred_photo ? photoUrl : null}
        guess={guess?.({
          cards: profile.guess_cards,
          rightGuesses: profile.right_guesses,
          reward: profile.has_blurred_photo ? 'blur' : null,
          title: 'Guess first',
          onGuessed,
          onStale,
        })}
      />
      <div className="grid grid-cols-[1fr_2fr] gap-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={onPass}
          className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text disabled:opacity-60"
        >
          Pass
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onMatch}
          className="h-[54px] rounded-full bg-accent text-base font-bold text-on-accent disabled:opacity-60"
        >
          Like back
        </button>
      </div>
    </div>
  )
}
