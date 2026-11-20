import { env } from '@/config/env'

import { useJoinWaitlist } from '../hooks/useJoinWaitlist'
import { JoinedCard } from './JoinedCard'
import { WaitlistForm } from './WaitlistForm'

const steps = [
  { title: 'Verify', body: 'Enrollment number and a quick selfie. Only real students from your college.' },
  { title: 'Seven cards', body: 'Name, branch, hometown, a voice note. You choose what is shown.' },
  { title: '9pm drop', body: 'A few people every night. Like a line they wrote, not a face.' },
  { title: 'Swap to reveal', body: 'Hidden cards open only when you both say yes. Photo comes last.' },
]

export function WaitlistScreen() {
  const join = useJoinWaitlist()

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 bg-bg px-6 pt-10 pb-12 text-text">
      <span className="font-display text-xl font-extrabold tracking-tight">Reveal</span>

      <header className="flex flex-col gap-3">
        <p className="m-0 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold">
          Only for {env.VITE_COLLEGE_NAME}
        </p>
        <h1 className="m-0 font-display text-4xl leading-none font-extrabold tracking-tight">
          Meet someone from your college. <span className="text-accent">Photo comes last.</span>
        </h1>
        <p className="m-0 text-base text-muted">
          Every profile is seven cards. You choose which are shown. The rest open only when you both agree.
        </p>
      </header>

      {join.data ? (
        <JoinedCard
          position={join.data.position}
          alreadyJoined={join.data.already_joined}
          shareUrl={window.location.origin}
        />
      ) : (
        <section aria-labelledby="join-heading" className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
          <h2 id="join-heading" className="m-0 font-display text-2xl font-extrabold tracking-tight">
            Get in early
          </h2>
          <WaitlistForm onSubmit={join.mutateAsync} />
        </section>
      )}

      <section aria-labelledby="how-heading" className="flex flex-col gap-3">
        <h2 id="how-heading" className="m-0 text-xs font-bold tracking-widest text-muted uppercase">
          How it works
        </h2>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-extrabold">
                {index + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">{step.title}</span>
                <span className="text-sm text-muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="m-0 text-center text-xs text-muted">18+ only · built by students, not the college</p>
    </div>
  )
}
