import { http, HttpResponse } from 'msw'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { setToken } from '@/lib/auth/token'

import { server } from './server'

type Me = components['schemas']['Me']
type VerificationStatus = components['schemas']['VerificationStatus']
type MyProfile = components['schemas']['MyProfile']

export const testUser: Me = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'aanya@gmail.com',
  name: 'Aanya Sharma',
  is_admin: false,
  verified: true,
  verified_via: 'college_email',
}

/** A finished profile, so tests land in the app instead of the profile screens. */
export const completeProfile: MyProfile = {
  first_name: 'Aanya',
  nickname: 'Quiet storm',
  vibe: 'Night owl',
  interests: ['Music', 'Films', 'Trekking'],
  prompts: [
    { id: 'p1', question: 'My ideal Sunday', answer: 'Chai, a long walk, zero plans' },
    { id: 'p2', question: 'Hot take', answer: 'Maggi is a full meal' },
    { id: 'p3', question: 'Green flag in people', answer: 'They remember small things' },
  ],
  branch: 'CSE',
  year: 2,
  hometown: 'Jaipur',
  looking_for: 'serious',
  contact: null,
  gender: 'woman',
  interested_in: 'men',
  match_on: [],
  basics_done: true,
  prompts_done: true,
  cards_done: true,
  preferences_done: true,
  complete: true,
}

/** Signed in with personal Gmail, not yet a verified student. */
export const unverifiedUser: Me = { ...testUser, verified: false, verified_via: null }

/** Start the test signed in: a stored token and a backend that recognises it. */
export function signInAs(
  user: Me = testUser,
  verification: VerificationStatus = { status: 'none', submitted_at: null, reject_reason: null },
  profile: MyProfile = completeProfile,
) {
  setToken('test-session-token')
  server.use(
    http.get(`${env.VITE_API_URL}/v1/auth/me`, () => HttpResponse.json(user)),
    http.get(`${env.VITE_API_URL}/v1/verification/me`, () => HttpResponse.json(verification)),
    http.get(`${env.VITE_API_URL}/v1/profile/me`, () => HttpResponse.json(profile)),
  )
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
