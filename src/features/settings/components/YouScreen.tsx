import type { ReactNode } from 'react'

import { ListCard } from '@/components/ListRow'

type Props = {
  /** Header, drop preview link, guess cards and swap cards, composed in from the profile feature. */
  profile?: ReactNode
  /** The notifications card, composed in from its feature. */
  notifications?: ReactNode
  /** Rows for the settings list (hide list, blocked, account), each from its own feature. */
  settings?: ReactNode
}

export function YouScreen({ profile, notifications, settings }: Props) {
  return (
    <div className="rise flex flex-col gap-[18px] pb-8">
      {/* The tab's name; the nickname under it is the visible title. */}
      <h1 className="sr-only">You</h1>
      {profile}
      <section aria-labelledby="settings-title" className="flex flex-col gap-2">
        <h2 id="settings-title" className="m-0 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Settings
        </h2>
        {notifications}
        {settings && (
<ListCard>{settings}</ListCard>
        )}
      </section>
    </div>
  )
}
