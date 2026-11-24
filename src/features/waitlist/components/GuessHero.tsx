import type { CSSProperties } from 'react'

import { useGuessGame } from '../hooks/useGuessGame'
import { demoClues } from '../utils/clues'
import { BlurredFace } from './BlurredFace'

const letters = ['A', 'B', 'C']

export function GuessHero({ college }: { college: string }) {
  const game = useGuessGame(demoClues)

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden text-white">
      <BlurredFace blur={game.blur} />

      <div className="relative mx-auto flex min-h-[800px] max-w-5xl flex-col px-5 pb-4 md:min-h-[720px] md:px-10 md:pb-10">
        <header className="flex h-16 items-center justify-between">
          <span className="font-display text-[30px] leading-none">
            Re<em className="text-peach">veal</em>
          </span>
          <a
            href="#join"
            className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-bold text-text no-underline"
          >
            Get in line
          </a>
        </header>

        <div className="relative flex flex-1 flex-col gap-8 md:grid md:grid-cols-[1fr_400px] md:items-end md:gap-12">
          <div className="relative pt-6 md:self-center md:pt-0">
            <div aria-hidden="true" className="mb-5 flex max-w-[260px] gap-1.5">
              {demoClues.map((clue, i) => (
                <span
                  key={clue.kind}
                  className={`h-[3px] flex-1 rounded-full ${
                    i < game.results.length ? (game.results[i] ? 'bg-white' : 'bg-white/45') : 'bg-white/25'
                  }`}
                />
              ))}
            </div>
            <span
              aria-hidden="true"
              className="float absolute top-[52px] right-0 rounded-xl bg-white px-3 py-2 text-xs font-bold tracking-[0.04em] text-text md:right-auto md:left-[300px]"
              style={{ '--r': '-7deg' } as CSSProperties}
            >
              DROPS AT 9PM
            </span>
            <h1
              id="hero-heading"
              className="m-0 font-display text-[78px] leading-[0.86] font-normal tracking-[-0.03em] md:text-[112px]"
            >
              Don't
              <br />
              swipe.
              <br />
              <em className="text-peach">Guess.</em>
            </h1>
            <p className="mt-4 mb-0 max-w-[30ch] text-[15px] leading-6 text-white/90 md:text-lg">
              The {college} dating app where the face comes last. Try it: this photo is waiting on you.
            </p>
          </div>

          <div className="relative mt-auto">
            <span
              aria-hidden="true"
              className="float absolute -top-4 right-4 z-10 rounded-xl bg-peach px-3 py-2 text-xs font-bold tracking-[0.04em] text-text [animation-delay:-2s]"
              style={{ '--r': '5deg' } as CSSProperties}
            >
              STUDENTS ONLY
            </span>
            <div
              className="rounded-[26px] bg-surface p-[18px] text-text shadow-[0_24px_60px_rgb(10_5_2/0.4)]"
              aria-live="polite"
            >
              {game.done ? (
                <div className="flex flex-col gap-3">
                  <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-accent-text uppercase">
                    {game.right} of {demoClues.length} right · that's the whole game
                  </p>
                  <p className="m-0 font-display text-[28px] leading-[1.05]">
                    Now imagine it's someone from <em className="text-accent-text">your batch.</em>
                  </p>
                  <p className="m-0 text-sm leading-5 text-muted">
                    Right guesses sharpen the photo. It opens fully only when you both say yes.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={game.restart}
                      className="h-12 flex-1 rounded-full border border-border-strong bg-transparent text-sm font-semibold text-text"
                    >
                      Again
                    </button>
                    <a
                      href="#join"
                      className="inline-flex h-12 flex-[1.6] items-center justify-center rounded-full bg-accent text-[15px] font-bold text-on-accent no-underline"
                    >
                      I want in →
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.14em] uppercase">
                    <span className="text-muted">
                      0{game.index + 1} · {game.clue.kind}
                    </span>
                    <span className="text-accent-text">Guess to reveal</span>
                  </div>
                  <p className="m-0 font-display text-[25px] leading-[1.1]">{game.clue.question}</p>
                  <div role="radiogroup" aria-label="Your guess" className="flex flex-col gap-[7px]">
                    {game.clue.options.map((option, i) => {
                      const isAnswer = game.answered && i === game.clue.answer
                      const isWrongPick = game.answered && i === game.picked && !isAnswer
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={game.picked === i}
                          disabled={game.answered}
                          onClick={() => game.guess(i)}
                          className={`flex min-h-[46px] items-center gap-3 rounded-[14px] border px-3.5 text-left text-[15px] ${
                            isAnswer
                              ? 'border-open bg-open-bg text-open'
                              : isWrongPick
                                ? 'border-accent-text text-accent-text'
                                : 'border-border bg-transparent text-text enabled:hover:border-border-strong'
                          }`}
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold">
                            {letters[i]}
                          </span>
                          <span className="flex-1">{option}</span>
                          {isAnswer && <span className="text-xs font-bold">True</span>}
                          {isWrongPick && <span className="text-xs font-bold">Nope</span>}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex min-h-11 items-center justify-between gap-3">
                    <span
                      className={`text-[13px] font-semibold ${
                        !game.answered ? 'text-muted' : game.correct ? 'text-open' : 'text-accent-text'
                      }`}
                    >
                      {!game.answered
                        ? 'Pick one. Right guesses sharpen the photo.'
                        : game.correct
                          ? 'Correct. Look up.'
                          : 'Wrong. The photo stays blurry.'}
                    </span>
                    {game.answered && (
                      <button
                        type="button"
                        onClick={game.next}
                        className="h-11 shrink-0 rounded-full bg-text px-5 text-sm font-bold text-bg"
                      >
                        {game.isLast ? 'Finish' : 'Next clue'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
