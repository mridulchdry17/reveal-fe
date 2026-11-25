import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { freshBoard, matchId, mockThread } from '@/testing/chats'
import { kabir } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { ChatScreen } from './ChatScreen'

const api = env.VITE_API_URL
const routes = [{ path: '/app/chats/:matchId', element: <ChatScreen /> }]
const withPhoto = { ...kabir, has_blurred_photo: true }
const hometownAsked = {
  ...freshBoard,
  cards: freshBoard.cards.map((c) => (c.card === 'hometown' ? { ...c, state: 'they_asked' as const } : c)),
}

describe('Guess tiles in a chat', () => {
  it('opens an inline guess over the message box, hiding their swap request while open', async () => {
    signInAs()
    mockThread([], { profile: withPhoto, swaps: hometownAsked })
    const calls: unknown[] = []
    server.use(
      http.post(`${api}/v1/guesses/kg3`, async ({ request }) => {
        calls.push(await request.json())
        mockThread([], {
          profile: {
            ...withPhoto,
            right_guesses: 1,
            guess_cards: withPhoto.guess_cards.map((c) => (c.id === 'kg3' ? { ...c, picked: 1, answer: 1 } : c)),
          },
          swaps: { ...hometownAsked, photo_pieces: [4] },
        })
        return HttpResponse.json({ correct: true, answer: 1, picked: 1 })
      }),
      http.get(`${api}/v1/chats/${matchId}/photo`, () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await screen.findByRole('region', { name: 'Swap request' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Guess: What I always carry in my bag' }))

    const panel = screen.getByRole('region', { name: 'Guess' })
    expect(screen.queryByRole('region', { name: 'Swap request' })).not.toBeInTheDocument()
    await userEvent.click(within(panel).getByRole('radio', { name: 'A book' }))

    expect(await within(panel).findByText('Right. One more piece of their photo (up to 6).')).toBeInTheDocument()
    expect(within(panel).getByRole('radio', { name: /A book/ })).toHaveTextContent('Your guess · their answer')
    expect(calls).toEqual([{ pick: 1 }])
    // The reloaded thread marks the tile as guessed right, with the answer.
    const cards = screen.getByRole('list', { name: 'Their cards' })
    expect(await within(cards).findByText('A book')).toBeInTheDocument()
    expect(within(cards).getByText('(you guessed right)')).toBeInTheDocument()

    await userEvent.click(within(panel).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('region', { name: 'Guess' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Swap request' })).toBeInTheDocument()
  })

  it('tags their answer and my wrong guess', async () => {
    signInAs()
    mockThread()
    server.use(
      http.post(`${api}/v1/guesses/kg1`, () => {
        mockThread([], {
          profile: { ...kabir, guess_cards: kabir.guess_cards.map((c) => (c.id === 'kg1' ? { ...c, picked: 2, answer: 0 } : c)) },
        })
        return HttpResponse.json({ correct: false, answer: 0, picked: 2 })
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    await userEvent.click(await screen.findByRole('button', { name: 'Guess: My go-to canteen order' }))
    const panel = screen.getByRole('region', { name: 'Guess' })
    await userEvent.click(within(panel).getByRole('radio', { name: 'Cold coffee' }))

    expect(await within(panel).findByText("Not quite. Now you've got something to ask about.")).toBeInTheDocument()
    expect(within(panel).getByRole('radio', { name: /Rajma chawal/ })).toHaveTextContent('Their answer')
    expect(within(panel).getByRole('radio', { name: /Cold coffee/ })).toHaveTextContent('Your guess')
    const cards = screen.getByRole('list', { name: 'Their cards' })
    expect(await within(cards).findByText('Rajma chawal')).toBeInTheDocument()
    expect(within(cards).queryByText('(you guessed right)')).not.toBeInTheDocument()
  })
})
