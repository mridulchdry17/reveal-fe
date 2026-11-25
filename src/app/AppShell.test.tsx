import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { mockDrop, mockLikes, sampleLike } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

describe('AppShell', () => {
  it('opens /app on the Drop and shows the four tabs', async () => {
    signInAs()
    mockDrop([])
    renderRoutes(routes, '/app')

    expect(await screen.findByText('Your next drop')).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Drop', 'Likes', 'Chats', 'You'])
    expect(within(nav).getByRole('link', { name: 'Drop' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Likes' })).toHaveAttribute('href', '/app/likes')
  })

  it('counts likes waiting on the Likes tab', async () => {
    signInAs()
    mockDrop([])
    mockLikes([sampleLike('l1'), sampleLike('l2')])
    renderRoutes(routes, '/app/tonight')

    const likes = await screen.findByRole('link', { name: 'Likes, 2 waiting' })
    await userEvent.click(likes)
    expect(await screen.findByRole('heading', { name: 'Likes' })).toBeInTheDocument()
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
