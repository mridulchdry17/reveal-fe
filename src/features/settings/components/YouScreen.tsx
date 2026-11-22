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
}

export function YouScreen({ account, profile }: Props) {
  const status = useServerStatus()

  return (
    <section>
      <ScreenHeader title="You" />
      {profile && <div className="mb-3">{profile}</div>}
      {account && <div className="mb-3">{account}</div>}
      <dl className="m-0 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <dt className="text-sm font-semibold">Server</dt>
        <dd className={`m-0 text-sm ${status === 'connected' ? 'text-open' : 'text-muted'}`}>
          {statusLabel[status]}
        </dd>
      </dl>
    </section>
  )
}
