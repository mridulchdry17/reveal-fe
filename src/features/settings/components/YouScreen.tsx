import type { ReactNode } from 'react'

import { ScreenHeader } from '@/components/ScreenHeader'

import { useServerStatus, type ServerStatus } from '../hooks/useServerStatus'

const statusLabel: Record<ServerStatus, string> = {
  checking: 'Checking…',
  connected: 'Connected',
  degraded: 'Having trouble',
  offline: 'Offline',
}

type Props = {
  /** The account card, composed in from the auth feature by the app routes. */
  account?: ReactNode
  /** The profile summary, composed in from the profile feature. */
  profile?: ReactNode
  /** Notifications and the hide list, composed in from their features. */
  privacy?: ReactNode
}

export function YouScreen({ account, profile, privacy }: Props) {
  const status = useServerStatus()

  return (
    <section className="rise pb-8">
      {/* The whole title is the accent word, so the heading's name stays "You". */}
      <ScreenHeader
        kicker="How you show up"
        title=""
        accent="You"
        subtitle="Make it sound like you. Your photo, voice and contact stay Hidden until you swap."
      />
      {profile && <div className="mt-3">{profile}</div>}

      {privacy && (
        <div className="mt-8 flex flex-col gap-3">
          <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">Pings and privacy</p>
          {privacy}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">The boring bits</p>
        {account}
        <dl className="m-0 flex min-h-11 items-center justify-between rounded-[20px] border border-border bg-surface px-4 py-3">
          <dt className="text-sm font-semibold">Server</dt>
          <dd className="m-0 flex items-center gap-2 text-sm text-muted">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${status === 'connected' ? 'bg-open' : 'bg-border-strong'}`}
            />
            <span className={status === 'connected' ? 'font-semibold text-open' : undefined}>
              {statusLabel[status]}
            </span>
          </dd>
        </dl>
      </div>
    </section>
  )
}
