import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { signInAs } from '@/testing/auth'
import { freshBoard, matchId, mockThread } from '@/testing/chats'
import { kabir } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { ChatScreen } from './ChatScreen'

type SwapBoard = components['schemas']['SwapBoard']
type CardState = components['schemas']['CardState']

const api = `${env.VITE_API_URL}/v1/chats/${matchId}`
const routes = [
  { path: '/app/chats/:matchId', element: <ChatScreen /> },
  { path: '/elsewhere', element: <p>Elsewhere</p> },
]
const jpeg = () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })

function board(states: Partial<Record<string, CardState>>, pieces: number[] = [0]): SwapBoard {
  return {
    cards: freshBoard.cards.map((c) => {
      const state = states[c.card] ?? c.state
      return { ...c, state, decided_at: state === 'open' ? '2026-11-24T18:00:00Z' : null }
    }),
    photo_pieces: pieces,
  }
}

const readiness = (sheet: HTMLElement) =>
  within(sheet).getAllByRole('listitem').map((row) => row.textContent)

async function openFinale() {
  await userEvent.click(await screen.findByRole('button', { name: 'Full picture' }))
  return screen.getByRole('dialog', { name: 'Ready for the full picture?' })
}

describe('Full picture', () => {
  it('explains that a card swap comes first while the photo is locked', async () => {
    signInAs()
    mockThread()
    renderRoutes(routes, `/app/chats/${matchId}`)

    const sheet = await openFinale()
    expect(sheet).toHaveTextContent('Photos come after your first card swap.')
    expect(within(sheet).queryByRole('button', { name: "I'm ready" })).not.toBeInTheDocument()
    await userEvent.click(within(sheet).getByRole('button', { name: 'Keep chatting for now' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('says when one of you has no photo yet', async () => {
    signInAs()
    mockThread([], { swaps: board({ first_name: 'open', photo: 'needs_theirs' }) })
    server.use(http.get(`${api}/photo`, jpeg))
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await openFinale()).toHaveTextContent("Sunset chaser hasn't added a photo yet.")
  })

  it("asks only after a confirm that says it can't be undone", async () => {
    signInAs()
    mockThread([], { swaps: board({ first_name: 'open', photo: 'can_ask' }) })
    let asked: unknown
    server.use(
      http.get(`${api}/photo`, jpeg),
      http.post(`${api}/swaps`, async ({ request }) => {
        asked = await request.json()
        const next = board({ first_name: 'open', photo: 'you_asked' })
        mockThread([], { swaps: next })
        return HttpResponse.json(next)
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    const sheet = await openFinale()
    expect(readiness(sheet)).toEqual(['YouNot yet', 'Sunset chaserDeciding'])
    await userEvent.click(within(sheet).getByRole('button', { name: "I'm ready" }))
    expect(sheet).toHaveTextContent("Can't be undone once you both say yes.")
    expect(asked).toBeUndefined()

    await userEvent.click(within(sheet).getByRole('button', { name: 'Not yet' }))
    expect(within(sheet).getByRole('button', { name: "I'm ready" })).toBeInTheDocument()
    await userEvent.click(within(sheet).getByRole('button', { name: "I'm ready" }))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Swap' }))

    expect(await within(sheet).findByRole('button', { name: 'Changed my mind' })).toBeInTheDocument()
    expect(readiness(sheet)).toEqual(['YouReady ✓', 'Sunset chaserDeciding'])
    expect(asked).toEqual({ card: 'photo' })
    expect(within(sheet).getByRole('button', { name: 'Changed my mind' })).toBeInTheDocument()
  })

  it('takes my request back with "Changed my mind"', async () => {
    signInAs()
    mockThread([], { swaps: board({ first_name: 'open', photo: 'you_asked' }) })
    let withdrawn = false
    server.use(
      http.get(`${api}/photo`, jpeg),
      http.delete(`${api}/swaps/photo`, () => {
        withdrawn = true
        const next = board({ first_name: 'open', photo: 'can_ask' })
        mockThread([], { swaps: next })
        return HttpResponse.json(next)
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    const sheet = await openFinale()
    await userEvent.click(within(sheet).getByRole('button', { name: 'Changed my mind' }))

    expect(await within(sheet).findByRole('button', { name: "I'm ready" })).toBeInTheDocument()
    expect(withdrawn).toBe(true)
  })

  it('accepts when they asked first, then shows the revealed screen once', async () => {
    signInAs()
    mockThread([], {
      profile: { ...kabir, first_name: 'Kabir' },
      swaps: board({ first_name: 'open', photo: 'they_asked' }),
    })
    server.use(
      http.get(`${api}/photo`, jpeg),
      http.post(`${api}/swaps/photo/accept`, () => {
        const next = board({ first_name: 'open', photo: 'open' }, [0, 1, 2, 3, 4, 5, 6, 7, 8])
        mockThread([], { profile: { ...kabir, first_name: 'Kabir' }, swaps: next })
        return HttpResponse.json(next)
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    const sheet = await openFinale()
    expect(readiness(sheet)).toEqual(['YouNot yet', 'KabirReady ✓'])
    await userEvent.click(within(sheet).getByRole('button', { name: "I'm ready" }))
    expect(sheet).toHaveTextContent('Kabir already said yes')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Swap' }))

    const revealed = await screen.findByRole('dialog', { name: 'Hi, Kabir.' })
    expect(revealed).toHaveTextContent('You both said yes')
    expect(screen.queryByRole('dialog', { name: 'Ready for the full picture?' })).not.toBeInTheDocument()
  })
})

describe('Revealed', () => {
  const opened = {
    profile: {
      ...kabir,
      first_name: 'Kabir',
      branch: 'ECE',
      year: 3,
      hometown: 'Dehradun',
      guess_cards: kabir.guess_cards.map((c, i) => (i < 2 ? { ...c, picked: 0, answer: i === 0 ? 0 : 1 } : c)),
    },
    matched_at: '2026-11-22T16:35:00Z',
    swaps: board({ first_name: 'open', branch: 'open', hometown: 'open', photo: 'open', contact: 'can_ask' }, [0, 1, 2, 3, 4, 5, 6, 7, 8]),
  }

  it('shows once by itself, then only from the Full picture tile', async () => {
    signInAs()
    mockThread([], opened)
    server.use(http.get(`${api}/photo`, jpeg))
    const first = renderRoutes(routes, `/app/chats/${matchId}`)

    const revealed = await screen.findByRole('dialog', { name: 'Hi, Kabir.' })
    expect(revealed).toHaveTextContent(
      'Took you 2 guesses, 3 swaps and two days. The photo stays inside Reveal and goes away if either of you unmatches.',
    )
    const chips = within(revealed).getByRole('list', { name: 'What you know' })
    expect(within(chips).getAllByRole('listitem').map((c) => c.textContent)).toEqual([
      'Rajma chawal',
      'ECE · 3rd year',
      'Dehradun',
    ])
    expect(revealed).toHaveTextContent('Contact is the last card')
    expect(revealed).not.toHaveTextContent('Instagram')
    // No long-press or right-click save on their photo.
    expect(await within(revealed).findByRole('img', { name: "Kabir's photo" })).toHaveAttribute('draggable', 'false')
    await userEvent.click(within(revealed).getByRole('button', { name: 'Back to chat' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    first.unmount()

    renderRoutes(routes, `/app/chats/${matchId}`)
    expect(await screen.findByRole('heading', { name: 'Kabir' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Hi, Kabir.' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Full picture' }))
    expect(screen.getByRole('dialog', { name: 'Hi, Kabir.' })).toBeInTheDocument()
  })

  it('swaps contact through the confirm step', async () => {
    signInAs()
    mockThread([], opened)
    let asked: unknown
    server.use(
      http.get(`${api}/photo`, jpeg),
      http.post(`${api}/swaps`, async ({ request }) => {
        asked = await request.json()
        const next = { ...opened.swaps, cards: opened.swaps.cards.map((c) => (c.card === 'contact' ? { ...c, state: 'you_asked' as const } : c)) }
        mockThread([], { ...opened, swaps: next })
        return HttpResponse.json(next)
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    const revealed = await screen.findByRole('dialog', { name: 'Hi, Kabir.' })
    await userEvent.click(within(revealed).getByRole('button', { name: 'Swap contact' }))
    const confirm = screen.getByRole('dialog', { name: 'Swap contacts?' })
    expect(confirm).toHaveTextContent("Can't be undone.")
    expect(asked).toBeUndefined()
    await userEvent.click(within(confirm).getByRole('button', { name: 'Swap' }))

    expect(await within(revealed).findByText('You asked to swap contacts')).toBeInTheDocument()
    expect(asked).toEqual({ card: 'contact' })
  })
})
