import { CheckIcon, HeartIcon, LockIcon } from '@/components/icons'
import { Sticker } from '@/components/Sticker'

import type { PublicProfile } from '../api/drops'
import { branchLine, lookingForLabels } from '@/utils/cardLabels'

type Props = {
  profile: PublicProfile
  /** Shows a heart on each prompt. Leave out where liking isn't possible. */
  onLikePrompt?: (promptId: string) => void
}

/** Someone else's profile: only what the server sent. Hidden cards arrive empty. */
export function DropProfile({ profile, onLikePrompt }: Props) {
  const shown = [
    profile.branch && branchLine(profile.branch, profile.year),
    profile.hometown,
    profile.looking_for && lookingForLabels[profile.looking_for],
  ].filter((value): value is string => Boolean(value))
  const hidden = profile.hidden_cards.length

  return (
    <article
      aria-label={profile.nickname}
      className="rise flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-3 pb-5 shadow-[0_18px_40px_-28px_rgb(40_20_10/0.45)]"
    >
      <div className="relative flex h-[340px] flex-col justify-between overflow-hidden rounded-[22px] bg-night p-4 text-white">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center pb-16 font-display text-[180px] leading-none text-white/[0.07] italic"
        >
          ?
        </span>
        <span className="relative flex w-fit items-center gap-1.5 rounded-full border border-dashed border-white/35 px-3 py-1.5 text-[12px] font-semibold text-white/85">
          <LockIcon className="size-3.5" />
          Photo opens through swaps
        </span>
        <Sticker tone="peach" tilt={5} className="absolute top-[72px] right-4">
          verified student
        </Sticker>
        <div className="relative flex flex-col gap-1.5">
          {profile.first_name && (
            <span className="text-[11px] font-bold tracking-[0.16em] text-peach uppercase">
              {profile.first_name}
            </span>
          )}
          <h2 className="m-0 font-display text-[46px] leading-[0.92] font-normal tracking-[-0.01em] text-balance">
            {profile.nickname}
          </h2>
          <p className="m-0 text-[15px] text-white/80">{profile.vibe}</p>
        </div>
      </div>

      <ul aria-label="Cards" className="m-0 flex list-none flex-wrap gap-1.5 px-1">
        {shown.map((value) => (
          <li
            key={value}
            className="flex items-center gap-1 rounded-full bg-open-bg px-3 py-1.5 text-[13px] font-semibold text-open"
          >
            <CheckIcon className="size-3.5" />
            {value}
          </li>
        ))}
        {hidden > 0 && (
          <li className="hatch flex items-center gap-1 rounded-full border-[1.5px] border-dashed border-locked px-3 py-1.5 text-[13px] font-semibold text-locked">
            <LockIcon className="size-3.5" />
            {hidden} hidden
          </li>
        )}
      </ul>

      <ul aria-label="Prompts" className="m-0 flex list-none flex-col gap-2.5 p-0">
        {profile.prompts.map((prompt) => (
          <li
            key={prompt.id}
            className="flex flex-col gap-2 rounded-[22px] border border-border bg-bg px-4 pt-4 pb-3"
          >
            <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              {prompt.question}
            </span>
            <span className="flex items-end justify-between gap-3">
              <span className="font-display text-[26px] leading-[1.08] font-normal italic">
                “<span>{prompt.answer}</span>”
              </span>
              {onLikePrompt && (
                <button
                  type="button"
                  aria-label={`Like "${prompt.question}"`}
                  onClick={() => onLikePrompt(prompt.id)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-surface text-accent-text transition-transform duration-150 active:scale-90"
                >
                  <HeartIcon className="size-5" />
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>

      {profile.interests.length > 0 && (
        <p className="m-0 px-1 text-[13px] text-muted">
          Into <span className="text-text">{profile.interests.join(' · ')}</span>
        </p>
      )}
    </article>
  )
}
