import type { ReactNode } from 'react'

import type { components } from '@/lib/api/schema'

import type { ChatProfile } from '../api/chats'

/** The guess feature's cards, composed in from routes.tsx (a feature can't import another). */
export type GuessSlotProps = {
  cards: ChatProfile['guess_cards']
  rightGuesses: number
  reward: 'pieces' | null
  onGuessed: (cardId: string, result: components['schemas']['GuessResult']) => void
  onStale: () => void
}

export type GuessSlot = (props: GuessSlotProps) => ReactNode
