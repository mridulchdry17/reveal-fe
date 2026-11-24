import { Link } from 'react-router'

import { Sticker } from '@/components/Sticker'

import { useMyProfile } from '../hooks/useProfile'
import { yearLabels } from '../utils/labels'
import { stepPath } from '../utils/steps'

/** Your nickname, vibe and interests, with a way back into the profile screens. Rendered in the You tab. */
export function ProfileSummary() {
  const profile = useMyProfile()
  if (!profile.data) return null

  const { nickname, vibe, interests, branch, year } = profile.data
  const yearLabel = year ? yearLabels[year - 1] : undefined
  const meta = [branch, yearLabel].filter(Boolean).join(' · ')

  return (
    <section
      aria-label="Your profile"
      className="relative rounded-[28px] bg-forest p-5 pt-6 text-white shadow-[0_16px_36px_rgb(31_58_45/0.22)]"
    >
      <Sticker tone="peach" tilt={6} className="absolute -top-3 right-5">
        That's you
      </Sticker>
      <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-peach uppercase">You appear as</p>
      <p className="mt-2 mb-0 font-display text-[52px] leading-[0.92] font-normal tracking-[-0.02em] break-words">
        {nickname ?? 'No nickname yet'}
      </p>
      {meta && <p className="mt-2 mb-0 text-sm text-white/80">{meta}</p>}

      {(vibe || interests.length > 0) && (
        <ul aria-label="Vibe and interests" className="mt-4 mb-0 flex list-none flex-wrap gap-1.5 p-0">
          {vibe && (
            <li className="rounded-full bg-peach px-3 py-1.5 text-[13px] font-bold text-text">{vibe}</li>
          )}
          {interests.map((interest) => (
            <li
              key={interest}
              className="rounded-full border border-white/30 px-3 py-1.5 text-[13px] font-medium text-white"
            >
              {interest}
            </li>
          ))}
        </ul>
      )}

      <Link
        to={stepPath('basics')}
        className="mt-5 flex h-11 w-fit items-center rounded-full border-[1.5px] border-white/50 px-5 text-sm font-semibold text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Edit profile
      </Link>
    </section>
  )
}
