import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

describe('AppShell', () => {
  it('opens /app on Tonight and shows the three tabs', async () => {
    renderRoutes(routes, '/app')

    expect(await screen.findByRole('heading', { name: 'Tonight' })).toBeInTheDocument()
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
    renderRoutes(routes, '/app/tonight')

    await userEvent.click(screen.getByRole('link', { name: 'Chats' }))
    expect(await screen.findByRole('heading', { name: 'Chats' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'You' }))
    expect(await screen.findByRole('heading', { name: 'You' })).toBeInTheDocument()
  })
})
