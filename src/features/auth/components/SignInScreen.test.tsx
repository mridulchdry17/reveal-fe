import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { getToken } from '@/lib/auth/token'
import { signInAs, stubGoogleButton, testUser } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { SignInScreen } from './SignInScreen'

const signInUrl = `${env.VITE_API_URL}/v1/auth/google`

const routes = [
  { path: '/sign-in', element: <SignInScreen /> },
  { path: '/app/*', element: <h1>App home</h1> },
]

describe('SignInScreen', () => {
  it('signs in with Google and goes to the app', async () => {
    stubGoogleButton('google-id-token')
    let sentCredential = ''
    server.use(
      http.post(signInUrl, async ({ request }) => {
        sentCredential = ((await request.json()) as { credential: string }).credential
        return HttpResponse.json({ token: 'new-session', user: testUser })
      }),
    )
    renderRoutes(routes, '/sign-in')

    await userEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }))

    expect(await screen.findByRole('heading', { name: 'App home' })).toBeInTheDocument()
    expect(sentCredential).toBe('google-id-token')
    expect(getToken()).toBe('new-session')
  })

  it('explains when Google does not confirm the account', async () => {
    stubGoogleButton()
    server.use(
      http.post(signInUrl, () =>
        HttpResponse.json({ code: 'unauthenticated', detail: 'Invalid' }, { status: 401 }),
      ),
    )
    renderRoutes(routes, '/sign-in')

    await userEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("Google didn't confirm that account")
    expect(getToken()).toBeNull()
  })

  it('sends someone already signed in straight to the app', async () => {
    signInAs()
    renderRoutes(routes, '/sign-in')

    expect(await screen.findByRole('heading', { name: 'App home' })).toBeInTheDocument()
  })

  it('warns inside Instagram, where Google sign-in fails', async () => {
    stubGoogleButton()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone) Instagram 312.0')
    renderRoutes(routes, '/sign-in')

    expect(await screen.findByRole('alert')).toHaveTextContent('open Reveal in Chrome or Safari')
    vi.restoreAllMocks()
  })
})
