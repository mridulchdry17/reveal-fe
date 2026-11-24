import { useEffect, useId, useState } from 'react'

import { AlertIcon, CloseIcon } from '@/components/icons'

import type { ReportReason } from '../api/chats'
import type { SafetyAction } from '../hooks/useChats'

const reasons: { value: ReportReason; label: string }[] = [
  { value: 'harassment', label: 'Harassment or threats' },
  { value: 'inappropriate', label: 'Sexual or inappropriate messages' },
  { value: 'fake_profile', label: 'Fake profile or not a student' },
  { value: 'spam', label: 'Spam or selling something' },
  { value: 'underage', label: 'Under 18' },
  { value: 'other', label: 'Something else' },
]

type Step = 'menu' | 'unmatch' | 'block' | 'report'

type Props = {
  nickname: string
  pending: boolean
  error?: string
  onAction: (action: SafetyAction) => void
  onClose: () => void
}

/** Report, block or unmatch. Each ends the chat for both, so each asks first. */
export function SafetySheet({ nickname, pending, error, onAction, onClose }: Props) {
  const titleId = useId()
  const [step, setStep] = useState<Step>('menu')
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const name = <em className="text-accent-text">{nickname}</em>
  const title = {
    menu: name,
    unmatch: <>Unmatch {name}?</>,
    block: <>Block {name}?</>,
    report: <>Report {name}</>,
  }[step]
  const kicker = step === 'menu' ? 'Safety' : step === 'report' ? 'Report' : 'Are you sure?'


  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-text/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="rise flex max-h-[90dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-[28px] border-t border-border bg-surface px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <span aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-border-strong" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">{kicker}</p>
            <h2 id={titleId} className="m-0 font-display text-[38px] leading-[0.95] font-normal tracking-[-0.01em]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1 flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-transparent text-text"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {step === 'menu' && (
          <>
            <p className="m-0 -mt-2 text-[15px] leading-6 text-muted">
              Each of these ends the chat for both of you. You'll be asked to confirm first.
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              <MenuItem
                label="Report"
                detail="Tell an admin what happened. This also blocks them."
                onClick={() => setStep('report')}
                danger
              />
              <MenuItem
                label="Block"
                detail="End the chat. You won't see each other again."
                onClick={() => setStep('block')}
              />
              <MenuItem
                label="Unmatch"
                detail="End the chat for both of you."
                onClick={() => setStep('unmatch')}
              />
            </ul>
          </>
        )}

        {(step === 'unmatch' || step === 'block') && (
          <>
            <p className="m-0 text-[15px] leading-6 text-muted">
              {step === 'block'
                ? "The chat ends for both of you and you won't appear to each other again. They aren't told why. Can't be undone."
                : "The chat ends for both of you. They aren't told why. Can't be undone."}
            </p>
            <Actions
              confirm={step === 'block' ? 'Block' : 'Unmatch'}
              pending={pending}
              onBack={() => setStep('menu')}
              onConfirm={() => onAction({ kind: step })}
            />
          </>
        )}

        {step === 'report' && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (reason) onAction({ kind: 'report', reason, details: details.trim() || null })
            }}
          >
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold">What happened?</legend>
              {reasons.map((r) => (
                <label
                  key={r.value}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[18px] border border-border bg-bg px-4 text-[15px] has-checked:border-accent has-checked:bg-accent-bg has-focus-visible:outline-2 has-focus-visible:outline-accent"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="size-4 accent-[var(--accent)]"
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              <span>
                Anything else? <span className="font-normal text-muted">(optional)</span>
              </span>
              <textarea
                rows={3}
                maxLength={500}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                className="resize-none rounded-[20px] border-[1.5px] border-field bg-bg p-3.5 text-base font-normal text-text focus:border-accent focus:outline-none"
              />
            </label>
            <p className="m-0 text-[13px] leading-5 text-muted">
              They're blocked and the chat ends for both of you. They aren't told who reported them.
            </p>
            <Actions
              confirm="Report and block"
              pending={pending}
              disabled={!reason}
              onBack={() => setStep('menu')}
              submit
            />
          </form>
        )}

        {error && (
          <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

function MenuItem({
  label,
  detail,
  onClick,
  danger = false,
}: {
  label: string
  detail: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-[20px] border bg-bg p-4 text-left ${
          danger ? 'border-[1.5px] border-accent' : 'border-border'
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={`text-base font-bold ${danger ? 'text-accent-text' : 'text-text'}`}>{label}</span>
          <span className="text-[13px] leading-5 text-muted">{detail}</span>
        </span>
        <span aria-hidden="true" className="text-lg text-muted">
          →
        </span>
      </button>
    </li>
  )
}

function Actions({
  confirm,
  pending,
  disabled = false,
  submit = false,
  onBack,
  onConfirm,
}: {
  confirm: string
  pending: boolean
  disabled?: boolean
  submit?: boolean
  onBack: () => void
  onConfirm?: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-2.5">
      <button
        type="button"
        onClick={onBack}
        className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-[15px] font-semibold text-text"
      >
        Not yet
      </button>
      <button
        type={submit ? 'submit' : 'button'}
        onClick={onConfirm}
        disabled={pending || disabled}
        className="h-[54px] rounded-full bg-accent text-base font-bold text-on-accent disabled:opacity-50"
      >
        {pending ? 'One moment…' : confirm}
      </button>
    </div>
  )
}
