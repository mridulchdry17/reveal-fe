import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { mockDrop, mockLikes } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

describe('AppShell', () => {
  it('opens /app on Tonight and shows the three tabs', async () => {
    signInAs()
    mockDrop([])
    renderRoutes(routes, '/app')

    expect(await screen.findByRole('heading', { name: "Tonight's drop" })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toHaveTextContent('Tonight')
    expect(nav).toHaveTextContent('Chats')
    expect(nav).toHaveTextContent('You')
  })

  it('moves between tabs', async () => {
    server.use(
      http.get(`${env.VITE_API_URL}/health`, () =>
        HttpResponse.json({ status: 'ok', database: 'ok' }),
      ),
    )
    signInAs()
    mockDrop([])
    mockLikes()
    renderRoutes(routes, '/app/tonight')

    await userEvent.click(await screen.findByRole('link', { name: 'Chats' }))
    expect(await screen.findByRole('heading', { name: 'Chats' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'You' }))
    expect(await screen.findByRole('heading', { name: 'You' })).toBeInTheDocument()
  })
})
