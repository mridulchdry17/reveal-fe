const pad = (n: number) => String(n).padStart(2, '0')

/** Hours, minutes and seconds until `at`, as two-digit strings. Never below zero. */
export function countdown(
  at: string,
  now: Date = new Date(),
): { hours: string; minutes: string; seconds: string } {
  let left = Math.max(0, Math.floor((new Date(at).getTime() - now.getTime()) / 1000))
  const hours = Math.floor(left / 3600)
  left %= 3600
  return { hours: pad(hours), minutes: pad(Math.floor(left / 60)), seconds: pad(left % 60) }
}

/** "Tonight" or "Tomorrow", and the hour in 12-hour time ("9", or "9:30"). */
export function dropDay(at: string, now: Date = new Date()): { day: string; time: string } {
  const drop = new Date(at)
  const sameDay = drop.toDateString() === now.toDateString()
  const hour = drop.getHours() % 12 || 12
  const minutes = drop.getMinutes()
  return {
    day: sameDay ? 'Tonight' : 'Tomorrow',
    time: minutes ? `${hour}:${pad(minutes)}` : String(hour),
  }
}
