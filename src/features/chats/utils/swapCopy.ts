import { branchLine } from '@/utils/cardLabels'

import type { Card, ChatProfile, ChatSummary } from '../api/chats'

/** The card as a tile kicker ("First name"), as one thing ("name") and as what two people swap ("first names"). */
export const cardCopy: Record<Card, { label: string; one: string; plural: string }> = {
  first_name: { label: 'First name', one: 'name', plural: 'first names' },
  branch: { label: 'Branch', one: 'branch and year', plural: 'branches' },
  hometown: { label: 'Hometown', one: 'hometown', plural: 'hometowns' },
  looking_for: { label: 'Looking for', one: 'what they want', plural: 'what you want' },
  voice: { label: 'Voice', one: 'voice note', plural: 'voice notes' },
  photo: { label: 'Photo', one: 'whole photo', plural: 'photos' },
  contact: { label: 'Contact', one: 'Instagram or number', plural: 'contacts' },
}

/** What a swap opens, said plainly for the confirm step. */
export function swapOutcome(card: Card): string {
  return `You each see the other's ${cardCopy[card].one}, at the same moment.`
}

/** The chat row's last line when a request is waiting: "Wants to swap first names". */
export function pendingLine(pending: NonNullable<ChatSummary['pending_swap']>): string {
  const { plural } = cardCopy[pending.card]
  return pending.by === 'them' ? `Wants to swap ${plural}` : `You asked to swap ${plural}`
}

/** What they're called once their first name is open, else their nickname. */
export function displayName(profile: ChatProfile): string {
  return profile.first_name ?? profile.nickname
}

/** A swap that opened, as a line in the chat: "You swapped hometowns · Mira is from Dehradun". */
export function swapEventLine(card: Card, profile: ChatProfile): string {
  const base = `You swapped ${cardCopy[card].plural}`
  const name = displayName(profile)
  if (card === 'hometown' && profile.hometown) return `${base} · ${name} is from ${profile.hometown}`
  if (card === 'branch' && profile.branch) return `${base} · ${name} is in ${branchLine(profile.branch, profile.year)}`
  return base
}
