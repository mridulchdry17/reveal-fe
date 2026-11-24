import { useSearchParams } from 'react-router'

import { CheckIcon } from '@/components/icons'
import { env } from '@/config/env'

import { useJoinWaitlist } from '../hooks/useJoinWaitlist'
import { GuessHero } from './GuessHero'
import { JoinedCard } from './JoinedCard'
import { WaitlistForm, type WaitlistFormValues } from './WaitlistForm'

const college = env.VITE_COLLEGE_NAME

const strip = ['no swiping', 'faces come last', 'students only', 'drops at 9pm', 'like an answer', 'both say yes']

const rules = [
  {
    title: 'A few people at 9pm',
    body: 'A small drop. No endless scroll, no stack of faces.',
    tone: 'bg-forest text-white',
    number: 'text-peach',
    tilt: '-rotate-[1.5deg]',
  },
  {
    title: 'Guess their answers',
    body: 'Everyone writes 3 little questions about themselves. Every right guess sharpens their photo.',
    tone: 'bg-surface text-text border border-border',
    number: 'text-accent-text',
    tilt: 'rotate-[1.2deg]',
  },
  {
    title: 'Like an answer, not a face',
    body: 'Tell them why their answer got you. If they like you back, you can talk.',
    tone: 'bg-peach-strong text-text',
    number: 'text-text',
    tilt: '-rotate-1',
  },
  {
    title: 'Swap, then both say yes',
    body: 'Name, hometown, a voice note, one swap at a time. The full photo opens only when you both choose to.',
    tone: 'bg-night text-white',
    number: 'text-peach',
    tilt: 'rotate-[1.4deg]',
  },
]

const versus = [
  { no: 'Swiping on faces', yes: 'Guessing on vibes' },
  { no: 'Endless scroll', yes: 'A few, at 9pm' },
  { no: 'Randoms and bots', yes: `Verified ${college} only` },
  { no: 'Photos for anyone', yes: 'Both say yes first' },
]

const safety = [
  `Only verified students from ${college}. No outsiders.`,
  'Hide anyone you know: seniors, your ex, your roommate.',
  "Every photo carries the viewer's watermark.",
]

export function WaitlistScreen() {
  const join = useJoinWaitlist()
  const [searchParams] = useSearchParams()
  const source = searchParams.get('src') ?? undefined

  function submit(values: WaitlistFormValues) {
    return join.mutateAsync({ ...values, source })
  }

  return (
    <div data-theme="editorial" className="min-h-dvh overflow-x-clip bg-bg text-text">
      <GuessHero college={college} />

      <div aria-hidden="true" className="-mx-4 mt-5 -rotate-2 overflow-hidden bg-accent py-3.5 text-on-accent">
        <div className="marquee flex w-max">
          {[...strip, ...strip].map((word, i) => (
            <span key={i} className="flex items-center gap-[18px] pr-[18px] font-display text-2xl whitespace-nowrap">
              {word}
              <span className="text-sm">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 md:max-w-5xl md:px-10">
        <div className="md:grid md:grid-cols-2 md:gap-16">
          <section aria-labelledby="rules-heading" className="pt-12">
            <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">The rules</p>
            <h2 id="rules-heading" className="mt-2 mb-0 font-display text-[46px] leading-[0.95] font-normal">
              Four steps.
              <br />
              <em>Zero swiping.</em>
            </h2>
            <ol className="mt-6 mb-0 flex list-none flex-col gap-3.5 p-0">
              {rules.map((rule, i) => (
                <li
                  key={rule.title}
                  className={`flex gap-3.5 rounded-3xl p-5 shadow-[0_12px_30px_rgb(40_20_10/0.1)] ${rule.tone} ${rule.tilt}`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-10 shrink-0 font-display text-[56px] leading-[0.8] italic ${rule.number}`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="font-display text-[26px] leading-none">{rule.title}</span>
                    <span className="text-sm leading-5 opacity-90">{rule.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="pt-12 md:pt-[148px]">
            <section aria-labelledby="versus-heading">
              <h2 id="versus-heading" className="m-0 font-display text-[40px] leading-[0.98] font-normal">
                Not another
                <br />
                <em className="text-accent-text">face-rating app.</em>
              </h2>
              <ul className="mt-5 mb-0 grid list-none grid-cols-2 gap-2.5 p-0">
                {versus.map((item) => (
                  <li
                    key={item.no}
                    className="flex flex-col gap-1.5 rounded-[18px] border border-border bg-surface p-3.5"
                  >
                    <span className="text-[13px] text-muted line-through">{item.no}</span>
                    <span className="text-[15px] font-semibold">{item.yes}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="safety-heading" className="mt-8">
              <h2 id="safety-heading" className="m-0 font-display text-[26px] leading-[1.1] font-normal">
                Nobody finds out unless you want them to.
              </h2>
              <ul className="mt-4 mb-0 flex list-none flex-col gap-3 p-0">
                {safety.map((line) => (
                  <li key={line} className="flex gap-2.5 text-[15px] leading-6">
                    <CheckIcon className="mt-1 size-4 shrink-0 text-open" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <section
          id="join"
          aria-labelledby={join.data ? undefined : 'join-heading'}
          className="mx-auto mt-14 max-w-[480px] scroll-mt-6 rounded-[30px] bg-night p-5 pt-7 text-white"
        >
          {join.data ? (
            <JoinedCard
              position={join.data.position}
              alreadyJoined={join.data.already_joined}
              college={college}
              origin={window.location.origin}
            />
          ) : (
            <>
              <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-peach uppercase">Waitlist</p>
              <h2 id="join-heading" className="mt-1.5 mb-0 font-display text-[44px] leading-[0.95] font-normal">
                Claim your <em className="text-peach">spot.</em>
              </h2>
              <p className="mt-2 mb-6 text-sm text-white/75">Takes 20 seconds. Students only.</p>
              <div className="rounded-3xl bg-surface p-5 text-text">
                <WaitlistForm onSubmit={submit} />
              </div>
            </>
          )}
        </section>

        <footer className="mt-14 flex flex-col gap-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <span
            aria-hidden="true"
            className="font-display text-[118px] leading-[0.8] tracking-[-0.03em] md:text-[200px]"
          >
            Re<em className="text-accent-text">veal</em>
          </span>
          <div className="flex flex-col gap-1 text-xs text-muted">
            <span>18+ only · Made by students, for students</span>
            <span>Not affiliated with {college}.</span>
            {env.VITE_CONTACT_EMAIL && (
              <span>
                Delete your data or report a problem:{' '}
                <a href={`mailto:${env.VITE_CONTACT_EMAIL}`} className="text-text underline underline-offset-2">
                  {env.VITE_CONTACT_EMAIL}
                </a>
              </span>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
