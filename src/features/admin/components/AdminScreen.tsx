import { Link, useSearchParams } from 'react-router'

import { useAdminActions } from '../hooks/useAdminActions'
import { useReviews } from '../hooks/useReviews'
import { adminErrorMessage } from '../utils/errorMessage'
import { ActionLog } from './ActionLog'
import { LetInForm } from './LetInForm'
import { ReviewItem } from './ReviewItem'

const tabs = [
  { id: 'reviews', label: 'ID checks' },
  { id: 'let-in', label: 'Let in' },
  { id: 'log', label: 'Log' },
] as const
type Tab = (typeof tabs)[number]['id']

function Reviews() {
  const reviews = useReviews()
  if (reviews.isPending) return <p className="m-0 text-sm text-muted">Loading…</p>
  if (reviews.isError) {
    return (
      <p role="alert" className="m-0 text-sm text-accent-text">
        {adminErrorMessage(reviews.error)}
      </p>
    )
  }
  if (reviews.data.length === 0) {
    return (
      <p className="m-0 rounded-2xl bg-surface-2 p-4 text-sm leading-6">
        Nothing waiting. New ID checks show up here, oldest first.
      </p>
    )
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {reviews.data.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </ul>
  )
}

function Log() {
  const actions = useAdminActions()
  if (actions.isPending) return <p className="m-0 text-sm text-muted">Loading…</p>
  if (actions.isError) {
    return (
      <p role="alert" className="m-0 text-sm text-accent-text">
        {adminErrorMessage(actions.error)}
      </p>
    )
  }
  return <ActionLog actions={actions.data} />
}

export function AdminScreen() {
  const [params, setParams] = useSearchParams()
  const current: Tab = tabs.find((t) => t.id === params.get('tab'))?.id ?? 'reviews'
  const reviews = useReviews()
  const waiting = reviews.data?.length ?? 0

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-3 pb-10">
        <header className="flex h-11 items-center justify-between">
          <Link to="/app/you" className="-ml-2 px-2 text-sm font-semibold text-muted no-underline">
            Back
          </Link>
          <span className="text-[13px] text-muted">Admins only</span>
        </header>
        <h1 className="m-0 font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em]">
          Admin
        </h1>

        <nav aria-label="Admin sections" className="flex gap-1 rounded-full bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-current={current === t.id ? 'page' : undefined}
              onClick={() => setParams({ tab: t.id }, { replace: true })}
              className="h-10 flex-1 rounded-full border-0 bg-transparent text-sm font-semibold text-muted aria-[current=page]:bg-surface aria-[current=page]:text-text aria-[current=page]:shadow-sm"
            >
              {t.label}
              {t.id === 'reviews' && waiting > 0 && ` (${waiting})`}
            </button>
          ))}
        </nav>

        {current === 'reviews' && <Reviews />}
        {current === 'let-in' && <LetInForm />}
        {current === 'log' && <Log />}
      </div>
    </div>
  )
}
