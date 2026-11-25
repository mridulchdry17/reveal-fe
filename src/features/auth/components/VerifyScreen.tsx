import { useCallback, useId, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'

import { AlertIcon, ChevronRightIcon, IdCardIcon, LockIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { StepProgress } from '@/components/StepProgress'
import { env } from '@/config/env'

import { useMe } from '../hooks/useMe'
import { useSignOut } from '../hooks/useSignOut'
import { useVerificationStatus } from '../hooks/useVerificationStatus'
import { useVerifyCollegeEmail } from '../hooks/useVerifyCollegeEmail'
import { verifyErrorMessage } from '../utils/errorMessage'
import { GoogleSignInButton } from './GoogleSignInButton'

/** Signed in, not yet a verified student: pick how to prove you're at the college. */
export function VerifyScreen() {
  const me = useMe()
  const signOut = useSignOut()
  const verify = useVerifyCollegeEmail()
  const { mutate } = verify
  const onCredential = useCallback((credential: string) => mutate(credential), [mutate])
  const [askAdmin, setAskAdmin] = useState(false)
  const adminId = useId()
  const status = useVerificationStatus()
  // The waiting screen links back here to switch to college email; don't bounce them.
  const choosing = (useLocation().state as { choose?: boolean } | null)?.choose === true
  const idStatus = status.data?.status

  if (me.data?.verified) return <Navigate to="/app" replace />
  if (idStatus === 'pending' && !choosing) return <Navigate to="/verify/pending" replace />

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-3 pb-8">
        <StepProgress
          step={1}
          back={{
            node: (
              <button
                type="button"
                onClick={() => signOut.mutate()}
                disabled={signOut.isPending}
                className="-ml-2 h-11 rounded-full bg-transparent px-2 text-sm font-semibold text-muted"
              >
                Sign out
              </button>
            ),
          }}
        />

        <div className="rise pt-2">
          <ScreenHeader
            title="Only students."
            accent="That's the point."
            subtitle="Everyone on Reveal is checked. Pick whichever is quicker for you."
          />
        </div>

        {(idStatus === 'rejected' || idStatus === 'expired') && (
          <p
            role="alert"
            className="m-0 flex gap-2.5 rounded-[20px] bg-warn-bg p-4 text-sm leading-5"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-warn" />
            <span>
              {idStatus === 'rejected'
                ? `Your ID check didn't go through${status.data?.reject_reason ? `: ${status.data.reject_reason}` : '.'}`
                : "Your photos weren't checked in time, so we deleted them."}{' '}
              Send new photos, or use your college email.
            </span>
          </p>
        )}

        <section
          aria-labelledby="college-email"
          className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-5 shadow-[0_10px_24px_rgb(40_20_10/0.06)]"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="college-email"
              className="m-0 text-[11px] font-bold tracking-[0.16em] text-muted uppercase"
            >
              College email
            </h2>
            <span className="rounded-full bg-open-bg px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-open uppercase">
              Instant
            </span>
          </div>
          <p className="m-0 font-display text-[24px] leading-tight font-normal">
            Your @{env.VITE_COLLEGE_DOMAIN} account
          </p>
          <p className="m-0 text-[13px] leading-5 text-muted">
            One tap: pick it in Google's window. It's never shown on your profile, and one email
            verifies one account.
          </p>
          {verify.isPending ? (
            <p className="m-0 flex min-h-11 items-center justify-center text-sm font-semibold">
              Checking your college account…
            </p>
          ) : (
            <GoogleSignInButton onCredential={onCredential} hostedDomain={env.VITE_COLLEGE_DOMAIN} />
          )}
          {verify.isError && (
            <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {verifyErrorMessage(verify.error)}
            </p>
          )}
        </section>

        <div aria-hidden="true" className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" />
          no college email?
          <span className="h-px flex-1 bg-border" />
        </div>

        <Link
          to={idStatus === 'pending' ? '/verify/pending' : '/verify/id-card'}
          className="flex items-center gap-3.5 rounded-[24px] border border-border bg-surface px-4 py-4 text-text no-underline"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-surface-2">
            <IdCardIcon className="size-[22px]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[15px] font-semibold">
              {idStatus === 'pending' ? 'Your ID is being checked' : 'Upload your college ID'}
            </span>
            <span className="text-[13px] leading-5 text-muted">
              {idStatus === 'pending'
                ? 'See where it is'
                : 'A person checks it, usually within a few hours'}
            </span>
          </span>
          <ChevronRightIcon className="size-[18px] shrink-0 text-muted" />
        </Link>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={askAdmin}
            aria-controls={adminId}
            onClick={() => setAskAdmin((open) => !open)}
            className="min-h-11 self-center rounded-full border-0 bg-transparent px-3 text-sm font-semibold text-muted underline underline-offset-4"
          >
            No email or ID yet? Ask an admin
          </button>
          {askAdmin && (
            <section
              id={adminId}
              aria-label="Ask an admin"
              className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-5 text-sm leading-6"
            >
              <p className="m-0">
                Just joined and nothing official yet? Message a Reveal admin (whoever shared Reveal
                with you) with your name, year and the email you signed in with:
              </p>
              <p className="m-0 rounded-2xl bg-surface-2 px-3.5 py-3 font-bold break-all">
                {me.data?.email}
              </p>
              <p className="m-0 text-muted">Once they let you in, come back and tap below.</p>
              <button
                type="button"
                onClick={() => void me.refetch()}
                disabled={me.isFetching}
                className="h-12 rounded-full border-0 bg-text text-sm font-bold text-bg disabled:opacity-60"
              >
                {me.isFetching ? 'Checking…' : "I've been let in"}
              </button>
            </section>
          )}
        </div>

        <p className="mt-auto mb-0 flex gap-2 text-xs leading-5 text-muted">
          <LockIcon className="mt-0.5 size-4 shrink-0" />
          Your ID is only used to check you're a student. Nobody on Reveal ever sees it.
        </p>
      </div>
    </div>
  )
}
