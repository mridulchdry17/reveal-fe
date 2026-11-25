import { CheckIcon, LockIcon } from '@/components/icons'
import { Sticker } from '@/components/Sticker'
import { lookingForLabels } from '@/utils/cardLabels'

import type { MyProfile } from '../api/profile'

type Props = {
  profile: MyProfile
  /** My own photo; blurred here the way the drop blurs it. */
  photoUrl: string | null
}

/**
 * My profile as someone else meets it in the drop: blurred photo, nickname, vibe, guess cards
 * without the answers, prompts, interests. Only "Looking for" is shown; every other card is hidden.
 */
export function DropPreview({ profile, photoUrl }: Props) {
  const lookingFor = profile.looking_for ? lookingForLabels[profile.looking_for] : null
  // Same layout for everyone: first name, branch, hometown, voice (if added), photo, contact stay hidden.
  const hidden = 5 + (profile.voice_seconds ? 1 : 0)

  return (
    <article
      aria-label={`${profile.nickname ?? 'Your profile'}, as the drop shows it`}
      className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-3 pb-5 shadow-[0_18px_40px_-28px_rgb(40_20_10/0.45)]"
    >
      <div
        className="relative flex h-[340px] flex-col justify-between overflow-hidden rounded-[22px] bg-night p-4 text-white select-none [-webkit-touch-callout:none]"
        onContextMenu={(event) => event.preventDefault()}
      >
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt="Your photo, blurred"
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full scale-125 object-cover blur-2xl"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(20_17_15/0.45),rgb(20_17_15/0.1)_40%,rgb(20_17_15/0.85))]"
            />
          </>
        ) : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center pb-16 font-display text-[180px] leading-none text-white/[0.07] italic"
          >
            ?
          </span>
        )}
        <span className="relative flex w-fit items-center gap-1.5 rounded-full border border-dashed border-white/35 px-3 py-1.5 text-[12px] font-semibold text-white/85">
          <LockIcon className="size-3.5" />
          Photo opens through swaps
        </span>
        <Sticker tone="peach" tilt={5} className="absolute top-[72px] right-4">
          verified student
        </Sticker>
        <div className="relative flex flex-col gap-1.5">
          <h2 className="m-0 font-display text-[46px] leading-[0.92] font-normal tracking-[-0.01em] text-balance">
            {profile.nickname ?? 'No nickname yet'}
          </h2>
          {profile.vibe && <p className="m-0 text-[15px] text-white/80">{profile.vibe}</p>}
          <p className="m-0 text-[12px] text-white/80">
            {photoUrl
              ? 'People who added a photo see yours blurred like this.'
              : 'No photo yet, so people see this instead.'}
          </p>
        </div>
      </div>

      {profile.guess_cards.length > 0 && (
        <section aria-label="Your guess cards, as others see them" className="flex flex-col gap-2 px-1">
          <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Guess before you match</p>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {profile.guess_cards.map((card) => (
              <li key={card.id} className="flex flex-col gap-2 rounded-[20px] border border-border bg-bg px-4 py-3">
                <span className="font-display text-[20px] leading-[1.15] font-normal">{card.question}</span>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {card.options.map((option) => (
                    <li key={option} className="rounded-full border border-border-strong px-3 py-1.5 text-[13px]">
                      {option}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}

      <ul aria-label="Cards" className="m-0 flex list-none flex-wrap gap-1.5 px-1">
        {lookingFor && (
          <li className="flex items-center gap-1 rounded-full bg-open-bg px-3 py-1.5 text-[13px] font-semibold text-open">
            <CheckIcon className="size-3.5" />
            {lookingFor}
          </li>
        )}
        <li className="hatch flex items-center gap-1 rounded-full border-[1.5px] border-dashed border-locked px-3 py-1.5 text-[13px] font-semibold text-locked">
          <LockIcon className="size-3.5" />
          {hidden} hidden
        </li>
      </ul>

      {profile.prompts.length > 0 && (
        <ul aria-label="Prompts" className="m-0 flex list-none flex-col gap-2.5 p-0">
          {profile.prompts.map((prompt) => (
            <li key={prompt.id} className="flex flex-col gap-2 rounded-[22px] border border-border bg-bg px-4 pt-4 pb-3">
              <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{prompt.question}</span>
              <span className="font-display text-[26px] leading-[1.08] font-normal italic">“{prompt.answer}”</span>
            </li>
          ))}
        </ul>
      )}

      {profile.interests.length > 0 && (
        <p className="m-0 px-1 text-[13px] text-muted">
          Into <span className="text-text">{profile.interests.join(' · ')}</span>
        </p>
      )}
    </article>
  )
}
