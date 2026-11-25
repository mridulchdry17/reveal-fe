import type { Gender, GuessKind, InterestedIn, MatchOn } from '../api/profile'

export const genderLabels: Record<Gender, string> = {
  woman: 'Woman',
  man: 'Man',
  nonbinary: 'Non-binary',
}

export const interestedInLabels: Record<InterestedIn, string> = {
  women: 'Women',
  men: 'Men',
  everyone: 'Everyone',
}

export const matchOnLabels: Record<MatchOn, string> = {
  shared_interests: 'Shared interests',
  same_hometown: 'Same hometown',
  same_vibe: 'Same vibe',
  nearby_years: 'Nearby years',
}

/** Short names for the three guess card slots, in setup order. */
export const guessKindLabels: Record<GuessKind, string> = {
  everyday: 'Everyday',
  hot_take: 'Hot take',
  little_thing: 'Little thing',
}

export const yearLabels = ['1st year', '2nd year', '3rd year', '4th year', '5th year']

export const branchSuggestions = [
  'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AI & DS', 'AI & ML', 'CSE (Data Science)',
  'CSE (AI & ML)', 'BBA', 'BCA', 'MBA',
]  // prettier-ignore
