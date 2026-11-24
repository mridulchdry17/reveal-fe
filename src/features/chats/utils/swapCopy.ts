import type { Card } from '../api/chats'

/** The card as a chip ("Name"), as one thing ("name") and as what two people swap ("names"). */
export const cardCopy: Record<Card, { label: string; one: string; plural: string }> = {
  first_name: { label: 'Name', one: 'name', plural: 'names' },
  branch: { label: 'Branch', one: 'branch and year', plural: 'branches' },
  hometown: { label: 'Hometown', one: 'hometown', plural: 'hometowns' },
  looking_for: { label: 'Looking for', one: 'what they want', plural: 'what you want' },
  voice: { label: 'Voice note', one: 'voice note', plural: 'voice notes' },
  photo: { label: 'Photo', one: 'whole photo', plural: 'photos' },
  contact: { label: 'Contact', one: 'Instagram or number', plural: 'contacts' },
}

/** What a swap opens, said plainly for the confirm step. */
export function swapOutcome(card: Card): string {
  return `You each see the other's ${cardCopy[card].one}, at the same moment.`
}
