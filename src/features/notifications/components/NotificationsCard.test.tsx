import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { env } from '@/config/env'
import { renderWithQuery } from '@/testing/render'
import { pushBrowser } from '@/testing/push'
import { server } from '@/testing/server'

import { NotificationsCard } from './NotificationsCard'

const configUrl = `${env.VITE_API_URL}/v1/notifications/config`
const subscriptionUrl = `${env.VITE_API_URL}/v1/notifications/subscription`

describe('NotificationsCard', () => {
  it('asks from a tap, subscribes and tells the server', async () => {
    const { pushManager } = pushBrowser({ permission: 'default', answer: 'granted', subscribed: false })
    server.use(http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })))
    let saved: unknown
    server.use(
      http.put(subscriptionUrl, async ({ request }) => {
        saved = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWithQuery(<NotificationsCard />)

    await userEvent.click(await screen.findByRole('button', { name: 'Turn on notifications' }))

    expect(await screen.findByRole('heading', { name: 'Pings are on' })).toBeInTheDocument()
    expect(pushManager.subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }))
    expect(saved).toEqual({ endpoint: 'https://push.example.com/abc', keys: { p256dh: 'p', auth: 'a' } })
  })

  it('explains how to unblock when they said no', async () => {
    pushBrowser({ permission: 'denied', answer: 'denied', subscribed: false })
    server.use(http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })))
    renderWithQuery(<NotificationsCard />)

    expect(await screen.findByText(/blocked for Reveal/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Turn on notifications' })).not.toBeInTheDocument()
  })

  it('turns off on this phone', async () => {
    const { subscription } = pushBrowser({ permission: 'granted', answer: 'granted', subscribed: true })
    server.use(
      http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })),
      http.put(subscriptionUrl, () => new HttpResponse(null, { status: 204 })),
      http.post(`${subscriptionUrl}/remove`, () => new HttpResponse(null, { status: 204 })),
    )
    renderWithQuery(<NotificationsCard />)

    await userEvent.click(await screen.findByRole('button', { name: 'Turn off on this phone' }))

    expect(await screen.findByRole('button', { name: 'Turn on notifications' })).toBeInTheDocument()
    expect(subscription.unsubscribe).toHaveBeenCalled()
  })

  it('walks an iPhone in Safari through Add to Home Screen first', async () => {
    vi.stubGlobal(
      'navigator',
      Object.create(navigator, {
        userAgent: { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1' },
      }),
    )
    server.use(http.get(configUrl, () => HttpResponse.json({ public_key: 'AQID' })))
    renderWithQuery(<NotificationsCard />)

    expect(await screen.findByText(/add Reveal to your Home Screen first/)).toBeInTheDocument()
    expect(screen.getByText('Add to Home Screen')).toBeInTheDocument()
  })

  it('stays out of the way when the server has push off', async () => {
    pushBrowser({ permission: 'default', answer: 'granted', subscribed: false })
    server.use(http.get(configUrl, () => HttpResponse.json({ public_key: null })))
    const { container } = renderWithQuery(<NotificationsCard />)

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })
})
