import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { AlertIcon } from '@/components/icons'

import { useLikes, useMatchBack, usePassLike, useSentLikes, useTakeBack } from '../hooks/useLikes'
import { dropErrorMessage } from '../utils/errorMessage'
import { ReceivedLikeCard } from './ReceivedLikeCard'
import { SentLikeCard } from './SentLikeCard'

/**
 * Likes: who liked one of my answers (match, guess first, or pass without them knowing),
 * and the likes I sent that are still waiting. The open tab lives in the URL.
 */
export function LikesScreen() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'sent' ? 'sent' : 'received'
  const navigate = useNavigate()
  const received = useLikes()
  const sent = useSentLikes()
  const matchBack = useMatchBack()
  const pass = usePassLike()
  const takeBack = useTakeBack()
  const [confirming, setConfirming] = useState<string | null>(null)
  const busy = matchBack.isPending || pass.isPending
  const error = tab === 'received' ? (matchBack.error ?? pass.error) : takeBack.error

  const tabs = [
    { id: 'received', label: 'Received', count: received.data?.length },
    { id: 'sent', label: 'Sent', count: sent.data?.length },
  ] as const
  const list = tab === 'received' ? received : sent

  return (
    <section className="flex flex-col gap-3 pb-6">
      <header className="flex flex-col gap-2 pb-2">
        <h1 className="m-0 font-display text-[44px] leading-none font-normal">Likes</h1>
        <p className="m-0 text-sm leading-normal text-muted">
          They liked one of your answers. Match now, or guess theirs first to see their photo a little clearer.
        </p>
        <div role="tablist" aria-label="Likes" className="mt-3 flex gap-1 rounded-full bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setConfirming(null)
                setParams(t.id === 'sent' ? { tab: 'sent' } : {}, { replace: true })
              }}
              className={`h-[38px] flex-1 rounded-full text-[13px] font-semibold ${
                tab === t.id ? 'bg-surface text-text shadow-[0_1px_3px_rgb(40_20_10/0.12)]' : 'text-muted'
              }`}
            >
              {t.label}
              {t.count !== undefined && ` · ${t.count}`}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {dropErrorMessage(error)}
        </p>
      )}

      <div role="tabpanel" aria-label={tab === 'received' ? 'Received' : 'Sent'} className="flex flex-col gap-3">
        {list.isPending && <p className="m-0 text-sm text-muted">Loading…</p>}
        {list.isError && (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {dropErrorMessage(list.error)}
            </p>
            <button
              type="button"
              onClick={() => void list.refetch()}
              className="h-11 rounded-full bg-text px-5 text-sm font-bold text-bg"
            >
              Try again
            </button>
          </div>
        )}

        {tab === 'received' &&
          (received.data?.length === 0 ? (
            <Empty
              title="No likes waiting"
              body="When someone likes one of your answers, they land here. Specific answers get more likes than safe ones."
            />
          ) : (
            received.data?.map((like) => (
              <ReceivedLikeCard
                key={like.id}
                like={like}
                busy={busy}
                onPass={() => pass.mutate(like.id)}
                onGuess={() => void navigate(`/app/likes/${like.id}`)}
                onMatch={() =>
                  matchBack.mutate(like.id, {
                    onSuccess: (result) => void navigate(`/app/chats/${result.match_id}`),
                  })
                }
              />
            ))
          ))}

        {tab === 'sent' &&
          (sent.data?.length === 0 ? (
            <Empty
              title="Nothing sent yet"
              body="Like an answer in tonight's drop and it waits here until they answer."
            />
          ) : (
            sent.data?.map((like) => (
              <SentLikeCard
                key={like.id}
                like={like}
                confirming={confirming === like.id}
                busy={takeBack.isPending}
                onTakeBack={() => setConfirming(like.id)}
                onKeep={() => setConfirming(null)}
                onConfirm={() => takeBack.mutate(like.id, { onSuccess: () => setConfirming(null) })}
              />
            ))
          ))}
      </div>
    </section>
  )
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[22px] border-[1.5px] border-dashed border-border-strong bg-surface px-6 py-8 text-center">
      <h2 className="m-0 font-display text-[30px] leading-none font-normal">{title}</h2>
      <p className="m-0 text-sm leading-6 text-muted">{body}</p>
    </div>
  )
}
