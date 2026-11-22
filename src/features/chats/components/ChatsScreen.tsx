import type { ReactNode } from 'react'

import { ScreenHeader } from '@/components/ScreenHeader'

type Props = {
  /** People who liked you, composed in from the tonight feature by the app routes. */
  likes?: ReactNode
}

export function ChatsScreen({ likes }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <ScreenHeader title="Chats" />
      {likes}
      <p className="m-0 text-sm text-muted">
        No chats yet. Matches will show up here once chat is ready.
      </p>
    </section>
  )
}
