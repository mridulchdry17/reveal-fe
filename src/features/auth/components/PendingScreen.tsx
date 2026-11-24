import { Link, Navigate } from 'react-router'

import { CheckIcon, ShieldCheckIcon } from '@/components/icons'

import { useMe } from '../hooks/useMe'
import { useSignOut } from '../hooks/useSignOut'
import { useVerificationStatus } from '../hooks/useVerificationStatus'

/** ID card and selfie sent; a person hasn't checked them yet. */
export function PendingScreen() {
  const me = useMe()
  const status = useVerificationStatus()
  const signOut = useSignOut()

  if (me.data?.verified) return <Navigate to="/app" replace />
  if (status.data && status.data.status !== 'pending') return <Navigate to="/verify" replace />

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-16 pb-8">
        <span className="flex size-[72px] items-center justify-center rounded-[22px] bg-surface-2 text-locked">
          <ShieldCheckIcon className="size-[34px]" strokeWidth={1.4} />
        </span>
        <div>
          <h1 className="m-0 font-display text-[42px] leading-[0.98] font-normal tracking-[-0.01em]">
            We're checking your ID
          </h1>
          <p className="mt-2.5 mb-0 text-[15px] leading-6 text-pretty text-muted">
            Usually within a few hours. Open Reveal again later and you'll go straight in once it's
            approved.
          </p>
        </div>

        <ul className="m-0 flex list-none flex-col gap-3 rounded-[18px] border border-border bg-surface p-[18px] text-sm">
          {['Signed in with Google', 'College ID and selfie received'].map((done) => (
            <li key={done} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-open text-on-accent">
                <CheckIcon className="size-3.5" />
              </span>
              {done}
            </li>
          ))}
          <li className="flex items-center gap-3 text-muted">
            <span className="size-6 shrink-0 rounded-full border-2 border-dashed border-border-strong" />
            A person is matching your selfie to your ID
          </li>
        </ul>

        <p className="m-0 rounded-2xl bg-open-bg p-3.5 text-[13px] leading-5">
          Got your college email now? Verify with it instead and you're in straight away.{' '}
          <Link to="/verify" state={{ choose: true }} className="font-bold text-open">
            Use college email
          </Link>
        </p>

        <p className="m-0 text-[13px] leading-5 text-muted">
          If a photo is unclear, we'll ask you to take it again. Your ID and selfie are deleted once
          we've checked them.
        </p>

        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="mt-auto h-11 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
