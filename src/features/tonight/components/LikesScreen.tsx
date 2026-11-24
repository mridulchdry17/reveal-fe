import { useState } from 'react'
import { Link } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

import { useLikes, useMatchBack, usePassLike } from '../hooks/useLikes'
import { dropErrorMessage } from '../utils/errorMessage'
import { DropProfile } from './DropProfile'
import { MatchMoment } from './MatchMoment'

/** People who liked one of my prompts. Like back to match, or pass without them knowing. */
export function LikesScreen() {
  const likes = useLikes()
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
        <div key={like.id} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-5 shadow-[0_18px_40px_-30px_rgb(40_20_10/0.45)]">
            <p className="m-0 text-[13px] text-muted">
              <span className="font-display text-[26px] leading-none text-text">{like.profile.nickname}</span> liked
              "{like.prompt_question}"
            </p>
            <div className="flex flex-col gap-1 rounded-[20px] border border-border bg-bg px-4 py-3">
              <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Your answer</span>
              <span className="font-display text-[22px] leading-[1.1] font-normal italic">
                “{like.prompt_answer}”
              </span>
            </div>
            {like.comment && (
              <div className="flex flex-col gap-1 self-start rounded-[20px] rounded-tl-md bg-forest px-4 py-3 text-white">
                <span className="text-[11px] font-bold tracking-[0.14em] text-peach uppercase">They said</span>
                <p className="m-0 font-display text-[22px] leading-[1.1] font-normal italic">“{like.comment}”</p>
              </div>
            )}
          </div>
          <DropProfile profile={like.profile} />
          <div className="grid grid-cols-[1fr_2fr] gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMatched(null)
                pass.mutate(like.id)
              }}
              className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text disabled:opacity-60"
            >
              Pass
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                matchBack.mutate(like.id, {
                  onSuccess: () => setMatched(like.profile.nickname),
                })
              }
              className="h-[54px] rounded-full bg-accent text-base font-bold text-on-accent disabled:opacity-60"
            >
              Like back
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}
