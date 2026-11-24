import { Link } from 'react-router'

import { HeartIcon } from '@/components/icons'

import { useLikes } from '../hooks/useLikes'

/** "2 people liked your words", linking to the Likes list. Nothing when no one is waiting. */
export function LikesBanner() {
  const likes = useLikes()
  const count = likes.data?.length ?? 0
  if (count === 0) return null

  return (
    <Link
      to="/app/likes"
      className="rise flex items-center gap-4 rounded-[24px] bg-forest p-5 text-white no-underline shadow-[0_18px_40px_-26px_rgb(20_40_30/0.7)]"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-[0.16em] text-peach uppercase">Waiting on you</span>
        <span className="font-display text-[30px] leading-[0.95] font-normal">
          {count === 1 ? '1 person' : `${count} people`} liked <em className="text-peach">your words.</em>
        </span>
        <span className="text-[13px] text-white/80">See what they liked →</span>
      </span>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-peach text-text">
        <HeartIcon className="size-6" />
      </span>
    </Link>
  )
}
