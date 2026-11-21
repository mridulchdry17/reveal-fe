import { useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { env } from '@/config/env'

import { useMe } from '../hooks/useMe'
import { useSignIn } from '../hooks/useSignIn'
import { signInErrorMessage } from '../utils/errorMessage'
import { GoogleSignInButton } from './GoogleSignInButton'

/** Only send people back inside the app, never to another site. */
function safeNext(next: string | null): string {
  return next?.startsWith('/app') ? next : '/app'
}

export function SignInScreen() {
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))
  const me = useMe()
  const signIn = useSignIn()
  const { mutate } = signIn
  const onCredential = useCallback((credential: string) => mutate(credential), [mutate])

  if (me.data) return <Navigate to={next} replace />

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5">
        <header className="flex h-14 items-center">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="relative size-5">
              <span className="absolute top-0.5 left-0 h-[15px] w-[11px] -rotate-[8deg] rounded-[3px] bg-open" />
              <span className="absolute top-0.5 left-2 h-[15px] w-[11px] rotate-[6deg] rounded-[3px] hatch border border-dashed border-locked" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.03em]">Reveal</span>
          </span>
        </header>

        <main className="flex flex-1 flex-col justify-center pb-16">
          <section
            aria-labelledby="sign-in-heading"
            className="rounded-[28px] border border-border bg-surface p-6 shadow-[0_1px_0_rgb(42_30_46/0.04),0_24px_48px_-32px_rgb(42_30_46/0.35)]"
          >
            <h1
              id="sign-in-heading"
              className="m-0 font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em]"
            >
              Sign in
            </h1>
            <p className="mt-2 mb-6 text-[15px] leading-6 text-pretty text-muted">
              Use the Google account you check every day. Next, you'll show you're at{' '}
              {env.VITE_COLLEGE_NAME}: with your college email or your ID card.
            </p>

            {signIn.isPending ? (
              <p className="m-0 flex min-h-11 items-center justify-center text-sm font-semibold">
                Signing you in…
              </p>
            ) : (
              <GoogleSignInButton onCredential={onCredential} />
            )}

            {signIn.isError && (
              <p role="alert" className="mt-4 mb-0 flex gap-2 text-sm text-accent-text">
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
                {signInErrorMessage(signIn.error)}
              </p>
            )}
          </section>

          <p className="mx-auto mt-5 mb-0 max-w-[34ch] text-center text-xs leading-5 text-muted">
            We only get your name and email from Google. We never post anything or see your
            password.
          </p>
        </main>
      </div>
    </div>
  )
}
