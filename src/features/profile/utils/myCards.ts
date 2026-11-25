import { branchLine } from '@/utils/cardLabels'

import type { MyProfile } from '../api/profile'
import { clock } from './duration'
import { stepPath } from './steps'

export type SwapCardRow = {
  label: string
  /** What's on the card, or "Not added". */
  value: string
  added: boolean
  /** Where to change it. First name comes from Google, so it has none. */
  to?: string
}

/** The six cards that open only by swapping, as the You tab lists them. */
export function swapCardRows(profile: MyProfile): SwapCardRow[] {
  const missing = 'Not added'
  return [
    { label: 'First name', value: profile.first_name, added: true },
    {
      label: 'Branch and year',
      value: profile.branch ? branchLine(profile.branch, profile.year) : missing,
      added: Boolean(profile.branch),
      to: stepPath('cards'),
    },
    {
      label: 'Hometown',
      value: profile.hometown ?? missing,
      added: Boolean(profile.hometown),
      to: stepPath('cards'),
    },
    {
      label: 'Voice note',
      value: profile.voice_seconds ? clock(profile.voice_seconds) : missing,
      added: Boolean(profile.voice_seconds),
      to: '/app/you/cards/voice',
    },
    {
      label: 'Photo',
      value: profile.has_photo ? 'Added' : missing,
      added: profile.has_photo,
      to: '/app/you/cards/photo',
    },
    {
      label: 'Contact',
      value: profile.contact ? (profile.contact.kind === 'instagram' ? 'Instagram' : 'Phone') : missing,
      added: Boolean(profile.contact),
      to: '/app/you/cards/contact',
    },
  ]
}

/** "61% guess right", or "No guesses yet" before anyone has tried. */
export function guessStat(card: { guessed_count: number; right_count: number }): string {
  if (card.guessed_count === 0) return 'No guesses yet'
  return `${Math.round((card.right_count / card.guessed_count) * 100)}% guess right`
}
