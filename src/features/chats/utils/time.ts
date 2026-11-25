const DAY_MS = 86_400_000

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Whole calendar days between two moments: 0 today, 1 yesterday. */
export function daysAgo(iso: string, now: Date = new Date()): number {
  return Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS)
}

/** "10:18 PM". */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** "10:18 PM" today, "Yesterday", "Mon" within a week, else "12 Nov". Short enough for a chat row. */
export function listTime(iso: string, now: Date = new Date()): string {
  const days = daysAgo(iso, now)
  if (days <= 0) return clockTime(iso)
  if (days === 1) return 'Yesterday'
  const at = new Date(iso)
  if (days < 7) return at.toLocaleDateString('en-US', { weekday: 'short' })
  return at.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** The separator between days in a chat: "Today", "Yesterday", "12 Nov". */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const days = daysAgo(iso, now)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
