import type { AdminReport } from '../api/admin'
import { timeAgo } from '../utils/timeAgo'

const reasons: Record<AdminReport['reason'], string> = {
  harassment: 'Harassment',
  inappropriate: 'Inappropriate messages',
  fake_profile: 'Fake profile',
  spam: 'Spam or selling',
  underage: 'Under 18',
  other: 'Something else',
}

/** Reports from students. Reporting already blocked the person and ended the chat. */
export function ReportList({ reports }: { reports: AdminReport[] }) {
  if (reports.length === 0) {
    return (
      <p className="m-0 rounded-2xl bg-surface-2 p-4 text-sm leading-6">
        No reports. When a student reports someone from a chat, it shows up here.
      </p>
    )
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {reports.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-surface p-3.5 text-sm">
          <p className="m-0 flex justify-between gap-3">
            <span className="font-bold">{reasons[r.reason]}</span>
            <span className="shrink-0 text-xs text-muted">{timeAgo(r.created_at)}</span>
          </p>
          <p className="mt-1 mb-0 break-all">
            <span className="text-muted">Reported:</span> {r.reported_email ?? 'Deleted account'}
          </p>
          {r.details && <p className="mt-1 mb-0 text-muted">“{r.details}”</p>}
          <p className="mt-1 mb-0 text-xs break-all text-muted">
            by {r.reporter_email ?? 'a deleted account'}
          </p>
        </li>
      ))}
    </ul>
  )
}
