import { useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router'

import { AlertIcon } from '@/components/icons'
import { env } from '@/config/env'
import { isInAppBrowser } from '@/utils/inAppBrowser'

import { useMe } from '../hooks/useMe'
import { useSignIn } from '../hooks/useSignIn'
import { signInErrorMessage } from '../utils/errorMessage'
import { GoogleSignInButton } from './GoogleSignInButton'

/** Only send people back inside the app, never to another site. */
function safeNext(next: string | null): string {
  return next?.startsWith('/app') ? next : '/app'
}

const waysIn = [
  { dot: 'bg-open', text: `Your @${env.VITE_COLLEGE_DOMAIN} email, one tap` },
  { dot: 'bg-locked', text: 'A photo of your college ID card' },
  { dot: 'bg-accent', text: 'New here? An admin can let you in' },
]

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
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 pt-4 pb-8">
        <header className="flex h-12 items-center">
          <span className="font-display text-[30px] leading-none">
            Re<em className="text-accent-text">veal</em>
          </span>
        </header>

        {isInAppBrowser() && (
          <p
            role="alert"
            className="m-0 flex gap-3 rounded-2xl border border-border bg-surface-2 p-3.5 text-sm leading-[1.45]"
          >
            <AlertIcon className="mt-0.5 size-5 shrink-0 text-warn" />
            <span>
              You're in another app's browser, where Google sign-in doesn't work. Tap{' '}
              <span className="font-bold">•••</span> at the top and open Reveal in Chrome or Safari.
            </span>
          </p>
        )}

        <div className="mt-4">
          <h1 className="m-0 font-display text-[56px] leading-[0.92] font-normal tracking-[-0.01em]">
            Sign in
            <span aria-hidden="true" className="text-accent-text">
              .
            </span>
          </h1>
          <p className="mt-2.5 mb-0 text-[15px] leading-6 text-pretty text-muted">
            Use the Google account you check every day. This is only your login. Next we'll check
            you're a student at {env.VITE_COLLEGE_NAME}.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {signIn.isPending ? (
            <p className="m-0 flex min-h-11 items-center justify-center text-sm font-semibold">
              Signing you in…
            </p>
          ) : (
            <GoogleSignInButton onCredential={onCredential} />
          )}
          {signIn.isError && (
            <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {signInErrorMessage(signIn.error)}
            </p>
          )}
        </div>

        <section
          aria-labelledby="ways-in"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
        >
          <h2 id="ways-in" className="m-0 text-[13px] font-bold">
            After this, one of three ways in
          </h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {waysIn.map((way) => (
              <li key={way.text} className="flex items-center gap-2.5 text-sm">
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${way.dot}`} />
                {way.text}
              </li>
            ))}
          </ul>
        </section>

        <p className="m-0 text-[13px] leading-5 text-muted">
          We only get your name and email from Google. We never post anything or see your password.
        </p>

        <p className="mt-auto mb-0 text-center text-[13px] leading-5 text-muted">
          By continuing you confirm you're 18 or older.
        </p>
      </div>
    </div>
  )
}
