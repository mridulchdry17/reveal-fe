import { useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router'

import { BlurredFace } from '@/components/BlurredFace'
import { AlertIcon } from '@/components/icons'
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

const points = [
  'A small drop, every night at 9',
  'Each right guess brings a face into focus',
  'Full photo only when you both say yes',
]

const cardShadow = 'shadow-[0_18px_40px_rgb(40_20_10/0.18)]'

/** Decoration: three blurred stand-in photos, the middle one asking "?". No real people. */
function BlurredStack() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[250px] w-full max-w-[330px]">
      <span className={`absolute top-8 left-[4%] h-[200px] w-[140px] -rotate-[9deg] overflow-hidden rounded-[22px] ${cardShadow}`}>
        <BlurredFace blur={16} />
      </span>
      <span className={`absolute top-8 right-[4%] h-[200px] w-[140px] rotate-[9deg] overflow-hidden rounded-[22px] ${cardShadow}`}>
        <BlurredFace blur={16} />
      </span>
      <span
        className="absolute top-0 left-1/2 flex h-[228px] w-[160px] -translate-x-1/2 items-center justify-center overflow-hidden rounded-[24px] shadow-[0_24px_50px_rgb(40_20_10/0.25)]"
      >
        <BlurredFace blur={20} />
        <span className="relative font-display text-[72px] leading-none text-white/85">?</span>
      </span>
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
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 pt-12 pb-8">
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

        <header className="rise flex flex-col gap-3.5">
          <h1 className="m-0 font-normal">
            <Wordmark className="text-[64px] tracking-[-0.015em]" />
          </h1>
          <p className="m-0 max-w-[300px] text-[15px] leading-normal text-muted">
            Campus dating, one guess at a time. For verified {env.VITE_COLLEGE_NAME} students.
          </p>
        </header>

        <BlurredStack />

        <ol aria-label="How Reveal works" className="m-0 flex list-none flex-col gap-2.5 p-0">
          {points.map((point, i) => (
            <li key={point} className="flex items-baseline gap-3 text-[15px]">
              <span aria-hidden="true" className="w-4 shrink-0 text-[11px] font-bold tracking-[0.12em] text-accent-text">
                {String(i + 1).padStart(2, '0')}
              </span>
              {point}
            </li>
          ))}
        </ol>

        <div className="mt-auto flex flex-col gap-3">
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
          <p className="m-0 text-center text-xs leading-normal text-muted">
            You go by a nickname. Your name, photo and number stay hidden until you choose to swap
            them.
          </p>
          <p className="m-0 text-center text-xs leading-normal text-muted">
            By continuing you confirm you're 18 or older. We only get your name and email from
            Google, and never post anything.
          </p>
        </div>
      </div>
    </div>
  )
}
