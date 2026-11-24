import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { pushBrowser } from '@/testing/push'
import { renderWithQuery } from '@/testing/render'
import { server } from '@/testing/server'

import { DropReminder } from './DropReminder'

const configUrl = `${env.VITE_API_URL}/v1/notifications/config`

describe('DropReminder', () => {
  it('turns pings on from Tonight', async () => {
    pushBrowser({ permission: 'default', answer: 'granted', subscribed: false })
    server.use(
      http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })),
      http.put(`${env.VITE_API_URL}/v1/notifications/subscription`, () => new HttpResponse(null, { status: 204 })),
    )
    renderWithQuery(<DropReminder />)

    await userEvent.click(await screen.findByRole('button', { name: 'Ping me' }))
    await waitFor(() => expect(screen.queryByText(/Want a ping/)).not.toBeInTheDocument())
  })

  it('remembers "not now"', async () => {
    pushBrowser({ permission: 'default', answer: 'granted', subscribed: false })
    server.use(http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })))
    const first = renderWithQuery(<DropReminder />)

    await userEvent.click(await screen.findByRole('button', { name: 'Not now' }))
    expect(screen.queryByText(/Want a ping/)).not.toBeInTheDocument()
    first.unmount()

    renderWithQuery(<DropReminder />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByText(/Want a ping/)).not.toBeInTheDocument()
  })

  it('says nothing to someone already getting pings', async () => {
    pushBrowser({ permission: 'granted', answer: 'granted', subscribed: true })
    server.use(
      http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })),
      http.put(`${env.VITE_API_URL}/v1/notifications/subscription`, () => new HttpResponse(null, { status: 204 })),
    )
    const { container } = renderWithQuery(<DropReminder />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })
})
