/**
 * The session token from POST /v1/auth/google, kept in localStorage.
 *
 * Bearer token rather than a cookie: the API is on a different site, and iOS Safari
 * blocks cross-site cookies. Storage can throw (private mode, blocked site data), so
 * every access is guarded and a failure just means "signed out".
 */
const KEY = 'reveal.session'

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // Signed in for this page view only.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing stored.
  }
}
