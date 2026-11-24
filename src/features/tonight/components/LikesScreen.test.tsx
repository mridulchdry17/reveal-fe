import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { kabir, mockLikes } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { LikesScreen } from './LikesScreen'
import { LikesBanner } from './LikesBanner'

const like = {
  id: 'l1',
  prompt_question: 'Hot take',
  prompt_answer: 'Maggi is a full meal',
  comment: 'Only with extra masala',
  created_at: '2026-11-22T16:40:00Z',
  profile: kabir,
}

const routes = [
  { path: '/app/likes', element: <LikesScreen /> },
  { path: '/app/chats', element: <LikesBanner /> },
]

describe('Likes', () => {
  it('shows who liked which prompt and what they said', async () => {
    signInAs()
    mockLikes([like])
    renderRoutes(routes, '/app/likes')

    expect(await screen.findByText(/liked "Hot take"/)).toBeInTheDocument()
    expect(screen.getByText('“Only with extra masala”')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Sunset chaser' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Like "/ })).not.toBeInTheDocument()
  })

  it('likes back to match', async () => {
    signInAs()
    mockLikes([like])
    server.use(
      http.post(`${env.VITE_API_URL}/v1/likes/l1/match`, () => {
        mockLikes([])
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/likes')

    await userEvent.click(await screen.findByRole('button', { name: 'Like back' }))

    expect(await screen.findByRole('status')).toHaveTextContent("It's a match with Sunset chaser")
    expect(await screen.findByRole('heading', { name: 'No likes waiting' })).toBeInTheDocument()
  })

  it('passes without telling them', async () => {
    signInAs()
    mockLikes([like])
    let passed = false
    server.use(
      http.post(`${env.VITE_API_URL}/v1/likes/l1/pass`, () => {
        passed = true
        mockLikes([])
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/likes')

    await userEvent.click(await screen.findByRole('button', { name: 'Pass' }))

    expect(await screen.findByRole('heading', { name: 'No likes waiting' })).toBeInTheDocument()
    expect(passed).toBe(true)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('counts waiting likes on the Chats tab and opens them', async () => {
    signInAs()
    mockLikes([like, { ...like, id: 'l2' }])
    renderRoutes(routes, '/app/chats')

    await userEvent.click(await screen.findByRole('link', { name: /2 people liked you/ }))

    expect(await screen.findByRole('heading', { name: 'Liked you' })).toBeInTheDocument()
  })

  it('shows nothing on the Chats tab when no one is waiting', async () => {
    signInAs()
    mockLikes([])
    const { container } = renderRoutes(routes, '/app/chats')

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })
})
