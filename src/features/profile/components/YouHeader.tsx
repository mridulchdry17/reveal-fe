import { Link } from 'react-router'

import { CameraIcon, EyeIcon, ChevronRightIcon } from '@/components/icons'

import { useMyPhoto, useMyProfile } from '../hooks/useProfile'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { stepPath } from '../utils/steps'

/** Top of the You tab: my photo, nickname, vibe and interests, Edit, and the way into the drop preview. */
export function YouHeader() {
  const profile = useMyProfile()
  const photo = useMyPhoto(profile.data?.has_photo ?? false)
  const url = useObjectUrl(profile.data?.has_photo ? photo.data : null)
  if (!profile.data) return null

  const { nickname, vibe, interests } = profile.data
  const line = [vibe, ...interests].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-[18px]">
      <header className="flex items-center gap-3.5">
        {url ? (
          <img
            src={url}
            alt="Your photo"
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
            className="size-16 shrink-0 rounded-full object-cover select-none"
          />
        ) : (
          <Link
            to="/app/you/cards/photo"
            aria-label="Add a photo"
            className="hatch flex size-16 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-locked text-locked"
          >
            <CameraIcon className="size-6" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="m-0 font-display text-[34px] leading-none font-normal break-words">
            {nickname ?? 'No nickname yet'}
          </h2>
          {line && <p className="mt-1 mb-0 text-[13px] text-muted">{line}</p>}
        </div>
        <Link
          to={stepPath('basics')}
          aria-label="Edit profile"
          className="flex h-11 shrink-0 items-center px-1 text-sm font-semibold text-accent-text no-underline"
        >
          Edit
        </Link>
      </header>

      <Link
        to="/app/you/preview"
        className="flex min-h-12 items-center gap-3 rounded-[18px] bg-forest px-4 py-3.5 text-bg no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
      >
        <EyeIcon className="size-5 shrink-0" />
        <span className="flex-1 text-sm font-medium">See yourself the way the drop does</span>
        <ChevronRightIcon className="size-4 shrink-0" />
      </Link>
    </div>
  )
}
