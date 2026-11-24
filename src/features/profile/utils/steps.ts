import type { MyProfile } from '../api/profile'

export const steps = ['basics', 'prompts', 'guesses', 'cards', 'preferences'] as const
export type Step = (typeof steps)[number]

export const stepPath = (step: Step) => `/profile/setup/${step}`

/** The first screen still to fill in, or null once the profile is complete. */
export function nextStep(profile: MyProfile): Step | null {
  if (!profile.basics_done) return 'basics'
  if (!profile.prompts_done) return 'prompts'
  if (!profile.guesses_done) return 'guesses'
  if (!profile.cards_done) return 'cards'
  if (!profile.preferences_done) return 'preferences'
  return null
}
