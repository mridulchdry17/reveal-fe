import { useCallback, useEffect, useState } from 'react'

import { AlertIcon, CloseIcon, HeartIcon } from '@/components/icons'

import type { DropItem, LikeRequest } from '../api/drops'
import { useLikeItem, usePassItem, useTonight } from '../hooks/useTonight'
import { dropErrorMessage } from '../utils/errorMessage'
import { timeLeft } from '../utils/timeLeft'
import { DropProfile } from './DropProfile'
import { LikeSheet } from './LikeSheet'

/** Tonight's drop: one profile at a time. Like a line or pass. */
export function TonightScreen() {
  const drop = useTonight()
  const like = useLikeItem()
  const pass = usePassItem()
  const [liking, setLiking] = useState<{ item: DropItem; promptId: string } | null>(null)
  const [matched, setMatched] = useState<string | null>(null)
  const currentId = drop.data?.items.find((item) => !item.decision)?.id
  // Each new person starts at the top, not where the last one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentId])
  const closeSheet = useCallback(() => {
    setLiking(null)
    like.reset()
  }, [like])

  if (drop.isPending) {
    return <Header subtitle="Getting tonight's drop…" />
  }
  if (drop.isError) {
    return (
      <section>
        <Header />
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(drop.error)}
        </p>
        <button
          type="button"
          onClick={() => void drop.refetch()}
          className="mt-4 h-11 rounded-full border-[1.5px] border-border-strong bg-transparent px-5 text-sm font-semibold text-text"
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
      <div className="flex items-end justify-between">
        <Header subtitle={next} />
        {items.length > 0 && (
          <span
            role="img"
            aria-label={`${seen} of ${items.length} seen`}
            className="flex gap-1 pb-4"
          >
            {items.map((item) => (
              <span
                key={item.id}
                className={`h-1 w-[18px] rounded-full ${item.decision ? 'bg-accent' : 'bg-border'}`}
              />
            ))}
          </span>
        )}
      </div>

      {matched && (
        <p role="status" className="m-0 rounded-2xl bg-open-bg p-3.5 text-sm leading-5 text-text">
          <span className="font-bold">It's a match with {matched}.</span> You both liked each
          other. Chat is coming in the next update.
        </p>
      )}
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
          />
          <div className="flex justify-center gap-5">
            <button
              type="button"
              aria-label={`Pass on ${current.profile.nickname}`}
              disabled={pass.isPending}
              onClick={() => {
                setMatched(null)
                pass.mutate({ itemId: current.id })
              }}
              className="flex size-[60px] items-center justify-center rounded-full border border-border bg-surface text-text"
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
              className="flex size-[60px] items-center justify-center rounded-full bg-accent text-on-accent"
            >
              <HeartIcon className="size-[26px]" />
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-6 text-center">
          <h2 className="m-0 font-display text-xl font-bold">
            {items.length > 0 ? "That's everyone for tonight" : 'No one new right now'}
          </h2>
          <p className="mt-2 mb-0 text-sm leading-6 text-muted">
            {items.length > 0
              ? `${next}. People who like you show up in Chats.`
              : 'Your drop fills up as more students finish their profiles. Check back later, or invite friends from your college.'}
          </p>
        </div>
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

function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header className="flex flex-col gap-0.5 pb-3">
      <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.03em]">Tonight's drop</h1>
      {subtitle && <p className="m-0 text-[13px] text-muted">{subtitle}</p>}
    </header>
  )
}
