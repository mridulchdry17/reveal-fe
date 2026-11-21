import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { signInAs, unverifiedUser } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'

import { PendingScreen } from './PendingScreen'

const routes = [
  { path: '/verify/pending', element: <PendingScreen /> },
  { path: '/verify', element: <h1>Verify</h1> },
  { path: '/app/*', element: <h1>App home</h1> },
]

const pending = { status: 'pending' as const, submitted_at: null, reject_reason: null }

describe('PendingScreen', () => {
  it('says the ID is being checked', async () => {
    signInAs(unverifiedUser, pending)
    renderRoutes(routes, '/verify/pending')

    expect(
      await screen.findByRole('heading', { name: "We're checking your ID" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Use college email' })).toBeInTheDocument()
  })

  it('lets approved students into the app', async () => {
    signInAs(undefined, { ...pending, status: 'approved' })
    renderRoutes(routes, '/verify/pending')

    expect(await screen.findByRole('heading', { name: 'App home' })).toBeInTheDocument()
  })

  it('sends rejected students back to verify', async () => {
    signInAs(unverifiedUser, { ...pending, status: 'rejected' })
    renderRoutes(routes, '/verify/pending')

    expect(await screen.findByRole('heading', { name: 'Verify' })).toBeInTheDocument()
  })
})
