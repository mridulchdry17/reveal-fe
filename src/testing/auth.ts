import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { setToken } from '@/lib/auth/token'

import { server } from './server'

type Me = components['schemas']['Me']

export const testUser: Me = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'aanya@gmail.com',
  name: 'Aanya Sharma',
  is_admin: false,
}

/** Start the test signed in: a stored token and a backend that recognises it. */
export function signInAs(user: Me = testUser) {
  setToken('test-session-token')
  server.use(http.get(`${env.VITE_API_URL}/v1/auth/me`, () => HttpResponse.json(user)))
}

type Callback = (response: { credential: string }) => void

/** A stand-in for Google's button: clicking it hands back `credential` like Google would. */
export function stubGoogleButton(credential = 'google-id-token') {
  let callback: Callback = () => {}
  window.google = {
    accounts: {
      id: {
        initialize: (options) => {
          callback = options.callback
        },
        renderButton: (parent) => {
          const button = document.createElement('button')
          button.type = 'button'
          button.textContent = 'Continue with Google'
          button.addEventListener('click', () => callback({ credential }))
          parent.replaceChildren(button)
        },
        disableAutoSelect: () => {},
      },
    },
  }
}
