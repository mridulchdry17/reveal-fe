import { Link } from 'react-router'

import { HeartIcon } from '@/components/icons'

import { useLikes } from '../hooks/useLikes'

/** "2 people liked you", linking to the Likes list. Nothing when no one is waiting. */
export function LikesBanner() {
  const likes = useLikes()
  const count = likes.data?.length ?? 0
  if (count === 0) return null

  return (
    <Link
      to="/app/likes"
      className="flex items-center gap-3.5 rounded-2xl bg-accent-bg p-4 text-text no-underline"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
        <HeartIcon className="size-5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] font-bold">
          {count === 1 ? '1 person liked you' : `${count} people liked you`}
        </span>
        <span className="text-[13px] text-accent-text">See what they liked</span>
      </span>
    </Link>
  )
}
