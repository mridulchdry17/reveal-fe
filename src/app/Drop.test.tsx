import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { signInAs } from '@/testing/auth'
import { matchId, mockThread } from '@/testing/chats'
import { dev, dropItem, kabir, mockDrop } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

type PublicProfile = components['schemas']['PublicProfile']

const api = env.VITE_API_URL

/** Answer each guess with the card's true option (Kabir: Maggi, Theatre, Earphones). */
const truth: Record<string, number> = { kg1: 1, kg2: 0, kg3: 0 }

function answerGuesses() {
  const calls: { card: string; pick: number }[] = []
  server.use(
    http.post(`${api}/v1/guesses/:card`, async ({ params, request }) => {
      const card = String(params.card)
      const { pick } = (await request.json()) as { pick: number }
      calls.push({ card, pick })
      const answer = truth[card] ?? 0
      return HttpResponse.json({ correct: pick === answer, answer, picked: pick })
    }),
  )
  return calls
}

/** Kabir with some cards already guessed: card index → my pick. */
function guessedKabir(picks: Record<number, number>): PublicProfile {
  const cards = kabir.guess_cards.map((c, i) => {
    const pick = picks[i]
    return pick === undefined ? c : { ...c, picked: pick, answer: truth[c.id] ?? 0 }
  })
  return {
    ...kabir,
    guess_cards: cards,
    right_guesses: cards.filter((c) => c.answer !== null && c.picked === c.answer).length,
  }
}

async function guess(option: string) {
  await userEvent.click(screen.getByRole('radio', { name: new RegExp(option) }))
  await userEvent.click(screen.getByRole('button', { name: 'Guess' }))
}

describe('The guess game', () => {
  it('opens from the drop and plays one card at a time to a summary', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir), dropItem('i2', dev)])
    const calls = answerGuesses()
    renderRoutes(routes, '/app/tonight')

    await userEvent.click(await screen.findByRole('link', { name: "Guess Sunset chaser's cards" }))

    expect(screen.getByRole('heading', { name: 'Sunset chaser' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '0 of 3 guessed' })).toBeInTheDocument()
    expect(screen.getByText(/01 · Everyday choice/)).toBeInTheDocument()
    expect(screen.getByText('My go-to canteen order')).toBeInTheDocument()
    // Only the current card is on screen.
    expect(screen.queryByText('Movies: theatre or laptop?')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guess' })).toBeDisabled()

    await guess('Maggi')
    expect(await screen.findByRole('status')).toHaveTextContent('Right. You read them well.')
    expect(screen.getByRole('radio', { name: /Maggi/ })).toHaveTextContent('Their answer')
    expect(screen.getByRole('img', { name: '1 of 3 guessed' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))
    expect(screen.getByText(/02 · Hot take/)).toBeInTheDocument()
    await guess('Laptop')
    expect(await screen.findByRole('status')).toHaveTextContent('Not quite.')
    expect(screen.getByRole('radio', { name: /Laptop/ })).toHaveTextContent('Your guess')
    expect(screen.getByRole('radio', { name: /Theatre/ })).toHaveTextContent('Their answer')

    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))
    await guess('Earphones')
    await userEvent.click(await screen.findByRole('button', { name: 'See how you did' }))

    expect(screen.getByText('2 of 3 right')).toBeInTheDocument()
    expect(screen.getByText('Close enough to say hi.')).toBeInTheDocument()
    expect(screen.getByText(/Like one of their answers to say hi/)).toBeInTheDocument()
    // One guess per card: there's no way to play again.
    expect(screen.queryByRole('button', { name: /Try again/ })).not.toBeInTheDocument()
    expect(calls).toEqual([
      { card: 'kg1', pick: 1 },
      { card: 'kg2', pick: 1 },
      { card: 'kg3', pick: 0 },
    ])

    // The server now has the guesses, as the next screen will see when it reloads the drop.
    mockDrop([dropItem('i1', guessedKabir({ 0: 1, 1: 1, 2: 0 })), dropItem('i2', dev)])
    await userEvent.click(screen.getByRole('button', { name: 'Like an answer' }))
    expect(await screen.findByRole('heading', { name: 'Say why you guessed it.' })).toBeInTheDocument()
    expect(screen.getByText('You got 2 of 3 right')).toBeInTheDocument()
  })

  it('says "You know them already." when every guess is right', async () => {
    signInAs()
    mockDrop([dropItem('i1', guessedKabir({ 0: 1, 1: 0, 2: 0 }))])
    renderRoutes(routes, '/app/tonight/i1')

    expect(await screen.findByText('3 of 3 right')).toBeInTheDocument()
    expect(screen.getByText('You know them already.')).toBeInTheDocument()
  })

  it('starts on the first card not yet guessed', async () => {
    signInAs()
    mockDrop([dropItem('i1', guessedKabir({ 0: 0 }))])
    renderRoutes(routes, '/app/tonight/i1')

    expect(await screen.findByText('Movies: theatre or laptop?')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '1 of 3 guessed' })).toBeInTheDocument()
  })

  it('uses the hint once: strikes the option it returns, then says it is used', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    answerGuesses()
    const hints: string[] = []
    server.use(
      http.post(`${api}/v1/guesses/:card/hint`, ({ params }) => {
        hints.push(String(params.card))
        return HttpResponse.json({ card_id: params.card, struck: 2 })
      }),
    )
    renderRoutes(routes, '/app/tonight/i1')

    await userEvent.click(await screen.findByRole('button', { name: 'Use your hint' }))

    const struck = await screen.findByRole('radio', { name: /Cold coffee.*struck off by your hint/ })
    expect(struck).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hint used tonight' })).toBeDisabled()
    expect(hints).toEqual(['kg1'])

    await guess('Maggi')
    await userEvent.click(await screen.findByRole('button', { name: 'Next card' }))
    // Still gone on the next card: one hint per night.
    expect(screen.getByRole('button', { name: 'Hint used tonight' })).toBeDisabled()
    expect(screen.queryByText(/struck off/)).not.toBeInTheDocument()
  })

  it('respects the hint already used tonight and a card it struck earlier', async () => {
    signInAs()
    mockDrop(
      [dropItem('i1', { ...kabir, guess_cards: kabir.guess_cards.map((c, i) => (i === 0 ? { ...c, struck: 0 } : c)) })],
      { hintUsed: true },
    )
    renderRoutes(routes, '/app/tonight/i1')

    expect(await screen.findByRole('radio', { name: /Rajma chawal.*struck off by your hint/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Hint used tonight' })).toBeDisabled()
  })

  it('passes from the game and goes back to the next person', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir), dropItem('i2', dev)])
    let passed = false
    server.use(
      http.post(`${api}/v1/drops/tonight/i1/pass`, () => {
        passed = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoutes(routes, '/app/tonight/i1')

    await userEvent.click(await screen.findByRole('button', { name: 'Pass on Sunset chaser' }))

    expect(await screen.findByRole('article', { name: 'Lost playlist' })).toBeInTheDocument()
    expect(passed).toBe(true)
  })
})

