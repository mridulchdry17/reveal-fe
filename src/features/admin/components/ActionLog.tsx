import type { AdminAction } from '../api/admin'
import { timeAgo } from '../utils/timeAgo'

const words: Record<AdminAction['action'], string> = {
  approve: 'Approved',
  reject: 'Rejected',
  let_in: 'Let in',
}

export function ActionLog({ actions }: { actions: AdminAction[] }) {
  if (actions.length === 0) {
    return <p className="m-0 text-sm text-muted">No decisions yet.</p>
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {actions.map((a) => (
        <li key={a.id} className="rounded-2xl border border-border bg-surface p-3.5 text-sm">
          <p className="m-0 flex justify-between gap-3">
            <span className="min-w-0 truncate">
              <span className="font-bold">{words[a.action]}</span> {a.target_email}
            </span>
            <span className="shrink-0 text-xs text-muted">{timeAgo(a.created_at)}</span>
          </p>
          {a.note && <p className="mt-1 mb-0 text-muted">“{a.note}”</p>}
          <p className="mt-1 mb-0 text-xs text-muted">by {a.admin_email}</p>
        </li>
      ))}
    </ul>
  )
}
