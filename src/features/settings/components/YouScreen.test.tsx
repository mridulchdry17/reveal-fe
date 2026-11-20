import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { renderWithQuery } from '@/testing/render'
import { server } from '@/testing/server'

import { YouScreen } from './YouScreen'

const healthUrl = `${env.VITE_API_URL}/health`

describe('YouScreen server status', () => {
  it('shows Connected when the API is healthy', async () => {
    server.use(http.get(healthUrl, () => HttpResponse.json({ status: 'ok', database: 'ok' })))
    renderWithQuery(<YouScreen />)

    expect(await screen.findByText('Connected')).toBeInTheDocument()
  })

  it('shows Having trouble when the API reports a degraded database', async () => {
    server.use(
      http.get(healthUrl, () =>
        HttpResponse.json({ status: 'degraded', database: 'down' }, { status: 503 }),
      ),
    )
    renderWithQuery(<YouScreen />)

    expect(await screen.findByText('Having trouble')).toBeInTheDocument()
  })

  it('shows Offline when the API is unreachable', async () => {
    server.use(http.get(healthUrl, () => HttpResponse.error()))
    renderWithQuery(<YouScreen />)

    expect(await screen.findByText('Offline')).toBeInTheDocument()
  })
})
