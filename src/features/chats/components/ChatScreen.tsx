import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { AlertIcon, LockIcon, ShieldCheckIcon } from '@/components/icons'
import { ApiError } from '@/lib/api/errors'
import { branchLine, lookingForLabels } from '@/utils/cardLabels'

import type { ChatProfile } from '../api/chats'
import { useChat, useEndChat, useMarkRead, useSendMessage, type SafetyAction } from '../hooks/useChats'
import { chatErrorMessage } from '../utils/errorMessage'
import { shortTime } from '../utils/time'
import { Initial } from './ChatRow'
import { SafetySheet } from './SafetySheet'

const MESSAGE_MAX = 1000

/** One chat. New messages arrive by polling every few seconds while it's open. */
export function ChatScreen() {
  const { matchId = '' } = useParams()
  const navigate = useNavigate()
  const chat = useChat(matchId)
  const send = useSendMessage(matchId)
  const { mutate: markRead } = useMarkRead(matchId)
  const end = useEndChat(matchId)
  const [draft, setDraft] = useState('')
  const [safetyOpen, setSafetyOpen] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)

  const messages = chat.data?.messages ?? []
  const last = messages.at(-1)
  // Seen their latest message: clear the unread dot. Scroll to it either way.
  useEffect(() => {
    if (last && !last.mine) markRead()
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [last, markRead])

  const closeSafety = useCallback(() => {
    setSafetyOpen(false)
    end.reset()
  }, [end])

  const ended = chat.error instanceof ApiError && chat.error.code === 'match_not_found'
  if (chat.isPending) return <Shell>{null}</Shell>
  if (chat.isError) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="m-0 font-display text-2xl font-bold">
            {ended ? 'This chat has ended' : "Couldn't open this chat"}
          </h1>
          <p className="m-0 text-sm text-muted">
            {ended ? 'It closed for both of you.' : chatErrorMessage(chat.error)}
          </p>
          <Link to="/app/chats" className="mt-2 font-semibold text-text">
            Back to Chats
          </Link>
        </div>
      </Shell>
    )
  }

  const { profile } = chat.data
  const submit = () => {
    const body = draft.trim()
    if (!body || send.isPending) return
    send.mutate(body, { onSuccess: () => setDraft('') })
  }
  const act = (action: SafetyAction) =>
    end.mutate(action, {
      onSuccess: () => navigate('/app/chats', { replace: true, state: { ended: action.kind } }),
    })

  return (
    <Shell>
      <header className="sticky top-0 z-10 flex flex-col gap-2.5 border-b border-border bg-bg px-4 pt-3 pb-3">
        <div className="flex items-center gap-2.5">
          <Link
            to="/app/chats"
            aria-label="Back to Chats"
            className="-ml-2 flex size-11 items-center justify-center text-xl text-text no-underline"
          >
            ←
          </Link>
          <Initial name={profile.nickname} size="sm" />
          <h1 className="m-0 min-w-0 flex-1 truncate text-[17px] font-bold">{profile.nickname}</h1>
          <button
            type="button"
            aria-label="Report, block or unmatch"
            onClick={() => setSafetyOpen(true)}
            className="-mr-2 flex size-11 items-center justify-center bg-transparent text-muted"
          >
            <ShieldCheckIcon className="size-[22px]" />
          </button>
        </div>
        <ShownCards profile={profile} />
      </header>

      <ol aria-label="Messages" className="m-0 flex flex-1 list-none flex-col gap-2 px-4 py-4">
        {messages.length === 0 && (
          <li className="m-auto max-w-[260px] text-center text-sm leading-6 text-muted">
            You matched with {profile.nickname}. Either of you can say hi first.
          </li>
        )}
        {messages.map((m) => (
          <li
            key={m.id}
            className={`flex max-w-[80%] flex-col gap-0.5 ${m.mine ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <span className="sr-only">{m.mine ? 'You' : profile.nickname}:</span>
            <span
              className={`rounded-[18px] px-3.5 py-2.5 text-[15px] leading-snug break-words whitespace-pre-wrap ${
                m.mine
                  ? 'rounded-br-md bg-accent text-on-accent'
                  : 'rounded-bl-md border border-border bg-surface text-text'
              }`}
            >
              {m.body}
            </span>
            <span className="px-1 text-[11px] text-muted">{shortTime(m.sent_at)}</span>
          </li>
        ))}
      </ol>
      <div ref={bottom} />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-bg px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {send.isError && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {chatErrorMessage(send.error)}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <textarea
            id="message"
            rows={1}
            maxLength={MESSAGE_MAX}
            value={draft}
            placeholder="Message"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] border-[1.5px] border-field bg-surface px-4 py-2.5 text-base text-text focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim() || send.isPending}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40"
          >
            <svg viewBox="0 0 16 16" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 8h10M8.5 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </form>

      {safetyOpen && (
        <SafetySheet
          nickname={profile.nickname}
          pending={end.isPending}
          error={end.isError ? chatErrorMessage(end.error) : undefined}
          onAction={act}
          onClose={closeSafety}
        />
      )}
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">{children}</div>
    </div>
  )
}

/** Their shown cards, and how many are still hidden. Only what the server sent. */
function ShownCards({ profile }: { profile: ChatProfile }) {
  const shown = [
    profile.branch && branchLine(profile.branch, profile.year),
    profile.hometown,
    profile.looking_for && lookingForLabels[profile.looking_for],
  ].filter((value): value is string => Boolean(value))
  return (
    <ul aria-label="Their cards" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {shown.map((value) => (
        <li key={value} className="rounded-full bg-open-bg px-2.5 py-1 text-xs text-open">
          {value}
        </li>
      ))}
      {profile.hidden_cards.length > 0 && (
        <li className="flex items-center gap-1 rounded-full border border-dashed border-locked px-2.5 py-1 text-xs text-locked">
          <LockIcon className="size-3" />
          {profile.hidden_cards.length} hidden
        </li>
      )}
    </ul>
  )
}
