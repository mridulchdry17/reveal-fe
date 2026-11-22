import type { Contact } from '../api/profile'

/** How a saved contact reads back to its owner: "@aanya.reads" or "+91 98765 43210". */
export function contactLabel(contact: Contact): string {
  if (contact.kind === 'instagram') return `@${contact.value}`
  return `+91 ${contact.value.slice(0, 5)} ${contact.value.slice(5)}`
}
