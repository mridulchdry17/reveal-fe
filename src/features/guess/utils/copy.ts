/** What a right guess does to their photo where the cards are shown. */
export type PhotoReward = 'blur' | 'pieces' | null

export const guessCopy: Record<'blur' | 'pieces' | 'none', { hint: string; right: string; wrong: string }> = {
  blur: {
    hint: 'One try each, totally optional. Every right guess sharpens their blurred photo a little.',
    right: 'Right. Their photo got a little sharper.',
    wrong: 'Not quite. It stays as it is.',
  },
  pieces: {
    hint: 'One try each. A right guess opens a piece of their photo, up to 6 before you swap photos.',
    right: 'Right. One more piece of their photo (up to 6).',
    wrong: 'Not quite. It stays as it is.',
  },
  none: {
    hint: 'One try each, totally optional. Bonus: instant conversation starter.',
    right: 'Right. You read them well.',
    wrong: "Not quite. Now you've got something to ask about.",
  },
}
