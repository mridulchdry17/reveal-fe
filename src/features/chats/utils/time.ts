/** "14:05" today, "Yesterday", or "12 Nov". Short enough for a chat row. */
export function shortTime(iso: string, now: Date = new Date()): string {
  const at = new Date(iso)
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((day(now) - day(at)) / 86_400_000)
  if (days <= 0) return at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (days === 1) return 'Yesterday'
  return at.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
