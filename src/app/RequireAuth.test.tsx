import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { getToken, setToken } from '@/lib/auth/token'
import { signInAs, stubGoogleButton, unverifiedUser } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

const api = env.VITE_API_URL

describe('signed-in app', () => {
  it('sends signed-out visitors to sign in', async () => {
    stubGoogleButton()
    renderRoutes(routes, '/app/chats')

    expect(await screen.findByRole('heading', { level: 1, name: 'Reveal' })).toBeInTheDocument()
  })

  it('treats an expired session as signed out', async () => {
    stubGoogleButton()
    setToken('expired-token')
    server.use(
      http.get(`${api}/v1/auth/me`, () =>
        HttpResponse.json({ code: 'unauthenticated', detail: 'expired' }, { status: 401 }),
      ),
    )
    renderRoutes(routes, '/app')

    expect(await screen.findByRole('heading', { level: 1, name: 'Reveal' })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('sends signed-in but unverified students to verify first', async () => {
    stubGoogleButton()
    signInAs(unverifiedUser)
    renderRoutes(routes, '/app/chats')

    expect(
      await screen.findByRole('heading', { name: "Only students. That's the point." }),
    ).toBeInTheDocument()
  })

  it('shows the account on the You tab and signs out', async () => {
    stubGoogleButton()
    signInAs()
    let signedOutWith = ''
    server.use(
      http.post(`${api}/v1/auth/sign-out`, ({ request }) => {
        signedOutWith = request.headers.get('Authorization') ?? ''
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/you')

    expect(await screen.findByText('aanya@gmail.com')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Reveal' })).toBeInTheDocument()
    expect(signedOutWith).toBe('Bearer test-session-token')
    expect(getToken()).toBeNull()
  })

  it('marks admins on the You tab', async () => {
    signInAs({
      id: '00000000-0000-4000-8000-000000000002',
      email: 'mridul@gmail.com',
      name: 'Mridul',
      is_admin: true,
      verified: true,
      verified_via: 'college_email',
    })
    renderRoutes(routes, '/app/you')

    expect(await screen.findByText('Admin')).toBeInTheDocument()
  })
})
