import { useState } from 'react'

import { AlertIcon } from '@/components/icons'

import type { Review } from '../api/admin'
import { useApproveReview, useRejectReview } from '../hooks/useDecideReview'
import { adminErrorMessage } from '../utils/errorMessage'
import { timeAgo } from '../utils/timeAgo'
import { ReviewPhoto } from './ReviewPhoto'

const reasons = [
  "Selfie doesn't match the ID",
  'ID photo is blurry or cut off',
  "Not an ADGIPS ID card",
  'Selfie is unclear',
]

/** One waiting ID check: the two photos side by side, approve or reject with a reason. */
export function ReviewItem({ review }: { review: Review }) {
  const approve = useApproveReview()
  const reject = useRejectReview()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const busy = approve.isPending || reject.isPending
  const error = approve.error ?? reject.error

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 truncate font-display text-lg font-bold">{review.user.name}</p>
          <p className="m-0 truncate text-sm text-muted">{review.user.email}</p>
        </div>
        <span className="shrink-0 text-xs text-muted">{timeAgo(review.submitted_at)}</span>
      </div>

      <div className="flex gap-3">
        <ReviewPhoto reviewId={review.id} kind="id_card" label="ID card" />
        <ReviewPhoto reviewId={review.id} kind="selfie" label="Selfie" />
      </div>

      {rejecting ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (reason.trim()) reject.mutate({ reviewId: review.id, reason: reason.trim() })
          }}
          className="flex flex-col gap-3"
        >
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold">Why? The student sees this.</legend>
            {reasons.map((r) => (
              <label key={r} className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="radio"
                  name={`reason-${review.id}`}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="size-5 accent-accent"
                />
                {r}
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Or write your own
            <input
              value={reasons.includes(reason) ? '' : reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={300}
              className="h-11 rounded-xl border-[1.5px] border-field bg-bg px-3 font-normal text-text"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !reason.trim()}
              className="h-11 flex-1 rounded-full border-0 bg-text text-sm font-bold text-bg disabled:opacity-50"
            >
              {reject.isPending ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={busy}
            className="h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => approve.mutate(review.id)}
            disabled={busy}
            className="h-11 flex-1 rounded-full border-0 bg-accent text-sm font-bold text-on-accent disabled:opacity-60"
          >
            {approve.isPending ? 'Approving…' : 'Approve'}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {adminErrorMessage(error)}
        </p>
      )}
    </li>
  )
}
