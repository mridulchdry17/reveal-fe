import { useEffect, useRef, useState } from 'react'

import { env } from '@/config/env'
import { loadGoogleIdentity } from '@/lib/auth/googleIdentity'

type Props = {
  onCredential: (credential: string) => void
  /** Suggest accounts from this Google Workspace domain (e.g. the college's). */
  hostedDomain?: string
}

type State = 'loading' | 'ready' | 'unavailable' | 'not-configured'

/** Google's own button (their brand rules require it). Hands back the ID token. */
export function GoogleSignInButton({ onCredential, hostedDomain }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const latestOnCredential = useRef(onCredential)
  const [state, setState] = useState<State>(env.VITE_GOOGLE_CLIENT_ID ? 'loading' : 'not-configured')

  useEffect(() => {
    latestOnCredential.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!env.VITE_GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGoogleIdentity()
      .then((google) => {
        const parent = container.current
        if (cancelled || !parent) return
        google.initialize({
          client_id: env.VITE_GOOGLE_CLIENT_ID,
          callback: ({ credential }) => latestOnCredential.current(credential),
          hd: hostedDomain,
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        google.renderButton(parent, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: Math.min(parent.clientWidth || 320, 400),
        })
        setState('ready')
      })
      .catch(() => {
        if (!cancelled) setState('unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [hostedDomain])

  return (
    <div className="flex min-h-11 flex-col items-center justify-center">
      <div ref={container} className="flex w-full justify-center" />
      {state === 'loading' && <p className="m-0 text-sm text-muted">Loading Google sign-in…</p>}
      {state === 'not-configured' && (
        <p role="alert" className="m-0 text-center text-sm text-muted">
          Sign-in isn't switched on yet. Check back soon.
        </p>
      )}
      {state === 'unavailable' && (
        <p role="alert" className="m-0 text-center text-sm text-muted">
          Google sign-in isn't available right now. Check your connection, or open this page in
          Chrome or Safari.
        </p>
      )}
    </div>
  )
}
