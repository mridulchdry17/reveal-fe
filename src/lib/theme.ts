export type Theme = 'paper' | 'ink'
export type ThemePreference = Theme | 'auto'

const IST_OFFSET_MINUTES = 5 * 60 + 30

/** Ink from 21:00 to 08:00 IST (the drop hours), Paper otherwise. */
export function autoTheme(now: Date): Theme {
  const istMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + IST_OFFSET_MINUTES) % (24 * 60)
  const hour = Math.floor(istMinutes / 60)
  return hour >= 21 || hour < 8 ? 'ink' : 'paper'
}

export function resolveTheme(preference: ThemePreference, now: Date): Theme {
  return preference === 'auto' ? autoTheme(now) : preference
}
