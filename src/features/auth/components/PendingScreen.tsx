import { Link, Navigate } from 'react-router'

import { CheckIcon, ShieldCheckIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Sticker } from '@/components/Sticker'
import { Wordmark } from '@/components/Wordmark'

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
    <div className="min-h-dvh overflow-x-clip bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-3 pb-8">
        <header className="flex h-12 items-center">
          <Wordmark />
        </header>

        <div className="rise">
          <ScreenHeader
            kicker="Step 3 of 3 · almost there"
            title="We're checking"
            accent="your ID"
            subtitle="Usually within a few hours. Open Reveal again later and you'll go straight in once it's approved."
          />
        </div>

        <section
          aria-label="Where your check is"
          className="relative rounded-[28px] bg-forest p-5 text-white shadow-[0_20px_44px_rgb(20_40_30/0.25)]"
        >
          <Sticker tone="peach" tilt={-6} className="absolute -top-3 right-4">
            Sit tight
          </Sticker>
          <span className="flex size-14 items-center justify-center rounded-[18px] bg-white/10 text-peach">
            <ShieldCheckIcon className="size-7" strokeWidth={1.4} />
          </span>
          <p className="mt-4 mb-0 font-display text-[28px] leading-[1.05]">
            A real person, <em className="text-peach">not a bot,</em> looks at it.
          </p>
          <ul className="mt-5 mb-0 flex list-none flex-col gap-3.5 p-0 text-[15px]">
            {['Signed in with Google', 'College ID and selfie received'].map((done) => (
              <li key={done} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-peach text-text">
                  <CheckIcon className="size-3.5" />
                </span>
                {done}
              </li>
            ))}
            <li className="flex items-center gap-3 text-white/80">
              <span className="pulse-dot size-6 shrink-0 rounded-full border-2 border-dashed border-white/60" />
              A person is matching your selfie to your ID
            </li>
          </ul>
        </section>

        <p className="m-0 rounded-[20px] bg-open-bg p-4 text-[13px] leading-5">
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
          className="mt-auto h-12 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
