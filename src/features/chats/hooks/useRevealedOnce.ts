import { useCallback, useEffect, useState } from 'react'

const key = (matchId: string) => `reveal:revealed:${matchId}`

function remember(matchId: string) {
  try {
    localStorage.setItem(key(matchId), '1')
  } catch {
    // Private mode: it may show once more next visit. Harmless.
  }
}

function seen(matchId: string): boolean {
  try {
    return localStorage.getItem(key(matchId)) === '1'
  } catch {
    return false
  }
}

/**
 * The "You both said yes" screen shows by itself once per match, the first time this phone
 * sees the photo swap open (right after accepting, or when a poll brings their yes).
 * Later it opens only from the Full picture tile.
 */
export function useRevealedOnce(matchId: string, photoOpen: boolean) {
  const [opened, setOpened] = useState(false)
  const [dismissed, setDismissed] = useState(() => seen(matchId))
  const auto = photoOpen && !dismissed
  const show = opened || auto
  // Remember as soon as it shows, so leaving any way at all counts as seen.
  useEffect(() => {
    if (auto) remember(matchId)
  }, [auto, matchId])

  const open = useCallback(() => setOpened(true), [])
  const close = useCallback(() => {
    setDismissed(true)
    setOpened(false)
  }, [])

  return { show, open, close }
}
