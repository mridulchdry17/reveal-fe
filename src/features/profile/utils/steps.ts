import type { MyProfile } from '../api/profile'

/** Setup screens in order. */
export const steps = ['basics', 'prompts', 'guesses', 'cards', 'preferences'] as const
export type Step = (typeof steps)[number]

export const stepPath = (step: Step) => `/profile/setup/${step}`

/** Onboarding step number: verification is step 1, so basics is step 2. */
export const stepNumber = (step: Step) => steps.indexOf(step) + 2

/** The screen before this one, or null on the first. */
export function previousStep(step: Step): Step | null {
  return steps[steps.indexOf(step) - 1] ?? null
}

/** The first screen still to fill in, or null once the profile is complete. */
export function nextStep(profile: MyProfile): Step | null {
  if (!profile.basics_done) return 'basics'
  if (!profile.prompts_done) return 'prompts'
  if (!profile.guesses_done) return 'guesses'
  if (!profile.cards_done) return 'cards'
  if (!profile.preferences_done) return 'preferences'
  return null
}
