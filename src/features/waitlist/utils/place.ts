/** Until this many people have joined, nobody sees an exact number: a tiny "#3" looks empty. */
export const FOUNDING_SIZE = 50

export type Place = { kind: 'founding' } | { kind: 'numbered'; number: string }

export function describePlace(position: number): Place {
  if (position <= FOUNDING_SIZE) return { kind: 'founding' }
  return { kind: 'numbered', number: position.toLocaleString('en-IN') }
}
