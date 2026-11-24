import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'

import { AlertIcon, LockIcon } from '@/components/icons'
import { env } from '@/config/env'

import { useMe } from '../hooks/useMe'
import { useSignOut } from '../hooks/useSignOut'
import { useVerificationStatus } from '../hooks/useVerificationStatus'
import { useVerifyCollegeEmail } from '../hooks/useVerifyCollegeEmail'
import { verifyErrorMessage } from '../utils/errorMessage'
import { GoogleSignInButton } from './GoogleSignInButton'
import { StepHeader } from './StepHeader'

type Method = 'college_email' | 'id_card' | 'admin'

const methods: { value: Method; title: string; detail: string; badge?: string }[] = [
  {
    value: 'college_email',
    title: 'College email',
    detail: `One tap with your @${env.VITE_COLLEGE_DOMAIN} Google account`,
    badge: 'Instant',
  },
  {
    value: 'id_card',
    title: 'College ID card',
    detail: 'Upload a photo of the front. A person checks it, usually within a few hours',
  },
  {
    value: 'admin',
    title: 'No email or ID yet',
    detail: 'First-years and new joiners. Ask an admin to let you in',
  },
]

/** Signed in, not yet a verified student: pick how to prove you're at the college. */
export function VerifyScreen() {
  const me = useMe()
  const signOut = useSignOut()
  const verify = useVerifyCollegeEmail()
  const { mutate } = verify
  const onCredential = useCallback((credential: string) => mutate(credential), [mutate])
  const [method, setMethod] = useState<Method>('college_email')
  const status = useVerificationStatus()
  // The waiting screen links back here to switch to college email; don't bounce them.
  const choosing = (useLocation().state as { choose?: boolean } | null)?.choose === true
  const idStatus = status.data?.status

  if (me.data?.verified) return <Navigate to="/app" replace />
  if (idStatus === 'pending' && !choosing) return <Navigate to="/verify/pending" replace />

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-3 pb-8">
        <StepHeader
          step={1}
          left={
            <button
              type="button"
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
              className="-ml-2 h-11 rounded-full bg-transparent px-2 text-sm font-semibold text-muted"
            >
              Sign out
            </button>
          }
        />

        <div>
          <h1 className="m-0 font-display text-[42px] leading-[0.98] font-normal tracking-[-0.01em]">
            Prove you're from campus
          </h1>
          <p className="mt-2.5 mb-0 text-[15px] leading-6 text-pretty text-muted">
            Pick whichever is easier. Everyone on Reveal is a verified student.
          </p>
        </div>

        {(idStatus === 'rejected' || idStatus === 'expired') && (
          <p
            role="alert"
            className="m-0 flex gap-2.5 rounded-2xl bg-warn-bg p-3.5 text-sm leading-5"
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

        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="sr-only">How do you want to verify?</legend>
          {methods.map((m) => (
            <label
              key={m.value}
              className="flex cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-border bg-surface p-4 has-checked:border-accent has-checked:bg-accent-bg"
            >
              <input
                type="radio"
                name="method"
                value={m.value}
                checked={method === m.value}
                onChange={() => setMethod(m.value)}
                className="size-[22px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-border-strong checked:border-[7px] checked:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold">{m.title}</span>
                  {m.badge && (
                    <span className="rounded-full bg-open-bg px-2 py-0.5 text-xs font-bold text-open">
                      {m.badge}
                    </span>
                  )}
                </span>
                <span className="text-[13px] leading-5 text-muted">{m.detail}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {method === 'college_email' && (
          <section aria-label="Verify with college email" className="flex flex-col gap-4">
            <p className="m-0 flex gap-2.5 text-[13px] leading-5 text-muted">
              <LockIcon className="mt-0.5 size-[18px] shrink-0 text-locked" />
              Only @{env.VITE_COLLEGE_DOMAIN} accounts work here. Your college email is never shown
              on your profile, and one email verifies one account.
            </p>
            {verify.isPending ? (
              <p className="m-0 flex min-h-11 items-center justify-center text-sm font-semibold">
                Checking your college account…
              </p>
            ) : (
              <GoogleSignInButton
                onCredential={onCredential}
                hostedDomain={env.VITE_COLLEGE_DOMAIN}
              />
            )}
            {verify.isError && (
              <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
                {verifyErrorMessage(verify.error)}
              </p>
            )}
            <p className="m-0 text-center text-[13px] text-muted">
              Pick your college account in the Google window.
            </p>
          </section>
        )}

        {method === 'id_card' &&
          (idStatus === 'pending' ? (
            <p className="m-0 rounded-2xl bg-surface-2 p-4 text-sm leading-6">
              Your ID is already being checked.{' '}
              <Link to="/verify/pending" className="font-bold text-text">
                See where it is
              </Link>
            </p>
          ) : (
            <section aria-label="Verify with ID card" className="mt-auto flex flex-col gap-3">
              <p className="m-0 text-[13px] leading-5 text-muted">
                You'll take a photo of your ID, then a selfie. A person checks they match. Both
                photos are deleted after review.
              </p>
              <Link
                to="/verify/id-card"
                className="flex h-[54px] items-center justify-center rounded-full bg-accent text-base font-bold text-on-accent no-underline"
              >
                Continue with ID card
              </Link>
            </section>
          ))}

        {method === 'admin' && (
          <section
            aria-label="Ask an admin"
            className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 text-sm leading-6"
          >
            <p className="m-0">
              Message a Reveal admin (whoever shared Reveal with you) with your name, year and the
              email you signed in with:
            </p>
            <p className="m-0 rounded-xl bg-surface px-3 py-2.5 font-bold break-all">
              {me.data?.email}
            </p>
            <p className="m-0 text-muted">Once they let you in, come back and tap below.</p>
            <button
              type="button"
              onClick={() => void me.refetch()}
              disabled={me.isFetching}
              className="h-11 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
            >
              {me.isFetching ? 'Checking…' : "I've been let in"}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
