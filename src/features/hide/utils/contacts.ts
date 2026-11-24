import type { HideKind } from '../api/hides'

type PickedContact = { tel?: string[]; email?: string[] }
type ContactsManager = {
  select: (props: Array<'tel' | 'email'>, options: { multiple: boolean }) => Promise<PickedContact[]>
}

/** The Contact Picker (Android Chrome). Elsewhere people type the number in. */
export function contactPicker(): ContactsManager | null {
  const nav = navigator as Navigator & { contacts?: ContactsManager }
  return nav.contacts && 'select' in nav.contacts ? nav.contacts : null
}

/** Every phone number and email on the picked contacts, as entries to hide. */
export function entriesFrom(picked: PickedContact[]): Array<{ kind: HideKind; value: string }> {
  return picked.flatMap((contact) => [
    ...(contact.tel ?? []).map((value) => ({ kind: 'phone' as const, value })),
    ...(contact.email ?? []).map((value) => ({ kind: 'email' as const, value })),
  ])
}
