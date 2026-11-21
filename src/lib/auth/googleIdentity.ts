/**
 * Loads Google Identity Services (the "Sign in with Google" button) once, on demand.
 * Only the parts we use are typed. Docs: https://developers.google.com/identity/gsi/web
 */

export type GoogleCredentialResponse = { credential: string }

type ButtonOptions = {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
}

export type GoogleAccountsId = {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    /** Hint Google to show accounts from this Workspace domain (still check `hd` on the server). */
    hd?: string
    ux_mode?: 'popup' | 'redirect'
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  renderButton: (parent: HTMLElement, options: ButtonOptions) => void
  disableAutoSelect: () => void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let loading: Promise<GoogleAccountsId> | null = null

/** Rejects after `timeoutMs` too: a blocked or very slow network must not spin forever. */
export function loadGoogleIdentity(timeoutMs = 10_000): Promise<GoogleAccountsId> {
  const ready = window.google?.accounts?.id
  if (ready) return Promise.resolve(ready)
  loading ??= new Promise<GoogleAccountsId>((resolve, reject) => {
    const fail = (message: string) => {
      loading = null
      script.remove()
      reject(new Error(message))
    }
    const timer = window.setTimeout(() => fail('Google sign-in took too long to load'), timeoutMs)
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => {
      window.clearTimeout(timer)
      const id = window.google?.accounts?.id
      if (id) resolve(id)
      else fail('Google Identity Services did not initialise')
    }
    script.onerror = () => {
      window.clearTimeout(timer)
      fail('Could not load Google sign-in')
    }
    document.head.appendChild(script)
  })
  return loading
}
