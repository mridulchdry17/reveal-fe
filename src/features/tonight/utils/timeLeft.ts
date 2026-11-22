/** "20h 14m" or "14m" until `at`. Rounds up so it never says 0m before the drop. */
export function timeLeft(at: string, now: Date = new Date()): string {
  const minutes = Math.max(1, Math.ceil((new Date(at).getTime() - now.getTime()) / 60_000))
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}
