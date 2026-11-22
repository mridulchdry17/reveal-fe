import type { LookingFor } from '../api/drops'

// Same words as GET /v1/profile/options; typed so a new choice fails the build here.
export const lookingForLabels: Record<LookingFor, string> = {
  serious: 'Something serious',
  see_where_it_goes: 'See where it goes',
  friends_first: 'Friends first',
  not_sure: 'Not sure yet',
}

const yearLabels = ['1st year', '2nd year', '3rd year', '4th year', '5th year']

export function branchLine(branch: string, year: number | null): string {
  const label = year ? yearLabels[year - 1] : undefined
  return label ? `${branch} · ${label}` : branch
}
