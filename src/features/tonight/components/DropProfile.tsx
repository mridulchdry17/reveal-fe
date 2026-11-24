import { HeartIcon, LockIcon } from '@/components/icons'

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
      className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-4 shadow-[0_18px_40px_-28px_rgb(40_20_10/0.45)]"
    >
      <div className="flex h-[188px] flex-col items-center justify-center gap-1 rounded-[20px] border border-dashed border-white/25 bg-night text-white">
        <span aria-hidden="true" className="font-display text-[84px] leading-none text-peach italic">
          ?
        </span>
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">
          <LockIcon className="size-4" />
          Photo opens through swaps
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 font-display text-[34px] leading-none font-normal">{profile.nickname}</h2>
        {profile.first_name && <span className="text-sm text-muted">{profile.first_name}</span>}
      </div>

      <ul aria-label="Cards" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        <li className="rounded-full bg-surface-2 px-2.5 py-1.5 text-[13px]">{profile.vibe}</li>
        {shown.map((value) => (
          <li key={value} className="rounded-full bg-open-bg px-2.5 py-1.5 text-[13px] text-open">
            {value}
          </li>
        ))}
        {hidden > 0 && (
          <li className="flex items-center gap-1 rounded-full border border-dashed border-locked px-2.5 py-1.5 text-[13px] text-locked">
            <LockIcon className="size-3.5" />
            {hidden} hidden
          </li>
        )}
      </ul>

      <ul aria-label="Prompts" className="m-0 flex list-none flex-col gap-2.5 p-0">
        {profile.prompts.map((prompt) => (
          <li key={prompt.id} className="flex justify-between gap-3 rounded-[20px] bg-bg p-4">
            <span className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                {prompt.question}
              </span>
              <span className="font-display text-[22px] leading-tight font-normal italic">
                “<span>{prompt.answer}</span>”
              </span>
            </span>
            {onLikePrompt && (
              <button
                type="button"
                aria-label={`Like "${prompt.question}"`}
                onClick={() => onLikePrompt(prompt.id)}
                className="flex size-11 shrink-0 items-center justify-center self-end rounded-full border border-border bg-surface text-accent"
              >
                <HeartIcon className="size-5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="m-0 text-[13px] text-muted">
        Into: <span className="text-text">{profile.interests.join(' · ')}</span>
      </p>
    </article>
  )
}
