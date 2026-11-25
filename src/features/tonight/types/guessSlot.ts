import type { ReactNode } from 'react'

import type { GuessResult, PublicProfile } from '../api/drops'

/**
 * The guess feature's one-card-at-a-time game, composed in from routes.tsx (a feature can't
 * import another). Tonight supplies the profile, the photo and what Pass and Like do.
 */
export type GuessGameSlotProps = {
  nickname: string
  about: string
  cards: PublicProfile['guess_cards']
  hintUsed: boolean
  reward: 'blur' | null
  backdrop: ReactNode
  like: { label: string; cta: string; body: string }
  backLabel: string
  busy: boolean
  error?: string
  onBack: () => void
  onPass: () => void
  onLike: () => void
  onGuessed: (cardId: string, result: GuessResult) => void
  onHinted: (cardId: string, struck: number) => void
  onHintGone: () => void
  onStale: () => void
}

export type GuessGameSlot = (props: GuessGameSlotProps) => ReactNode