describe('Send like', () => {
  function captureLike(result: { matched: boolean; match_id?: string | null } = { matched: false }) {
    const bodies: unknown[] = []
    server.use(
      http.post(`${api}/v1/drops/tonight/i1/like`, async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(result)
      }),
    )
    return bodies
  }

  it('likes a guessed card with a line', async () => {
    signInAs()
    mockDrop([dropItem('i1', guessedKabir({ 0: 1, 1: 1 })), dropItem('i2', dev)])
    const bodies = captureLike()
    renderRoutes(routes, '/app/tonight/i1/like')

    expect(await screen.findByText('You got 1 of 3 right')).toBeInTheDocument()
    expect(screen.getByText("Sunset chaser's answers")).toBeInTheDocument()
    const tabs = screen.getByRole('tablist', { name: 'Pick an answer to like' })
    // Guessed cards, then prompts. The unguessed card can't be liked yet.
    expect(within(tabs).getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Everyday',
      'Hot take',
      "I'll fall for you if",
      'Unpopular opinion',
      'My ideal Sunday',
    ])
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('“Maggi”')
    expect(panel).toHaveTextContent('You guessed right')

    await userEvent.click(within(tabs).getByRole('tab', { name: 'Hot take' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('“Theatre”')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('You guessed Laptop')

    await userEvent.click(screen.getByRole('button', { name: 'Same here, honestly' }))
    await userEvent.type(screen.getByLabelText('Add a line (optional)'), ' Laptop gang though')
    expect(screen.getByText('They see the answer you liked and this line, never a clear photo. They can match you straight back.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('article', { name: 'Lost playlist' })).toBeInTheDocument()
    expect(bodies).toEqual([{ guess_card_id: 'kg2', comment: 'Same here, honestly Laptop gang though' }])
  })

  it('likes a prompt from its heart, with no line as null', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    const bodies = captureLike()
    renderRoutes(routes, '/app/tonight')

    await userEvent.click(await screen.findByRole('button', { name: 'Like "Unpopular opinion"' }))
    expect(await screen.findByRole('heading', { name: 'Say why you liked it.' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Unpopular opinion' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('heading', { name: "That's everyone for tonight" })).toBeInTheDocument()
    expect(bodies).toEqual([{ prompt_id: 'k2', comment: null }])
  })

  it('goes straight to the new chat on a match', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    mockThread([])
    server.use(http.post(`${api}/v1/chats/${matchId}/read`, () => new HttpResponse(null, { status: 204 })))
    captureLike({ matched: true, match_id: matchId })
    renderRoutes(routes, '/app/tonight/i1/like')

    await userEvent.click(await screen.findByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('heading', { name: 'Sunset chaser' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
  })

  it('explains a line the server refuses and stays open', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    server.use(
      http.post(`${api}/v1/drops/tonight/i1/like`, () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'comment'], msg: 'Value error, x', type: 'value_error' }] },
          { status: 422 },
        ),
      ),
    )
    renderRoutes(routes, '/app/tonight/i1/like')

    await userEvent.type(await screen.findByLabelText('Add a line (optional)'), 'insta me')
    await userEvent.click(screen.getByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No numbers, handles or links')
    expect(screen.getByRole('button', { name: 'Send like' })).toBeInTheDocument()
  })

  it('cancels back to the drop', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    renderRoutes(routes, '/app/tonight')

    await userEvent.click(await screen.findByRole('button', { name: 'Like Sunset chaser' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('article', { name: 'Sunset chaser' })).toBeInTheDocument()
  })
})
