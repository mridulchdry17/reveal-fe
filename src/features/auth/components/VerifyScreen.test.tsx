import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs, stubGoogleButton, testUser, unverifiedUser } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { VerifyScreen } from './VerifyScreen'

const verifyUrl = `${env.VITE_API_URL}/v1/auth/college-email`

const routes = [
  { path: '/verify', element: <VerifyScreen /> },
  { path: '/verify/id-card', element: <h1>ID card photo</h1> },
  { path: '/verify/pending', element: <h1>Waiting for review</h1> },
  { path: '/app/*', element: <h1>App home</h1> },
  { path: '/sign-in', element: <h1>Sign in</h1> },
]

describe('VerifyScreen', () => {
  it('verifies with the college Google account and goes to the app', async () => {
    stubGoogleButton('college-id-token')
    signInAs(unverifiedUser)
    let sentCredential = ''
    server.use(
      http.post(verifyUrl, async ({ request }) => {
        sentCredential = ((await request.json()) as { credential: string }).credential
        return HttpResponse.json(testUser)
      }),
    )
    renderRoutes(routes, '/verify')

    expect(
      await screen.findByRole('heading', { name: "Prove you're from campus" }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(await screen.findByRole('heading', { name: 'App home' })).toBeInTheDocument()
    expect(sentCredential).toBe('college-id-token')
  })

  it('explains when the account is not a college one', async () => {
    stubGoogleButton()
    signInAs(unverifiedUser)
    server.use(
      http.post(verifyUrl, () =>
        HttpResponse.json({ code: 'not_college_account', detail: 'x' }, { status: 403 }),
      ),
    )
    renderRoutes(routes, '/verify')

    await userEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      `Pick the one ending in @${env.VITE_COLLEGE_DOMAIN}`,
    )
  })

  it('explains when the college email is already used', async () => {
    stubGoogleButton()
    signInAs(unverifiedUser)
    server.use(
      http.post(verifyUrl, () =>
        HttpResponse.json({ code: 'college_email_taken', detail: 'x' }, { status: 409 }),
      ),
    )
    renderRoutes(routes, '/verify')

    await userEvent.click(await screen.findByRole('button', { name: 'Continue with Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('already linked')
  })

  it('starts the ID card flow from the ID card option', async () => {
    stubGoogleButton()
    signInAs(unverifiedUser)
    renderRoutes(routes, '/verify')

    await userEvent.click(await screen.findByRole('radio', { name: /College ID card/ }))
    expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Continue with ID card' }))

    expect(await screen.findByRole('heading', { name: 'ID card photo' })).toBeInTheDocument()
  })

  it('says letting people in by hand is coming soon', async () => {
    stubGoogleButton()
    signInAs(unverifiedUser)
    renderRoutes(routes, '/verify')

    await userEvent.click(await screen.findByRole('radio', { name: /No email or ID yet/ }))
    expect(screen.getByText(/let in by an admin is coming soon/)).toBeInTheDocument()
  })

  it('sends someone whose ID is being checked to the waiting screen', async () => {
    signInAs(unverifiedUser, { status: 'pending', submitted_at: null, reject_reason: null })
    renderRoutes(routes, '/verify')

    expect(await screen.findByRole('heading', { name: 'Waiting for review' })).toBeInTheDocument()
  })

  it('says why an ID check was rejected', async () => {
    stubGoogleButton()
    signInAs(unverifiedUser, {
      status: 'rejected',
      submitted_at: null,
      reject_reason: 'ID photo is blurry',
    })
    renderRoutes(routes, '/verify')

    expect(await screen.findByRole('alert')).toHaveTextContent('ID photo is blurry')
  })

  it('sends someone already verified to the app', async () => {
    signInAs()
    renderRoutes(routes, '/verify')

    expect(await screen.findByRole('heading', { name: 'App home' })).toBeInTheDocument()
  })
})
