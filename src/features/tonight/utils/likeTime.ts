/** "9:14 PM" for today, "Mon" within the week, else "22 Nov". */
export function likeTime(at: string, now: Date = new Date()): string {
  const date = new Date(at)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  const days = (now.getTime() - date.getTime()) / 86_400_000
  if (days < 6) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
