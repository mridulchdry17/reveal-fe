import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { matchId, mockThread } from '@/testing/chats'
import { kabir, mockDrop, mockLikes, mockSentLikes, sampleLike, sampleSent } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

const api = env.VITE_API_URL
const jpeg = () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })

describe('Likes', () => {
  it('shows received and sent likes in two tabs', async () => {
    signInAs()
    mockLikes([sampleLike('l1'), sampleLike('l2', { profile: { ...kabir, nickname: 'Lost playlist' } })])
    mockSentLikes([sampleSent('s1')])
    renderRoutes(routes, '/app/likes')

    expect(await screen.findByRole('heading', { name: 'Likes' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: 'Received · 2' })).toHaveAttribute('aria-selected', 'true')
    expect(await screen.findByRole('tab', { name: 'Sent · 1' })).toBeInTheDocument()
    // Likes is a tab now: no way "back" to Chats.
    expect(screen.queryByRole('link', { name: /← Chats/ })).not.toBeInTheDocument()

    const card = screen.getByRole('article', { name: 'Sunset chaser' })
    expect(card).toHaveTextContent('Got 2 of 3 of yours right')
    expect(card).toHaveTextContent('Your hot take')
    expect(card).toHaveTextContent('“Only at 2am”')
    expect(card).toHaveTextContent('Finally someone said it')
    expect(within(card).getByRole('button', { name: 'Not for me' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Sent · 1' }))
    const sent = screen.getByRole('article', { name: 'Lost playlist' })
    expect(sent).toHaveTextContent('Their prompt')
    expect(sent).toHaveTextContent('“Rain ruins plans, never moods”')
    expect(sent).toHaveTextContent('Monsoon walks though?')
    expect(sent).toHaveTextContent('Waiting for them')
  })

  it('matches straight into the new chat', async () => {
    signInAs()
    mockLikes([sampleLike('l1')])
    mockSentLikes()
    mockThread([])
    server.use(
      http.post(`${api}/v1/chats/${matchId}/read`, () => new HttpResponse(null, { status: 204 })),
      http.post(`${api}/v1/likes/l1/match`, () => {
        mockLikes([])
        return HttpResponse.json({ match_id: matchId })
      }),
    )
    renderRoutes(routes, '/app/likes')

    await userEvent.click(await screen.findByRole('button', { name: 'Match' }))

    expect(await screen.findByRole('heading', { name: 'Sunset chaser' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
  })

  it('passes without telling them', async () => {
    signInAs()
    mockLikes([sampleLike('l1')])
    mockSentLikes()
    let passed = false
    server.use(
      http.post(`${api}/v1/likes/l1/pass`, () => {
        passed = true
        mockLikes([])
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/likes')

    await userEvent.click(await screen.findByRole('button', { name: 'Not for me' }))

    expect(await screen.findByRole('heading', { name: 'No likes waiting' })).toBeInTheDocument()
    expect(passed).toBe(true)
  })

  it('opens the guess game for someone who liked me, with their sharpening photo', async () => {
    signInAs()
    mockDrop([])
    mockLikes([sampleLike('l1', { profile: { ...kabir, has_blurred_photo: true } })])
    mockSentLikes()
    let photoFetches = 0
    server.use(
      http.get(`${api}/v1/likes/l1/photo`, () => {
        photoFetches += 1
        return jpeg()
      }),
      http.post(`${api}/v1/guesses/kg1`, () => HttpResponse.json({ correct: true, answer: 0, picked: 0 })),
    )
    renderRoutes(routes, '/app/likes')

    await userEvent.click(await screen.findByRole('button', { name: 'Guess first' }))

    expect(await screen.findByText('Sharpens the photo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Match with Sunset chaser' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /Rajma chawal/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Guess' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Right. Their photo got a little sharper.')
    // A right guess asks for the sharper photo.
    await expect.poll(() => photoFetches).toBe(2)
  })

  it('takes back a sent like after confirming', async () => {
    signInAs()
    mockLikes()
    mockSentLikes([sampleSent('s1')])
    let deleted = false
    server.use(
      http.delete(`${api}/v1/likes/sent/s1`, () => {
        deleted = true
        mockSentLikes([])
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/likes?tab=sent')

    await userEvent.click(await screen.findByRole('button', { name: 'Take back' }))
    const confirm = screen.getByRole('group', { name: 'Take back this like?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Keep it' }))
    expect(deleted).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: 'Take back' }))
    await userEvent.click(within(screen.getByRole('group', { name: 'Take back this like?' })).getByRole('button', { name: 'Take back' }))

    expect(await screen.findByRole('heading', { name: 'Nothing sent yet' })).toBeInTheDocument()
    expect(deleted).toBe(true)
    expect(screen.getByRole('tab', { name: 'Sent · 0' })).toBeInTheDocument()
  })

  it('says when nothing is waiting either way', async () => {
    signInAs()
    mockLikes()
    mockSentLikes()
    renderRoutes(routes, '/app/likes')

    expect(await screen.findByRole('heading', { name: 'No likes waiting' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Sent · 0' }))
    expect(screen.getByRole('heading', { name: 'Nothing sent yet' })).toBeInTheDocument()
  })

  it('shows an error with a retry when likes fail to load', async () => {
    signInAs()
    mockSentLikes()
    server.use(http.get(`${api}/v1/likes`, () => HttpResponse.json({ code: 'boom', detail: 'x' }, { status: 500 })))
    renderRoutes(routes, '/app/likes')

    expect(await screen.findByRole('alert')).toHaveTextContent("That one's on us")
    mockLikes([sampleLike('l1')])
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('article', { name: 'Sunset chaser' })).toBeInTheDocument()
  })
})
