import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { CheckIcon } from '@/components/icons'
import { env } from '@/config/env'

import { useJoinWaitlist } from '../hooks/useJoinWaitlist'
import { HeroProfile } from './HeroProfile'
import { JoinedCard } from './JoinedCard'
import { WaitlistForm, type WaitlistFormValues } from './WaitlistForm'

const college = env.VITE_COLLEGE_NAME

const glyphBase = 'relative flex h-[60px] w-11 shrink-0 items-center justify-center rounded-lg'

const rules: { title: string; body: string; glyph: ReactNode }[] = [
  {
    title: 'Seven cards. Your call.',
    body: "Name, branch, hometown, what you're after, a voice note. Show what you like. Photo and number stay hidden.",
    glyph: (
      <span className={`${glyphBase} bg-open font-display text-2xl font-extrabold text-bg`}>7</span>
    ),
  },
  {
    title: '9pm. A few new people.',
    body: 'About five, every night. Gone by 9am.',
    glyph: <span className={`${glyphBase} bg-text font-display text-sm font-extrabold text-bg`}>9pm</span>,
  },
  {
    title: 'Like a line, not a face.',
    body: 'Reply to something they wrote, with a note.',
    glyph: (
      <span className={`${glyphBase} border border-border bg-surface font-display text-2xl font-extrabold text-text`}>
        “
      </span>
    ),
  },
  {
    title: "Swap, don't stalk.",
    body: 'A card opens only when you both tap yes, together. Photo always comes last.',
    glyph: (
      <span className={`${glyphBase} hatch overflow-hidden border-[1.5px] border-dashed border-border-strong`}>
        <span className="absolute inset-0 bg-open [clip-path:polygon(0_0,100%_0,0_100%)]" />
      </span>
    ),
  },
]

const safety = [
  `Only verified students from ${college}. No outsiders.`,
  'First-years only see first-years.',
  'Hide anyone you know: seniors, your ex, your roommate.',
  'Women write first, by default.',
  "Every screenshot carries the viewer's watermark.",
]

export function WaitlistScreen() {
  const join = useJoinWaitlist()
  const [searchParams] = useSearchParams()
  const source = searchParams.get('src') ?? undefined

  function submit(values: WaitlistFormValues) {
    return join.mutateAsync({ ...values, source })
  }

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto max-w-md px-5 md:max-w-5xl md:px-10">
        <header className="flex h-14 items-center justify-between md:h-16">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="relative size-5">
              <span className="absolute top-0.5 left-0 h-[15px] w-[11px] -rotate-[8deg] rounded-[3px] bg-open" />
              <span className="absolute top-0.5 left-2 h-[15px] w-[11px] rotate-[6deg] rounded-[3px] hatch border border-dashed border-border-strong" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.03em]">Reveal</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <span aria-hidden="true" className="pulse-dot size-1.5 rounded-full bg-open" />
            Waitlist open
          </span>
        </header>

        <section className="text-center">
          <div className="mt-6 md:mt-10">
            <HeroProfile />
          </div>
          <p className="mt-8 mb-0 inline-flex h-8 max-w-full items-center gap-1.5 truncate rounded-full border border-border bg-surface px-3 text-[13px] font-semibold">
            <CheckIcon className="size-3.5 shrink-0 text-open" />
            {college} only · verified students
          </p>
          <h1 className="mx-auto mt-4 mb-0 font-display text-[38px] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance md:max-w-[14ch] md:text-[64px]">
            Get known <span className="mark">before you're seen.</span>
          </h1>
          <p className="mx-auto mt-4 mb-0 max-w-[32ch] text-base leading-6 text-pretty text-muted md:max-w-[42ch] md:text-lg md:leading-7">
            A dating app for {college}, and only {college}. Your photo stays hidden until you both say yes, at
            the same moment.
          </p>
        </section>

        <div className="mt-8 md:mt-16 md:grid md:grid-cols-[420px_1fr] md:items-start md:gap-16">
          <section
            id="join"
            aria-labelledby={join.data ? undefined : 'join-heading'}
            className="scroll-mt-6 rounded-[28px] border border-border bg-surface p-5 pt-6 shadow-[0_1px_0_rgb(19_22_42/0.04),0_24px_48px_-32px_rgb(19_22_42/0.35)] md:sticky md:top-8"
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
                <h2 id="join-heading" className="m-0 font-display text-2xl font-extrabold tracking-[-0.02em]">
                  Save your spot
                </h2>
                <p className="mt-1 mb-5 text-sm text-muted">Takes 20 seconds. Students only.</p>
                <WaitlistForm onSubmit={submit} />
              </>
            )}
          </section>

          <div className="mt-14 md:mt-0">
            <section aria-labelledby="rules-heading">
              <p className="m-0 text-xs font-bold tracking-[0.12em] text-muted uppercase">The rules</p>
              <h2
                id="rules-heading"
                className="mt-2 mb-0 font-display text-[28px] leading-[1.05] font-extrabold tracking-[-0.025em]"
              >
                Slow on purpose.
              </h2>
              <ul className="mt-5 mb-0 list-none divide-y divide-border border-y border-border p-0">
                {rules.map((rule) => (
                  <li key={rule.title} className="flex gap-4 py-5">
                    <span aria-hidden="true">{rule.glyph}</span>
                    <span className="flex flex-col">
                      <span className="font-display text-lg leading-6 font-bold tracking-[-0.01em]">
                        {rule.title}
                      </span>
                      <span className="mt-1 text-[15px] leading-6 text-muted">{rule.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="safety-heading" className="mt-12 rounded-[28px] bg-surface-2 p-5">
              <p className="m-0 text-xs font-bold tracking-[0.12em] text-muted uppercase">Safety</p>
              <h2
                id="safety-heading"
                className="mt-2 mb-0 font-display text-[24px] leading-[1.1] font-extrabold tracking-[-0.02em] text-balance"
              >
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

            {!join.data && (
              <a
                href="#join"
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full border-[1.5px] border-border-strong text-sm font-semibold text-text no-underline md:hidden"
              >
                Save your spot ↑
              </a>
            )}
          </div>
        </div>

        <footer className="mt-12 flex flex-col gap-1 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-xs text-muted">
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
        </footer>
      </div>
    </div>
  )
}
