import { ScreenHeader } from '@/components/ScreenHeader'

import { useServerStatus, type ServerStatus } from '../hooks/useServerStatus'

const statusLabel: Record<ServerStatus, string> = {
  checking: 'Checking…',
  connected: 'Connected',
  degraded: 'Having trouble',
  offline: 'Offline',
}

export function YouScreen() {
  const status = useServerStatus()

  return (
    <section>
      <ScreenHeader title="You" />
      <dl className="m-0 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <dt className="text-sm font-semibold">Server</dt>
        <dd className={`m-0 text-sm ${status === 'connected' ? 'text-open' : 'text-muted'}`}>
          {statusLabel[status]}
        </dd>
      </dl>
    </section>
  )
}
