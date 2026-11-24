import { Link } from 'react-router'

import { Sticker } from '@/components/Sticker'

/** The moment two people like each other: a forest card that says so and points to Chats. */
export function MatchMoment({ nickname }: { nickname: string }) {
  return (
    <div
      role="status"
      className="rise relative flex flex-col gap-3 overflow-hidden rounded-[28px] bg-forest px-5 pt-6 pb-5 text-white shadow-[0_18px_40px_-24px_rgb(20_40_30/0.6)]"
    >
      <Sticker tone="peach" tilt={6} className="absolute top-4 right-4">
        both said yes
      </Sticker>
      <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-peach uppercase">New match</p>
      <p className="m-0 max-w-[16ch] font-display text-[40px] leading-[0.95] font-normal">
        It's a <em className="text-peach">match</em> with {nickname}.
      </p>
      <p className="m-0 text-sm leading-6 text-white/80">
        You both liked each other. Either of you can say hi first.
      </p>
      <Link
        to="/app/chats"
        className="inline-flex h-11 w-fit items-center rounded-full bg-white px-5 text-sm font-bold text-text no-underline"
      >
        Go to Chats
      </Link>
    </div>
  )
}
