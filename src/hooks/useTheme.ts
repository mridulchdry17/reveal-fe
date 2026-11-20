import { useEffect, useState } from 'react'

import { resolveTheme, type ThemePreference } from '@/lib/theme'

const STORAGE_KEY = 'reveal.theme'

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'paper' || stored === 'ink' || stored === 'auto') return stored
  } catch {
    // Storage can be blocked (private mode); fall back to auto.
  }
  return 'auto'
}

/** Applies the theme to <html data-theme> and re-checks every minute for the 9pm switch. */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const theme = resolveTheme(preference, now)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function setPreference(next: ThemePreference) {
    setPreferenceState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore: the choice still applies for this session.
    }
  }

  return { theme, preference, setPreference }
}
