import { useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router'

import { AlertIcon, LockIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Sticker } from '@/components/Sticker'
import { Wordmark } from '@/components/Wordmark'
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

const points = [
  {
    title: 'A few people every night at 9',
    body: 'A small drop from your college. No endless scroll.',
  },
  {
    title: 'Swap cards to see more',
    body: 'Name, hometown, a voice note. Each opens only when you both swap.',
  },
  {
    title: 'Photo only when you both say yes',
    body: 'It opens piece by piece through swaps, fully only when you both agree.',
  },
]

/** Decoration: two hidden cards and a sealed photo, fanned out like a hand of cards. */
function CardStack() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[188px] w-[264px]">
      <span className="hatch absolute top-6 left-0 flex h-[148px] w-[108px] -rotate-[9deg] flex-col justify-end gap-1 rounded-[20px] border-[1.5px] border-dashed border-locked p-3 shadow-[0_12px_30px_rgb(40_20_10/0.1)]">
        <span className="text-[10px] font-bold tracking-[0.12em] text-locked uppercase">Hometown</span>
        <span className="text-[13px] font-semibold text-locked">Hidden</span>
      </span>
      <span className="hatch absolute top-6 right-0 flex h-[148px] w-[108px] rotate-[8deg] flex-col justify-end gap-1 rounded-[20px] border-[1.5px] border-dashed border-locked p-3 shadow-[0_12px_30px_rgb(40_20_10/0.1)]">
        <span className="text-[10px] font-bold tracking-[0.12em] text-locked uppercase">First name</span>
        <span className="text-[13px] font-semibold text-locked">Hidden</span>
      </span>
      <span className="absolute top-0 left-1/2 flex h-[168px] w-[120px] -translate-x-1/2 -rotate-1 flex-col items-center justify-between rounded-[22px] bg-night p-3 text-white shadow-[0_20px_44px_rgb(20_10_5/0.3)]">
        <LockIcon className="size-4 self-end text-peach" />
        <span className="font-display text-[84px] leading-[0.7] text-peach">?</span>
        <span className="text-[10px] font-bold tracking-[0.12em] text-white/80 uppercase">Photo</span>
      </span>
      <Sticker tone="peach" tilt={6} className="absolute -right-3 -bottom-2 z-10">
        Pehle baat, phir photo
      </Sticker>
    </div>
  )
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
    <div className="min-h-dvh overflow-x-clip bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-3 pb-8">
        <header className="flex h-12 items-center">
          <Wordmark />
        </header>

        {isInAppBrowser() && (
          <p
            role="alert"
            className="m-0 flex gap-3 rounded-[20px] border border-border bg-surface-2 p-3.5 text-sm leading-[1.45]"
          >
            <AlertIcon className="mt-0.5 size-5 shrink-0 text-warn" />
            <span>
              You're in another app's browser, where Google sign-in doesn't work. Tap{' '}
              <span className="font-bold">•••</span> at the top and open Reveal in Chrome or Safari.
            </span>
          </p>
        )}

        <div className="rise">
          <ScreenHeader
            kicker={`${env.VITE_COLLEGE_NAME} · verified students only`}
            title="Talk first."
            accent="Photos later."
            subtitle="Sign in with the Google account you check every day. Next we'll check you're a student here."
          />
        </div>

        <CardStack />

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

        <ol aria-label="How Reveal works" className="m-0 flex list-none flex-col gap-3.5 p-0">
          {points.map((point, i) => (
            <li key={point.title} className="flex gap-3.5">
              <span
                aria-hidden="true"
                className="w-7 shrink-0 font-display text-[40px] leading-[0.8] text-accent-text italic"
              >
                {i + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold">{point.title}</span>
                <span className="text-sm leading-5 text-muted">{point.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <section
          aria-labelledby="ways-in"
          className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-5 shadow-[0_12px_30px_rgb(40_20_10/0.06)]"
        >
          <h2 id="ways-in" className="m-0 font-display text-[22px] leading-none font-normal">
            After this, one of <em className="text-accent-text">three ways in</em>
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
