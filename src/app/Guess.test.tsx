import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { signInAs } from '@/testing/auth'
import { freshBoard, matchId, mockThread } from '@/testing/chats'
import { dropItem, kabir, mockDrop, mockLikes } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

type PublicProfile = components['schemas']['PublicProfile']

const api = env.VITE_API_URL
const jpeg = () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })

/** Kabir when we both have a photo, so his blurred one is available. */
const withPhoto: PublicProfile = { ...kabir, has_blurred_photo: true }

function guessReturns(cardId: string, result: { correct: boolean; answer: number; picked: number }) {
  const calls: unknown[] = []
  server.use(
    http.post(`${api}/v1/guesses/${cardId}`, async ({ request }) => {
      calls.push(await request.json())
      return HttpResponse.json(result)
    }),
  )
  return calls
}

describe('Guessing on the drop', () => {
  it('guesses once, shows the true answer and says the photo got sharper', async () => {
    signInAs()
    mockDrop([dropItem('i1', withPhoto)])
    const photoFetches: number[] = []
    server.use(
      http.get(`${api}/v1/drops/tonight/i1/photo`, () => {
        photoFetches.push(Date.now())
        return jpeg()
      }),
    )
    const calls = guessReturns('kg1', { correct: true, answer: 1, picked: 1 })
    renderRoutes(routes, '/app/tonight')

    const card = await screen.findByRole('article', { name: 'Sunset chaser' })
    expect(await within(card).findByRole('img', { name: "Sunset chaser's photo, blurred" })).toBeInTheDocument()
    expect(within(card).getByText('Photo opens through swaps')).toBeInTheDocument()
    const guess = within(card).getByRole('region', { name: 'Guess them' })
    expect(guess).toHaveTextContent('0 of 3 right')

    await userEvent.click(within(guess).getByRole('button', { name: 'Maggi' }))

    expect(await within(guess).findByText('Right. Their photo got a little sharper.')).toBeInTheDocument()
    const answers = within(guess).getByRole('list', { name: 'Answers to "My go-to canteen order"' })
    expect(within(answers).getByText('Maggi').closest('li')).toHaveTextContent('True · your pick')
    expect(within(answers).queryByRole('button')).not.toBeInTheDocument()
    expect(guess).toHaveTextContent('1 of 3 right')
    expect(within(guess).getByRole('img', { name: '1 of 3 guessed' })).toBeInTheDocument()
    expect(calls).toEqual([{ pick: 1 }])
    // A right guess asks for the sharper photo.
    await expect.poll(() => photoFetches.length).toBe(2)
  })

  it('marks their true answer and my wrong pick, without mentioning a photo when there is none', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    guessReturns('kg2', { correct: false, answer: 1, picked: 0 })
    renderRoutes(routes, '/app/tonight')

    const guess = await screen.findByRole('region', { name: 'Guess them' })
    await userEvent.click(within(guess).getByRole('button', { name: 'Theatre' }))

    expect(await within(guess).findByText("Not quite. Now you've got something to ask about.")).toBeInTheDocument()
    const answers = within(guess).getByRole('list', { name: 'Answers to "Movies: theatre or laptop?"' })
    expect(within(answers).getByText('Theatre').closest('li')).toHaveTextContent('Your pick · Nope')
    expect(within(answers).getByText('Laptop').closest('li')).toHaveTextContent('True')
    expect(screen.queryByText(/photo got/)).not.toBeInTheDocument()
  })

  it('shows cards already guessed as answered', async () => {
    signInAs()
    mockDrop([
      dropItem('i1', {
        ...kabir,
        right_guesses: 1,
        guess_cards: kabir.guess_cards.map((c, i) => (i === 0 ? { ...c, picked: 2, answer: 2 } : c)),
      }),
    ])
    renderRoutes(routes, '/app/tonight')

    const guess = await screen.findByRole('region', { name: 'Guess them' })
    const answers = within(guess).getByRole('list', { name: 'Answers to "My go-to canteen order"' })
    expect(within(answers).getByText('Cold coffee').closest('li')).toHaveTextContent('True · your pick')
    expect(guess).toHaveTextContent('1 of 3 right')
    expect(within(guess).getAllByRole('button')).toHaveLength(6)
  })

  it('still passes without guessing', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    let passed = false
    server.use(
      http.post(`${api}/v1/drops/tonight/i1/pass`, () => {
        passed = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/tonight')

    await userEvent.click(await screen.findByRole('button', { name: 'Pass on Sunset chaser' }))

    expect(await screen.findByRole('heading', { name: "That's everyone for tonight" })).toBeInTheDocument()
    expect(passed).toBe(true)
  })
})

describe('Guessing on likes', () => {
  const like = {
    id: 'l1',
    liked: { kind: 'prompt' as const, question: 'Hot take', answer: 'Maggi is a full meal', guess_kind: null },
    prompt_question: 'Hot take',
    prompt_answer: 'Maggi is a full meal',
    their_right_guesses: 0,
    my_cards_total: 3,
    comment: null,
    created_at: '2026-11-22T16:40:00Z',
    profile: withPhoto,
  }

  it('likes back without guessing first', async () => {
    signInAs()
    mockLikes([like])
    server.use(
      http.get(`${api}/v1/likes/l1/photo`, jpeg),
      http.post(`${api}/v1/likes/l1/match`, () => {
        mockLikes([])
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/likes')

    expect(await screen.findByRole('region', { name: 'Guess first' })).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: "Sunset chaser's photo, blurred" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Like back' }))

    expect(await screen.findByRole('status')).toHaveTextContent("It's a match with Sunset chaser")
  })

  it('guesses one of their cards', async () => {
    signInAs()
    mockLikes([like])
    server.use(http.get(`${api}/v1/likes/l1/photo`, jpeg))
    const calls = guessReturns('kg3', { correct: false, answer: 0, picked: 2 })
    renderRoutes(routes, '/app/likes')

    const guess = await screen.findByRole('region', { name: 'Guess first' })
    await userEvent.click(within(guess).getByRole('button', { name: 'Snacks' }))

    expect(await within(guess).findByText('Not quite. It stays as it is.')).toBeInTheDocument()
    expect(calls).toEqual([{ pick: 2 }])
  })
})

describe('Guessing in a chat', () => {
  function allowRead() {
    server.use(http.post(`${api}/v1/chats/${matchId}/read`, () => new HttpResponse(null, { status: 204 })))
  }

  it('opens their cards from the chat and reloads the thread after a right guess', async () => {
    signInAs()
    allowRead()
    mockThread([], { profile: withPhoto })
    server.use(http.get(`${api}/v1/chats/${matchId}/photo`, jpeg))
    server.use(
      http.post(`${api}/v1/guesses/kg1`, () => {
        mockThread([], {
          profile: {
            ...withPhoto,
            right_guesses: 1,
            guess_cards: withPhoto.guess_cards.map((c, i) => (i === 0 ? { ...c, picked: 0, answer: 0 } : c)),
          },
          swaps: { ...freshBoard, photo_pieces: [6] },
        })
        return HttpResponse.json({ correct: true, answer: 0, picked: 0 })
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    await userEvent.click(await screen.findByRole('button', { name: "Guess Sunset chaser's cards · 3 left" }))
    const sheet = screen.getByRole('dialog', { name: 'Guess Sunset chaser' })
    await userEvent.click(within(sheet).getByRole('button', { name: 'Rajma chawal' }))

    expect(await within(sheet).findByText('Right. One more piece of their photo (up to 6).')).toBeInTheDocument()
    // The reloaded thread brings the new piece, so their photo appears in the header.
    expect(await screen.findByRole('button', { name: "See Sunset chaser's photo" })).toBeInTheDocument()
    await userEvent.click(within(sheet).getByRole('button', { name: 'Back to the chat' }))
    expect(screen.getByRole('button', { name: "Guess Sunset chaser's cards · 2 left" })).toBeInTheDocument()
  })

  it('hides the guess row once every card is guessed', async () => {
    signInAs()
    allowRead()
    mockThread([], {
      profile: { ...kabir, guess_cards: kabir.guess_cards.map((c) => ({ ...c, picked: 0, answer: 1 })) },
    })
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await screen.findByRole('heading', { name: 'Sunset chaser' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Guess Sunset chaser's cards/ })).not.toBeInTheDocument()
  })
})
