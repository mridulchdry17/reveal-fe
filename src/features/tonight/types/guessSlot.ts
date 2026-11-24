import type { ReactNode } from 'react'

import type { GuessResult, PublicProfile } from '../api/drops'

/** The guess feature's cards, composed in from routes.tsx (a feature can't import another). */
export type GuessSlotProps = {
  cards: PublicProfile['guess_cards']
  rightGuesses: number
  reward: 'blur' | null
  title?: string
  onGuessed: (cardId: string, result: GuessResult) => void
  onStale: () => void
}

export type GuessSlot = (props: GuessSlotProps) => ReactNode
