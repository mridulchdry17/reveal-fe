import { useState } from 'react'
import { Link } from 'react-router'

import { AlertIcon } from '@/components/icons'

import { useLikes, useMatchBack, usePassLike } from '../hooks/useLikes'
import { dropErrorMessage } from '../utils/errorMessage'
import { DropProfile } from './DropProfile'

/** People who liked one of my prompts. Like back to match, or pass without them knowing. */
export function LikesScreen() {
  const likes = useLikes()
  const matchBack = useMatchBack()
  const pass = usePassLike()
  const [matched, setMatched] = useState<string | null>(null)
  const busy = matchBack.isPending || pass.isPending
  const error = matchBack.error ?? pass.error

  return (
    <section className="flex flex-col gap-4 pb-6">
      <Link to="/app/chats" className="-ml-1 flex h-11 w-fit items-center px-1 text-sm font-semibold text-muted no-underline">
        ← Chats
      </Link>
      <header className="flex flex-col gap-0.5">
        <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.03em]">Liked you</h1>
        <p className="m-0 text-[13px] text-muted">Like them back to match. Passing is private.</p>
      </header>

      {matched && (
        <p role="status" className="m-0 rounded-2xl bg-open-bg p-3.5 text-sm leading-5">
          <span className="font-bold">It's a match with {matched}.</span> Chat is coming in the
          next update.
        </p>
      )}
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
        <div className="rounded-3xl border border-border bg-surface p-6 text-center">
          <h2 className="m-0 font-display text-xl font-bold">No likes waiting</h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-muted">
            When someone likes one of your prompts, they'll show up here.
          </p>
        </div>
      )}

      {likes.data?.map((like) => (
        <div key={like.id} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-2xl bg-accent-bg p-4">
            <p className="m-0 text-[13px] text-accent-text">
              <span className="font-bold">{like.profile.nickname}</span> liked "{like.prompt_question}"
            </p>
            <p className="m-0 text-sm text-muted">{like.prompt_answer}</p>
            {like.comment && (
              <p className="m-0 font-display text-[19px] leading-tight font-medium">"{like.comment}"</p>
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
              className="h-[54px] rounded-2xl border border-border-strong bg-transparent text-[15px] font-semibold text-text"
            >
              Pass
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                matchBack.mutate(like.id, { onSuccess: () => setMatched(like.profile.nickname) })
              }
              className="h-[54px] rounded-2xl bg-accent text-base font-bold text-on-accent"
            >
              Like back
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}
